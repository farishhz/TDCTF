'use client'

import { useEffect, useState } from 'react'
import { getUserDetailLite } from '@/features/users/services/user-profile.service'
import type { ChallengeWithSolve } from '@/shared/types'

export type ChallengeStats = {
  rank: number | null
  solved: number
  total: number
}

export function useChallengeStats(
  user: { id: string } | null,
  challenges: ChallengeWithSolve[],
  eventId: string | null | undefined
): ChallengeStats | null {
  const [stats, setStats] = useState<ChallengeStats | null>(null)

  useEffect(() => {
    if (!user) {
      setStats(null)
      return
    }

    const eventChallenges = challenges.filter((c) => {
      if (eventId === 'all') return true
      if (eventId === null) return c.event_id == null
      if (typeof eventId === 'string') return c.event_id === eventId
      return false
    })

    const total = eventChallenges.length
    const solved = eventChallenges.filter((c) => c.is_solved).length

    if (total === 0) {
      setStats({ rank: null, solved: 0, total: 0 })
      return
    }

    const rpcEventId = eventId === 'all' || eventId === null ? null : eventId
    const rpcEventMode = eventId === 'all' ? 'any' : eventId === null ? 'is_null' : 'equals'

    let cancelled = false

    getUserDetailLite(user.id, rpcEventId, rpcEventMode).then((detail) => {
      if (cancelled) return
      setStats({
        rank: detail?.rank ?? null,
        solved,
        total,
      })
    })

    return () => {
      cancelled = true
    }
  }, [user?.id, eventId, challenges])

  return stats
}
