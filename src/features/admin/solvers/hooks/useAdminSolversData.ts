"use client"

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuth } from '@/shared/contexts/AuthContext'
import {
  deleteSolver,
  getSolversAll,
  getSolversByChallengeTitle,
  getSolversByUsername,
  isAdmin,
} from '../lib'
import type { PendingDeleteDetail, SolverRow } from '../types'

export function useAdminSolversData() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [isAdminUser, setIsAdminUser] = useState(false)
  const [solvers, setSolvers] = useState<SolverRow[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<string | null>(null)
  const [pendingDeleteDetail, setPendingDeleteDetail] = useState<PendingDeleteDetail>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const fetchSolvers = useCallback(async (startOffset = 0) => {
    try {
      if (startOffset > 0) setLoadingMore(true)
      const data = await getSolversAll(100, startOffset)
      setSolvers((prev) => (startOffset === 0 ? data : [...prev, ...data]))
      setOffset(startOffset + 100)
      setHasMore(data.length === 100)
      if (startOffset === 0) setSelectedIds([])
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch solvers')
    } finally {
      setLoadingMore(false)
    }
  }, [])

  const searchSolvers = useCallback(async () => {
    const keyword = searchQuery.trim()
    setSelectedIds([])
    if (!keyword) {
      await fetchSolvers(0)
      return
    }

    setSearching(true)
    try {
      const [userResults, challengeResults] = await Promise.all([
        getSolversByUsername(keyword),
        getSolversByChallengeTitle(keyword),
      ])
      const combined = [...userResults, ...challengeResults]
      const unique = combined.filter(
        (item, index, self) => index === self.findIndex((t) => t.solve_id === item.solve_id),
      )
      setSolvers(unique)
      setHasMore(false)
    } catch (err) {
      toast.error('Failed to search solvers')
      console.error(err)
    } finally {
      setSearching(false)
    }
  }, [fetchSolvers, searchQuery])

  const resetSearch = useCallback(async () => {
    setSearchQuery('')
    setSelectedIds([])
    await fetchSolvers(0)
  }, [fetchSolvers])

  const askDelete = useCallback((id: string) => {
    const solver = solvers.find((s) => s.solve_id === id)
    setPendingDelete(id)
    if (solver) {
      setPendingDeleteDetail({ username: solver.username, challenge_title: solver.challenge_title })
    } else {
      setPendingDeleteDetail(null)
    }
    setConfirmOpen(true)
  }, [solvers])

  const doDelete = useCallback(async (id: string) => {
    try {
      await deleteSolver(id)
      setSolvers((prev) => prev.filter((s) => s.solve_id !== id))
      setSelectedIds((prev) => prev.filter((val) => val !== id))
      toast.success('Solve deleted successfully')
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete solve')
    }
  }, [])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((val) => val !== id) : [...prev, id]
    )
  }, [])

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.length === solvers.length ? [] : solvers.map((s) => s.solve_id)
    )
  }, [solvers])

  const doBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return
    const toastId = toast.loading(`Deleting ${selectedIds.length} solve(s)...`)
    try {
      await Promise.all(selectedIds.map((id) => deleteSolver(id)))
      setSolvers((prev) => prev.filter((s) => !selectedIds.includes(s.solve_id)))
      toast.success(`Successfully deleted ${selectedIds.length} solve(s)`, { id: toastId })
      setSelectedIds([])
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete some or all selected solves', { id: toastId })
    }
  }, [selectedIds])

  useEffect(() => {
    let mounted = true

    const initSolversData = async () => {
      if (authLoading) return

      if (!user) {
        router.push('/challenges')
        return
      }

      const adminCheck = await isAdmin()
      if (!mounted) return
      setIsAdminUser(adminCheck)
      if (!adminCheck) {
        router.push('/challenges')
        return
      }

      await fetchSolvers(0)
      if (!mounted) return
      setIsLoading(false)
    }

    initSolversData()
    return () => {
      mounted = false
    }
  }, [authLoading, user, router, fetchSolvers])

  return {
    user,
    authLoading,
    isLoading,
    isAdminUser,
    solvers,
    offset,
    hasMore,
    loadingMore,
    searchQuery,
    setSearchQuery,
    searching,
    confirmOpen,
    setConfirmOpen,
    pendingDelete,
    setPendingDelete,
    pendingDeleteDetail,
    setPendingDeleteDetail,
    fetchSolvers,
    searchSolvers,
    resetSearch,
    askDelete,
    doDelete,
    selectedIds,
    setSelectedIds,
    toggleSelect,
    toggleSelectAll,
    doBulkDelete,
  }
}
