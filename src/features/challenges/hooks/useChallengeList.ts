'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import APP from '@/config'
import { getMyTeamChallenges } from '@/features/teams/services/team.service'
import { getChallengesList } from '@/shared/lib'
import type { ChallengeWithSolve } from '@/shared/types'
import type { EventSelectorValue } from '../types'

const getEventCacheKey = (eventId?: EventSelectorValue) => {
  if (eventId === undefined || eventId === 'all') return 'all'
  if (eventId === null) return 'main'
  return String(eventId)
}

const getChallengesSnapshot = (challenges: ChallengeWithSolve[]) => {
  return JSON.stringify(challenges.map((challenge: any) => ({
    id: challenge.id,
    event_id: challenge.event_id ?? null,
    updated_at: challenge.updated_at ?? null,
    points: challenge.points,
    total_solves: challenge.total_solves,
    is_solved: !!challenge.is_solved,
    is_team_solved: !!challenge.is_team_solved,
    has_questions: !!challenge.has_questions,
    is_maintenance: !!challenge.is_maintenance,
  })))
}

export function useChallengeList(userId?: string, eventId?: EventSelectorValue) {
  const [challenges, setChallenges] = useState<ChallengeWithSolve[]>([])
  const [isChallengesLoading, setIsChallengesLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const initialLoadingRef = useRef(true)
  const requestIdRef = useRef(0)
  const cacheRef = useRef(new Map<string, ChallengeWithSolve[]>())
  const snapshotRef = useRef('[]')
  const userIdRef = useRef(userId)

  useEffect(() => {
    initialLoadingRef.current = initialLoading
  }, [initialLoading])

  useEffect(() => {
    if (userIdRef.current === userId) return

    userIdRef.current = userId
    cacheRef.current.clear()
    snapshotRef.current = '[]'
    setChallenges([])
  }, [userId])

  useEffect(() => {
    if (initialLoadingRef.current) return

    const cachedChallenges = cacheRef.current.get(getEventCacheKey(eventId))
      || cacheRef.current.get('all')

    if (!cachedChallenges) return

    const cachedSnapshot = getChallengesSnapshot(cachedChallenges)
    if (cachedSnapshot === snapshotRef.current) return

    snapshotRef.current = cachedSnapshot
    setChallenges(cachedChallenges)
  }, [eventId])

  const loadChallenges = useCallback(async () => {
    if (!userId) return

    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    const shouldShowInitialLoader = initialLoadingRef.current
    if (shouldShowInitialLoader) setIsChallengesLoading(true)

    try {
      const [challengesData, teamChallengesResult] = await Promise.all([
        getChallengesList(userId, false, eventId),
        APP.teams.enabled ? getMyTeamChallenges() : Promise.resolve({ challenges: [] }),
      ])
      const teamSolvedIds = new Set((teamChallengesResult?.challenges || []).map((challenge: any) => challenge.challenge_id))

      if (requestId !== requestIdRef.current) return

      const nextChallenges = (challengesData || []).map((challenge: any) => ({
        ...challenge,
        hint: [],
        attachments: [],
        description: typeof challenge.description === 'string' ? challenge.description : '',
        is_team_solved: teamSolvedIds.has(challenge.id),
      }))
      const nextSnapshot = getChallengesSnapshot(nextChallenges)

      cacheRef.current.set(getEventCacheKey(eventId), nextChallenges)
      if (nextSnapshot !== snapshotRef.current) {
        snapshotRef.current = nextSnapshot
        setChallenges(nextChallenges)
      }
    } finally {
      if (shouldShowInitialLoader) {
        initialLoadingRef.current = false
        setIsChallengesLoading(false)
        setInitialLoading(false)
      }
    }
  }, [eventId, userId])

  const updateChallengeSolvesCount = useCallback((challengeId: string, totalSolves: number) => {
    setChallenges((prevChallenges) =>
      prevChallenges.map((c: ChallengeWithSolve) =>
        c.id === challengeId ? { ...c, total_solves: totalSolves } : c
      )
    )

    cacheRef.current.forEach((cachedList, key) => {
      cacheRef.current.set(
        key,
        cachedList.map((c: ChallengeWithSolve) =>
          c.id === challengeId ? { ...c, total_solves: totalSolves } : c
        )
      )
    })
  }, [])

  useEffect(() => {
    void loadChallenges()
  }, [loadChallenges])

  return {
    challenges,
    isChallengesLoading,
    initialLoading,
    loadChallenges,
    updateChallengeSolvesCount,
  }
}
