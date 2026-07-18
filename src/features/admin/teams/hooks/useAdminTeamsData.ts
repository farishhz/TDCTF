"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/features/auth'
import { useAuth } from '@/shared/contexts/AuthContext'
import { getAdminTeams } from '../services/admin-teams.service'
import type { AdminTeamRow } from '../types'

export function useAdminTeamsData() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [teams, setTeams] = useState<AdminTeamRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isDataLoading, setIsDataLoading] = useState(false)
  const [accessReady, setAccessReady] = useState(false)
  const [isAllowed, setIsAllowed] = useState(false)

  // Filters state
  const [query, setQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('') // committed search query
  const [sortMode, setSortMode] = useState<'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'member_count'>('newest')
  const [pageSize, setPageSize] = useState(100)
  const [page, setPage] = useState(1)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const onRefresh = () => setRefreshTrigger((prev) => prev + 1)

  useEffect(() => {
    let mounted = true

    const checkAccess = async () => {
      if (authLoading) return

      if (!user) {
        setAccessReady(true)
        router.push('/challenges')
        return
      }

      const allowed = await AuthService.isGlobalAdmin()
      if (!mounted) return

      setIsAllowed(allowed)
      setAccessReady(true)
      if (!allowed) {
        router.push('/challenges')
        return
      }
    }

    void checkAccess()

    return () => {
      mounted = false
    }
  }, [authLoading, router, user])

  // Fetch data reactively when query/pagination changes
  useEffect(() => {
    if (!isAllowed) return
    let mounted = true

    const fetchData = async () => {
      setIsDataLoading(true)
      const offset = (page - 1) * pageSize
      const result = await getAdminTeams({
        search: searchQuery,
        sortBy: sortMode,
        limit: pageSize,
        offset: offset,
      })

      if (!mounted) return
      setTeams(result.teams)
      setTotalCount(result.totalCount)
      setIsLoading(false)
      setIsDataLoading(false)
    }

    void fetchData()

    return () => {
      mounted = false
    }
  }, [isAllowed, searchQuery, sortMode, pageSize, page, refreshTrigger])

  return {
    user,
    authLoading,
    accessReady,
    isAllowed,
    isLoading,
    isDataLoading,
    teams,
    totalCount,
    query,
    setQuery,
    searchQuery,
    setSearchQuery,
    sortMode,
    setSortMode,
    pageSize,
    setPageSize,
    page,
    setPage,
    onRefresh,
  }
}
