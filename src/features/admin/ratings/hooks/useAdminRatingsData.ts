'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAuth } from '@/shared/contexts/AuthContext'
import { isAdmin } from '@/features/admin/services/admin.service'
import {
  deleteChallengeRating,
  getAdminChallengeRatings,
  getAdminRatingAnalytics,
} from '@/features/challenges/services/challenge-ratings.service'
import type { ChallengeRating, RatingAnalyticsSummary } from '@/shared/types'

export function useAdminRatingsData() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false)

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
        setLoadingMore(false)
      }
    },
    [searchQuery, ratingFilter, categoryFilter, eventIdFilter]
  )

  const fetchAnalytics = useCallback(async () => {
    try {
      const summary = await getAdminRatingAnalytics()
      setAnalytics(summary)
    } catch (err) {
      console.error('Error fetching rating analytics:', err)
    }
  }, [])

  const reloadAll = useCallback(async () => {
    setIsLoading(true)
    try {
      await Promise.all([fetchRatings(0), fetchAnalytics()])
    } finally {
      setIsLoading(false)
    }
  }, [fetchRatings, fetchAnalytics])

  useEffect(() => {
    let mounted = true

    const initRatingsData = async () => {
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

      try {
        await Promise.all([fetchRatings(0), fetchAnalytics()])
      } catch (err) {
        console.error('Error initializing ratings data:', err)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initRatingsData()
    return () => {
      mounted = false
    }
  }, [authLoading, user, router, fetchRatings, fetchAnalytics])

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
