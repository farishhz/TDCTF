'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { submitFlag, getMyFlagSubmissionStats } from '@/shared/lib'
import type { User } from '@/shared/types'
import type { KeyedBooleanMap, KeyedFlagFeedbackMap, KeyedStringMap } from '../types'

type UseChallengeFlagSubmissionOptions = {
  user: User | null | undefined
  reloadChallenges: () => Promise<void>
  selectedChallengeId?: string | null
}

export function useChallengeFlagSubmission({
  user,
  reloadChallenges,
  selectedChallengeId,
}: UseChallengeFlagSubmissionOptions) {
  const [flagInputs, setFlagInputs] = useState<KeyedStringMap>({})
  const [flagFeedback, setFlagFeedback] = useState<KeyedFlagFeedbackMap>({})
  const [submitting, setSubmitting] = useState<KeyedBooleanMap>({})

  const [stats, setStats] = useState<{
    incorrect_attempts: number
    window_attempts: number
    window_start_at: string
    remaining_attempts: number
    cooldown_seconds: number
  } | null>(null)

  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0)
  const feedbackTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({})

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(feedbackTimeoutsRef.current).forEach(clearTimeout)
    }
  }, [])

  const fetchStats = useCallback(async (challengeId: string) => {
    if (!user) return
    const data = await getMyFlagSubmissionStats(challengeId)
    setStats(data)
    if (data) {
      setCooldownSeconds(data.cooldown_seconds)
    } else {
      setCooldownSeconds(0)
    }
  }, [user])

  // Fetch stats when selected challenge changes
  useEffect(() => {
    if (selectedChallengeId) {
      fetchStats(selectedChallengeId)
    } else {
      setStats(null)
      setCooldownSeconds(0)
    }
  }, [selectedChallengeId, fetchStats])

  const submissionsRemaining = useMemo(() => {
    if (!stats) return 10
    return stats.remaining_attempts
  }, [stats])

  // Countdown timer for rate limiting
  useEffect(() => {
    if (cooldownSeconds <= 0) return

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          if (selectedChallengeId) {
            fetchStats(selectedChallengeId)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldownSeconds, selectedChallengeId, fetchStats])

  const handleFlagSubmit = useCallback(async (challengeId: string, customFlag?: string) => {
    const flagVal = (customFlag || flagInputs[challengeId] || '').trim()
    if (!user || !flagVal) return

    setSubmitting((prev) => ({ ...prev, [challengeId]: true }))
    setFlagFeedback((prev) => ({ ...prev, [challengeId]: null }))

    try {
      const result = await submitFlag(challengeId, flagVal)
      if (result?.success) await reloadChallenges()

      // Update our rate limiting stats immediately after submit
      await fetchStats(challengeId)

      // Clear any existing auto-dismiss timer for this challenge
      if (feedbackTimeoutsRef.current[challengeId]) {
        clearTimeout(feedbackTimeoutsRef.current[challengeId])
      }

      setFlagFeedback((prev) => ({ ...prev, [challengeId]: { success: result.success, message: result.message } }))

      // Set new auto-dismiss timer (5 seconds)
      feedbackTimeoutsRef.current[challengeId] = setTimeout(() => {
        setFlagFeedback((prev) => ({ ...prev, [challengeId]: null }))
      }, 5000)

      if (result.success) {
        const audio = new Audio('/sounds/succes.wav')
        audio.volume = 0.3
        audio.play().catch(() => {})
        import('canvas-confetti').then((confetti) => {
          const duration = 0.8 * 1000
          const end = Date.now() + duration
          const frame = () => {
            confetti.default({
              particleCount: 3,
              startVelocity: 20,
              spread: 360,
              ticks: 80,
              gravity: 0.8,
              scalar: 0.8,
              colors: ['#00e0ff', '#ffffff', '#ff7b00'],
              origin: { x: Math.random(), y: Math.random() - 0.2 },
            })
            if (Date.now() < end) requestAnimationFrame(frame)
          }
          frame()
        })
        setFlagInputs((prev) => ({ ...prev, [challengeId]: '' }))
      } else {
        const audio = new Audio('/sounds/incorect.mp3')
        audio.volume = 0.3
        audio.play().catch(() => {})
      }
    } catch (error) {
      console.error('Error submitting flag:', error)
      if (feedbackTimeoutsRef.current[challengeId]) {
        clearTimeout(feedbackTimeoutsRef.current[challengeId])
      }
      setFlagFeedback((prev) => ({ ...prev, [challengeId]: { success: false, message: 'Failed to submit flag' } }))
      feedbackTimeoutsRef.current[challengeId] = setTimeout(() => {
        setFlagFeedback((prev) => ({ ...prev, [challengeId]: null }))
      }, 5000)
    } finally {
      setSubmitting((prev) => ({ ...prev, [challengeId]: false }))
    }
  }, [flagInputs, reloadChallenges, user, fetchStats])

  const handleFlagInputChange = useCallback((challengeId: string, value: string) => {
    setFlagInputs((prev) => ({ ...prev, [challengeId]: value }))
  }, [])

  return {
    flagInputs,
    flagFeedback,
    submitting,
    submissionsRemaining,
    cooldownSeconds,
    fetchStats,
    handleFlagSubmit,
    handleFlagInputChange,
  }
}
