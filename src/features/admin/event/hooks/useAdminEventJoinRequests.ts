import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { listEventJoinRequests, reviewEventJoinRequest, listEventTeams, reviewTeamEvent } from '../lib'
import type { EventJoinRequestRow } from '../types'
import type { EventTeamRow } from '@/features/events/services/event.service'

interface UseAdminEventJoinRequestsOptions {
  manageEventId: string
  loadEventMembers: (eventId: string) => Promise<void>
}

export function useAdminEventJoinRequests({
  manageEventId,
  loadEventMembers,
}: UseAdminEventJoinRequestsOptions) {
  const [joinRequests, setJoinRequests] = useState<EventJoinRequestRow[]>([])
  const [loadingJoinRequests, setLoadingJoinRequests] = useState(false)
  const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(null)

  // Team-event states
  const [eventTeams, setEventTeams] = useState<EventTeamRow[]>([])
  const [loadingEventTeams, setLoadingEventTeams] = useState(false)
  const [reviewingTeamId, setReviewingTeamId] = useState<string | null>(null)

  const loadJoinRequests = useCallback(async (eventId: string) => {
    if (!eventId) {
      setJoinRequests([])
      setEventTeams([])
      return
    }
    setLoadingJoinRequests(true)
    setLoadingEventTeams(true)
    try {
      const [requestsData, teamsData] = await Promise.all([
        listEventJoinRequests(eventId, 'pending'),
        listEventTeams(eventId),
      ])
      setJoinRequests(requestsData)
      setEventTeams(teamsData)
    } catch (err) {
      console.error('Failed to load event entries:', err)
    } finally {
      setLoadingJoinRequests(false)
      setLoadingEventTeams(false)
    }
  }, [])

  const handleReviewRequest = useCallback(async (requestId: string, approve: boolean) => {
    if (!manageEventId) return
    setReviewingRequestId(requestId)
    try {
      await reviewEventJoinRequest(requestId, approve)
      await loadJoinRequests(manageEventId)
      await loadEventMembers(manageEventId)
      toast.success(approve ? 'Request approved' : 'Request rejected')
    } catch (err) {
      console.error(err)
      toast.error('Failed to review request')
    } finally {
      setReviewingRequestId(null)
    }
  }, [manageEventId, loadJoinRequests, loadEventMembers])

  const handleReviewTeam = useCallback(async (teamId: string, approve: boolean) => {
    if (!manageEventId) return
    setReviewingTeamId(teamId)
    try {
      const res = await reviewTeamEvent(manageEventId, teamId, approve)
      if (res?.success) {
        toast.success(approve ? 'Team pendaftaran disetujui (Roster terkunci!)' : 'Team pendaftaran ditolak')
        await loadJoinRequests(manageEventId)
        await loadEventMembers(manageEventId)
      } else {
        toast.error('Failed to review team registration')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to review team registration')
    } finally {
      setReviewingTeamId(null)
    }
  }, [manageEventId, loadJoinRequests, loadEventMembers])

  return {
    loadJoinRequests,
    joinRequests,
    loadingJoinRequests,
    reviewingRequestId,
    handleReviewRequest,
    eventTeams,
    loadingEventTeams,
    reviewingTeamId,
    handleReviewTeam,
  }
}
