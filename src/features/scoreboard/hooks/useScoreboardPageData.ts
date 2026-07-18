'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  getFirstBloodLeaderboard,
  getLeaderboardSummary,
  getTopProgressByUsernames,
  getActiveUserTags,
} from '@/shared/lib'
import { getRecentSolves } from '@/features/logs/lib/log-service'
import { getSolvedEventIds } from '@/features/events/services/event.service'
import { useAuth, useTheme } from '@/shared/contexts'
import { useEventContext } from '@/features/events/contexts/EventContext'
import type { LeaderboardEntry } from '@/shared/types'
import {
  getScoreboardEventParam,
  buildScoreboard,
  isScoreboardEmpty,
} from '../lib'
import type { LeaderboardSummaryRow } from '../types'

export function useScoreboardPageData() {
  const { user, loading: authLoading } = useAuth()
  const { theme } = useTheme()
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [recentSolvesMapState, setRecentSolvesMapState] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const firstBloodMode = useMemo(() => {
    return searchParams.get('mode') === 'first-blood'
  }, [searchParams])
  const setFirstBloodMode = useCallback((value: boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('mode', value ? 'first-blood' : 'points')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, pathname, router])
  const view: 'top' | 'all' = useMemo(() => {
    const value = searchParams.get('tab')
    return value === 'all' ? 'all' : 'top'
  }, [searchParams])
  const setView = useCallback((tab: 'top' | 'all') => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, pathname, router])

  const selectedTag = useMemo(() => {
    return searchParams.get('tag') || ''
  }, [searchParams])
  const setSelectedTag = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('tag', value)
    } else {
      params.delete('tag')
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, pathname, router])
  const { startedEvents, selectedEvent, setSelectedEvent } = useEventContext()
  const [solvedEventIds, setSolvedEventIds] = useState<string[] | null>(null)
  const [hasMounted, setHasMounted] = useState(false)
  const [stableLeaderboard, setStableLeaderboard] = useState<LeaderboardEntry[]>([])
  const [activeTags, setActiveTags] = useState<string[]>([])
  const leaderboardLengthRef = useRef(0)
  const fetchStateRef = useRef({ event: selectedEvent, fb: firstBloodMode, limit: 100 })

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    getSolvedEventIds().then(setSolvedEventIds)
  }, [])

  useEffect(() => {
    getActiveUserTags().then(setActiveTags)
  }, [])

  useEffect(() => {
    leaderboardLengthRef.current = leaderboard.length
    if (leaderboard.length > 0) {
      setStableLeaderboard(leaderboard)
    }
  }, [leaderboard])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const fetchData = async () => {
      const isFirstLoad = leaderboardLengthRef.current === 0
      const targetLimit = view === 'all' ? 1000 : 100
      const lastFetch = fetchStateRef.current

      // Check if we already have sufficient data for the current context to avoid refetching
      const isSameContext = lastFetch.event === selectedEvent && lastFetch.fb === firstBloodMode && (lastFetch as any).tag === selectedTag
      if (isSameContext && lastFetch.limit >= targetLimit && leaderboardLengthRef.current > 0) {
        return
      }

      if (isFirstLoad) setLoading(true)
      if (!user) {
        if (isFirstLoad) setLoading(false)
        return
      }

      const eventParam = getScoreboardEventParam(selectedEvent)

      const eventMode = selectedEvent === 'all' ? 'any' : selectedEvent === 'main' ? 'main' : 'event'
      const p_event_id = (selectedEvent === 'all' || selectedEvent === 'main') ? null : String(selectedEvent)
      const recentSolves = await getRecentSolves(100, 0, p_event_id, eventMode)
      const recentSolvesMap = new Map<string, number>()
      recentSolves.forEach(solve => {
        const count = recentSolvesMap.get(solve.log_username) || 0
        recentSolvesMap.set(solve.log_username, count + 1)
      })

      if (firstBloodMode) {
        const firstBloodLeaderboard = await getFirstBloodLeaderboard(targetLimit, 0, eventParam)
        setLeaderboard(firstBloodLeaderboard)
        setRecentSolvesMapState(recentSolvesMap)
        fetchStateRef.current = { event: selectedEvent, fb: firstBloodMode, limit: targetLimit, tag: selectedTag } as any
        if (isFirstLoad) setLoading(false)
        return
      }

      const summary = await getLeaderboardSummary(targetLimit, 0, eventParam, selectedTag)
      const topUsernames = summary.slice(0, 10).map((row: LeaderboardSummaryRow) => row.username)
      const progressMap = await getTopProgressByUsernames(topUsernames, eventParam)

      const result = buildScoreboard(summary, {
        nameKey: 'username',
        scoreKey: 'score',
        limit: targetLimit,
        progressMap
      })

      setLeaderboard(result.entries)
      setRecentSolvesMapState(recentSolvesMap)
      fetchStateRef.current = { event: selectedEvent, fb: firstBloodMode, limit: targetLimit, tag: selectedTag } as any
      if (isFirstLoad) setLoading(false)
    }

    fetchData()
  }, [user, firstBloodMode, selectedEvent, view, selectedTag])

  const eventParam = getScoreboardEventParam(selectedEvent)

  const filteredStartedEvents = useMemo(() => {
    if (solvedEventIds === null) return startedEvents
    const solved = startedEvents.filter((e) => solvedEventIds.includes(String(e.id)))
    const selectedInList = selectedEvent === 'all' || selectedEvent === 'main' || solved.some((e) => String(e.id) === String(selectedEvent))
    if (selectedInList) return solved
    const currentEvent = startedEvents.find((e) => String(e.id) === String(selectedEvent))
    if (currentEvent) return [...solved, currentEvent]
    return solved
  }, [startedEvents, solvedEventIds, selectedEvent])

  const displayedLeaderboard = view === 'top' ? leaderboard.slice(0, 100) : leaderboard
  const displayedStableLeaderboard = view === 'top' ? stableLeaderboard.slice(0, 100) : stableLeaderboard

  return {
    user,
    authLoading,
    theme,
    leaderboard: displayedLeaderboard,
    loading,
    firstBloodMode,
    setFirstBloodMode,
    view,
    setView,
    startedEvents: filteredStartedEvents,
    selectedEvent,
    setSelectedEvent,
    hasMounted,
    stableLeaderboard: displayedStableLeaderboard,
    isEmpty: isScoreboardEmpty(displayedLeaderboard),
    isDark: theme === 'dark',
    eventParam,
    recentSolvesMap: recentSolvesMapState,
    selectedTag,
    setSelectedTag,
    activeTags,
  }
}
