import React from 'react'
import { Users, ShieldCheck, Trophy, Flag, Flame, Sparkles, BarChart3, FolderOpen } from 'lucide-react'
import { AdminStatCard } from '@/features/admin/ui'
import type { SiteInfo } from '../types'
import type { Challenge } from '@/shared/types'

interface OverviewStatsCardsProps {
  siteInfo: SiteInfo | null
  challenges: Challenge[]
}

const OverviewStatsCards: React.FC<OverviewStatsCardsProps> = ({ siteInfo, challenges }) => {
  const challengeCount = siteInfo?.total_challenges ?? challenges.length
  const activeChallengeCount = siteInfo?.active_challenges ?? challenges.filter((challenge) => challenge.is_active).length
  const difficultyCount = new Set(challenges.map((challenge) => challenge.difficulty).filter(Boolean)).size
  const categoryCount = new Set(challenges.map((challenge) => challenge.category).filter(Boolean)).size

  const stats = [
    { label: 'Total Users', value: siteInfo?.total_users ?? 0, icon: Users },
    { label: 'Total Admins', value: siteInfo?.total_admins ?? 0, icon: ShieldCheck },
    { label: 'Unique Solvers', value: siteInfo?.unique_solvers ?? 0, icon: Trophy },
    { label: 'Total Solves', value: siteInfo?.total_solves ?? 0, icon: Flag },
    { label: 'Total Challenges', value: challengeCount, icon: Flame },
    { label: 'Active Challenges', value: activeChallengeCount, icon: Sparkles },
    { label: 'Difficulties', value: difficultyCount, icon: BarChart3 },
    { label: 'Categories', value: categoryCount, icon: FolderOpen },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <AdminStatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
        />
      ))}
    </div>
  )
}

export default OverviewStatsCards
