'use client'

import React from 'react'
import { Search, Filter, Trash2, RefreshCw, MessageSquareQuote, Flag, User as UserIcon, Calendar } from 'lucide-react'
import Rating02, { RATINGS } from '@/components/ui/rating-emoji'
import type { ChallengeRating } from '@/shared/types'
import { formatRelativeDate } from '@/shared/lib/utils'

interface RatingsListCardProps {
  ratings: ChallengeRating[]
  total: number
  isLoading: boolean
  loadingMore: boolean
  hasMore: boolean
  searchQuery: string
  ratingFilter: number | 'all'
  categoryFilter: string
  onSearchQueryChange: (query: string) => void
  onRatingFilterChange: (val: number | 'all') => void
  onCategoryFilterChange: (val: string) => void
  onResetFilters: () => void
  onLoadMore: (offset: number) => void
  onAskDelete: (item: ChallengeRating) => void
  offset: number
}

export const RatingsListCard: React.FC<RatingsListCardProps> = ({
  ratings,
  total,
  isLoading,
  loadingMore,
  hasMore,
  searchQuery,
  ratingFilter,
  onSearchQueryChange,
  onRatingFilterChange,
  onResetFilters,
  onLoadMore,
  onAskDelete,
  offset,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-xl">
      {/* Header & Filter Bar */}
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20">
            <MessageSquareQuote className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Daftar Evaluasi & Rating Soal
              <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
                {total} ulasan
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Evaluasi masukan dan alasan pemberian rating dari solvers
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[220px] flex-1 md:flex-initial">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Cari challenge, user, atau ulasan..."
              className="w-full rounded-xl border border-gray-700/60 bg-slate-950/60 pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-all"
            />
          </div>

          {/* Rating Filter Select */}
          <select
            value={ratingFilter}
            onChange={(e) => {
              const v = e.target.value
              onRatingFilterChange(v === 'all' ? 'all' : Number(v))
            }}
            className="rounded-xl border border-gray-700/60 bg-slate-950/60 px-3 py-2 text-xs text-gray-200 outline-none focus:border-cyan-500 transition-all"
          >
            <option value="all">Semua Emoji Rating</option>
            <option value="5">😍 5 - Awesome</option>
            <option value="4">😊 4 - Good</option>
            <option value="3">😐 3 - Okay</option>
            <option value="2">😞 2 - Bad</option>
            <option value="1">😭 1 - Terrible</option>
          </select>

          {/* Reset button */}
          <button
            type="button"
            onClick={onResetFilters}
            title="Reset filter"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-700/60 bg-slate-950/60 text-gray-400 hover:text-white hover:border-gray-600 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content Table / List */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center text-xs text-gray-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent mr-2" />
          Memuat data evaluasi rating...
        </div>
      ) : ratings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <MessageSquareQuote className="h-12 w-12 text-gray-600 mb-3 opacity-50" />
          <h4 className="text-sm font-semibold text-gray-300">Belum ada data ulasan ditemukan</h4>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            Coba ubah kata kunci pencarian atau filter emoji yang dipilih.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-slate-950/40 text-gray-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Challenge & Kategori</th>
                <th className="px-5 py-3.5">Solver / User</th>
                <th className="px-5 py-3.5">Emoji Rating</th>
                <th className="px-5 py-3.5">Alasan / Feedback</th>
                <th className="px-5 py-3.5">Waktu</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {ratings.map((item) => {
                const ratingObj = item.rating >= 1 && item.rating <= 5 ? RATINGS[item.rating - 1] : null

                return (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Challenge & Category */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-white text-sm flex items-center gap-1.5">
                          <Flag className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                          {item.challenge_title}
                        </span>
                        <span className="inline-flex max-w-fit items-center rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 border border-cyan-500/20">
                          {item.challenge_category}
                        </span>
                      </div>
                    </td>

                    {/* Solver / User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        {item.user_picture ? (
                          <img
                            src={item.user_picture}
                            alt={item.username}
                            className="h-8 w-8 rounded-full object-cover ring-1 ring-cyan-500/30"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-cyan-400 font-bold border border-cyan-500/20">
                            {item.username?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-200">{item.username}</span>
                          {item.team_name && (
                            <span className="text-[10px] text-gray-400">Tim: {item.team_name}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Emoji Rating */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Rating02 value={item.rating} readOnly size="sm" />
                        <span className="font-mono text-xs font-bold text-cyan-400">
                          ({item.rating}/5)
                        </span>
                      </div>
                    </td>

                    {/* Feedback */}
                    <td className="px-5 py-4 max-w-xs">
                      {item.feedback ? (
                        <p className="italic text-gray-300 line-clamp-3 bg-slate-950/40 p-2 rounded-lg border border-white/5">
                          {`"${item.feedback}"`}
                        </p>
                      ) : (
                        <span className="text-gray-500 italic text-[11px]">Tanpa ulasan tertulis</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 whitespace-nowrap text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-gray-500" />
                        <span>{formatRelativeDate(item.created_at)}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onAskDelete(item)}
                        title="Hapus rating (Moderasi)"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Load More Footer */}
      {hasMore && (
        <div className="border-t border-white/10 p-4 text-center">
          <button
            type="button"
            onClick={() => onLoadMore(offset)}
            disabled={loadingMore}
            className="rounded-xl border border-gray-700 bg-slate-950/80 px-5 py-2 text-xs font-semibold text-gray-200 hover:border-cyan-500 hover:text-cyan-400 disabled:opacity-50 transition-all"
          >
            {loadingMore ? 'Memuat ulasan lainnya...' : 'Muat Lebih Banyak Ulasan'}
          </button>
        </div>
      )}
    </div>
  )
}

export default RatingsListCard
