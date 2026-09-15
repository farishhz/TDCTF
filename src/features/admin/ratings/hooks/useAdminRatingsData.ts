'use client'

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/shared/contexts/AuthContext'
import {
  deleteChallengeRating,
  getAdminChallengeRatings,
  getAdminRatingAnalytics,
} from '@/features/challenges/services/challenge-ratings.service'
import type { ChallengeRating, RatingAnalyticsSummary } from '@/shared/types'

export function useAdminRatingsData() {
  const { user, loading: authLoading } = useAuth()
  const isAdminUser = Boolean(user?.is_admin)

  const [ratings, setRatings] = useState<ChallengeRating[]>([])
  const [analytics, setAnalytics] = useState<RatingAnalyticsSummary | null>(null)
  const [total, setTotal] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [offset, setOffset] = useState<number>(0)
  const [hasMore, setHasMore] = useState<boolean>(true)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [eventIdFilter, setEventIdFilter] = useState<string>('all')

  // Moderation / Delete Dialog State
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false)
  const [pendingDelete, setPendingDelete] = useState<ChallengeRating | null>(null)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  const fetchRatings = useCallback(
    async (startOffset = 0) => {
      try {
        if (startOffset > 0) setLoadingMore(true)
        const res = await getAdminChallengeRatings({
          searchQuery,
          ratingFilter,
          categoryFilter,
          eventIdFilter,
          limit: 20,
          offset: startOffset,
        })

        setRatings((prev) => (startOffset === 0 ? res.data : [...prev, ...res.data]))
        setTotal(res.total)
        setOffset(startOffset + 20)
        setHasMore(res.data.length === 20 && startOffset + 20 < res.total)
      } catch (err) {
        console.error('Error fetching admin ratings:', err)
        toast.error('Gagal memuat data rating evaluasi.')
      } finally {
        setIsLoading(false)
        setLoadingMore(false)
      }
    },
    [searchQuery, ratingFilter, categoryFilter, eventIdFilter]
  )

  const fetchAnalytics = useCallback(async () => {
    const summary = await getAdminRatingAnalytics()
    setAnalytics(summary)
  }, [])

  const reloadAll = useCallback(async () => {
    setIsLoading(true)
    await Promise.all([fetchRatings(0), fetchAnalytics()])
  }, [fetchRatings, fetchAnalytics])

  useEffect(() => {
    if (!authLoading && user && isAdminUser) {
      reloadAll()
    }
  }, [authLoading, user, isAdminUser, reloadAll])

  const handleAskDelete = (item: ChallengeRating) => {
    setPendingDelete(item)
    setConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return
    setIsDeleting(true)

    const ok = await deleteChallengeRating(pendingDelete.id)
    setIsDeleting(false)

    if (ok) {
      toast.success('Rating & feedback berhasil dihapus.')
      setRatings((prev) => prev.filter((r) => r.id !== pendingDelete.id))
      setTotal((t) => Math.max(0, t - 1))
      setConfirmOpen(false)
      setPendingDelete(null)
      fetchAnalytics()
    } else {
      toast.error('Gagal menghapus rating.')
    }
  }

  return {
    user,
    authLoading,
    isAdminUser,
    isLoading,
    loadingMore,
    ratings,
    analytics,
    total,
    offset,
    hasMore,
    searchQuery,
    setSearchQuery,
    ratingFilter,
    setRatingFilter,
    categoryFilter,
    setCategoryFilter,
    eventIdFilter,
    setEventIdFilter,
    fetchRatings,
    reloadAll,
    confirmOpen,
    setConfirmOpen,
    pendingDelete,
    isDeleting,
    handleAskDelete,
    handleConfirmDelete,
  }
}
