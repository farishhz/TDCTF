'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { AuthService } from '@/features/auth'
import {
  getAllMyEventMemberships,
  getMyEventMembership,
} from '@/features/events/services/event.service'
import { formatEventDurationCompact } from '@/shared/lib'
import type { EventMembershipStatus, User } from '@/shared/types'
import type {
  ChallengeEventFilterItem,
  ChallengesMainTab,
  EventSelectorValue,
} from '../types'

type SelectedEventValue = 'all' | 'main' | string

type TargetEventMembership = {
  evt: ChallengeEventFilterItem
  joinMode: 'open' | 'request' | 'key'
  membership: EventMembershipStatus | null | undefined
}

type UseChallengeEventAccessOptions = {
  user: User | null | undefined
  currentTab: ChallengesMainTab
  setCurrentTab: (tab: ChallengesMainTab) => void
  events: ChallengeEventFilterItem[]
  eventId: EventSelectorValue
  setSelectedEvent: (value: SelectedEventValue) => void
}

export function useChallengeEventAccess({
  user,
  currentTab,
  setCurrentTab,
  events,
  eventId,
  setSelectedEvent,
}: UseChallengeEventAccessOptions) {
  const [eventMembership, setEventMembership] = useState<EventMembershipStatus | null>(null)
  const [teamStatus, setTeamStatus] = useState<any>(null)
  const router = useRouter()
  const [eventMembershipLoading, setEventMembershipLoading] = useState(false)
  const [isGlobalAdminUser, setIsGlobalAdminUser] = useState(false)
  const [eventAdminIds, setEventAdminIds] = useState<string[]>([])
  const [targetEventId, setTargetEventId] = useState<string | null>(null)
  const [targetEventMembership, setTargetEventMembership] = useState<TargetEventMembership | null>(null)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [allMembershipsLoaded, setAllMembershipsLoaded] = useState(false)
  const [eventMembershipCache] = useState(() => new Map<string, EventMembershipStatus | null>())

  const getCachedEventMembership = useCallback(async (id: string, force = false) => {
    if (!force && eventMembershipCache.has(id)) return eventMembershipCache.get(id)!

    const data = await getMyEventMembership(id)
    eventMembershipCache.set(id, data)
    return data
  }, [eventMembershipCache])

  useEffect(() => {
    let mounted = true

    const loadScope = async () => {
      if (!user) {
        if (mounted) {
          setIsGlobalAdminUser(false)
          setEventAdminIds([])
        }
        return
      }

      const scope = await AuthService.getAdminScope()
      if (!mounted) return
      setIsGlobalAdminUser(!!scope.is_global_admin)
      setEventAdminIds(scope.event_ids || [])
    }

    void loadScope()
    return () => { mounted = false }
  }, [user])

  useEffect(() => {
    let mounted = true

    const loadAllMemberships = async () => {
      if (!user) return

      try {
        const allMemberships = await getAllMyEventMemberships()
        if (!mounted) return

        allMemberships.forEach((membership) => eventMembershipCache.set(membership.event_id, membership))
        setAllMembershipsLoaded(true)

        if (typeof eventId === 'string' && eventId !== 'all') {
          const membership = eventMembershipCache.get(eventId)
          if (membership) {
            setEventMembership(membership)
            setEventMembershipLoading(false)
          }
        }
      } catch (error) {
        console.error(error)
      }
    }

    void loadAllMemberships()
    return () => { mounted = false }
  }, [eventId, eventMembershipCache, user])

  useEffect(() => {
    let mounted = true

    const loadMembership = async () => {
      if (!user || typeof eventId !== 'string' || eventId === 'all') {
        if (mounted) {
          setEventMembership(null)
          setTeamStatus(null)
        }
        return
      }

      if (selectedEventObj?.is_team_event) {
        setEventMembershipLoading(true)
        try {
          const { getMyTeamEventStatus } = await import('@/features/events/services/event.service')
          const data = await getMyTeamEventStatus(eventId)
          if (!mounted) return
          setTeamStatus(data)
          setEventMembership({
            success: true,
            event_id: eventId,
            is_member: data?.registration_status === 'approved' && data.is_roster_member,
            request_status: data?.registration_status || null,
            join_mode: selectedEventObj.join_mode || 'open'
          })
        } catch (error) {
          console.error(error)
        } finally {
          if (mounted) setEventMembershipLoading(false)
        }
        return
      }

      if (eventMembership?.event_id === eventId) return

      if (eventMembershipCache.has(eventId)) {
        if (mounted) setEventMembership(eventMembershipCache.get(eventId) || null)
        return
      }

      setEventMembershipLoading(true)
      try {
        const data = await getCachedEventMembership(eventId)
        if (!mounted) return
        setEventMembership(data)
      } finally {
        if (mounted) setEventMembershipLoading(false)
      }
    }

    void loadMembership()
    return () => { mounted = false }
  }, [eventId, eventMembership, eventMembershipCache, getCachedEventMembership, user])

  const selectedEventObj =
    typeof eventId === 'string' && eventId !== 'all'
      ? events.find((event) => event.id === eventId) || null
      : null
  const nowDate = new Date()
  const selectedEventStart = selectedEventObj?.start_time ? new Date(selectedEventObj.start_time) : null
  const selectedEventEnd = selectedEventObj?.end_time ? new Date(selectedEventObj.end_time) : null
  const selectedEventNotStarted = !!(selectedEventStart && nowDate < selectedEventStart)
  const selectedEventEnded = !!(selectedEventEnd && nowDate > selectedEventEnd)

  const closeEventsTabIfNeeded = useCallback(() => {
    if (currentTab !== 'events') return

    setCurrentTab('challenges')

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'auto' })
      })
    })
  }, [currentTab, setCurrentTab])

  const attemptEventSelect = useCallback(async (id: EventSelectorValue) => {
    if (id === eventId) {
      closeEventsTabIfNeeded()
      return
    }

    if (id === null || id === 'all') {
      setSelectedEvent(id === null ? 'main' : id)
      closeEventsTabIfNeeded()
      return
    }

    const event = events.find((candidate) => candidate.id === id)
    if (!event) return

    const joinMode = event.join_mode || 'open'
    const isSelectedEventAdmin = eventAdminIds.includes(id)
    const canBypass = isGlobalAdminUser || isSelectedEventAdmin

    if (event.is_team_event) {
      if (canBypass) {
        setSelectedEvent(id)
        closeEventsTabIfNeeded()
        return
      }

      const toastId = toast.loading('Checking team access...')
      try {
        const { getMyTeamEventStatus } = await import('@/features/events/services/event.service')
        const teamStatusObj = await getMyTeamEventStatus(id)
        if (teamStatusObj?.registration_status === 'approved' && teamStatusObj.is_roster_member) {
          setSelectedEvent(id)
          closeEventsTabIfNeeded()
        } else {
          router.push(`/events/${id}/join`)
        }
      } catch (error) {
        console.error(error)
        router.push(`/events/${id}/join`)
      } finally {
        toast.dismiss(toastId)
      }
      return
    }

    if (canBypass || joinMode === 'open') {
      setSelectedEvent(id)
      closeEventsTabIfNeeded()
      return
    }

    let membership = eventMembershipCache.get(id)
    if (membership === undefined) {
      const toastId = toast.loading('Checking access...')
      try {
        membership = await getCachedEventMembership(id)
      } catch (error) {
        console.error(error)
        toast.error('Failed to check access')
        membership = null
      } finally {
        toast.dismiss(toastId)
      }
    }

    if (membership?.is_member) {
      setEventMembership(membership)
      setSelectedEvent(id)
      closeEventsTabIfNeeded()
    } else {
      setTargetEventId(id)
      setTargetEventMembership({ evt: event, joinMode, membership })
      setIsJoinDialogOpen(true)
    }
  }, [
    closeEventsTabIfNeeded,
    eventAdminIds,
    eventId,
    eventMembershipCache,
    events,
    getCachedEventMembership,
    isGlobalAdminUser,
    setSelectedEvent,
  ])

  const selectedJoinMode = eventMembership?.join_mode || (selectedEventObj?.join_mode || 'open')
  const isSelectedEventAdmin = typeof eventId === 'string' && eventId !== 'all' && eventAdminIds.includes(eventId)
  const canBypassEventJoin = isGlobalAdminUser || isSelectedEventAdmin
  const eventJoinBlocked =
    typeof eventId === 'string' &&
    eventId !== 'all' &&
    selectedJoinMode !== 'open' &&
    !eventMembership?.is_member &&
    !canBypassEventJoin

  const enrichedEvents = useMemo(() => {
    return events.map((event) => {
      const isGlobalAdmin = isGlobalAdminUser
      const isEventAdmin = eventAdminIds.includes(event.id)
      const canBypass = isGlobalAdmin || isEventAdmin
      const membership = eventMembershipCache.get(event.id)
      const isLocked = !allMembershipsLoaded
        ? false
        : (!canBypass && event.join_mode !== 'open' && !membership?.is_member)

      return { ...event, isLocked }
    })
  }, [events, isGlobalAdminUser, eventAdminIds, eventMembershipCache, allMembershipsLoaded, eventMembership])

  return {
    eventMembership,
    setEventMembership,
    eventMembershipLoading,
    targetEventId,
    setTargetEventId,
    targetEventMembership,
    setTargetEventMembership,
    isJoinDialogOpen,
    setIsJoinDialogOpen,
    allMembershipsLoaded,
    selectedEventObj,
    nowDate,
    selectedEventStart,
    selectedEventNotStarted,
    selectedEventEnded,
    attemptEventSelect,
    eventJoinBlocked,
    enrichedEvents,
    getCachedEventMembership,
    formatRemaining: formatEventDurationCompact,
  }
}
