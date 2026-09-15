'use client'

import React from 'react'
import { Star, MessageSquare, TrendingUp, TrendingDown, Award, AlertTriangle } from 'lucide-react'
import Rating02, { RATINGS } from '@/components/ui/rating-emoji'
import type { RatingAnalyticsSummary } from '@/shared/types'
import { motion } from 'framer-motion'

interface RatingsOverviewStatsProps {
  analytics: RatingAnalyticsSummary | null
}

export const RatingsOverviewStats: React.FC<RatingsOverviewStatsProps> = ({ analytics }) => {
  if (!analytics) return null

  const { totalRatings, averageRating, distribution, topRated, lowestRated } = analytics

  return (
    <div className="flex flex-col gap-6">
      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Reviews */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl shadow-lg transition-all hover:border-cyan-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Ulasan</p>
              <h3 className="mt-2 text-3xl font-black tracking-tight text-white">{totalRatings}</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20">
              <MessageSquare className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
            <span>Seluruh evaluasi dari solvers</span>
          </div>
        </div>

        {/* Card 2: Average Rating */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl shadow-lg transition-all hover:border-amber-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Rata-Rata Skor</p>
              <div className="mt-2 flex items-baseline gap-2">
                <h3 className="text-3xl font-black tracking-tight text-amber-400">{averageRating}</h3>
                <span className="text-sm font-semibold text-gray-400">/ 5.0</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
              <Star className="h-6 w-6 fill-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-amber-400/90 font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Kualitas keseluruhan soal</span>
          </div>
        </div>

        {/* Card 3: Top Rated Challenge */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-slate-900/60 p-5 backdrop-blur-xl shadow-lg transition-all hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <Award className="h-3.5 w-3.5" /> Challenge Terbaik
              </p>
              <h3 className="mt-2 text-base font-bold text-white truncate" title={topRated?.title || 'Belum ada data'}>
                {topRated?.title || 'Belum ada data'}
              </h3>
            </div>
            {topRated && (
              <div className="ml-2 flex flex-col items-end shrink-0">
                <span className="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-xs font-extrabold text-emerald-300">
                  {topRated.avgRating} ★
                </span>
                <span className="text-[10px] text-gray-400 mt-1">{topRated.totalCount} rating</span>
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-gray-400 truncate">
            {topRated ? `Kategori: ${topRated.category}` : 'Dapatkan rating dari solvers'}
          </p>
        </div>

        {/* Card 4: Lowest Rated Challenge */}
        <div className="relative overflow-hidden rounded-2xl border border-rose-500/20 bg-slate-900/60 p-5 backdrop-blur-xl shadow-lg transition-all hover:border-rose-500/40">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Perlu Evaluasi
              </p>
              <h3 className="mt-2 text-base font-bold text-white truncate" title={lowestRated?.title || 'Belum ada data'}>
                {lowestRated?.title || 'Belum ada data'}
              </h3>
            </div>
            {lowestRated && (
              <div className="ml-2 flex flex-col items-end shrink-0">
                <span className="rounded-lg bg-rose-500/20 px-2 py-0.5 text-xs font-extrabold text-rose-300">
                  {lowestRated.avgRating} ★
                </span>
                <span className="text-[10px] text-gray-400 mt-1">{lowestRated.totalCount} rating</span>
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-gray-400 truncate">
            {lowestRated ? `Kategori: ${lowestRated.category}` : 'Belum ada catatan masukan'}
          </p>
        </div>
      </div>

      {/* Emoji Distribution Bar Chart Section */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <span>Distribus Penilaian Emoji Solvers</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[5, 4, 3, 2, 1].map((starIdx) => {
            const count = distribution[starIdx] || 0
            const percentage = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0
            const emojiInfo = RATINGS[starIdx - 1]

            return (
              <div
                key={starIdx}
                className="flex flex-col items-center rounded-xl border border-white/5 bg-slate-950/40 p-3 text-center transition-transform hover:scale-[1.02]"
              >
                <div className="mb-2 flex items-center justify-center">
                  <Rating02 value={starIdx} readOnly size="sm" max={starIdx} className="scale-90" />
                </div>
                <div className="text-xs font-semibold text-gray-200">{emojiInfo.label}</div>
                <div className="text-lg font-black text-white mt-1">{count}</div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-1 font-mono">{percentage}%</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default RatingsOverviewStats
