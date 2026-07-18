import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import toast from 'react-hot-toast'
import {
  getMyTeam,
  getMyTeamSummary,
  getMyTeamChallenges,
  createTeam,
  joinTeam,
  leaveTeam,
  deleteTeam,
  regenerateTeamInviteCode,
  kickTeamMember,
  transferTeamCaptain,
  updateTeamProfile,
} from '@/features/teams/services/team.service'
import { TeamInfo, TeamMember, TeamSummary, TeamChallenge } from '../types'

export function useMyTeam(user: any, effectiveSelectedEvent: string | number) {
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [team, setTeam] = useState<TeamInfo | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])
  const [summary, setSummary] = useState<TeamSummary | null>(null)
  const [challenges, setChallenges] = useState<TeamChallenge[]>([])
  const [solvedEventIds, setSolvedEventIds] = useState<string[]>([])
  const [hasMainSolved, setHasMainSolved] = useState<boolean>(false)
  // toast-based status inline
  const [initialLoading, setInitialLoading] = useState(true)
  const teamRef = useRef<TeamInfo | null>(null)

  const loadTeamData = useCallback(async () => {
    if (!user) return
    const isFirstLoad = teamRef.current === null
    if (isFirstLoad) setLoading(true)

    const p_event_id = (effectiveSelectedEvent === 'all' || effectiveSelectedEvent === 'main') ? null : String(effectiveSelectedEvent)
    const p_event_mode = effectiveSelectedEvent === 'all' ? 'any' : effectiveSelectedEvent === 'main' ? 'main' : 'event'

    try {
      const [teamRes, summaryRes, challengesRes] = await Promise.all([
        getMyTeam(p_event_id, p_event_mode),
        getMyTeamSummary(p_event_id, p_event_mode),
        getMyTeamChallenges(p_event_id, p_event_mode),
      ])

      const nextTeam = teamRes.team ?? null
      teamRef.current = nextTeam
      setTeam(nextTeam)
      setMembers(teamRes.members ?? [])
      setSummary(summaryRes.stats ?? null)
      setChallenges(challengesRes.challenges ?? [])
      setSolvedEventIds(teamRes.solved_event_ids ?? [])
      setHasMainSolved(!!teamRes.has_main_solved)
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }, [user, effectiveSelectedEvent])

  useEffect(() => {
    loadTeamData()
  }, [loadTeamData])

  const currentMember = useMemo(() => members.find(m => m.user_id === user?.id), [members, user])
  const isCaptain = currentMember?.role === 'captain'
  const canManage = isCaptain

  const handleCreateTeam = async (teamName: string) => {
    if (!teamName.trim()) return
    setBusy(true)
    const { error } = await createTeam(teamName.trim())
    if (error) {
      toast.error(error)
    } else {
      toast.success('Team created.')
      await loadTeamData()
    }
    setBusy(false)
  }

  const handleJoinTeam = async (inviteCode: string) => {
    if (!inviteCode.trim()) return
    setBusy(true)
    const { error } = await joinTeam(inviteCode.trim())
    if (error) {
      toast.error(error)
    } else {
      toast.success('Joined team.')
      await loadTeamData()
    }
    setBusy(false)
  }

  const handleLeaveTeam = async () => {
    setBusy(true)
    const { success, error } = await leaveTeam()
    if (!success) {
      toast.error(error || 'Failed to leave team.')
    } else {
      toast.success('You left the team.')
      await loadTeamData()
    }
    setBusy(false)
  }

  const handleDeleteTeam = async (teamId: string) => {
    setBusy(true)
    const { success, error } = await deleteTeam(teamId)
    if (!success) {
      toast.error(error || 'Failed to delete team.')
    } else {
      toast.success('Team deleted.')
      await loadTeamData()
    }
    setBusy(false)
  }

  const handleRegenerateInvite = async (teamId: string) => {
    setBusy(true)
    const { error } = await regenerateTeamInviteCode(teamId)
    if (error) {
      toast.error(error)
    } else {
      toast.success('Invite code regenerated.')
      await loadTeamData()
    }
    setBusy(false)
  }

  const handleKickMember = async (teamId: string, member: TeamMember) => {
    setBusy(true)
    const { success, error } = await kickTeamMember(teamId, member.user_id)
    if (!success) {
      toast.error(error || 'Failed to kick member.')
    } else {
      toast.success(`${member.username} kicked.`)
      await loadTeamData()
    }
    setBusy(false)
  }

  const handleTransferCaptain = async (teamId: string, member: TeamMember) => {
    setBusy(true)
    try {
      const { success, error } = await transferTeamCaptain(teamId, member.user_id)
      if (!success) {
        toast.error(error || 'Failed to transfer captain.')
      } else {
        toast.success(`${member.username} is now captain.`)
        await loadTeamData()
      }
    } catch (err: any) {
      toast.error(err?.message || 'Unexpected error occurred.')
    } finally {
      setBusy(false)
    }
  }

  const handleRenameTeam = async (teamId: string, newName: string, pictureUrl?: string | null) => {
    const { success, error } = await updateTeamProfile(teamId, newName, pictureUrl)
    if (success) {
      toast.success('Team profile updated.')
      await loadTeamData()
    }
    return { success, error }
  }

  return {
    loading,
    busy,
    team,
    members,
    summary,
    challenges,
    solvedEventIds,
    hasMainSolved,
    initialLoading,
    canManage,
    handleCreateTeam,
    handleJoinTeam,
    handleLeaveTeam,
    handleDeleteTeam,
    handleRegenerateInvite,
    handleKickMember,
    handleTransferCaptain,
    handleRenameTeam,
    refresh: loadTeamData
  }
}
