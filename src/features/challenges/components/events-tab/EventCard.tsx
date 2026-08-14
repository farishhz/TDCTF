'use client'

import type { CSSProperties } from 'react'
import { Calendar, Clock, Lock, Unlock } from 'lucide-react'
import Image from 'next/image'
import { SurfaceCard } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'
import {
  getEventDateLabels,
  getEventStatus,
  getTimeRemaining,
  normalizeEventImageUrl,
} from '../../lib'
import type { EnrichedChallengeEvent } from '../../types'
import EventJoinSection from './EventJoinSection'

type EventCardTone = 'default' | 'ended'

type EventCardProps = {
  event: EnrichedChallengeEvent
  selected: boolean
  fallbackImageUrl: string | null
  now: Date
  delay: number
  tone?: EventCardTone
  onSelect: () => void
}

export default function EventCard({
  event,
  selected,
  fallbackImageUrl,
  now,
  delay,
  tone = 'default',
  onSelect,
}: EventCardProps) {
  const status = getEventStatus(event)
  const timeRemaining = getTimeRemaining(event)
  const eventImageUrl = normalizeEventImageUrl(event.image_url) || fallbackImageUrl
  const { startText, endText, startLabel, endLabel } = getEventDateLabels(event, now)

  return (
    <div
      key={event.id}
      style={{ '--card-reveal-delay': `${delay}s` } as CSSProperties}
      className="event-card-reveal relative group cursor-pointer h-full transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
      onClick={onSelect}
    >
      <div
        className={cn(
          'relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/30 dark:border-white/10 bg-gradient-to-b from-white/60 to-white/30 dark:from-[#111622]/85 dark:to-[#0d111a]/95 backdrop-blur-xl transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.1)] group-hover:border-white/40 dark:group-hover:border-white/20 group-hover:shadow-[0_12px_36px_0_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.5)]',
          selected && 'border-blue-500/60 dark:border-blue-500/40 bg-gradient-to-b from-blue-500/10 to-indigo-600/10 shadow-[0_8px_32px_0_rgba(37,99,235,0.15),inset_0_1px_1px_rgba(255,255,255,0.4)]',
          tone === 'ended' && 'opacity-70 grayscale-[0.3]'
        )}
      >
        {/* Image Section */}
        <div className="relative h-40 w-full overflow-hidden border-b border-white/20 dark:border-white/10">
          {eventImageUrl ? (
            <Image
              src={eventImageUrl}
              alt={event.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 flex items-center justify-center">
              <Calendar size={24} className="text-blue-500/20" />
            </div>
          )}

          {/* Bottom shadow gradient for image transition */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0d111a]/80 to-transparent pointer-events-none" />

          <div className="absolute top-3 right-3">
            <EventJoinSection isLocked={event.isLocked} />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 md:p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <div className={cn('text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full backdrop-blur-md border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]', status.color)}>
                {status.label}
              </div>
              
              {event.isLocked ? (
                <div className="text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 backdrop-blur-md flex items-center gap-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                  <Lock size={10} />
                  Locked
                </div>
              ) : (
                <div className="text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 backdrop-blur-md flex items-center gap-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                  <Unlock size={10} />
                  Joined
                </div>
              )}
            </div>

            <h4 className="text-sm md:text-base font-black text-gray-900 dark:text-gray-100 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
              {event.name}
            </h4>
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 dark:text-gray-400">
              <Calendar size={12} className="text-blue-400/70" />
              <span className="line-clamp-1">{startText}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
              <Clock size={11} />
              <span>{timeRemaining}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
