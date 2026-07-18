'use client'

import { ArrowRight, ClipboardList } from 'lucide-react'
import type { ChallengeDialogTab } from '../../types'

const TASKS_BUTTON_CLASS =
  "flex select-none items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 bg-violet-500/10 text-violet-600 border border-violet-500/20 hover:bg-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20 dark:hover:bg-violet-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-offset-0"

type ChallengeTasksTeaserProps = {
  challengeId: string
  onTabChange: (tab: ChallengeDialogTab, challengeId?: string) => void
}

export default function ChallengeTasksTeaser({
  challengeId,
  onTabChange,
}: ChallengeTasksTeaserProps) {
  return (
    <div>
      <p className="select-none text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1.5 opacity-90">
        <ClipboardList className="h-3.5 w-3.5 text-violet-500/70" />
        <span>Tasks</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          title="Answer all questions to get the flag"
          aria-label="Answer all questions to get the flag"
          onClick={() => onTabChange('question', challengeId)}
          className={TASKS_BUTTON_CLASS}
        >
          <ClipboardList className="h-3.5 w-3.5" />
          <span>Answer Questions to Get the Flag</span>
          <ArrowRight className="h-3 w-3 opacity-60" />
        </button>
      </div>
    </div>
  )
}
