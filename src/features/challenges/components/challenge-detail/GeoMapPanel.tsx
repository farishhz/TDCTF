'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import type { ChallengeWithSolve } from '@/shared/types'
import type { GeoCoordinates } from '../../types'

const DynamicGeoMap = dynamic(
  () => import('./GeoMap'),
  {
    ssr: false,
    loading: () => (
      <span className="flex items-center gap-2">
        <span className="h-2 w-2 animate-ping rounded-full bg-blue-500"></span>
        Loading GeoGuessr Map Interface...
      </span>
    ),
  }
)

type GeoMapPanelProps = {
  challenge: ChallengeWithSolve
  geoGuesses: Record<string, GeoCoordinates | null>
  geoFeedback: Record<string, { success: boolean; message: string; distance_km?: number } | null>
  geoSubmitting: Record<string, boolean>
  geoSubmissionsRemaining: number
  geoCooldownSeconds: number
  isRevealed: boolean
  revealCardOpen: boolean
  setRevealCardOpen: (open: boolean) => void
  onTargetLoaded?: (target: { lat: number; lng: number; radius_km: number; flag?: string }) => void
  onReveal?: () => void
  handleGeoSubmit: (challengeId: string, coords: GeoCoordinates, prefix: string) => void
  handleGeoGuessChange: (challengeId: string, coords: GeoCoordinates | null) => void
}

export default function GeoMapPanel(props: GeoMapPanelProps) {
  return (
    <div className="w-full h-full flex flex-col flex-1">
      <DynamicGeoMap {...props} />
    </div>
  )
}
