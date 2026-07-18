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
          className="flex h-[38px] px-5 select-none items-center justify-center gap-2 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all active:scale-95 shrink-0"
        >
          <span>Geo Guess</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </DialogFooterLayout>
  )
}
