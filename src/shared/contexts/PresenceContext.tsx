'use client'

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
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
  if (pathname.startsWith('/challenges')) return 'Sedang mengerjakan challenge 🧩'
  if (pathname.startsWith('/scoreboard')) return 'Melihat Scoreboard 📈'
  if (pathname.startsWith('/teams')) return 'Melihat tim 👥'
  if (pathname.startsWith('/join')) return 'Bergabung ke event 🚀'
  if (pathname.startsWith('/profile')) return 'Mengatur profil ⚙️'
  if (pathname.startsWith('/admin')) return 'Mengelola panel admin 🔐'
  if (pathname.startsWith('/info')) return 'Melihat informasi platform ℹ️'
  return 'Menjelajahi platform 🌐'
}

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [onlineUsers, setOnlineUsers] = useState<Record<string, PresenceUser[]>>({})

  // channelKey increments to force the channel effect to re-run (reconnect after sleep/network drop)
  const [channelKey, setChannelKey] = useState(0)

  const channelRef = useRef<any>(null)
  const isSubscribedRef = useRef(false)
  const pathnameRef = useRef(pathname)
  const userRef = useRef(user)

  // Timers for delayed offline marking (absorbs the leave+join pair Supabase fires on every track() call)
  const leaveTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  // Keep refs in sync so event handlers always see latest values without re-registration
  useEffect(() => { pathnameRef.current = pathname }, [pathname])
  useEffect(() => { userRef.current = user }, [user])

  // ─── Effect 1: Manage WebSocket channel (reconnects on user change OR channelKey bump) ───
  useEffect(() => {
    if (!isSupabaseConfigured || !user) {
      setOnlineUsers({})
      isSubscribedRef.current = false
      channelRef.current = null
      return
    }

    console.log('[Presence] Initializing channel for user:', user.id, 'key:', channelKey)

    const channel = supabase.channel('online-users', {
      config: { presence: { key: user.id } },
    })

    channelRef.current = channel

    const syncPresence = () => {
      const state = channel.presenceState()
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

        if (mapped.length > 0) {
          formattedState[normKey] = [mapped[0]]
        }
      })

      setOnlineUsers(formattedState)
    }

    channel
      .on('presence', { event: 'sync' }, () => {
        console.log('[Presence] Sync event')
        syncPresence()
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        console.log('[Presence] Join event:', key)
        // Cancel any pending offline timer — absorbs leave+join pair from track() updates
        const targetKey = String(key).toLowerCase()
        if (leaveTimersRef.current[targetKey]) {
          clearTimeout(leaveTimersRef.current[targetKey])
          delete leaveTimersRef.current[targetKey]
        }
        syncPresence()
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        console.log('[Presence] Leave event:', key)
        // Delay offline marking 3.5s — if a join arrives within that window, user stays Online
        const targetKey = String(key).toLowerCase()
        if (leaveTimersRef.current[targetKey]) {
          clearTimeout(leaveTimersRef.current[targetKey])
        }
        leaveTimersRef.current[targetKey] = setTimeout(() => {
          delete leaveTimersRef.current[targetKey]
          setOnlineUsers(prev => {
            const next = { ...prev }
            const existing = next[targetKey] || []
            const hasActive = existing.some(p => p.currentActivity !== 'Offline')
            if (!hasActive) delete next[targetKey]
            return next
          })
        }, 3500)
        syncPresence()
      })
      .subscribe(async (status) => {
        console.log('[Presence] Channel status:', status)
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true
          const currentUser = userRef.current
          const currentPath = pathnameRef.current
          if (currentUser) {
            await channel.track({
              userId: currentUser.id,
              username: currentUser.username || (currentUser as any).email?.split('@')[0] || 'User',
              currentPath: currentPath,
              currentActivity: getActivityFromPath(currentPath),
              lastActiveAt: new Date().toISOString(),
            })
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('[Presence] Channel error/timeout, marking unsubscribed:', status)
          isSubscribedRef.current = false
        } else {
          isSubscribedRef.current = false
        }
      })

    return () => {
      console.log('[Presence] Cleaning up channel')
      isSubscribedRef.current = false
      Object.values(leaveTimersRef.current).forEach(clearTimeout)
      leaveTimersRef.current = {}
      void supabase.removeChannel(channel)
      channelRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, channelKey])

  // ─── Effect 2: Track activity on nav/visibility + wake-up reconnect detection ───
  useEffect(() => {
    if (!isSupabaseConfigured || !user) return

    const sendPresence = (activityText?: string) => {
      if (!channelRef.current || !isSubscribedRef.current) return
      const isHidden = typeof document !== 'undefined' && document.hidden
      const currentActivity = activityText || (isHidden
        ? 'Tidak aktif (Background tab) 🌙'
        : getActivityFromPath(pathname))

      void channelRef.current.track({
        userId: user.id,
        username: user.username || (user as any).email?.split('@')[0] || 'User',
        currentPath: pathname,
        currentActivity,
        lastActiveAt: new Date().toISOString(),
      }).catch((err: any) => {
        console.error('[Presence] track() failed:', err)
      })
    }

    // Send presence immediately on path/session change
    sendPresence()

    // Heartbeat every 12s to keep presence fresh
    const heartbeatTimer = setInterval(() => {
      if (isSubscribedRef.current) {
        sendPresence()
      }
    }, 12000)

    // ── Wake-up / network-restore handler ──────────────────────────────────────
    // When laptop wakes from sleep, the WebSocket is dropped. We detect this via:
    //   1. visibilitychange: page goes hidden→visible (user returns to tab after sleep/alt-tab)
    //   2. online: network restored after sleep/disconnect
    // If channel is no longer subscribed, bump channelKey to force a full reconnect.

    const handleWakeUp = () => {
      if (document.hidden) return // still hidden, skip
      console.log('[Presence] Wake-up detected, channel subscribed:', isSubscribedRef.current)
      if (!isSubscribedRef.current) {
        console.log('[Presence] Channel dropped (sleep/network), triggering reconnect')
        // Bump channelKey → forces Effect 1 to re-run with a fresh channel
        setChannelKey(k => k + 1)
      } else {
        sendPresence()
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        sendPresence('Tidak aktif (Background tab) 🌙')
      } else {
        handleWakeUp()
      }
    }

    const handleBeforeUnload = () => {
      if (channelRef.current && isSubscribedRef.current) {
        void channelRef.current.untrack()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('online', handleWakeUp)          // Network restored after sleep
    window.addEventListener('focus', handleWakeUp)           // Window focus after sleep
    window.addEventListener('pagehide', handleBeforeUnload)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(heartbeatTimer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('online', handleWakeUp)
      window.removeEventListener('focus', handleWakeUp)
      window.removeEventListener('pagehide', handleBeforeUnload)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, user?.id])

  // ─── Stable selectors via useCallback ────────────────────────────────────────
  const isUserOnline = useCallback((identifier: string): boolean => {
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
  }, [onlineUsers])

  const getUserPresence = useCallback((identifier: string): PresenceUser | null => {
    if (!identifier) return null
    const target = String(identifier).toLowerCase()
    const matchingKey = Object.keys(onlineUsers).find((key) => {
      if (key.toLowerCase() === target) return true
      const presences = onlineUsers[key] || []
      return presences.some(
        (p) => p.userId?.toLowerCase() === target || p.username?.toLowerCase() === target
      )
    })
    if (matchingKey && onlineUsers[matchingKey]?.length > 0) {
      const activePresences = onlineUsers[matchingKey].filter((p) => p.currentActivity !== 'Offline')
      if (activePresences.length > 0) {
        return [...activePresences].sort(
          (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
        )[0]
      }
    }
    return null
  }, [onlineUsers])

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
