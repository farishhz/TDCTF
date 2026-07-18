import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui'
import {
  AdminDataSurface,
  AdminEmptyState,
  AdminFilterInput,
  AdminFilterToolbar,
  AdminListSurface,
  AdminStickyToolbar,
} from '../../ui'
import { formatRelativeDate } from '../lib'
import type { SolverRow } from '../types'

interface SolversListCardProps {
  solvers: SolverRow[]
  searchQuery: string
  searching: boolean
  loadingMore: boolean
  hasMore: boolean
  offset: number
  onSearchQueryChange: (value: string) => void
  onSearch: () => void
  onReset: () => void
  onAskDelete: (id: string) => void
  onLoadMore: (offset: number) => void
  selectedIds: string[]
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  onBulkDelete: () => void
}

const SolversListCard: React.FC<SolversListCardProps> = ({
  solvers,
  searchQuery,
  searching,
  loadingMore,
  hasMore,
  offset,
  onSearchQueryChange,
  onSearch,
  onReset,
  onAskDelete,
  onLoadMore,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onBulkDelete,
}) => {
  return (
    <AdminDataSurface
      toolbar={(
        <AdminStickyToolbar
          filters={(
            <AdminFilterToolbar
              actions={(
                <>
                  <Button id="search-btn" variant="outline" size="sm" onClick={onSearch} className="h-9 shrink-0 rounded-xl border-gray-200/50 px-4 text-xs font-semibold text-gray-700 hover:border-blue-500/40 dark:border-gray-800/50 dark:text-gray-200">
                    {searching ? 'Searching...' : 'Search'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onReset}
                    className={searchQuery.trim().length > 0
                      ? "h-9 shrink-0 rounded-xl border-blue-600 bg-blue-600 px-4 text-xs font-semibold text-white hover:border-blue-500 hover:bg-blue-500 dark:border-blue-600 dark:bg-blue-600 dark:text-white"
                      : "h-9 shrink-0 rounded-xl border-gray-200/50 px-4 text-xs font-semibold text-gray-700 hover:border-blue-500/40 dark:border-gray-800/50 dark:text-gray-200"
                    }
                  >
                    Reset
                  </Button>
                </>
              )}
            >
            <AdminFilterInput
              type="text"
              placeholder="Search by user or challenge..."
              value={searchQuery}
              defaultValue=""
              onChange={onSearchQueryChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSearch()
              }}
            />
            </AdminFilterToolbar>
          )}
        />
      )}
      empty={solvers.length === 0 ? (
            <AdminEmptyState
              title="No solves found"
              description="No one has solved this challenge yet or matches your search."
            />
      ) : null}
    >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AdminListSurface>
              {solvers.length > 0 && (
                <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/5 select-none shrink-0">
                  <div className="flex items-center gap-3">
                    <label className="relative flex h-5 w-5 shrink-0 items-center justify-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={solvers.length > 0 && selectedIds.length === solvers.length}
                        onChange={onToggleSelectAll}
                        className="peer sr-only"
                      />
                      <span className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-gray-300/80 bg-white transition-all duration-150 peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/40 dark:border-gray-600 dark:bg-[#151b2a] dark:peer-checked:border-blue-500 dark:peer-checked:bg-blue-500">
                        <svg
                          className={`h-3 w-3 transition-transform duration-150 ${
                            selectedIds.length > 0 ? 'scale-100' : 'scale-0'
                          } text-white`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {selectedIds.length === solvers.length ? (
                            <polyline points="20 6 9 17 4 12" />
                          ) : (
                            <line x1="5" y1="12" x2="19" y2="12" />
                          )}
                        </svg>
                      </span>
                    </label>
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      {selectedIds.length > 0 ? `Selected ${selectedIds.length} solves` : 'Solve Details'}
                    </span>
                  </div>

                  {selectedIds.length > 0 ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={onBulkDelete}
                      className="h-7 text-[10px] font-extrabold rounded-lg flex items-center gap-1 bg-red-600 hover:bg-red-500 text-white"
                    >
                      <Trash2 size={12} />
                      <span>Delete Selected</span>
                    </Button>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      Actions
                    </span>
                  )}
                </div>
              )}

              {solvers.map((s) => {
                const isSelected = selectedIds.includes(s.solve_id)
                return (
                  <div
                    key={s.solve_id}
                    className={`flex items-center justify-between px-5 py-3 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-900/10 ${
                      isSelected ? 'bg-blue-50/20 dark:bg-blue-950/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <label className="relative flex h-5 w-5 shrink-0 items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect(s.solve_id)}
                          className="peer sr-only"
                        />
                        <span className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-gray-300/80 bg-white transition-all duration-150 peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/40 dark:border-gray-600 dark:bg-[#151b2a] dark:peer-checked:border-blue-500 dark:peer-checked:bg-blue-500">
                          <svg
                            className="h-3 w-3 scale-0 text-white transition-transform duration-150 peer-checked:scale-100"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                      </label>
                      <div className="truncate text-sm font-medium">
                        <Link
                          href={`/user/${encodeURIComponent(s.username)}`}
                          className="text-blue-600 dark:text-blue-300 hover:underline"
                          title={s.username}
                        >
                          {s.username}
                        </Link>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-normal"> solved </span>
                        <span className="text-xs text-gray-800 dark:text-gray-200 font-semibold">{s.challenge_title}</span>
                        <span className="ml-2.5 font-mono text-xs font-normal text-gray-500/80 dark:text-gray-500">
                          {formatRelativeDate(s.solved_at)}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onAskDelete(s.solve_id)}
                      aria-label="Delete Solve"
                      title="Delete Solve"
                      className="text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:text-red-700 h-8 w-8 rounded-lg shrink-0"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                )
              })}
            </AdminListSurface>
          </motion.div>

        {hasMore && (
          <div className="flex justify-center p-4 border-t border-gray-100 dark:border-gray-800">
            <Button onClick={() => onLoadMore(offset)} disabled={loadingMore} className="rounded-xl">
              {loadingMore ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}
      </AdminDataSurface>
  )
}

export default SolversListCard
