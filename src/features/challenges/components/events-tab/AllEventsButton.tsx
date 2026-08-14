'use client'

import type { CSSProperties } from 'react'
import { Layers } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { SurfaceCard } from '@/shared/ui'

type AllEventsButtonProps = {
  selected: boolean
  delay?: number
  onSelect: () => void
}

export default function AllEventsButton({
  selected,
  delay = 0,
  onSelect,
}: AllEventsButtonProps) {
  return (
    <div
      onClick={onSelect}
      style={{ '--card-reveal-delay': `${delay}s` } as CSSProperties}
      className={cn(
        'event-card-reveal group relative w-full cursor-pointer rounded-2xl border border-white/30 dark:border-white/10 bg-gradient-to-b from-white/60 to-white/30 dark:from-[#111622]/80 dark:to-[#0d111a]/90 backdrop-blur-xl p-4 md:p-5 text-left transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.1)] hover:-translate-y-1 hover:border-white/40 dark:hover:border-white/20 active:scale-[0.98]',
        selected && 'border-blue-500/60 dark:border-blue-500/40 bg-gradient-to-b from-blue-500/10 to-indigo-600/10 shadow-[0_8px_32px_0_rgba(37,99,235,0.15),inset_0_1px_1px_rgba(255,255,255,0.4)]'
      )}
    >
      <div className="flex items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] group-hover:scale-105 transition-transform duration-300">
            <Layers size={20} />
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm md:text-base font-black text-gray-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              All Challenges
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
              Browse across all available events
            </p>
          </div>
        </div>

        {selected && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30 shrink-0 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <div className="font-extrabold text-blue-600 dark:text-blue-400 text-[10px] uppercase tracking-wider">
              Active
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
