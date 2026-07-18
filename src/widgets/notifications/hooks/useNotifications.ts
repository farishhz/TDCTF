'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import APP from '@/config'
import {
  getNotifications,
  createNotification,
  deleteNotification,
  subscribeToNotifications,
  subscribeToSolves,
} from '@/shared/lib/challenges'
import {
  getSolveSoundEnabledSetting,
  setSolveSoundEnabledSetting,
} from '@/shared/lib/settings'
import {
  getNotifSeenIds,
  addNotifSeenIds,
} from '@/lib/storage/user-state'
import { useAuth } from '@/shared/contexts/AuthContext'
import { useTheme } from '@/shared/contexts/ThemeContext'

export function useNotifications() {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const [notifOpen, setNotifOpen] = useState(false)
  const [notifLoading, setNotifLoading] = useState(false)
  const [notifUnreadCount, setNotifUnreadCount] = useState(0)
  const [notifItems, setNotifItems] = useState<Array<{ id: string; title: string; message: string; level: string; created_at: string }>>([])
  const [notifSeenIds, setNotifSeenIds] = useState<Set<string>>(() => new Set())

  const [notifTitle, setNotifTitle] = useState('')
  const [notifMessage, setNotifMessage] = useState('')
  const [notifLevel, setNotifLevel] = useState<'info' | 'info_platform' | 'info_challenges'>('info_challenges')

  const [solveToasts, setSolveToasts] = useState<Array<{ id: string; username: string; challenge: string; isFirstBlood?: boolean }>>([])
  const [notifToasts, setNotifToasts] = useState<Array<{ id: string; title: string; message: string; level: string }>>([])

  const notifPanelRef = useRef<HTMLDivElement>(null)
  const notifButtonRef = useRef<HTMLButtonElement>(null)

  const [solveSoundEnabled, setSolveSoundEnabled] = useState(true)

  const mergeNotifications = useCallback((
    existing: Array<{ id: string; title: string; message: string; level: string; created_at: string }>,
    incoming: Array<{ id: string; title: string; message: string; level: string; created_at: string }>
  ) => {
    const byId = new Map<string, { id: string; title: string; message: string; level: string; created_at: string }>()
    for (const n of existing || []) byId.set(String(n.id), n)
    for (const n of incoming || []) byId.set(String(n.id), n)
    const merged = Array.from(byId.values())
    merged.sort((a, b) => {
      const ta = a.created_at ? Date.parse(a.created_at) : 0
      const tb = b.created_at ? Date.parse(b.created_at) : 0
      return tb - ta
    })
    return merged
  }, [])

  const getSeenNotifIds = useCallback(() => new Set<string>(getNotifSeenIds(user?.id || 'anon')), [user?.id])

  const markNotificationsSeen = useCallback((ids: string[]) => {
    const merged = addNotifSeenIds(user?.id || 'anon', ids)
    setNotifSeenIds(new Set(merged))
  }, [user?.id])

  useEffect(() => {
    setNotifSeenIds(getSeenNotifIds())
  }, [getSeenNotifIds])

  const markAllNotificationsRead = useCallback(async () => {
    const items = await getNotifications(50, 0)
    if (items && items.length > 0) {
      markNotificationsSeen(items.map((n: any) => n.id))
    }
    setNotifUnreadCount(0)
  }, [markNotificationsSeen])

  const markNotificationRead = useCallback((id: string) => {
    const notificationId = String(id || '').trim()
    if (!notificationId) return

    const seen = getSeenNotifIds()
    if (notifSeenIds.has(notificationId) || seen.has(notificationId)) return

    markNotificationsSeen([notificationId])
    setNotifUnreadCount((count) => Math.max(0, count - 1))
  }, [getSeenNotifIds, markNotificationsSeen, notifSeenIds])

  const openNotifPanel = useCallback(async () => {
    setNotifOpen((v) => !v)
    if (!notifOpen && user) {
      setNotifLoading(true)
      const items = await getNotifications(30, 0)
      setNotifItems((prev) => mergeNotifications(prev, (items || []) as any))
      setNotifLoading(false)
    }
  }, [notifOpen, user, mergeNotifications])

  const handleSendNotif = useCallback(async () => {
    if (!notifTitle.trim() || !notifMessage.trim()) return
    // Capture values before clearing
    const title = notifTitle.trim()
    const message = notifMessage.trim()
    const level = notifLevel
    try {
      const newId = await createNotification(title, message, level)
      setNotifTitle('')
      setNotifMessage('')
      // Optimistically add with the real database UUID
      if (newId) {
        setNotifItems(prev => [{
          id: String(newId),
          title,
          message,
          level,
          created_at: new Date().toISOString()
        }, ...prev])
      }
    } catch (err) {
      console.warn('Failed to create notification', err)
    }
  }, [notifTitle, notifMessage, notifLevel])

  const handleDeleteNotif = useCallback(async (id: string) => {
    try {
      await deleteNotification(id)
      setNotifItems(prev => prev.filter(n => n.id !== id))
      const seen = getSeenNotifIds()
      if (!seen.has(id)) {
        setNotifUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.warn('Failed to delete notification', err)
    }
  }, [getSeenNotifIds])

  const dismissSolveNotif = useCallback((toastId?: string) => {
    if (toastId) {
      setSolveToasts(prev => prev.filter(t => t.id !== toastId))
    } else {
      setSolveToasts([])
    }
  }, [])

  const dismissNotifToast = useCallback((toastId?: string) => {
    if (toastId) {
      setNotifToasts(prev => prev.filter(t => t.id !== toastId))
    } else {
      setNotifToasts([])
    }
  }, [])

  const isNotifRead = useCallback((id: string) => {
    if (notifSeenIds.has(id)) return true
    const seen = getSeenNotifIds()
    return seen.has(id)
  }, [getSeenNotifIds, notifSeenIds])

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'info_platform':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
      case 'info_challenges':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
    }
  }

  // Effect for forcing dark mode (Temporary feature from previous edit)
  useEffect(() => {
    if (theme === 'light') {
      toggleTheme()
    }
  }, [theme, toggleTheme])

  // Load notification sound setting
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      setSolveSoundEnabled(getSolveSoundEnabledSetting())
    } catch { }
  }, [])

  // Persist notification sound setting
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      setSolveSoundEnabledSetting(solveSoundEnabled)
    } catch { }
  }, [solveSoundEnabled])

  // Real-time notifications subscription
  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeToNotifications(async (payload) => {
      const id = payload.id || `realtime-${payload.created_at}-${payload.title}`

      // Check if payload from Supabase Realtime is empty (RLS issue)
      const isEmptyPayload = !payload.message && payload.title === 'Notification'

      let notifData = {
        id,
        title: payload.title,
        message: payload.message,
        level: payload.level,
        created_at: payload.created_at,
      }

      // If payload was empty, re-fetch latest from database to get actual content
      if (isEmptyPayload) {
        try {
          const items = await getNotifications(1, 0)
          if (items && items.length > 0) {
            const latest = items[0] as any
            notifData = {
              id: latest.id || id,
              title: latest.title || 'Notification',
              message: latest.message || '',
              level: latest.level || 'info',
              created_at: latest.created_at || new Date().toISOString(),
            }
          }
        } catch {
          // If fetch fails, keep the fallback data
        }
      }

      // Dedup: skip if this notification ID already exists (from optimistic update)
      setNotifItems(prev => {
        if (prev.some(n => n.id === notifData.id)) return prev
        return [notifData, ...prev]
      })

      const toastId = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      setNotifToasts(prev => [...prev, { id: toastId, title: notifData.title, message: notifData.message, level: notifData.level }])
      setTimeout(() => setNotifToasts(prev => prev.filter(t => t.id !== toastId)), 15000)

      try {
        const audio = new Audio('/sounds/notif.mp3')
        audio.volume = 0.5
        audio.play()
      } catch { }

      const seen = getSeenNotifIds()
      if (!seen.has(notifData.id)) {
        setNotifUnreadCount(prev => prev + 1)
      }
    })
    return () => {
      unsubscribe()
    }
  }, [user, getSeenNotifIds])

  // Initial unread count fetch
  useEffect(() => {
    if (!user) {
      setNotifUnreadCount(0)
      return
    }
    ; (async () => {
      const items = await getNotifications(50, 0)
      const seen = getSeenNotifIds()
      const unread = (items || []).filter((n: any) => !seen.has(n.id)).length
      setNotifUnreadCount(unread)
    })()
  }, [user, getSeenNotifIds])

  // Real-time solves subscription
  useEffect(() => {
    if (!user || !APP.notifSolves) return;
    const unsubscribe = subscribeToSolves(({ username, challenge, isFirstBlood }) => {
      const toastId = `solve-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      setSolveToasts(prev => [...prev, { id: toastId, username, challenge, isFirstBlood }])

      if (solveSoundEnabled && (isFirstBlood || username !== user.username)) {
        try {
          const soundFile = isFirstBlood ? '/sounds/first-blood.mp3' : '/sounds/notif_solves.mp3';
          const audio = new Audio(soundFile)
          audio.volume = isFirstBlood ? 0.6 : 0.5
          audio.play()
        } catch { }
      }

      setTimeout(() => {
        setSolveToasts(prev => prev.filter(t => t.id !== toastId))
      }, 12000)
    })
    return () => {
      unsubscribe()
    }
  }, [user, solveSoundEnabled])

  return {
    notifOpen,
    setNotifOpen,
    notifLoading,
    notifUnreadCount,
    notifItems,
    notifTitle,
    setNotifTitle,
    notifMessage,
    setNotifMessage,
    notifLevel,
    setNotifLevel,
    solveToasts,
    notifToasts,
    solveSoundEnabled,
    setSolveSoundEnabled,
    notifPanelRef,
    notifButtonRef,
    markAllNotificationsRead,
    markNotificationRead,
    openNotifPanel,
    handleSendNotif,
    handleDeleteNotif,
    dismissSolveNotif,
    dismissNotifToast,
    isNotifRead,
    getLevelBadgeClass,
  }
}
