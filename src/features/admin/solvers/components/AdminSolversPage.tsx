"use client"

import { useState } from 'react'
import ConfirmDialog from '@/shared/components/ConfirmDialog'
import SolversListCard from './SolversListCard'
import { useAdminSolversData } from '../hooks/useAdminSolversData'
import { AdminContentLoading, AdminPageShell } from '../../ui'

export default function AdminSolversPage() {
  const {
    user,
    authLoading,
    isLoading,
    isAdminUser,
    solvers,
    offset,
    hasMore,
    loadingMore,
    searchQuery,
    setSearchQuery,
    searching,
    confirmOpen,
    setConfirmOpen,
    pendingDelete,
    setPendingDelete,
    pendingDeleteDetail,
    setPendingDeleteDetail,
    fetchSolvers,
    searchSolvers,
    resetSearch,
    askDelete,
    doDelete,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    doBulkDelete,
  } = useAdminSolversData()

  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false)

  if (authLoading || (isLoading && !isAdminUser)) return <AdminContentLoading variant="solvers" />
  if (!user || !isAdminUser) return null

  if (isLoading) {
    return (
      <AdminPageShell>
        <AdminContentLoading variant="solvers" />
      </AdminPageShell>
    )
  }

  return (
    <>
      <AdminPageShell>
        <SolversListCard
          solvers={solvers}
          searchQuery={searchQuery}
          searching={searching}
          loadingMore={loadingMore}
          hasMore={hasMore}
          offset={offset}
          onSearchQueryChange={setSearchQuery}
          onSearch={() => void searchSolvers()}
          onReset={() => void resetSearch()}
          onAskDelete={askDelete}
          onLoadMore={fetchSolvers}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onBulkDelete={() => setBulkConfirmOpen(true)}
        />
      </AdminPageShell>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Solve"
        variant="destructive"
        description={
          <div>
            <div className="mb-2">Are you sure you want to delete this solve record? This action cannot be undone.</div>
            {pendingDeleteDetail && (
              <div className="mt-2 p-3 rounded bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 text-sm font-semibold flex flex-col gap-1">
                <span><b>User:</b> <span className="font-mono max-w-[300px] truncate inline-flex">{pendingDeleteDetail.username}</span></span>
                <span><b>Challenge:</b> <span className="font-mono max-w-[300px] truncate inline-flex">{pendingDeleteDetail.challenge_title}</span></span>
              </div>
            )}
          </div>
        }
        onConfirm={async () => {
          if (!pendingDelete) return
          await doDelete(pendingDelete)
          setPendingDelete(null)
          setPendingDeleteDetail(null)
        }}
      />

      <ConfirmDialog
        open={bulkConfirmOpen}
        onOpenChange={setBulkConfirmOpen}
        title="Delete Selected Solves"
        variant="destructive"
        description={`Are you sure you want to delete ${selectedIds.length} solve record(s)? This action cannot be undone.`}
        confirmLabel="Delete All Selected"
        verificationText="yes"
        verificationPlaceholder="Type 'yes' to confirm"
        onConfirm={async () => {
          await doBulkDelete()
        }}
      />
    </>
  )
}
