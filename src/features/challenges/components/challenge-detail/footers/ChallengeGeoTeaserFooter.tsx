import React from 'react'
import { DialogFooterLayout } from './DialogFooterLayout'
import { Map, ArrowRight } from 'lucide-react'

interface ChallengeGeoTeaserFooterProps {
  onGoToMap: () => void
}

export const ChallengeGeoTeaserFooter: React.FC<ChallengeGeoTeaserFooterProps> = ({ onGoToMap }) => {
  return (
    <DialogFooterLayout>
      <div className="flex items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <Map size={18} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 font-sans">
              GeoGuessr Challenge
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
              Submit your guess on the map tab
            </span>
          </div>
        </div>

        <button
          onClick={onGoToMap}
          className="flex h-[38px] px-6 select-none items-center justify-center gap-2 rounded-full text-xs font-black uppercase tracking-widest text-white transition-all duration-300 bg-gradient-to-b from-amber-400/80 to-amber-600/80 hover:from-amber-400/95 hover:to-amber-600/95 dark:from-amber-500/60 dark:to-amber-700/60 border border-white/30 dark:border-white/20 backdrop-blur-xl shadow-[0_8px_24px_rgba(245,158,11,0.35),inset_0_1px_1px_rgba(255,255,255,0.6)] hover:shadow-[0_12px_32px_rgba(245,158,11,0.5),inset_0_1px_1px_rgba(255,255,255,0.8)] active:scale-[0.98] shrink-0"
        >
          <span>Geo Guess</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </DialogFooterLayout>
  )
}
