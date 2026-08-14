'use client'

'use client'

import type { CSSProperties } from 'react'
import { Calendar } from 'lucide-react'
import Image from 'next/image'
import { SurfaceCard } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'

type MainEventCardProps = {
  label: string
  imageUrl: string | null
  selected: boolean
  delay: number
  onSelect: () => void
  disabled?: boolean
}

export default function MainEventCard({
  label,
  imageUrl,
  selected,
  delay,
  onSelect,
  disabled,
}: MainEventCardProps) {
  return (
    <div
      key="__main__"
      style={{ '--card-reveal-delay': `${delay}s` } as CSSProperties}
      className={cn(
        "event-card-reveal relative group h-full transition-all duration-300",
        disabled ? "cursor-not-allowed opacity-50 filter grayscale" : "cursor-pointer hover:-translate-y-1 active:scale-[0.98]"
      )}
      onClick={disabled ? undefined : onSelect}
    >
      <div
        className={cn(
          'relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/30 dark:border-white/10 bg-gradient-to-b from-white/60 to-white/30 dark:from-[#111622]/85 dark:to-[#0d111a]/95 backdrop-blur-xl transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.1)]',
          !disabled && 'group-hover:border-white/40 dark:group-hover:border-white/20 group-hover:shadow-[0_12px_36px_0_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.5)]',
          selected && !disabled && 'border-blue-500/60 dark:border-blue-500/40 bg-gradient-to-b from-blue-500/10 to-indigo-600/10 shadow-[0_8px_32px_0_rgba(37,99,235,0.15),inset_0_1px_1px_rgba(255,255,255,0.4)]'
        )}
      >
        {/* Image Section */}
        <div className="relative h-40 w-full overflow-hidden border-b border-white/20 dark:border-white/10">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={label}
              fill
              className={cn("object-cover transition-transform duration-500", !disabled && "group-hover:scale-105")}
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 flex items-center justify-center">
              <Calendar size={24} className="text-blue-500/20" />
            </div>
          )}

          {/* Bottom shadow gradient for image transition */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0d111a]/80 to-transparent pointer-events-none" />
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 md:p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              {disabled ? (
                <div className="text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 backdrop-blur-md">
                  Disabled
                </div>
              ) : (
                <div className="text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                  Main
                </div>
              )}
            </div>

            <h4 className={cn(
              "text-sm md:text-base font-black leading-tight transition-colors line-clamp-1",
              disabled ? "text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400"
            )}>
              {label}
            </h4>
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 dark:text-gray-400">
              <Calendar size={12} className="text-blue-400/70" />
              <span>{disabled ? 'Currently Unavailable' : 'Platform Default'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
