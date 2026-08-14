import React from 'react'
import { DialogFooterLayout } from './DialogFooterLayout'
import { MapPin } from 'lucide-react'
import type { GeoCoordinates } from '../../../types'

interface GeoFooterProps {
  currentGuess: GeoCoordinates | null
  submitting: boolean
  geoCooldownSeconds: number
  geoSubmissionsRemaining: number
  isSolved: boolean
  isTeamSolved: boolean
  isRevealed: boolean
  isRevealCardOpen: boolean
  target: { lat: number; lng: number; radius_km: number; flag?: string } | null
  onSubmit: () => void
}

export const GeoFooter: React.FC<GeoFooterProps> = ({
  currentGuess,
  submitting,
  geoCooldownSeconds,
  geoSubmissionsRemaining,
  isSolved,
  isTeamSolved,
  isRevealed,
  isRevealCardOpen,
  target,
  onSubmit,
}) => {
  return (
    <DialogFooterLayout>
      <div className="flex items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <MapPin size={18} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 font-sans">
              Selected Coordinates
            </span>
            {currentGuess ? (
              <span className="text-xs font-mono text-gray-800 dark:text-gray-200 truncate mt-0.5">
                {currentGuess.lat.toFixed(6)}, {currentGuess.lng.toFixed(6)}
              </span>
            ) : (
              <span className="text-xs text-gray-400 dark:text-gray-600 italic mt-0.5">
                Click on the map to place your pin
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] font-mono text-gray-400 dark:text-gray-500 shrink-0 hidden sm:block">
            {geoSubmissionsRemaining}/10
          </span>
          <button
            onClick={onSubmit}
            disabled={!currentGuess || submitting || geoCooldownSeconds > 0 || (isRevealed && isRevealCardOpen)}
            className={`flex h-[38px] min-w-[104px] px-5 select-none items-center justify-center rounded-full text-xs font-black uppercase tracking-widest text-white backdrop-blur-xl border border-white/20 shadow-lg transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed
              ${geoCooldownSeconds > 0
                ? 'bg-gradient-to-b from-red-500/80 to-red-700/80 shadow-[0_4px_16px_rgba(239,68,68,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)]'
                : 'bg-gradient-to-b from-blue-400/80 to-blue-600/80 hover:from-blue-400/95 hover:to-blue-600/95 shadow-[0_8px_24px_rgba(37,99,235,0.3),inset_0_1px_1px_rgba(255,255,255,0.5)]'}
            `}
          >
            {submitting ? (
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:-0.3s]"></span>
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:-0.15s]"></span>
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white"></span>
              </span>
            ) : geoCooldownSeconds > 0 ? (
              `${geoCooldownSeconds}s`
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </div>
    </DialogFooterLayout>
  )
}
