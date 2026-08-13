import { LocateFixed } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

type BaseScoreboardRankBadgeProps = {
  label: string
  rank?: number | null
  score?: React.ReactNode
  scoreLabel?: string
  rowHref?: string | null
  missingLabel: string
  className?: string
}

export default function BaseScoreboardRankBadge({
  label,
  rank,
  score,
  scoreLabel = 'Score',
  rowHref,
  missingLabel,
  className,
}: BaseScoreboardRankBadgeProps) {
  const hasRank = typeof rank === 'number' && rank > 0

  return (
    <div
      className={cn(
        'inline-flex items-center overflow-hidden divide-x divide-white/20 rounded-full border border-white/20 dark:border-white/10 bg-gradient-to-b from-blue-400/20 to-blue-600/20 backdrop-blur-xl shadow-[0_4px_16px_rgba(37,99,235,0.1),inset_0_1px_1px_rgba(255,255,255,0.4)] dark:divide-white/10 dark:from-blue-500/20 dark:to-blue-700/20',
        className
      )}
    >
      {hasRank ? (
        <>
          <div className="flex h-8 items-center gap-2 px-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600/80 dark:text-blue-400/80">
              {label}
            </span>
            <span className="text-sm font-black text-gray-900 dark:text-white">
              #{rank}
            </span>
          </div>
          {typeof score !== 'undefined' && (
            <div className="flex h-8 items-center gap-2 px-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {scoreLabel}
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {score}
              </span>
            </div>
          )}
          {rowHref && (
            <button
              onClick={(e) => {
                e.preventDefault()
                const id = rowHref.startsWith('#') ? rowHref.slice(1) : rowHref
                const element = document.getElementById(id)
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  element.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50')
                  setTimeout(() => {
                    element.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50')
                  }, 2000)
                }
              }}
              className="flex h-8 w-8 items-center justify-center text-blue-600 transition-colors hover:bg-blue-500/10 focus-visible:bg-blue-500/10 focus-visible:outline-none dark:text-blue-400 dark:hover:bg-blue-500/20 dark:focus-visible:bg-blue-500/20"
              title="Jump to my rank"
            >
              <LocateFixed size={14} />
            </button>
          )}
        </>
      ) : (
        <div className="flex h-8 items-center gap-2 px-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600/80 dark:text-blue-400/80">
            {label}
          </span>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {missingLabel}
          </span>
        </div>
      )}
    </div>
  )
}
