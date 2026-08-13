'use client'

import React from 'react'
import type { ChallengeWithSolve } from '@/shared/types'
import { SURFACE_GLASS_CARD_COMPACT_CLASS } from '@/shared/styles'
import { formatSmartFlag } from '../../lib/flag-formatting'
import type { KeyedBooleanMap, KeyedFlagFeedbackMap, KeyedStringMap } from '../../types'

type ChallengeFlagFormProps = {
  challenge: ChallengeWithSolve
  flagInputs: KeyedStringMap
  placeholders: KeyedStringMap
  submitting: KeyedBooleanMap
  flagFeedback: KeyedFlagFeedbackMap
  handleFlagInputChange: (challengeId: string, value: string) => void
  handleFlagSubmit: (challengeId: string) => void | Promise<unknown>
  submissionsRemaining?: number
  cooldownSeconds?: number
  eventEnded?: boolean
}

export default function ChallengeFlagForm({
  challenge,
  flagInputs,
  placeholders,
  submitting,
  flagFeedback,
  handleFlagInputChange,
  handleFlagSubmit,
  submissionsRemaining = 10,
  cooldownSeconds = 0,
  eventEnded = false,
}: ChallengeFlagFormProps) {
  const overlayRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  React.useEffect(() => {
    if (!eventEnded) {
      requestAnimationFrame(() => {
        inputRef.current?.focus({ preventScroll: true })
      })
    }
  }, [challenge.id, eventEnded])

  return (
    <div className="flex flex-col relative w-full">
      {flagFeedback[challenge.id] && (
        <div
          className={`absolute bottom-[calc(100%+12px)] left-0 right-0 p-2.5 rounded-lg text-xs font-black uppercase tracking-widest text-center shadow-lg transition-all z-20 animate-in fade-in slide-in-from-bottom-2
            ${flagFeedback[challenge.id]?.success
              ? 'bg-green-500 text-white dark:bg-green-600'
              : 'bg-red-500 text-white dark:bg-red-600'}
          `}
        >
          {flagFeedback[challenge.id]?.message}
        </div>
      )}

      {eventEnded && (
        <div className="mb-2 text-center text-xs font-bold text-red-500 dark:text-red-400">
          Waktu perlombaan telah habis. Anda tidak dapat melakukan submit flag lagi.
        </div>
      )}

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          if (cooldownSeconds > 0 || eventEnded) return
          handleFlagSubmit(challenge.id)
        }}
      >
        <div className="relative flex-1 h-[38px] overflow-hidden rounded-full border border-white/20 dark:border-white/10 bg-white/20 dark:bg-white/5 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] focus-within:ring-2 focus-within:ring-blue-500/40 focus-within:border-white/30 transition-all">
          {challenge.flag_placeholder && placeholders[challenge.id] && (
            <div
              ref={overlayRef}
              className="pointer-events-none absolute inset-0 flex select-none items-center overflow-hidden whitespace-pre pl-4 pr-16 font-mono text-sm text-gray-400 opacity-50 dark:text-gray-500"
            >
              <span className="invisible">{flagInputs[challenge.id] || ''}</span>
              <span>{placeholders[challenge.id].slice((flagInputs[challenge.id] || '').length)}</span>
            </div>
          )}
          <input
            ref={inputRef}
            type="text"
            onScroll={(event) => {
              if (overlayRef.current) overlayRef.current.scrollLeft = event.currentTarget.scrollLeft
            }}
            value={flagInputs[challenge.id] || ''}
            disabled={eventEnded}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                if (cooldownSeconds > 0 || eventEnded) {
                  event.preventDefault()
                  return
                }
              }

              if (event.key === 'Backspace') {
                setIsDeleting(true)
              } else {
                setIsDeleting(false)
              }
            }}
            onChange={(event) => {
              const value = event.target.value
              const mask = placeholders[challenge.id]

              if (challenge.flag_placeholder && mask && !isDeleting) {
                handleFlagInputChange(challenge.id, formatSmartFlag(value, mask))
              } else {
                handleFlagInputChange(challenge.id, value)
              }
            }}
            placeholder={challenge.flag_placeholder && placeholders[challenge.id] ? '' : eventEnded ? 'Event has ended' : 'Enter flag here...'}
            className="w-full h-full pl-4 pr-16 bg-transparent text-gray-900 dark:text-white focus:outline-none relative z-10 font-mono text-sm disabled:opacity-50"
            spellCheck={false}
            autoComplete="off"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-gray-400 dark:text-gray-500 select-none z-20 pointer-events-none">
            {submissionsRemaining}/10
          </span>
        </div>
        <button
          type="submit"
          disabled={
            submitting[challenge.id] ||
            cooldownSeconds > 0 ||
            eventEnded ||
            !flagInputs[challenge.id]?.trim() ||
            (challenge.flag_placeholder && placeholders[challenge.id] ? (flagInputs[challenge.id] || '').length !== placeholders[challenge.id].length : false)
          }
          onMouseDown={(event) => {
            event.preventDefault()
          }}
          className={`flex h-[38px] w-28 shrink-0 select-none items-center justify-center rounded-full text-[12px] font-black uppercase tracking-widest text-white shadow-lg transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed border border-white/20 backdrop-blur-xl
            ${eventEnded
              ? 'bg-gradient-to-b from-gray-600/60 to-gray-800/60 shadow-none border-white/10'
              : cooldownSeconds > 0
                ? 'bg-gradient-to-b from-red-500/80 to-red-700/80 shadow-[0_4px_16px_rgba(239,68,68,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)]'
                : 'bg-gradient-to-b from-blue-400/80 to-blue-600/80 hover:from-blue-400/95 hover:to-blue-600/95 shadow-[0_8px_24px_rgba(37,99,235,0.3),inset_0_1px_1px_rgba(255,255,255,0.5)]'}
          `}
        >
          {submitting[challenge.id] ? (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:-0.3s]"></span>
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:-0.15s]"></span>
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white"></span>
            </span>
          ) : eventEnded ? (
            'Ended'
          ) : cooldownSeconds > 0 ? (
            `${cooldownSeconds}s`
          ) : (
            'Submit'
          )}
        </button>
      </form>
    </div>
  )
}
