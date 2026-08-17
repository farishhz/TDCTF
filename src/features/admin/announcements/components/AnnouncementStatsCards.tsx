'use client'

import React from 'react'
import { Megaphone, CheckCircle2, CalendarClock, Flame, Eye, BookOpenCheck } from 'lucide-react'
import { AdminStatCard } from '@/features/admin/ui'
import type { AnnouncementStats } from '../types'

interface AnnouncementStatsCardsProps {
  stats: AnnouncementStats | null
  loading?: boolean
}

export default function AnnouncementStatsCards({ stats, loading }: AnnouncementStatsCardsProps) {
  const cards = [
    {
      label: 'Total Announcements',
      value: stats?.total ?? 0,
      icon: Megaphone,
    },
    {
      label: 'Active Now',
      value: stats?.active ?? 0,
      icon: Flame,
    },
    {
      label: 'Published',
      value: stats?.published ?? 0,
      icon: CheckCircle2,
    },
    {
      label: 'Scheduled',
      value: stats?.scheduled ?? 0,
      icon: CalendarClock,
    },
    {
      label: 'Total Views',
      value: stats?.total_views ?? 0,
      icon: Eye,
    },
    {
      label: 'Total Reads',
      value: stats?.total_reads ?? 0,
      icon: BookOpenCheck,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
      {cards.map((item) => (
        <AdminStatCard
          key={item.label}
          label={item.label}
          value={item.value}
          icon={item.icon}
        />
      ))}
    </div>
  )
}
