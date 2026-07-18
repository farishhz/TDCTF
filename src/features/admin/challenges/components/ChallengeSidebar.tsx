import React from 'react'
import ChallengeOverviewCard from './ChallengeOverviewCard'
import RecentSolversList from './RecentSolversList'
import type { Challenge, SiteInfo, SolverRow } from '../types'

interface ChallengeSidebarProps {
  challenges: Challenge[]
  solvers: SolverRow[]
  siteInfo: SiteInfo | null
  isGlobalAdmin: boolean
  onViewAllSolvers: () => void
}

const ChallengeSidebar: React.FC<ChallengeSidebarProps> = ({
  challenges,
  solvers,
  siteInfo,
  isGlobalAdmin,
  onViewAllSolvers,
}) => {
  return (
    <aside className="order-2 space-y-6 xl:order-none xl:col-span-1 xl:sticky xl:top-32">
      <ChallengeOverviewCard
        challenges={challenges}
        info={isGlobalAdmin ? (siteInfo || undefined) : undefined}
        showViewAll={isGlobalAdmin}
      />
      <RecentSolversList solvers={solvers} onViewAll={onViewAllSolvers} />
    </aside>
  )
}

export default ChallengeSidebar
