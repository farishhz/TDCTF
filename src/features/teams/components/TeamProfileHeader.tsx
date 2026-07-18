'use client'

import React from 'react'
import { Calendar, Flag, Hash, LogOut, Trophy, Users } from 'lucide-react'
import EventSelect from '@/features/events/components/EventSelect'
import ImageWithFallback from '@/shared/components/ImageWithFallback'
import { Button } from '@/shared/ui/button'
import { SurfaceCard } from '@/shared/ui'
import {
  TYPO_PAGE_TITLE_CLASS,
  TYPO_SECTION_TITLE_CLASS,
  TYPO_STAT_VALUE_CLASS,
  TYPO_METADATA_CLASS
} from '@/shared/styles'
import { TeamInfo, TeamSummary } from '../types'
import { cn } from '@/shared/lib/utils'

interface TeamProfileHeaderProps {
  team: TeamInfo
  summary: TeamSummary | null
  effectiveSelectedEvent: string | 'all'
  setSelectedEvent: (eventId: string | 'all') => void
  teamEvents: any[]
  showMainOption: boolean
  canManage: boolean
  onCopyInvite?: () => void
  onRegenerateInvite?: () => void
  onLeaveTeam?: () => void
  busy: boolean
  isMember?: boolean
  memberCount?: number
}

export default function TeamProfileHeader({
  team,
  summary,
  effectiveSelectedEvent,
  setSelectedEvent,
  teamEvents,
  showMainOption,
  onLeaveTeam,
  busy,
  isMember = false,
  memberCount = 0,
}: TeamProfileHeaderProps) {
  const teamInitials = team.name.charAt(0).toUpperCase()

  return (
    <SurfaceCard variant="glass" padding="none" className="relative overflow-hidden rounded-xl p-4 sm:p-5">
      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br shadow-lg border border-gray-200/50 dark:border-white/10">
            {team.picture_url ? (
              <ImageWithFallback
                src={team.picture_url}
                alt={team.name}
                size={64}
                rounded={false}
                fallbackBg="bg-transparent text-white"
              />
            ) : (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xl font-black text-white">
                {teamInitials}
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-black/5" />
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <h1 className={cn(TYPO_PAGE_TITLE_CLASS, "truncate")}>
              {team.name}
            </h1>
            <div className={cn("flex items-center gap-1.5", TYPO_METADATA_CLASS)}>
              <Calendar size={13} className="text-blue-500" />
              <span>Created {new Date(team.created_at).toLocaleDateString()}</span>
              <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-700" />
              <Users size={13} className="text-emerald-500" />
              <span>{memberCount} member{memberCount === 1 ? '' : 's'}</span>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 lg:w-[240px]">
          <EventSelect
            value={effectiveSelectedEvent}
            onChange={setSelectedEvent}
            events={teamEvents}
            showMain={showMainOption}
            className="!w-full"
            selectClassName="h-10"
            defaultValue="all"
            clearable
            getEventLabel={(ev: any) => String(ev?.name ?? ev?.title ?? 'Untitled')}
          />

          {isMember && onLeaveTeam && (
            <Button
              variant="outline"
              onClick={onLeaveTeam}
              disabled={busy}
              className="h-10 w-full border-red-200/50 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut size={14} className="mr-1.5" /> Leave Team
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-200/80 pt-4 dark:border-gray-800">
        <StatItem
          icon={<Hash size={14} className="text-emerald-500" />}
          label="Rank"
          value={summary?.rank ? `#${summary.rank}` : '-'}
        />
        <StatItem
          icon={<Trophy size={14} className="text-yellow-500" />}
          label="Points"
          value={summary?.total_score ?? summary?.unique_score ?? 0}
        />
        <StatItem
          icon={<Flag size={14} className="text-blue-500" />}
          label="Solves"
          value={summary?.unique_challenges ?? 0}
        />
      </div>
    </SurfaceCard>
  )
}

function StatItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100/50 dark:bg-gray-800/40">
        {icon}
      </div>
      <div className="min-w-0">
        <div className={cn(TYPO_SECTION_TITLE_CLASS, "!text-[10px] leading-none")}>
          {label}
        </div>
        <div className={cn(TYPO_STAT_VALUE_CLASS, "mt-0.5 !text-base sm:!text-lg")}>
          {value}
        </div>
      </div>
    </div>
  )
}
