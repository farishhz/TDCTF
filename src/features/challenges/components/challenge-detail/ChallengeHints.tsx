'use client'

import { Lightbulb } from 'lucide-react'
import type { ChallengeWithSolve } from '@/shared/types'
import type { HintModalState } from '../../types'

const HINT_BUTTON_CLASS =
  "flex select-none items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 dark:hover:bg-amber-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 focus-visible:ring-offset-0"

type ChallengeHintsProps = {
  challenge: ChallengeWithSolve
  setShowHintModal: (modal: HintModalState) => void
}

export default function ChallengeHints({
  challenge,
  setShowHintModal,
}: ChallengeHintsProps) {
  if (!Array.isArray(challenge.hint) || challenge.hint.length === 0) return null

  return (
    <div>
      <p className="select-none text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1.5 opacity-90">
        <Lightbulb className="h-3.5 w-3.5 text-amber-500/70" />
        <span>Hints</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {(challenge.hint ?? []).map((hint: string, idx: number) => (
          <button
            key={idx}
            type="button"
            className={HINT_BUTTON_CLASS}
            onClick={(event) => {
              event.stopPropagation()
              setShowHintModal({ challenge, hintIdx: idx })
            }}
          >
            <Lightbulb className="h-3.5 w-3.5" />
            <span>Hint {(challenge.hint?.length ?? 0) > 1 ? idx + 1 : ''}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
