'use client'

import { Lock } from 'lucide-react'
import APP from '@/config'
import { useSystemSettings } from '@/shared/contexts/SystemSettingsContext'
import { EmptyState, PageLoader } from '@/shared/components'
import type { ChallengeWithSolve } from '@/shared/types'
import type { ChallengeFilterSettings, EventSelectorValue } from '../../types'
import { CHALLENGE_LAYOUT_MODES, type ChallengeLayoutMode } from '../../lib'
import ChallengeCard from '../ChallengeCard'
import ChallengeEmptyState from './ChallengeEmptyState'

type ChallengeListContentProps = {
  initialLoading: boolean
  eventMembershipLoading: boolean
  eventMembershipEventId?: string | null
  eventId: EventSelectorValue
  eventJoinBlocked: boolean
  filteredChallenges: ChallengeWithSolve[]
  challenges: ChallengeWithSolve[]
  sortedFilteredChallenges: ChallengeWithSolve[]
  grouped: Record<string, ChallengeWithSolve[]>
  orderedKeys: string[]
  layoutMode: ChallengeLayoutMode
  filterSettings: ChallengeFilterSettings
  selectedEventObj: unknown
  selectedEventStart: Date | null
  selectedEventNotStarted: boolean
  selectedEventEnded: boolean
  nowDate: Date
  formatRemaining: (ms: number) => string
  onOpenChallenge: (challenge: ChallengeWithSolve) => void
}

export default function ChallengeListContent({
  initialLoading,
  eventMembershipLoading,
  eventMembershipEventId,
  eventId,
  eventJoinBlocked,
  filteredChallenges,
  challenges,
  sortedFilteredChallenges,
  grouped,
  orderedKeys,
  layoutMode,
  filterSettings,
  selectedEventObj,
  selectedEventStart,
  selectedEventNotStarted,
  selectedEventEnded,
  nowDate,
  formatRemaining,
  onOpenChallenge,
}: ChallengeListContentProps) {
  const { settings } = useSystemSettings()

  if (initialLoading) {
    return <PageLoader />
  }

  if (eventMembershipLoading && eventMembershipEventId !== eventId) {
    return <PageLoader />
  }

  if (eventJoinBlocked) {
    if ((selectedEventObj as any)?.is_team_event) {
      return (
        <EmptyState
          icon={<Lock className="w-full h-full text-yellow-500" />}
          title="Viewer Mode (Mode Penonton)"
          description="Anda sedang dalam mode penonton untuk event ini. Anda hanya dapat melihat Live Scoreboard dan Solves Feed. Silakan daftarkan tim Anda atau hubungi Kapten/Admin untuk bergabung ke roster peserta."
          containerHeight="py-16"
          action={
            <a
              href={`/events/${eventId}/join`}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-white text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 shadow-md transition-all duration-200"
            >
              Daftar / Cek Roster Tim
            </a>
          }
        />
      )
    }

    return (
      <EmptyState
        icon={<Lock className="w-full h-full" />}
        title="Access Restricted"
        description="Please join the event to unlock these challenges."
        containerHeight="py-16"
      />
    )
  }

  if (filteredChallenges.length === 0) {
    return (
      <ChallengeEmptyState
        eventId={eventId}
        selectedEventObj={selectedEventObj}
        selectedEventStart={selectedEventStart}
        selectedEventNotStarted={selectedEventNotStarted}
        selectedEventEnded={selectedEventEnded}
        nowDate={nowDate}
        challengesCount={challenges.length}
        formatRemaining={formatRemaining}
      />
    )
  }

  if (layoutMode === CHALLENGE_LAYOUT_MODES.COMPACT) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 auto-rows-max">
        {sortedFilteredChallenges.map((challenge) => (
          <div
            key={challenge.id}
            className="challenge-card-reveal relative w-full overflow-visible"
          >
            <ChallengeCard
              challenge={challenge}
              highlightTeamSolves={filterSettings.highlightTeamSolves}
              onOpenChallenge={onOpenChallenge}
            />
          </div>
        ))}
      </div>
    )
  }

  if (layoutMode === CHALLENGE_LAYOUT_MODES.CATEGORY_COMPACT) {
    const categoryOrderedChallenges = orderedKeys.flatMap((category) => grouped[category] ?? [])

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 auto-rows-max">
        {categoryOrderedChallenges.map((challenge) => (
          <div
            key={challenge.id}
            className="challenge-card-reveal relative w-full overflow-visible"
          >
            <ChallengeCard
              challenge={challenge}
              highlightTeamSolves={filterSettings.highlightTeamSolves}
              onOpenChallenge={onOpenChallenge}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      {orderedKeys.map((category) => {
        const categoryChallenges = grouped[category] ?? []

        if (categoryChallenges.length === 0) return null

        return (
          <div
            key={category}
            className="mb-8 relative z-0"
          >
            <div className="flex items-center justify-between gap-3 mb-5 border-b border-gray-200/50 dark:border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-2 rounded-full bg-gradient-to-b from-blue-400 via-cyan-400 to-indigo-600 shadow-[0_0_12px_rgba(59,130,246,0.6),inset_0_1px_1px_rgba(255,255,255,0.6)]" />
                <h2 className="text-lg md:text-xl font-black uppercase tracking-wider text-gray-900 dark:text-white">
                  {eventId === 'all' && String(category).toLowerCase() === 'intro'
                    ? `Intro (${String(settings.event_main_label || 'Main')})`
                    : category}
                </h2>
              </div>
              <span className="text-[11px] font-mono font-bold text-gray-500 dark:text-gray-400 px-3 py-1 rounded-full border border-white/20 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                {categoryChallenges.length} {categoryChallenges.length === 1 ? 'challenge' : 'challenges'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 auto-rows-max">
              {categoryChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="challenge-card-reveal relative w-full overflow-visible"
                >
                  <ChallengeCard
                    challenge={challenge}
                    highlightTeamSolves={filterSettings.highlightTeamSolves}
                    onOpenChallenge={onOpenChallenge}
                  />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </>
  )
}
