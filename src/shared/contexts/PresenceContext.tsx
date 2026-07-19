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
        formattedState[userId] = (presences as any[]).map((p) => ({
          presence_ref: p.presence_ref,
          userId: p.userId || userId,
          username: p.username || 'Anonymous',
          currentPath: p.currentPath || '',
          currentActivity: p.currentActivity || 'Online',
          lastActiveAt: p.lastActiveAt || new Date().toISOString(),
        }))
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

  // 2. Track activity when pathname changes
  useEffect(() => {
    if (!isSupabaseConfigured || !user || !channelRef.current || !isSubscribedRef.current) return

    const trackActivity = async () => {
      const currentActivity = getActivityFromPath(pathname)
      console.log('[Presence] Updating presence due to navigation:', pathname)
      try {
        await channelRef.current.track({
          userId: user.id,
          username: user.username,
          currentPath: pathname,
          currentActivity,
          lastActiveAt: new Date().toISOString(),
        })
      } catch (err) {
        console.error('[Presence] Failed to track activity:', err)
      }
    }

    void trackActivity()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, user?.id])

  const isUserOnline = (userId: string): boolean => {
    return !!onlineUsers[userId] && onlineUsers[userId].length > 0
  }

  const getUserPresence = (userId: string): PresenceUser | null => {
    const userPresences = onlineUsers[userId]
    if (!userPresences || userPresences.length === 0) return null
    // Sort by most recently active
    return [...userPresences].sort(
      (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
    )[0]
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
