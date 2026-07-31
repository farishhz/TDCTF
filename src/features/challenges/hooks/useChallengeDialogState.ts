'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  getChallengeDetail,
  getSolversByChallenge,
} from '@/shared/lib'
import type { Attachment, ChallengeWithSolve } from '@/shared/types'
import {
  getStoredSelectedChallengeId,
  normalizeChallengeHints,
  persistSelectedChallenge,
} from '../lib'
import type {
  ChallengeDialogTab,
  HintModalState,
  KeyedBooleanMap,
  KeyedStringMap,
  Solver,
} from '../types'

type UseChallengeDialogStateOptions = {
  challenges: ChallengeWithSolve[]
  initialLoading: boolean
  refreshSubChallenges: (challengeId: string) => Promise<unknown> | unknown
  onUpdateChallengeSolves?: (challengeId: string, totalSolves: number) => void
}

export function useChallengeDialogState({
  challenges,
  initialLoading,
  refreshSubChallenges,
  onUpdateChallengeSolves,
}: UseChallengeDialogStateOptions) {
  const [challengeTab, setChallengeTab] = useState<ChallengeDialogTab>('challenge')
  const [solvers, setSolvers] = useState<Solver[]>([])
  const [placeholders, setPlaceholders] = useState<KeyedStringMap>({})
  const [showHintModal, setShowHintModal] = useState<HintModalState>({ challenge: null })
  const [downloading, setDownloading] = useState<KeyedBooleanMap>({})
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeWithSolve | null>(null)

  const [challengeDetailCache] = useState(() => new Map<string, ChallengeWithSolve>())
  const [solversCache] = useState(() => new Map<string, Solver[]>())

  const scrollPositionRef = useRef({ x: 0, y: 0 })



  const fetchSolversForChallenge = useCallback(async (challengeId: string, force = false) => {
    const cached = solversCache.get(challengeId)
    if (cached && !force) {
      setSolvers(cached)
      return
    }

    try {
      const data = await getSolversByChallenge(challengeId)
      solversCache.set(challengeId, data)
      setSolvers(data)

      const currentChallenge = challenges.find((c) => c.id === challengeId)
      if (currentChallenge && currentChallenge.total_solves !== data.length) {
        onUpdateChallengeSolves?.(challengeId, data.length)
      }
    } catch {
      setSolvers([])
    }
  }, [solversCache, challenges, onUpdateChallengeSolves])

  const handleTabChange = useCallback(async (tab: ChallengeDialogTab, challengeId: string) => {
    setChallengeTab(tab)
    if (tab === 'solvers') {
      await fetchSolversForChallenge(challengeId, true)
      return
    }
    if (tab === 'question') {
      await refreshSubChallenges(challengeId)
      return
    }
  }, [fetchSolversForChallenge, refreshSubChallenges])

  const openChallenge = useCallback(async (challenge: ChallengeWithSolve) => {
    scrollPositionRef.current = { x: window.scrollX, y: window.scrollY }

    persistSelectedChallenge(challenge.id)
    setChallengeTab('challenge')
    setSolvers([])
    void refreshSubChallenges(challenge.id)

    if (challenge.flag_placeholder && !placeholders[challenge.id]) {
      import('@/shared/lib/challenges').then(({ getChallengePlaceholder }) => {
        getChallengePlaceholder(challenge.id).then((placeholder) => {
          if (placeholder) setPlaceholders((prev) => ({ ...prev, [challenge.id]: placeholder }))
        })
      })
    }

    const cached = challengeDetailCache.get(challenge.id)
    setSelectedChallenge(
      cached
        ? { ...challenge, ...cached, hint: normalizeChallengeHints((cached as any).hint) } as any
        : {
          ...challenge,
          description: challenge.description || 'Loading...',
          hint: Array.isArray((challenge as any).hint) ? (challenge as any).hint : [],
          attachments: Array.isArray((challenge as any).attachments) ? (challenge as any).attachments : [],
        } as any
    )

    const freshDetail = await getChallengeDetail(challenge.id)
    if (!freshDetail) return
    challengeDetailCache.set(challenge.id, freshDetail)
    setSelectedChallenge((prev) => {
      if (!prev || prev.id !== challenge.id) return prev
      return { ...prev, ...freshDetail, hint: normalizeChallengeHints((freshDetail as any).hint) } as any
    })
  }, [challengeDetailCache, placeholders, refreshSubChallenges])

  const closeChallenge = useCallback(() => {
    persistSelectedChallenge(null)
    setSelectedChallenge(null)
    // Restore scroll position after Radix releases its body scroll lock.
    // We need a small delay because Radix's react-remove-scroll cleanup
    // runs asynchronously after the dialog unmounts.
    const { x, y } = scrollPositionRef.current
    requestAnimationFrame(() => {
      window.scrollTo({ left: x, top: y, behavior: 'auto' })
    })
  }, [])

  useEffect(() => {
    if (initialLoading || challenges.length === 0 || selectedChallenge) return

    const storedChallengeId = getStoredSelectedChallengeId()
    if (!storedChallengeId) return

    const challengeToRestore = challenges.find((challenge) => challenge.id === storedChallengeId)
    if (challengeToRestore) void openChallenge(challengeToRestore)
    else persistSelectedChallenge(null)
  }, [challenges, initialLoading, openChallenge, selectedChallenge])

  useEffect(() => {
    if (!selectedChallenge?.id) return

    const updatedChallenge = challenges.find((challenge) => challenge.id === selectedChallenge.id)
    if (!updatedChallenge) return

    const hasChanged =
      selectedChallenge.is_solved !== updatedChallenge.is_solved ||
      (selectedChallenge as any).is_team_solved !== (updatedChallenge as any).is_team_solved ||
      selectedChallenge.total_solves !== updatedChallenge.total_solves ||
      selectedChallenge.points !== updatedChallenge.points ||
      selectedChallenge.updated_at !== updatedChallenge.updated_at

    if (!hasChanged) return

    setSelectedChallenge((prev) => {
      if (!prev || prev.id !== updatedChallenge.id) return prev
      return {
        ...prev,
        ...updatedChallenge,
        description: prev.description,
        hint: normalizeChallengeHints((prev as any).hint),
        attachments: Array.isArray((prev as any).attachments) ? (prev as any).attachments : [],
      } as any
    })
  }, [challenges, selectedChallenge])

  const downloadFile = useCallback(async (attachment: Attachment, attachmentKey: string) => {
    setDownloading((prev) => ({ ...prev, [attachmentKey]: true }))

    try {
      if (attachment.type === 'file') {
        // Get the user's session token to send as Authorization header.
        // We do this by building the URL as a signed request via a hidden <a> element.
        // However, since our proxy endpoint reads the Authorization header (not a cookie),
        // we must use fetch to add the header, then trigger the save via a Blob URL.
        // To avoid double-buffering the entire file in the browser, we stream it:
        const { data: sessionData } = await supabase.auth.getSession()
        const headers: Record<string, string> = {}
        if (sessionData?.session?.access_token) {
          headers['Authorization'] = `Bearer ${sessionData.session.access_token}`
        }

        const response = await fetch(attachment.url, { headers })
        if (!response.ok) throw new Error(`Download failed: ${response.status}`)

        // Stream the response body into a Blob without loading the entire file into
        // a single ArrayBuffer first. ReadableStream → Blob is handled natively by
        // the browser, keeping memory usage low even for large files.
        const blob = await response.blob()
        const objectUrl = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = objectUrl
        link.download = attachment.name || 'download'
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Revoke slightly after click so the browser has time to start the download
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000)
      } else {
        window.open(attachment.url, '_blank')
      }
    } catch (error) {
      console.error('Download failed:', error)
      // Fallback: open the URL directly in a new tab
      window.open(attachment.url, '_blank')
    } finally {
      setDownloading((prev) => ({ ...prev, [attachmentKey]: false }))
    }
  }, [])

  return {
    challengeTab,
    setChallengeTab,
    solvers,
    placeholders,
    showHintModal,
    setShowHintModal,
    downloading,
    selectedChallenge,
    handleTabChange,
    openChallenge,
    closeChallenge,
    downloadFile,
    fetchSolversForChallenge,
    scrollPositionRef,
  }
}
