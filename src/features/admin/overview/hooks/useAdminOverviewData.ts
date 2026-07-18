"use client"

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/contexts'
import { AuthService } from '@/features/auth'
import { getInfo } from '@/features/admin/overview/services/site-info.service'
import { getSolversAll } from '@/features/admin/solvers/lib'
import { getChallengesList } from '@/shared/lib'
import type { Challenge } from '@/shared/types'
import type { SolverRow } from '@/features/admin/solvers/types'
import type { ActivityPoint, TimeRange, SiteInfo } from '../types'
import { getStatsByRange } from '../services/activity-stats.service'

export function useAdminOverviewData() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [siteInfo, setSiteInfo] = useState<SiteInfo | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('7d')
  const [activityData, setActivityData] = useState<ActivityPoint[]>([])
  const [recentSolves, setRecentSolves] = useState<SolverRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [accessReady, setAccessReady] = useState(true)
  const [isAllowed, setIsAllowed] = useState(true)

  const refreshStats = useCallback(async (newRange: TimeRange) => {
    setTimeRange(newRange)
    const stats = await getStatsByRange(newRange)
    setActivityData(stats)
  }, [])

  useEffect(() => {
    let mounted = true

    const initOverviewData = async () => {
      if (authLoading) return

      if (!user) {
        setAccessReady(true)
        router.push('/challenges')
        return
      }

      const adminCheck = await AuthService.isGlobalAdmin()
      if (!mounted) return
      setIsAllowed(adminCheck)
      setAccessReady(true)
      if (!adminCheck) {
        router.push('/challenges')
        return
      }

      const [challengeList, info, stats, solves] = await Promise.all([
        getChallengesList(undefined, true, 'all'),
        getInfo(),
        getStatsByRange(timeRange),
        getSolversAll(10, 0),
      ])

      if (!mounted) return
      setChallenges(challengeList)
      setSiteInfo(info)
      setActivityData(stats)
      setRecentSolves(solves)
      setIsLoading(false)
    }

    initOverviewData()
    return () => { mounted = false }
  }, [authLoading, user, router, timeRange])

  return {
    user,
    authLoading,
    accessReady,
    isAllowed,
    isLoading,
    challenges,
    siteInfo,
    timeRange,
    activityData,
    recentSolves,
    refreshStats,
  }
}
