'use client'

import { Flag, Zap } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { AppTabs } from '@/shared/ui'
import type { ChallengesMainTab } from '../../types'
import ChallengeEventSummary from '../ChallengeEventSummary'

type ChallengePageTabsProps = {
  currentTab: ChallengesMainTab
  onTabChange: (tab: ChallengesMainTab) => void
  selectedEventName?: string
  eventStats?: { solvedCount: number; totalCount: number } | null
  compact?: boolean
  iconOnly?: boolean
  showSummary?: boolean
  className?: string
}

export default function ChallengePageTabs({
  currentTab,
  onTabChange,
  selectedEventName,
  eventStats,
  compact = false,
  iconOnly = false,
  showSummary = true,
  className,
}: ChallengePageTabsProps) {
  return (
    <div
      data-tour="challenge-page-tabs"
      className={cn(
        'flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center',
        iconOnly && 'inline-flex',
        compact ? 'gap-2' : 'gap-4',
        className
      )}
    >
      <AppTabs
        items={[
          {
            value: 'challenges',
            label: <span className={cn(iconOnly && 'text-[11px] font-semibold')}>Challenges</span>,
            icon: Flag
          },
          {
            value: 'events',
            label: <span className={cn(iconOnly && 'text-[11px] font-semibold')}>Events</span>,
            icon: Zap
          },
        ]}
        value={currentTab}
        onValueChange={onTabChange}
        className={cn(iconOnly ? 'w-full xl:w-[176px]' : 'w-full sm:w-auto xl:w-full')}
        size={compact ? 'sm' : 'md'}
        stretch={true}
        hideActiveLabel={iconOnly}
        collapseActive={iconOnly}
        ariaLabel="Challenge page tabs"
      />

      {showSummary && !compact && (
        <ChallengeEventSummary
          selectedEventName={selectedEventName}
          eventStats={eventStats}
        />
      )}
    </div>
  )
}
