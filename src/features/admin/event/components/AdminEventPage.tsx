"use client"

import { AnimatePresence } from 'framer-motion'
import { CalendarDays, GitBranch, Users } from 'lucide-react'
import ConfirmDialog from '@/shared/components/ConfirmDialog'
import BulkAssignChallengesCard from './BulkAssignChallengesCard'
import EventFormDialog from './EventFormDialog'
import EventListCard from './EventListCard'
import EventMembersCard from './EventMembersCard'
import { Button } from '@/shared/ui'
import { useAdminEventData } from '../hooks/useAdminEventData'
import { AdminContentLoading, AdminPageShell, AdminStickyToolbar, AdminTabs, useTabState } from '../../ui'

type AdminEventTab = 'event-list' | 'bulk-event' | 'event-members' | 'join-requests'

const EVENT_TABS = [
  { value: 'event-list' as const, label: 'Event List', icon: CalendarDays },
  { value: 'bulk-event' as const, label: 'Bulk Event', icon: GitBranch },
  { value: 'event-members' as const, label: 'Members', icon: Users },
]

export default function AdminEventPage() {
  const [activeTab, setActiveTab] = useTabState<AdminEventTab>('tab', 'event-list')
  const {
    user,
    authLoading,
    isLoading,
    isAdminUser,
    sortedEvents,
    manageEventId,
    setManageEventId,
    openForm,
    setOpenForm,
    editing,
    formData,
    setFormData,
    submitting,
    handleSubmit,
    handleRegenerateJoinKey,
    openAdd,
    openEdit,
    askDelete,
    confirmOpen,
    setConfirmOpen,
    pendingDelete,
    doDelete,
    assignUserQuery,
    setAssignUserQuery,
    loadingUserSearch,
    candidateUsers,
    selectedCandidateUserIds,
    toggleCandidateSelection,
    selectAllCandidates,
    clearCandidateSelection,
    handleQuickAddSelectedMembers,
    memberActionUserId,
    handleQuickAddMember,
    memberQuery,
    setMemberQuery,
    loadingEventMembers,
    filteredEventMembers,
    handleRemoveMember,
    filters,
    setFilters,
    categories,
    difficulties,
    selectAllFiltered,
    clearSelection,
    bulkEventId,
    setBulkEventId,
    handleBulkAssign,
    handleBulkRemove,
    bulkSubmitting,
    filteredChallenges,
    selectedIds,
    toggleSelect,
    joinRequests,
    loadingJoinRequests,
    reviewingRequestId,
    handleReviewRequest,
  } = useAdminEventData()

  if (authLoading || (isLoading && !isAdminUser)) return <AdminContentLoading variant="event" />
  if (!user || !isAdminUser) return null

  if (isLoading) {
    return (
      <AdminPageShell mainClassName="space-y-5">
        <AdminContentLoading variant="event" />
      </AdminPageShell>
    )
  }

  return (
    <>
      <AdminPageShell>
        <AdminStickyToolbar
          tabs={
              <AdminTabs
                items={EVENT_TABS}
                value={activeTab}
                onChange={setActiveTab}
              />
          }
          actions={
              activeTab === 'event-list' ? (
                <Button onClick={openAdd} size="sm" className="rounded-xl">
                  + Add Event
                </Button>
              ) : null
          }
        />

        <div className="space-y-0 mt-2">
          {activeTab === 'event-list' ? (
            <EventListCard
              events={sortedEvents}
              onEdit={openEdit}
              onDelete={askDelete}
            />
          ) : null}

          {activeTab === 'bulk-event' ? (
            <BulkAssignChallengesCard
              events={sortedEvents}
              filters={filters}
              onFilterChange={setFilters}
              categories={categories}
              difficulties={difficulties}
              onSelectAllFiltered={selectAllFiltered}
              onClearSelection={clearSelection}
              bulkEventId={bulkEventId}
              onBulkEventChange={setBulkEventId}
              onBulkAssign={handleBulkAssign}
              onBulkRemove={handleBulkRemove}
              bulkSubmitting={bulkSubmitting}
              filteredChallenges={filteredChallenges}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
            />
          ) : null}

          {activeTab === 'event-members' ? (
            <EventMembersCard
              events={sortedEvents}
              manageEventId={manageEventId}
              onManageEventChange={setManageEventId}
              assignUserQuery={assignUserQuery}
              onAssignUserQueryChange={setAssignUserQuery}
              loadingUserSearch={loadingUserSearch}
              candidateUsers={candidateUsers}
              selectedCandidateUserIds={selectedCandidateUserIds}
              onToggleCandidateSelection={toggleCandidateSelection}
              onSelectAllCandidates={selectAllCandidates}
              onClearCandidateSelection={clearCandidateSelection}
              onQuickAddSelectedMembers={handleQuickAddSelectedMembers}
              memberActionUserId={memberActionUserId}
              onQuickAddMember={handleQuickAddMember}
              memberQuery={memberQuery}
              onMemberQueryChange={setMemberQuery}
              loadingEventMembers={loadingEventMembers}
              filteredEventMembers={filteredEventMembers}
              onRemoveMember={handleRemoveMember}
              joinRequests={joinRequests}
              loadingJoinRequests={loadingJoinRequests}
              reviewingRequestId={reviewingRequestId}
              onReviewRequest={handleReviewRequest}
            />
          ) : null}
        </div>
      </AdminPageShell>

      <AnimatePresence>
        {openForm && (
          <EventFormDialog
            open={openForm}
            editing={editing}
            formData={formData}
            submitting={submitting}
            onOpenChange={setOpenForm}
            onChange={setFormData}
            onSubmit={handleSubmit}
            onRegenerateJoinKey={handleRegenerateJoinKey}
          />
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Event"
        description={
          <div>
            <div className="mb-2">Are you sure you want to delete this event? This action cannot be undone.</div>
            {pendingDelete && (
              <div className="mt-2 p-1 rounded bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 text-sm font-semibold">
                {pendingDelete.name}
              </div>
            )}
          </div>
        }
        confirmLabel="Delete"
        onConfirm={doDelete}
      />
    </>
  )
}
