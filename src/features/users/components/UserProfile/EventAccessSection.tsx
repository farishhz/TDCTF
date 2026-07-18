'use client'

import React from 'react'
import { CheckCircle2, KeyRound, LockKeyhole, MailPlus, ShieldCheck } from 'lucide-react'
import type { UserEventAccess } from '../../types'
import { UserSection } from '../ui'
import { cn } from '@/shared/lib/utils'
import {
  SURFACE_GLASS_CARD_COMPACT_CLASS,
  TYPO_CARD_TITLE_CLASS,
  TYPO_METADATA_CLASS,
  TYPO_MUTED_CLASS
} from '@/shared/styles'

type EventAccessSectionProps = {
  eventAccess: UserEventAccess[]
}

function getJoinModeIcon(joinMode: UserEventAccess['join_mode']) {
  if (joinMode === 'request') {
    return {
      icon: MailPlus,
      label: 'Invite/request event',
      className: 'bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400',
    }
  }

  if (joinMode === 'key') {
    return {
      icon: KeyRound,
      label: 'Key event',
      className: 'bg-violet-500/10 text-violet-600 ring-violet-500/20 dark:text-violet-400',
    }
  }

  return {
    icon: ShieldCheck,
    label: 'Open event',
    className: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400',
  }
}

export default function EventAccessSection({ eventAccess }: EventAccessSectionProps) {
  const visibleEvents = eventAccess.filter((event) => event.is_member || event.has_solve)

  if (visibleEvents.length === 0) return null

  return (
    <UserSection
      icon={LockKeyhole}
      title="Event Access"
      description="Events this user can access or has interacted with."
      contentClassName="space-y-3"
    >
      <div className="space-y-2">
        {visibleEvents.map((event) => {
          const mode = getJoinModeIcon(event.join_mode)
          const ModeIcon = mode.icon

          return (
            <div
              key={event.event_id}
              className={cn("flex items-center justify-between gap-3 px-3 py-2.5", SURFACE_GLASS_CARD_COMPACT_CLASS)}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1", mode.className)}
                  title={mode.label}
                >
                  <ModeIcon className="h-4 w-4" />
                </div>
                <h3 className={cn(TYPO_CARD_TITLE_CLASS, "truncate")} title={event.event_name}>
                  {event.event_name}
                </h3>
              </div>
              <div className={cn("flex shrink-0 items-center gap-3", TYPO_METADATA_CLASS)}>
                <span>{event.challenge_count} chall</span>
                <span className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Joined
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </UserSection>
  )
}
