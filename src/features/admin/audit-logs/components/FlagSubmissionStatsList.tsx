"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Search } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui'
import { cn } from '@/shared/lib/utils'
import { Loader } from '@/shared/components'
import { formatRelativeDate } from '@/shared/lib'
import { getFlagSubmissionStats, type FlagSubmissionStatsEntry } from '@/features/logs/lib/audit-service'
import {
  ADMIN_ROW_CLASS,
  AdminDataSurface,
  AdminEmptyState,
  AdminFilterInput,
  AdminFilterSelect,
  AdminFilterToolbar,
  AdminStickyToolbar,
  AdminTableSurface,
} from '../../ui'

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'solved', label: 'Solved' },
  { value: 'incorrect', label: 'Unsolved' },
]

const LIMIT_OPTIONS = [25, 50, 100, 250]

export default function FlagSubmissionStatsList({ tabs }: { tabs?: React.ReactNode }) {
  const [entries, setEntries] = useState<FlagSubmissionStatsEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [limit, setLimit] = useState(50)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')

  const offset = (page - 1) * limit
  const hasNextPage = entries.length === limit

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      try {
        const result = await getFlagSubmissionStats(limit, offset, {
          status: status === 'all' ? null : status,
          search: search.trim() || null,
        })
        setEntries(result.entries)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [status, search, limit, offset])

  useEffect(() => {
    setPage(1)
  }, [status, search, limit])

  if (isLoading) return (
    <div className="flex flex-1 items-center justify-center">
      <Loader size={40} />
    </div>
  )

  return (
    <AdminDataSurface
      toolbar={(
        <AdminStickyToolbar
          tabs={tabs}
          filters={(
            <AdminFilterToolbar
              actions={(
                <>
                  <AdminFilterSelect
                    value={status}
                    defaultValue="all"
                    onValueChange={setStatus}
                    className="w-full sm:w-[170px]"
                    options={STATUS_OPTIONS}
                  />
                  <AdminFilterSelect
                    value={String(limit)}
                    defaultValue="50"
                    onValueChange={(value) => setLimit(Number(value))}
                    className="w-full sm:w-[110px]"
                    options={LIMIT_OPTIONS.map((value) => ({ value: String(value), label: `${value} rows` }))}
                  />
                </>
              )}
            >
              <AdminFilterInput
                value={search}
                defaultValue=""
                onChange={setSearch}
                placeholder="Search user or challenge..."
                wrapperClassName="w-full"
                icon={<Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
              />
            </AdminFilterToolbar>
          )}
        />
      )}
      empty={entries.length === 0 ? (
        <AdminEmptyState
          title="No flag submission stats found"
          description="Try adjusting status or search query."
        />
      ) : null}
    >
      <AdminTableSurface>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200/80 hover:bg-transparent dark:border-gray-800">
              <TableHead className="pl-6 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">User</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Challenge</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Category</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</TableHead>
              <TableHead className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Attempts</TableHead>
              <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Last Attempt</TableHead>
              <TableHead className="pr-6 text-right text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Solved At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry, idx) => (
              <TableRow
                key={`${entry.user_id}-${entry.challenge_id}-${idx}`}
                className={cn(ADMIN_ROW_CLASS, "border-b border-gray-100 dark:border-gray-800")}
              >
                <TableCell className="pl-6 py-3 font-semibold text-gray-900 dark:text-gray-100">
                  <Link
                    href={`/user/${encodeURIComponent(entry.username)}`}
                    className="text-blue-600 transition hover:text-blue-500 hover:underline dark:text-blue-400"
                  >
                    {entry.username}
                  </Link>
                </TableCell>
                <TableCell className="py-3 font-semibold text-gray-800 dark:text-gray-200">
                  {entry.challenge_title}
                </TableCell>
                <TableCell className="py-3">
                  <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 uppercase tracking-wide">
                    {entry.challenge_category}
                  </span>
                </TableCell>
                <TableCell className="py-3">
                  {entry.is_solved ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Solved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                      <XCircle className="h-3 w-3" />
                      Unsolved
                    </span>
                  )}
                </TableCell>
                <TableCell className="py-3 text-center">
                  <span className="font-mono font-bold text-sm text-gray-700 dark:text-gray-300">
                    {entry.incorrect_attempts}
                  </span>
                </TableCell>
                <TableCell className="py-3 text-right text-xs text-gray-500 font-mono">
                  {formatRelativeDate(entry.last_attempt_at)}
                </TableCell>
                <TableCell className="pr-6 py-3 text-right text-xs font-mono">
                  {entry.is_solved && entry.solved_at ? (
                    <span className="text-emerald-600/90 dark:text-emerald-400/90">
                      {formatRelativeDate(entry.solved_at)}
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-600">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AdminTableSurface>

      <div className="mx-5 my-4 flex flex-col gap-3 border-t border-gray-200/80 pt-4 text-sm text-muted-foreground dark:border-gray-800/80 sm:flex-row sm:items-center sm:justify-between">
        <span>Page {page}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            disabled={page <= 1}
            className="rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((currentPage) => currentPage + 1)}
            disabled={!hasNextPage}
            className="rounded-xl"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AdminDataSurface>
  )
}
