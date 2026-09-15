'use client'

import React from 'react'
import ConfirmDialog from '@/shared/components/ConfirmDialog'
import { AdminContentLoading, AdminPageShell } from '../../ui'
import { useAdminRatingsData } from '../hooks/useAdminRatingsData'
import RatingsOverviewStats from './RatingsOverviewStats'
import RatingsListCard from './RatingsListCard'

export function AdminRatingsPage() {
  const {
    user,
    authLoading,
    isAdminUser,
    isLoading,
    loadingMore,
    ratings,
    analytics,
    total,
    offset,
    hasMore,
    searchQuery,
    setSearchQuery,
    ratingFilter,
    setRatingFilter,
    categoryFilter,
    setCategoryFilter,
    fetchRatings,
    reloadAll,
    confirmOpen,
    setConfirmOpen,
    pendingDelete,
    handleAskDelete,
    handleConfirmDelete,
  } = useAdminRatingsData()

  if (authLoading || (isLoading && !isAdminUser)) {
    return <AdminContentLoading variant="solvers" />
  }

  if (!user || !isAdminUser) return null

  return (
    <>
      <AdminPageShell>
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Evaluasi & Rating Soal CTF
            </h1>
            <p className="text-xs text-gray-400 sm:text-sm">
              Pantau masukan, rating emoji (1-5), dan tingkat kepuasan peserta terhadap soal-soal CTF.
            </p>
          </div>

          {/* Overview Cards & Distribution */}
          <RatingsOverviewStats analytics={analytics} />

          {/* Detailed Ratings List */}
          <RatingsListCard
            ratings={ratings}
            total={total}
            isLoading={isLoading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            searchQuery={searchQuery}
            ratingFilter={ratingFilter}
            categoryFilter={categoryFilter}
            onSearchQueryChange={setSearchQuery}
            onRatingFilterChange={setRatingFilter}
            onCategoryFilterChange={setCategoryFilter}
            onResetFilters={() => {
              setSearchQuery('')
              setRatingFilter('all')
              setCategoryFilter('all')
              reloadAll()
            }}
            onLoadMore={fetchRatings}
            onAskDelete={handleAskDelete}
            offset={offset}
          />
        </div>
      </AdminPageShell>

      {/* Delete / Moderation Confirmation Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Hapus Rating Evaluasi"
        variant="destructive"
        description={
          <div>
            <div className="mb-2">
              Apakah Anda yakin ingin menghapus rating & ulasan ini? Tindakan ini tidak dapat dibatalkan.
            </div>
            {pendingDelete && (
              <div className="mt-2 rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs font-semibold text-rose-200 flex flex-col gap-1">
                <span>
                  <b>User:</b> {pendingDelete.username}
                </span>
                <span>
                  <b>Challenge:</b> {pendingDelete.challenge_title} ({pendingDelete.rating}/5)
                </span>
                {pendingDelete.feedback && (
                  <span className="italic font-normal opacity-90">
                    {`"${pendingDelete.feedback}"`}
                  </span>
                )}
              </div>
            )}
          </div>
        }
        confirmLabel="Hapus Ulasan"
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}

export default AdminRatingsPage
