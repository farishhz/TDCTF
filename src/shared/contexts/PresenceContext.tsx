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
  if (pathname.startsWith('/challenges/')) {
    return 'Sedang mengerjakan challenge 🧩'
  }
  if (pathname === '/challenges') {
    return 'Melihat daftar challenge 🛡️'
  }
  if (pathname === '/scoreboard') {
    return 'Melihat Scoreboard 📈'
  }
  if (pathname === '/teams') {
    return 'Melihat daftar tim 👥'
  }
  if (pathname.startsWith('/teams/')) {
    return 'Melihat profil tim 👥'
  }
  if (pathname.startsWith('/profile')) {
    return 'Mengatur profil ⚙️'
  }
  if (pathname.startsWith('/admin')) {
    return 'Mengelola panel admin 🔐'
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

      Object.entries(state).forEach(([userId, presences]) => {
        const mapped = (presences as any[]).map((p) => ({
          presence_ref: p.presence_ref,
          userId: p.userId || userId,
          username: p.username || 'Anonymous',
          currentPath: p.currentPath || '',
          currentActivity: p.currentActivity || 'Online',
          lastActiveAt: p.lastActiveAt || new Date().toISOString(),
        }))
        formattedState[userId] = mapped
        if (mapped.length > 0) {
          const latest = [...mapped].sort(
            (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
          )[0]
          recentLastSeenMapRef.current[String(userId).toLowerCase()] = latest
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
          // Silently update last_login_at in users table
          void (supabase as any).from('users').update({ last_login_at: new Date().toISOString() }).eq('id', user.id)
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
    if (!isSupabaseConfigured || !user || !channelRef.current || !isSubscribedRef.current) return

    const updatePresenceState = async () => {
      if (!channelRef.current || !isSubscribedRef.current) return
      const isHidden = typeof document !== 'undefined' && document.hidden
      const currentActivity = isHidden
        ? 'Tidak aktif (Background tab) 🌙'
        : getActivityFromPath(pathname)

      try {
        await channelRef.current.track({
          userId: user.id,
          username: user.username,
          currentPath: pathname,
          currentActivity,
          lastActiveAt: new Date().toISOString(),
        })
        if (!isHidden) {
          void (supabase as any).from('users').update({ last_login_at: new Date().toISOString() }).eq('id', user.id)
        }
      } catch (err) {
        console.error('[Presence] Failed to track activity:', err)
      }
    }

    void updatePresenceState()

    const handleVisibilityChange = () => {
      void updatePresenceState()
    }

    const handleBeforeUnload = () => {
      if (channelRef.current) {
        void channelRef.current.untrack()
      }
      void (supabase as any).from('users').update({ last_login_at: new Date().toISOString() }).eq('id', user.id)
    }

    window.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handleBeforeUnload)

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handleBeforeUnload)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, user?.id])

  const isUserOnline = (userId: string): boolean => {
    if (!userId) return false
    const target = String(userId).toLowerCase()
    return Object.keys(onlineUsers).some(
      (key) => key.toLowerCase() === target && onlineUsers[key]?.length > 0
    )
  }

  const getUserPresence = (userId: string): PresenceUser | null => {
    if (!userId) return null
    const target = String(userId).toLowerCase()
    const matchingKey = Object.keys(onlineUsers).find((key) => key.toLowerCase() === target)
    if (matchingKey && onlineUsers[matchingKey]?.length > 0) {
      const userPresences = onlineUsers[matchingKey]
      return [...userPresences].sort(
        (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
      )[0]
    }
    return recentLastSeenMapRef.current[target] || null
  }

  const onlineCount = Object.keys(onlineUsers).length

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
