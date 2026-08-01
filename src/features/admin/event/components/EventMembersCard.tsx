"use client"

import React, { useState } from 'react'
import { Check, UserPlus, Users, X, HelpCircle, Copy, Key, Shield } from 'lucide-react'
import { Button, SearchInput, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Input } from '@/shared/ui'
import { FILTER_CONTROL_CLASS } from '@/shared/ui/filter'
import {
  AdminDataSurface,
  AdminEmptyState,
  AdminFilterSelect,
  AdminStatusBadge,
  AdminTableSurface,
  AdminTabs,
} from '@/features/admin/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
import type { Event, EventJoinRequestRow, EventMemberRow, UserLite } from '../types'
import toast from 'react-hot-toast'

interface EventMembersCardProps {
  events: Event[]
  manageEventId: string
  onManageEventChange: (eventId: string) => void
  assignUserQuery: string
  onAssignUserQueryChange: (query: string) => void
  loadingUserSearch: boolean
  candidateUsers: UserLite[]
  selectedCandidateUserIds: string[]
  onToggleCandidateSelection: (userId: string) => void
  onSelectAllCandidates: () => void
  onClearCandidateSelection: () => void
  onQuickAddSelectedMembers: () => void
  memberActionUserId: string | null
  onQuickAddMember: (userId: string) => void
  memberQuery: string
  onMemberQueryChange: (query: string) => void
  loadingEventMembers: boolean
  filteredEventMembers: EventMemberRow[]
  onRemoveMember: (userId: string) => void
  joinRequests: EventJoinRequestRow[]
  loadingJoinRequests: boolean
  reviewingRequestId: string | null
  onReviewRequest: (requestId: string, approve: boolean) => void
  eventTeams?: any[]
  loadingEventTeams?: boolean
  reviewingTeamId?: string | null
  onReviewTeam?: (teamId: string, approve: boolean) => void
  onReloadTeams?: (eventId: string) => Promise<void>
}

type AccessTab = 'members' | 'requests'

function formatDate(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const EventMembersCard: React.FC<EventMembersCardProps> = ({
  events,
  manageEventId,
  onManageEventChange,
  assignUserQuery,
  onAssignUserQueryChange,
  loadingUserSearch,
  candidateUsers,
  selectedCandidateUserIds,
  onToggleCandidateSelection,
  onSelectAllCandidates,
  onClearCandidateSelection,
  onQuickAddSelectedMembers,
  memberActionUserId,
  onQuickAddMember,
  memberQuery,
  onMemberQueryChange,
  loadingEventMembers,
  filteredEventMembers,
  onRemoveMember,
  joinRequests,
  loadingJoinRequests,
  reviewingRequestId,
  onReviewRequest,
  eventTeams = [],
  loadingEventTeams = false,
  reviewingTeamId = null,
  onReviewTeam,
  onReloadTeams,
}) => {
  const [activeTab, setActiveTab] = useState<AccessTab>('members')

  // Invite/Token generation states
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [unregisteredTeams, setUnregisteredTeams] = useState<any[]>([])
  const [loadingUnregistered, setLoadingUnregistered] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [generatedToken, setGeneratedToken] = useState<string | null>(null)
  const [generatingToken, setGeneratingToken] = useState(false)
  const [copiedToken, setCopiedToken] = useState(false)

  const activeEvent = events.find((e) => e.id === manageEventId)
  const isTeamEvent = activeEvent?.is_team_event === true

  const openInviteDialog = async () => {
    if (!manageEventId) return
    setInviteDialogOpen(true)
    setLoadingUnregistered(true)
    setGeneratedToken(null)
    setSelectedTeamId('')
    setCopiedToken(false)
    try {
      const { listUnregisteredTeams } = await import('@/features/events/services/event.service')
      const data = await listUnregisteredTeams(manageEventId)
      setUnregisteredTeams(data)
      if (data.length > 0) {
        setSelectedTeamId(data[0].id)
      }
    } catch (err) {
      console.error(err)
      toast.error('Gagal mengambil daftar tim.')
    } finally {
      setLoadingUnregistered(false)
    }
  }

  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeamId || !manageEventId) return
    setGeneratingToken(true)
    try {
      const { adminGenerateTeamToken } = await import('@/features/events/services/event.service')
      const res = await adminGenerateTeamToken(manageEventId, selectedTeamId)
      if (res.success && res.token) {
        setGeneratedToken(res.token)
        toast.success('Token registrasi tim berhasil digenerate!')
        if (onReloadTeams) {
          await onReloadTeams(manageEventId)
        }
      } else {
        toast.error(res.message || 'Gagal generate token.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Terjadi kesalahan sistem saat generate token.')
    } finally {
      setGeneratingToken(false)
    }
  }

  const handleCopyToken = () => {
    if (!generatedToken) return
    void navigator.clipboard.writeText(generatedToken)
    setCopiedToken(true)
    toast.success('Token disalin!')
    setTimeout(() => setCopiedToken(false), 2000)
  }

  return (
    <AdminDataSurface className="h-[calc(100dvh-8.5rem)] min-h-[520px]" contentClassName="flex h-full min-h-0 flex-col p-0">
      <div className="shrink-0 border-b border-gray-200/70 bg-white/95 p-3 backdrop-blur-md dark:border-gray-800/70 dark:bg-[#0b0f19]/95">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
            <AdminFilterSelect
              value={manageEventId || 'none'}
              defaultValue="none"
              onValueChange={(value) => onManageEventChange(value === 'none' ? '' : value)}
              className="w-full sm:w-[260px]"
              options={[
                { value: 'none', label: 'Select event' },
                ...events.map((event) => ({ value: event.id, label: event.name })),
              ]}
            />
            <div className="flex flex-wrap items-center gap-2">
              <AdminStatusBadge tone={filteredEventMembers.length > 0 ? 'info' : 'muted'}>
                {filteredEventMembers.length} {isTeamEvent ? 'roster members' : 'members'}
              </AdminStatusBadge>
              {!isTeamEvent && (
                <AdminStatusBadge tone={joinRequests.length > 0 ? 'warning' : 'muted'}>
                  {joinRequests.length} pending
                </AdminStatusBadge>
              )}
              {isTeamEvent && eventTeams && (
                <AdminStatusBadge tone={eventTeams.filter(t => t.status === 'pending').length > 0 ? 'warning' : 'muted'}>
                  {eventTeams.filter(t => t.status === 'pending').length} pending teams
                </AdminStatusBadge>
              )}
            </div>
          </div>

          <AdminTabs<AccessTab>
            value={activeTab}
            onChange={setActiveTab}
            items={
              isTeamEvent
                ? [
                    { value: 'members', label: 'Roster (Locked)', icon: Users },
                    { value: 'requests', label: 'Team Registrations', icon: UserPlus },
                  ]
                : [
                    { value: 'members', label: 'Members', icon: Users },
                    { value: 'requests', label: 'Join Requests', icon: UserPlus },
                  ]
            }
            stretch
            className="w-full sm:w-fit"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {activeTab === 'members' ? (
          <div className="flex min-h-full flex-col">
            <div className="border-b border-gray-200/70 p-3 dark:border-gray-800/70">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[180px] flex-1">
                  <SearchInput
                    placeholder="Type username..."
                    value={assignUserQuery}
                    onChange={onAssignUserQueryChange}
                    size="sm"
                    containerClassName="max-w-none"
                    inputClassName={FILTER_CONTROL_CLASS}
                    showSearchIcon={false}
                    showClearButton={false}
                  />

                  {candidateUsers.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                      <div className="max-h-60 overflow-y-auto">
                        {candidateUsers.map((user) => (
                          <div key={user.id} className="flex items-center justify-between gap-2 px-3 py-2 hover:!bg-transparent dark:hover:!bg-transparent">
                            <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                              <input
                                type="checkbox"
                                className="h-4 w-4 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                checked={selectedCandidateUserIds.includes(user.id)}
                                onChange={() => onToggleCandidateSelection(user.id)}
                              />
                              <div className="min-w-0">
                                <span className="block truncate text-sm font-medium text-gray-900 dark:text-gray-100">{user.username}</span>
                                <span className="block truncate font-mono text-[10px] text-gray-500">{user.id}</span>
                              </div>
                              </label>
                            <Button size="sm" onClick={() => onQuickAddMember(user.id)} disabled={memberActionUserId === user.id} className="h-7 shrink-0 rounded-lg px-2 text-xs">
                              Add
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button size="sm" variant="outline" onClick={onSelectAllCandidates} disabled={candidateUsers.length === 0} className="h-9 rounded-xl px-3 text-xs font-semibold">
                  Select All
                </Button>
                <Button size="sm" variant="ghost" onClick={onClearCandidateSelection} disabled={selectedCandidateUserIds.length === 0} className="h-9 rounded-xl px-3 text-xs font-semibold">
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={onQuickAddSelectedMembers}
                  disabled={memberActionUserId === '__bulk__' || selectedCandidateUserIds.length === 0}
                  className="h-9 rounded-xl px-3 text-xs font-semibold"
                >
                  Add Selected ({selectedCandidateUserIds.length})
                </Button>
              </div>

              {manageEventId !== '' && assignUserQuery.trim().length >= 2 && candidateUsers.length === 0 && !loadingUserSearch && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">No matching users or all are already members</p>
              )}
              {loadingUserSearch && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Searching users...</p>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Current Members</h3>
                <SearchInput
                  placeholder="Search current member..."
                  value={memberQuery}
                  onChange={onMemberQueryChange}
                  size="sm"
                  containerClassName="max-w-none sm:w-[260px]"
                  inputClassName={FILTER_CONTROL_CLASS}
                  showSearchIcon={false}
                  showClearButton={false}
                />
              </div>

              <AdminTableSurface>
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-gray-200/80 hover:bg-transparent dark:border-gray-800">
                      <TableHead className="pl-6 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Username</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">User ID</TableHead>
                      <TableHead className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Joined</TableHead>
                      <TableHead className="pr-6 text-right text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingEventMembers ? (
                      <TableRow className="hover:!bg-transparent dark:hover:!bg-transparent">
                        <TableCell colSpan={4} className="p-5 text-center text-sm text-gray-500 dark:text-gray-400">Loading members...</TableCell>
                      </TableRow>
                    ) : filteredEventMembers.length === 0 ? (
                      <TableRow className="hover:!bg-transparent dark:hover:!bg-transparent">
                        <TableCell colSpan={4} className="p-6">
                          <AdminEmptyState title="No members yet" description="Search users above to add members." />
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEventMembers.map((member) => (
                        <TableRow key={member.user_id}>
                          <TableCell className="pl-6 font-medium text-gray-900 dark:text-gray-100">{member.username}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{member.user_id}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{formatDate(member.joined_at)}</TableCell>
                          <TableCell className="pr-6 text-right">
                            <Button size="sm" variant="destructive" onClick={() => onRemoveMember(member.user_id)} disabled={memberActionUserId === member.user_id} className="h-8 rounded-lg px-2.5 text-xs">
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </AdminTableSurface>
            </div>
          </div>
        ) : (
          <section className="p-4">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {isTeamEvent ? 'Team Event Registrations' : 'Pending Join Requests'}
                </h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {isTeamEvent
                    ? 'Approve team registrations to lock their roster snapshot and allow members access to challenges.'
                    : 'Approve users to add them as event members, or reject requests that should not join.'}
                </p>
              </div>
              {isTeamEvent && manageEventId && (
                <Button
                  size="sm"
                  onClick={openInviteDialog}
                  className="rounded-xl shrink-0 h-9 font-bold text-xs uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20"
                >
                  + Generate Team Token
                </Button>
              )}
            </div>

            <div className="divide-y divide-gray-150 overflow-hidden rounded-xl border border-gray-200/70 dark:divide-gray-800/85 dark:border-gray-800/80">
              {!manageEventId ? (
                <div className="p-6">
                  <AdminEmptyState title="Select an event first" description="Choose an event to review join requests." />
                </div>
              ) : isTeamEvent ? (
                loadingEventTeams ? (
                  <div className="p-5 text-sm text-gray-500 dark:text-gray-400">Loading teams...</div>
                ) : !eventTeams || eventTeams.length === 0 ? (
                  <div className="p-6">
                    <AdminEmptyState title="No team registrations" description="Team pendaftaran for the selected event will appear here." />
                  </div>
                ) : (
                  eventTeams.map((team) => (
                    <div key={team.team_id} className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between hover:!bg-transparent dark:hover:!bg-transparent">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{team.team_name}</p>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            team.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                            team.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                          }`}>
                            {team.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="truncate font-mono text-[10px] text-gray-500">ID: {team.team_id} • {team.member_count} members</p>
                        {team.registration_token && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-blue-500 dark:text-blue-400">
                            <Key className="h-3.5 w-3.5" />
                            <span>Token Registrasi:</span>
                            <span className="font-mono bg-blue-500/10 px-1.5 py-0.5 rounded text-xs select-all">{team.registration_token}</span>
                          </div>
                        )}
                        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">Requested by Kapten {team.requested_by_username} on {formatDate(team.requested_at)}</p>
                      </div>
                      {team.status === 'pending' && (
                        <div className="flex shrink-0 items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => onReviewTeam?.(team.team_id, true)}
                            disabled={reviewingTeamId === team.team_id}
                            className="gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Approve (Lock Roster)
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onReviewTeam?.(team.team_id, false)}
                            disabled={reviewingTeamId === team.team_id}
                            className="gap-1.5 rounded-xl"
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )
              ) : loadingJoinRequests ? (
                <div className="p-5 text-sm text-gray-500 dark:text-gray-400">Loading requests...</div>
              ) : joinRequests.length === 0 ? (
                <div className="p-6">
                  <AdminEmptyState title="No pending requests" description="Pending requests for the selected event will appear here." />
                </div>
              ) : (
                joinRequests.map((request) => (
                  <div key={request.request_id} className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between hover:!bg-transparent dark:hover:!bg-transparent">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{request.username || request.user_id}</p>
                      <p className="truncate font-mono text-[10px] text-gray-500">{request.user_id}</p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Requested {formatDate(request.requested_at)}</p>
                      {request.note ? (
                        <p className="mt-2 rounded-xl border border-gray-200/70 bg-gray-50/70 px-3 py-2 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-200">
                          {request.note}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => onReviewRequest(request.request_id, true)}
                        disabled={reviewingRequestId === request.request_id}
                        className="gap-1.5 rounded-xl"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onReviewRequest(request.request_id, false)}
                        disabled={reviewingRequestId === request.request_id}
                        className="gap-1.5 rounded-xl"
                      >
                        <X className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </div>

      {/* Invite/Token Generation Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={(open) => { if (!open) setInviteDialogOpen(false) }}>
        <DialogContent className="max-w-md rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xl dark:border-gray-800/80 dark:bg-[#111622]">
          <DialogHeader>
            <DialogTitle className="text-base font-black tracking-tight text-gray-900 dark:text-white uppercase flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <span>Generate Team Token</span>
            </DialogTitle>
          </DialogHeader>

          {loadingUnregistered ? (
            <div className="flex h-32 items-center justify-center">
              <span className="text-sm font-semibold text-gray-500">Loading teams...</span>
            </div>
          ) : unregisteredTeams.length === 0 ? (
            <div className="py-6 text-center space-y-2">
              <p className="text-sm font-bold text-gray-850 dark:text-gray-200">Semua tim sudah terdaftar atau diundang.</p>
              <p className="text-xs text-gray-500">Tidak ada tim tersisa yang dapat diundang untuk event ini.</p>
            </div>
          ) : generatedToken ? (
            /* TOKEN GENERATED SUCCESS STATE */
            <div className="space-y-4 pt-2">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] p-4 text-center space-y-2">
                <Check className="h-8 w-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Token Berhasil Digenerate!</p>
                <p className="text-xs text-gray-500">Kirimkan token unik di bawah ini ke Kapten Tim untuk mendaftarkan timnya.</p>
              </div>

              <div className="relative">
                <Input
                  value={generatedToken}
                  readOnly
                  className="font-mono text-center pr-12 text-sm bg-gray-50 dark:bg-gray-950 font-bold"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyToken}
                  className="absolute right-1 top-1 h-8 px-2 text-gray-400 hover:text-blue-500"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <DialogFooter className="mt-4 pt-3 border-t dark:border-gray-850">
                <Button
                  onClick={() => setInviteDialogOpen(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          ) : (
            /* INPUT STATE */
            <form onSubmit={handleGenerateToken} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Pilih Tim yang Akan Diundang
                </label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-950 shadow-sm focus:border-blue-500 outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                  disabled={generatingToken}
                >
                  {unregisteredTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} {team.captain_username ? `(Captain: ${team.captain_username})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 font-medium">
                  Sistem akan membuat token registrasi acak unik yang terikat khusus ke tim terpilih ini.
                </p>
              </div>

              <DialogFooter className="gap-2 mt-4 pt-3 border-t dark:border-gray-850">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setInviteDialogOpen(false)}
                  disabled={generatingToken}
                  className="text-xs font-bold uppercase tracking-widest text-gray-500"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={generatingToken || !selectedTeamId}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 font-bold text-xs uppercase tracking-widest shadow-lg"
                >
                  {generatingToken ? 'Generating...' : 'Generate Token'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AdminDataSurface>
  )
}

export default EventMembersCard
