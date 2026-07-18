import React from 'react'
import Link from 'next/link'
import { Badge, Button } from '@/shared/ui'
import { AdminPanel } from '@/features/admin/ui'
import { Challenge, SiteInfo } from '../types'
import { motion } from 'framer-motion'
import { ADMIN_STAT_TILE_CLASS } from '@/features/admin/ui/card-styles'

interface ChallengeOverviewCardProps {
  challenges: Challenge[]
  showViewAll?: boolean
  info?: SiteInfo
}

const ChallengeOverviewCard: React.FC<ChallengeOverviewCardProps> = ({ challenges, info, showViewAll = true }) => {
  const viewAllAction = showViewAll && (
    <Link href="/admin/overview">
      <Button variant="default" size="sm">View All</Button>
    </Link>
  )

  return (
    <AdminPanel title="Overview" action={viewAllAction} className="shrink-0" contentClassName="pt-4">
      {info && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={ADMIN_STAT_TILE_CLASS}>
            <div className="text-xs text-muted-foreground dark:text-gray-300 truncate">Users</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">{info.total_users}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={ADMIN_STAT_TILE_CLASS}>
            <div className="text-xs text-muted-foreground dark:text-gray-300 truncate">Admins</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">{info.total_admins ?? 0}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={ADMIN_STAT_TILE_CLASS}>
            <div className="text-xs text-muted-foreground dark:text-gray-300 truncate">Uniq Solvers</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">{info.unique_solvers ?? 0}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={ADMIN_STAT_TILE_CLASS}>
            <div className="text-xs text-muted-foreground dark:text-gray-300 truncate">Solves</div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">{info.total_solves}</div>
          </motion.div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={ADMIN_STAT_TILE_CLASS}>
          <div className="text-xs text-muted-foreground dark:text-gray-300">Challenges</div>
          <div className="text-xl font-semibold text-gray-900 dark:text-white">{challenges.length}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={ADMIN_STAT_TILE_CLASS}>
          <div className="text-xs text-muted-foreground dark:text-gray-300">Active</div>
          <div className="text-xl font-semibold text-gray-900 dark:text-white">{challenges.filter(c => c.is_active).length}</div>
        </motion.div>
      </div>
      <div className="mb-6">
        <details className="group">
          <summary className="cursor-pointer list-none flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">By Difficulty</div>
            <svg className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </summary>

          <div className="pt-1 max-h-40 overflow-auto space-y-2 pr-2">
            {["Easy", "Medium", "Hard"].map(diff => {
              const count = challenges.filter(c => c.difficulty === diff).length
              return (
                <button
                  key={diff}
                  type="button"
                  className="w-full text-left flex items-center justify-between px-3 py-2 rounded-xl bg-white/40 border border-gray-200/80 hover:bg-white/80 dark:bg-[#111622]/40 dark:border-gray-800/80 dark:hover:bg-[#111622]/80 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-200"
                  aria-label={`Filter difficulty ${diff}`}>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">{diff}</span>
                  <Badge className={diff === "Easy" ? "bg-green-150 text-green-800 dark:bg-green-600/30 dark:text-green-400" : diff === "Medium" ? "bg-yellow-150 text-yellow-850 dark:bg-yellow-600/30 dark:text-yellow-400" : "bg-red-150 text-red-800 dark:bg-red-600/30 dark:text-red-400"}>
                    <span className="inline-block min-w-[36px] text-center text-sm font-semibold">{count}</span>
                  </Badge>
                </button>
              )
            })}
          </div>
        </details>
      </div>
      <div className="mb-6">
        <details className="group">
          <summary className="cursor-pointer list-none flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-200">By Category</div>
            <svg className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </summary>
          <div className="pt-1 max-h-48 overflow-auto space-y-2 pr-2 scroll-hidden">
            {Array.from(new Set(challenges.map(c => c.category))).map(cat => {
              const count = challenges.filter(c => c.category === cat).length
              return (
                <button
                  key={cat}
                  type="button"
                  className="w-full text-left flex items-center justify-between bg-white/40 px-3 py-2 rounded-xl border border-gray-200/80 hover:bg-white/80 dark:bg-[#111622]/40 dark:border-gray-800/80 dark:hover:bg-[#111622]/80 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-200"
                  aria-label={`Filter by ${cat}`}>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">{cat}</span>
                  <Badge className="bg-blue-150 text-blue-800 dark:bg-blue-600/30 dark:text-blue-400">
                    <span className="inline-block min-w-[36px] text-center text-sm font-semibold">{count}</span>
                  </Badge>
                </button>
              )
            })}
          </div>
        </details>
      </div>
    </AdminPanel>
  )
}

export default ChallengeOverviewCard
