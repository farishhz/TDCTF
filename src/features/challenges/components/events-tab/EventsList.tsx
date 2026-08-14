'use client'

import type { EnrichedChallengeEvent } from '../../types'
import EventCard from './EventCard'
import MainEventCard from './MainEventCard'

type MainEventOption = {
  label: string
  imageUrl: string | null
  selected: boolean
  onSelect: () => void
  disabled?: boolean
}

type EventsListProps = {
  title: string
  events: EnrichedChallengeEvent[]
  selectedEventId?: string | null | 'all'
  fallbackImageUrl: string | null
  now: Date
  onEventSelect: (eventId: string | null | 'all') => void
  mainEvent?: MainEventOption
  tone?: 'default' | 'ended'
  titleClassName?: string
}

export default function EventsList({
  title,
  events,
  selectedEventId,
  fallbackImageUrl,
  now,
  onEventSelect,
  mainEvent,
  tone = 'default',
}: EventsListProps) {
  const delayOffset = mainEvent ? 1 : 0

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-white/10 pb-2.5">
        <div className="flex h-5 w-2 rounded-full bg-gradient-to-b from-blue-400 via-cyan-400 to-indigo-600 shadow-[0_0_12px_rgba(59,130,246,0.6),inset_0_1px_1px_rgba(255,255,255,0.6)]" />
        <h3 className="text-lg md:text-xl font-black uppercase tracking-wider text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {mainEvent && (
          <MainEventCard
            label={mainEvent.label}
            imageUrl={mainEvent.imageUrl}
            selected={mainEvent.selected}
            delay={0}
            onSelect={mainEvent.onSelect}
            disabled={mainEvent.disabled}
          />
        )}

        {events.map((event, index) => (
          <EventCard
            key={event.id}
            event={event}
            selected={selectedEventId === event.id}
            fallbackImageUrl={fallbackImageUrl}
            now={now}
            delay={(index + delayOffset) * 0.05}
            tone={tone}
            onSelect={() => onEventSelect(event.id)}
          />
        ))}
      </div>
    </div>
  )
}
