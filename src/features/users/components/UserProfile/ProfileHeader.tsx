'use client'

import React, { useState, useEffect } from 'react'
import { CalendarDays, Clock3 } from 'lucide-react'
import { ImageWithFallback } from '@/shared/components'
import EventSelect from '@/features/events/components/EventSelect'
import SocialIcon from '@/features/users/components/ui/SocialIcon'
import { formatRelativeDate } from '@/shared/lib'
import { SurfaceCard } from '@/shared/ui'
import {
  TYPO_PAGE_TITLE_CLASS,
  TYPO_METADATA_CLASS
} from '@/shared/styles'
import { cn } from '@/shared/lib/utils'
import { usePresence } from '@/shared/contexts'
import { UserDetail, Badge } from '../../types'

/**
 * Sanitasi URL social media — hanya izinkan http/https ke domain publik.
 * Blokir javascript:, data:, dan protocol berbahaya lainnya.
 */
function sanitizeSocialUrl(url: string): string {
  if (!url?.trim()) return ''
  try {
    const parsed = new URL(url)
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.href
    }
    return ''
  } catch {
    return ''
  }
}

type ProfileHeaderProps = {
  userDetail: UserDetail
  avatarSrc: string | null
  badges: Badge[]
  effectiveSelectedEvent: string
  setSelectedEvent: (eventId: string) => void
  profileEvents: any[]
  showMainOption: boolean
  isCurrentUser: boolean
  authInfo: any[]
  refreshUserDetail: () => void
  onUpdateUserDetail: (detail: UserDetail) => void
}

export default function ProfileHeader({
  userDetail,
  avatarSrc,
  effectiveSelectedEvent,
  setSelectedEvent,
  profileEvents,
  showMainOption,
  isCurrentUser,
  authInfo,
  refreshUserDetail,
  onUpdateUserDetail
}: ProfileHeaderProps) {
  const { isUserOnline, getUserPresence } = usePresence()
  const isOnline = isUserOnline(userDetail.id)
  const presence = getUserPresence(userDetail.id)

  const effectiveLastActiveIso = React.useMemo(() => {
    const dbIso = userDetail.last_login_at
    const presenceIso = presence?.lastActiveAt
    if (!dbIso) return presenceIso || null
    if (!presenceIso) return dbIso
    const dbTime = new Date(dbIso).getTime()
    const presenceTime = new Date(presenceIso).getTime()
    return presenceTime > dbTime ? presenceIso : dbIso
  }, [userDetail.last_login_at, presence?.lastActiveAt])

  const isCurrentlyActive = isCurrentUser || isOnline
  const lastLoginText = isCurrentlyActive
    ? 'Just now'
    : effectiveLastActiveIso
    ? formatRelativeDate(effectiveLastActiveIso)
    : 'Never'

  return (
    <SurfaceCard
      variant="glass"
      padding="md"
      className="mx-auto flex w-full max-w-7xl flex-col gap-6 rounded-xl md:flex-row md:items-start md:justify-between relative overflow-hidden"
    >
      {/* Top Banner Cyber Accent */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-blue-600/15 via-indigo-600/10 to-purple-600/15 border-b border-white/5 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 flex w-full flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:gap-6 pt-2">
        <div className="relative mx-auto sm:mx-0 shrink-0">
          <div className="relative flex h-24 w-24 overflow-hidden rounded-full border-2 border-white/20 shadow-xl dark:border-white/10 sm:h-28 sm:w-28 aspect-square ring-4 ring-black/20 group">
            <ImageWithFallback
              src={avatarSrc}
              alt={userDetail.username}
              size={128}
              className="!h-full !w-full object-cover transition-transform duration-300 group-hover:scale-105"
              fallbackBg="bg-blue-500/10"
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3 text-center sm:text-left">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 min-w-0">
              <h1
                className={cn(TYPO_PAGE_TITLE_CLASS, "leading-tight truncate text-2xl sm:text-3xl font-black")}
                title={userDetail.username}
              >
                {userDetail.username}
              </h1>

              {userDetail.is_admin ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.15)]">
                  ADMIN
                </span>
              ) : null}

              {userDetail.tags && userDetail.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {userDetail.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex items-center text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-500/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <EventSelect
              value={effectiveSelectedEvent}
              onChange={setSelectedEvent}
              events={profileEvents as any}
              showMain={showMainOption}
              className="w-full sm:min-w-[180px] md:w-[220px]"
              defaultValue="all"
              clearable
              getEventLabel={(ev: any) => String(ev?.name ?? ev?.title ?? 'Untitled')}
            />
          </div>

          <p className="max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300 font-medium italic border-l-2 border-blue-500/30 pl-3">
            {userDetail.bio?.trim() || 'Empty bio. This user has not added a bio yet.'}
          </p>

          <div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row sm:items-center pt-1">
            <div className="flex flex-wrap justify-center items-center gap-2 sm:justify-start">
              <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-gray-200/60 bg-white/60 px-3 py-1 backdrop-blur-sm dark:border-white/10 dark:bg-white/5", TYPO_METADATA_CLASS)}>
                <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
                Joined {userDetail.created_at ? formatRelativeDate(userDetail.created_at) : '-'}
              </span>
              <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-gray-200/60 bg-white/60 px-3 py-1 backdrop-blur-sm dark:border-white/10 dark:bg-white/5", TYPO_METADATA_CLASS)}>
                <Clock3 className="h-3.5 w-3.5 text-blue-500" />
                Last login {lastLoginText}
              </span>
            </div>

            {userDetail.sosmed && (
              <div className="flex items-center gap-2">
                {userDetail.sosmed.linkedin?.trim() && (
                  <SocialIcon
                    type="linkedin"
                    href={sanitizeSocialUrl(
                      userDetail.sosmed.linkedin.startsWith('http')
                        ? userDetail.sosmed.linkedin
                        : `https://linkedin.com/in/${userDetail.sosmed.linkedin}`
                    )}
                    label="LinkedIn"
                    hideLabelOnMobile
                  />
                )}
                {userDetail.sosmed.instagram?.trim() && (
                  <SocialIcon
                    type="instagram"
                    href={sanitizeSocialUrl(
                      userDetail.sosmed.instagram.startsWith('http')
                        ? userDetail.sosmed.instagram
                        : `https://instagram.com/${userDetail.sosmed.instagram}`
                    )}
                    label="Instagram"
                    hideLabelOnMobile
                  />
                )}
                {userDetail.sosmed.web?.trim() && (
                  <SocialIcon
                    type="web"
                    href={sanitizeSocialUrl(
                      userDetail.sosmed.web.startsWith('http')
                        ? userDetail.sosmed.web
                        : `https://${userDetail.sosmed.web}`
                    )}
                    label="Website"
                    hideLabelOnMobile
                  />
                )}
                {userDetail.sosmed.discord?.trim() && (
                  <SocialIcon
                    type="discord"
                    label={userDetail.sosmed.discord}
                    alwaysShowLabel
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </SurfaceCard>
  )
}
