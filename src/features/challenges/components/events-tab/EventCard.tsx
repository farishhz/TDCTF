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
      className="event-card-reveal relative group cursor-pointer h-full transition-transform duration-200 hover:-translate-y-1 active:scale-[0.98]"
      onClick={onSelect}
    >
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/[0.03] rounded-2xl transition-colors duration-300 pointer-events-none" />

      <SurfaceCard
        variant="glass"
        className={cn(
          'relative flex h-full flex-col overflow-hidden transition-all duration-300',
          event.isLocked ? 'group-hover:border-red-500/30' : 'group-hover:border-blue-500/50',
          selected && 'border-blue-500/50 bg-blue-500/[0.03]',
          tone === 'ended' && 'opacity-70 grayscale-[0.3]'
        )}
      >
        {/* Image Section */}
        <div className="relative h-40 w-full overflow-hidden border-b border-gray-100 dark:border-gray-800/50">
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

          <div className="absolute top-3 right-3">
            <EventJoinSection isLocked={event.isLocked} />
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 md:p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md w-fit ${status.color}`}>
                {status.label}
              </div>
              
              {event.isLocked ? (
                <div className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md w-fit bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center gap-1">
                  <Lock size={10} />
                  Locked
                </div>
              ) : (
                <div className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md w-fit bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Unlock size={10} />
                  Joined
                </div>
              )}
            </div>

            <h4 className="text-sm md:text-base font-bold text-gray-900 dark:text-gray-100 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
              {event.name}
            </h4>
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500 dark:text-gray-400">
              <Calendar size={12} className="text-blue-500/50" />
              <span className="line-clamp-1">{startText}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
              <Clock size={11} />
              <span>{timeRemaining}</span>
            </div>
          </div>
        </div>
      </SurfaceCard>
    </div>
  )
}
