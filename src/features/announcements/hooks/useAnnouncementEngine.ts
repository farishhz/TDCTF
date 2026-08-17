'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/shared/contexts/AuthContext'
import type { ClientAnnouncement } from '../types'
import {
  fetchActiveAnnouncements,
  recordInteraction,
  subscribeToRealtimeAnnouncements,
} from '../services/announcement-client.service'

const STORAGE_PREFIX = 'tdctf_announcement_v2_'

export function useAnnouncementEngine() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading: authLoading } = useAuth()

  const [announcements, setAnnouncements] = useState<ClientAnnouncement[]>([])
  const [loading, setLoading] = useState(true)

  // Active items to display
  const [activeModal, setActiveModal] = useState<ClientAnnouncement | null>(null)
  const [activeBanner, setActiveBanner] = useState<ClientAnnouncement | null>(null)
  const [activeCard, setActiveCard] = useState<ClientAnnouncement | null>(null)

  // Track session dismissals in state
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set())
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set())

  // Reset in-memory tracking on user switch
  const lastUserIdRef = useRef<string | undefined>(user?.id)
  useEffect(() => {
    if (lastUserIdRef.current !== user?.id) {
      lastUserIdRef.current = user?.id
      setDismissedIds(new Set())
      setReadIds(new Set())
    }
  }, [user?.id])

  const getUserStorageKey = useCallback(
    (keyType: string, itemId: string) => {
      const userPart = user?.id ? `u_${user.id}` : 'guest'
      return `${STORAGE_PREFIX}${userPart}_${keyType}_${itemId}`
    },
    [user?.id]
  )

  const isEligibleToDisplay = useCallback(
    (item: ClientAnnouncement, channel: 'modal' | 'top_banner' | 'floating_card') => {
      // 1. Channel check
      if (!item.channels?.includes(channel)) return false

      // 2. Check if already marked as read in state or DB
      if (readIds.has(item.id) || item.is_read) {
        if (item.display_rule === 'until_read' || item.display_rule === 'first_visit') {
          return false
        }
      }

      // 3. Check session dismissal state
      if (dismissedIds.has(item.id)) return false

      if (typeof window === 'undefined') return false

      try {
        // 4. Check sessionStorage for once_per_session
        if (item.display_rule === 'once_per_session') {
          const sessionVal = sessionStorage.getItem(getUserStorageKey('session', item.id))
          if (sessionVal) return false
        }

        // 5. Check localStorage for first_visit
        if (item.display_rule === 'first_visit') {
          const firstVal = localStorage.getItem(getUserStorageKey('first', item.id))
          if (firstVal) return false
        }

        // 6. Check cooldown from localStorage
        const dismissedAtStr = localStorage.getItem(getUserStorageKey('dismissed', item.id))
        if (dismissedAtStr) {
          const dismissedAt = parseInt(dismissedAtStr, 10)
          const cooldownMs = (item.cooldown_hours || 24) * 3600 * 1000
          if (Date.now() - dismissedAt < cooldownMs) {
            return false
          }
        }
      } catch {
        // Fallback if storage blocked
      }

      return true
    },
    [dismissedIds, readIds, getUserStorageKey]
  )

  const evaluateActiveItems = useCallback(
    (items: ClientAnnouncement[]) => {
      if (!items || items.length === 0) {
        setActiveModal(null)
        setActiveBanner(null)
        setActiveCard(null)
        return
      }

      // 1. Pick Modal: Highest priority eligible item
      const eligibleModals = items.filter((item) => isEligibleToDisplay(item, 'modal'))
      if (eligibleModals.length > 0) {
        // Already sorted by priority in query (critical > high > normal > low)
        setActiveModal(eligibleModals[0])
      } else {
        setActiveModal(null)
      }

      // 2. Pick Top Banner
      const eligibleBanners = items.filter((item) => isEligibleToDisplay(item, 'top_banner'))
      if (eligibleBanners.length > 0) {
        setActiveBanner(eligibleBanners[0])
      } else {
        setActiveBanner(null)
      }

      // 3. Pick Floating Card (only show if no modal is active to avoid visual clutter)
      const eligibleCards = items.filter((item) => isEligibleToDisplay(item, 'floating_card'))
      if (eligibleCards.length > 0 && eligibleModals.length === 0) {
        setActiveCard(eligibleCards[0])
      } else {
        setActiveCard(null)
      }
    },
    [isEligibleToDisplay]
  )

  const loadAnnouncements = useCallback(async () => {
    try {
      const data = await fetchActiveAnnouncements()
      setAnnouncements(data)
      evaluateActiveItems(data)
    } catch (err) {
      console.warn('Announcement engine load error:', err)
    } finally {
      setLoading(false)
    }
  }, [evaluateActiveItems])

  // Initial load & route change or auth change re-evaluation
  useEffect(() => {
    if (!authLoading) {
      void loadAnnouncements()
    }
  }, [loadAnnouncements, pathname, user?.id, authLoading])

  // Realtime updates
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeAnnouncements(() => {
      void loadAnnouncements()
    })
    return () => {
      unsubscribe()
    }
  }, [loadAnnouncements])

  // Handlers
  const handleMarkAsRead = useCallback(
    async (item: ClientAnnouncement, triggerCta = false) => {
      setReadIds((prev) => {
        const next = new Set(prev)
        next.add(item.id)
        return next
      })

      // Record interaction in database
      void recordInteraction(item.id, 'read')

      // Save to storage
      try {
        localStorage.setItem(getUserStorageKey('read', item.id), Date.now().toString())
        sessionStorage.setItem(getUserStorageKey('session', item.id), '1')
      } catch {}

      // Close modal / banner / card if it was this item
      if (activeModal?.id === item.id) setActiveModal(null)
      if (activeBanner?.id === item.id) setActiveBanner(null)
      if (activeCard?.id === item.id) setActiveCard(null)

      // Handle CTA redirect
      if (triggerCta && item.cta_link) {
        if (item.cta_target === '_blank') {
          window.open(item.cta_link, '_blank', 'noopener,noreferrer')
        } else {
          router.push(item.cta_link)
        }
      }
    },
    [activeModal, activeBanner, activeCard, router, getUserStorageKey]
  )

  const handleDismiss = useCallback(
    async (item: ClientAnnouncement) => {
      setDismissedIds((prev) => {
        const next = new Set(prev)
        next.add(item.id)
        return next
      })

      // Record interaction in database
      void recordInteraction(item.id, 'dismiss')

      // Save to storage
      try {
        localStorage.setItem(getUserStorageKey('dismissed', item.id), Date.now().toString())
        localStorage.setItem(getUserStorageKey('first', item.id), '1')
        sessionStorage.setItem(getUserStorageKey('session', item.id), '1')
      } catch {}

      // Close display
      if (activeModal?.id === item.id) setActiveModal(null)
      if (activeBanner?.id === item.id) setActiveBanner(null)
      if (activeCard?.id === item.id) setActiveCard(null)
    },
    [activeModal, activeBanner, activeCard, getUserStorageKey]
  )

  return {
    announcements,
    loading,
    activeModal,
    activeBanner,
    activeCard,
    handleMarkAsRead,
    handleDismiss,
    refresh: loadAnnouncements,
  }
}
