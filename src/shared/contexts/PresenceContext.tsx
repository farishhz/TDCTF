'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/shared/contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'

export interface PresenceUser {
  presence_ref: string
  userId: string
  username: string
  currentPath: string
  currentActivity: string
  lastActiveAt: string
}

type PresenceContextType = {
  onlineUsers: Record<string, PresenceUser[]>
  isUserOnline: (userId: string) => boolean
  getUserPresence: (userId: string) => PresenceUser | null
  onlineCount: number
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined)

function getActivityFromPath(pathname: string): string {
  if (!pathname) return 'Menjelajahi platform 🌐'
  if (pathname.startsWith('/challenges')) {
    return 'Sedang mengerjakan challenge 🧩'
  }
  if (pathname.startsWith('/scoreboard')) {
    return 'Melihat Scoreboard 📈'
  }
  if (pathname.startsWith('/teams')) {
    return 'Melihat tim 👥'
  }
  if (pathname.startsWith('/join')) {
    return 'Bergabung ke event 🚀'
  }
  if (pathname.startsWith('/profile')) {
    return 'Mengatur profil ⚙️'
  }
  if (pathname.startsWith('/admin')) {
    return 'Mengelola panel admin 🔐'
  }
  if (pathname.startsWith('/info')) {
    return 'Melihat informasi platform ℹ️'
  }
  return 'Menjelajahi platform 🌐'
}

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [onlineUsers, setOnlineUsers] = useState<Record<string, PresenceUser[]>>({})
  const channelRef = useRef<any>(null)
  const isSubscribedRef = useRef(false)
  const recentLastSeenMapRef = useRef<Record<string, PresenceUser>>({})

  // 1. Manage WebSocket Connection (dependent on user session only)
  useEffect(() => {
    if (!isSupabaseConfigured || !user) {
      setOnlineUsers({})
      isSubscribedRef.current = false
      channelRef.current = null
      return
    }

    console.log('[Presence] Initializing channel for user:', user.id)

    // Touch activity in DB immediately on mount/session load
    void (supabase as any).rpc('touch_user_activity')

    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: user.id,
        },
      },
    })

    channelRef.current = channel

    const syncPresence = () => {
      const state = channel.presenceState()
      console.log('[Presence] Synced state:', state)
      const formattedState: Record<string, PresenceUser[]> = {}

      Object.entries(state).forEach(([userIdKey, presences]) => {
        const normKey = String(userIdKey).toLowerCase()
        const mapped = (presences as any[]).map((p) => ({
          presence_ref: p.presence_ref,
          userId: p.userId || userIdKey,
          username: p.username || 'Anonymous',
          currentPath: p.currentPath || '',
          currentActivity: p.currentActivity || 'Online',
          lastActiveAt: p.lastActiveAt || new Date().toISOString(),
        })).sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime())

        const latestArray = mapped.length > 0 ? [mapped[0]] : []
        formattedState[normKey] = latestArray
        if (mapped.length > 0) {
          recentLastSeenMapRef.current[normKey] = mapped[0]
        }
      })

      setOnlineUsers(formattedState)
    }

    channel
      .on('presence', { event: 'sync' }, () => {
        console.log('[Presence] Sync event received')
        syncPresence()
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('[Presence] Join event:', key, newPresences)
        syncPresence()
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('[Presence] Leave event:', key, leftPresences)
        if (leftPresences && (leftPresences as any[]).length > 0) {
          const targetKey = String(key).toLowerCase()
          const p = (leftPresences as any[])[0]
          recentLastSeenMapRef.current[targetKey] = {
            presence_ref: p.presence_ref || '',
            userId: p.userId || key,
            username: p.username || 'Anonymous',
            currentPath: p.currentPath || '',
            currentActivity: 'Offline',
            lastActiveAt: new Date().toISOString(),
          }
        }
        syncPresence()
      })
      .subscribe(async (status) => {
        console.log('[Presence] Subscription status:', status)
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true
          // Track initial page presence
          const currentActivity = getActivityFromPath(pathname)
          await channel.track({
            userId: user.id,
            username: user.username,
            currentPath: pathname,
            currentActivity,
            lastActiveAt: new Date().toISOString(),
          })
          // Update activity timestamp in database via SECURITY DEFINER RPC
          void (supabase as any).rpc('touch_user_activity')
        } else {
          isSubscribedRef.current = false
        }
      })

    return () => {
      console.log('[Presence] Unsubscribing from channel')
      isSubscribedRef.current = false
      void channel.unsubscribe()
      channelRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]) // Run ONLY when the user session changes (not pathname)

  // 2. Track activity when pathname or tab visibility changes
  useEffect(() => {
    if (!isSupabaseConfigured || !user) return

    const sendPresence = (activityText?: string) => {
      if (!channelRef.current || !isSubscribedRef.current) return
      const isHidden = typeof document !== 'undefined' && document.hidden
      const currentActivity = activityText || (isHidden
        ? 'Tidak aktif (Background tab) 🌙'
        : getActivityFromPath(pathname))

      const payload = {
        userId: user.id,
        username: user.username || (user as any).email?.split('@')[0] || 'User',
        currentPath: pathname,
        currentActivity,
        lastActiveAt: new Date().toISOString(),
      }

      void channelRef.current.track(payload).catch((err: any) => {
        console.error('[Presence] Failed to track activity:', err)
      })

      if (!isHidden) {
        void (supabase as any).rpc('touch_user_activity')
      }
    }

    sendPresence()

    // Periodic heartbeat ping every 15 seconds to keep presence & DB activity fresh
    const heartbeatTimer = setInterval(() => {
      sendPresence()
    }, 15000)

    const handleVisibilityChange = () => {
      const isHidden = typeof document !== 'undefined' && document.hidden
      if (isHidden) {
        sendPresence('Tidak aktif (Background tab) 🌙')
      } else {
        sendPresence()
      }
    }

    const handleBeforeUnload = () => {
      if (channelRef.current && isSubscribedRef.current) {
        void channelRef.current.untrack()
      }
      void (supabase as any).rpc('touch_user_activity')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', handleBeforeUnload)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(heartbeatTimer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', handleBeforeUnload)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, user?.id])

  const isUserOnline = (identifier: string): boolean => {
    if (!identifier) return false
    const target = String(identifier).toLowerCase()

    return Object.keys(onlineUsers).some((key) => {
      const presences = onlineUsers[key] || []
      return presences.some((p) => {
        const matchesUser =
          key.toLowerCase() === target ||
          p.userId?.toLowerCase() === target ||
          p.username?.toLowerCase() === target
        return matchesUser && p.currentActivity !== 'Offline'
      })
    })
  }

  const getUserPresence = (identifier: string): PresenceUser | null => {
    if (!identifier) return null
    const target = String(identifier).toLowerCase()

    const matchingKey = Object.keys(onlineUsers).find((key) => {
      if (key.toLowerCase() === target) return true
      const presences = onlineUsers[key] || []
      return presences.some(
        (p) =>
          p.userId?.toLowerCase() === target ||
          p.username?.toLowerCase() === target
      )
    })

    if (matchingKey && onlineUsers[matchingKey]?.length > 0) {
      const userPresences = onlineUsers[matchingKey]
      const activePresences = userPresences.filter((p) => p.currentActivity !== 'Offline')
      if (activePresences.length > 0) {
        return [...activePresences].sort(
          (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
        )[0]
      }
    }

    return null
  }

  const onlineCount = Object.keys(onlineUsers).filter((key) => {
    const list = onlineUsers[key] || []
    return list.some((p) => p.currentActivity !== 'Offline')
  }).length

  return (
    <PresenceContext.Provider value={{ onlineUsers, isUserOnline, getUserPresence, onlineCount }}>
      {children}
    </PresenceContext.Provider>
  )
}

export function usePresence() {
  const context = useContext(PresenceContext)
  if (context === undefined) {
    throw new Error('usePresence must be used within a PresenceProvider')
  }
  return context
}
