'use client'

import { useEffect, useState } from 'react'
import {
  getChallengeFilterSettings,
  setChallengeFilterSettings,
} from '@/shared/lib'
import { APP } from '@/config'
import type { ChallengeFilterSettings } from '../types'

export function useChallengeFilterSettings() {
  const [filterSettings, setFilterSettings] = useState<ChallengeFilterSettings>({
    hideMaintenance: false,
    highlightTeamSolves: true,
    hideSolvedIntro: true,
    splitSubCategories: true,
  })
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = getChallengeFilterSettings()
      if (stored) {
        setFilterSettings({
          ...stored,
          splitSubCategories: stored.splitSubCategories ?? true,
          highlightTeamSolves: APP.teams.enabled ? stored.highlightTeamSolves : false,
        })
      }
    } finally {
      setSettingsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!settingsLoaded || typeof window === 'undefined') return

    try {
      setChallengeFilterSettings({
        ...filterSettings,
        highlightTeamSolves: APP.teams.enabled ? filterSettings.highlightTeamSolves : false,
      })
    } catch {
      // ignore
    }
  }, [filterSettings, settingsLoaded])

  return {
    filterSettings,
    setFilterSettings,
  }
}
