"use client"

import React, { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Users,
  Edit3,
  RefreshCw,
  Trash2,
  Calendar,
  Crown
} from 'lucide-react'
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/ui'
import {
  ADMIN_ROW_CLASS,
  AdminDataSurface,
  AdminEmptyState,
  AdminTableSurface
} from '@/features/admin/ui'
import type { AdminTeamRow } from '../types'
import { adminDeleteTeam, adminRegenerateInviteCode } from '../services/admin-teams.service'
import toast from 'react-hot-toast'
import ConfirmDialog from '@/shared/components/ConfirmDialog'
import TeamMembersDialog from './TeamMembersDialog'
import RenameTeamDialog from './RenameTeamDialog'

interface TeamsTableCardProps {
  teams: AdminTeamRow[]
  totalCount: number
  isDataLoading: boolean
  pageSize: number
  page: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  onRefresh?: () => void
}

export default function TeamsTableCard({
  teams,
  totalCount,
  isDataLoading,
  pageSize,
  page,
  setPage,
  onRefresh,
}: TeamsTableCardProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState<{ id: string; name: string } | null>(null)
  const [selectedTeamForRename, setSelectedTeamForRename] = useState<{ id: string; name: string } | null>(null)
  const [teamToDelete, setTeamToDelete] = useState<AdminTeamRow | null>(null)
  const [teamToRegenCode, setTeamToRegenCode] = useState<AdminTeamRow | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    toast.success('Invite code copied to clipboard')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const totalPages = Math.ceil(totalCount / pageSize)
  const startRow = (page - 1) * pageSize + 1
  const endRow = Math.min(page * pageSize, totalCount)

  return (
    <AdminDataSurface
      empty={teams.length === 0 ? (
        <AdminEmptyState
          title="No Teams Found"
          description="No teams match your current search query or filter settings."
        />
      ) : null}
    >
      <AdminTableSurface>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Team Name</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Captain</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Invite Code</TableHead>
              <TableHead className="text-center text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Members</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Created</TableHead>
              <TableHead className="pr-6 text-right text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
                <TableRow key={team.id} className={ADMIN_ROW_CLASS}>
                  <TableCell className="pl-6 font-bold text-gray-900 dark:text-white">
                    {team.name}
                  </TableCell>

                  <TableCell className="text-xs text-gray-600 dark:text-gray-300">
                    {team.captain_username ? (
                      <span className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                        <Crown className="h-3 w-3" />
                        {team.captain_username}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 italic">None</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-[#111622] px-2 py-1 rounded">
                        {team.invite_code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(team.invite_code, team.id)}
                        className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                        title="Copy Code"
                      >
                        {copiedId === team.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </TableCell>

                  <TableCell className="text-center font-bold text-blue-500 dark:text-blue-400 font-mono text-xs">
                    {team.member_count}
                  </TableCell>

                  <TableCell className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(team.created_at).toLocaleDateString()}
                    </span>
                  </TableCell>

                  <TableCell className="pr-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTeamForMembers({ id: team.id, name: team.name })}
                        className="rounded-xl h-8 px-2.5 text-xs font-bold"
                      >
                        <Users className="h-3.5 w-3.5 mr-1" /> Members
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTeamForRename({ id: team.id, name: team.name })}
                        className="rounded-xl h-8 px-2.5 text-xs font-bold"
                      >
                        <Edit3 className="h-3.5 w-3.5 mr-1" /> Rename
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTeamToRegenCode(team)}
                        className="rounded-xl h-8 w-8 p-0 hover:text-amber-500"
                        title="Regenerate Invite Code"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTeamToDelete(team)}
                        className="rounded-xl h-8 w-8 p-0 border-red-200/50 hover:border-red-500 dark:border-red-950/40 hover:bg-red-500/10 text-red-500"
                        title="Delete Team"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </AdminTableSurface>

      {totalCount > 0 && (
        <div className="mx-6 my-4 flex flex-col gap-3 border-t border-gray-200/80 pt-4 text-sm text-muted-foreground dark:border-gray-800/80 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Showing <strong className="font-bold text-gray-800 dark:text-gray-200">{startRow}</strong> to{' '}
            <strong className="font-bold text-gray-800 dark:text-gray-200">{endRow}</strong> of{' '}
            <strong className="font-bold text-gray-800 dark:text-gray-200">{totalCount}</strong> teams
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isDataLoading}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="rounded-xl"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <span className="min-w-20 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
              {page} / {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isDataLoading}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="rounded-xl"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <TeamMembersDialog
        open={selectedTeamForMembers !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTeamForMembers(null)
        }}
        teamId={selectedTeamForMembers?.id || null}
        teamName={selectedTeamForMembers?.name || null}
      />

      <RenameTeamDialog
        open={selectedTeamForRename !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTeamForRename(null)
        }}
        teamId={selectedTeamForRename?.id || null}
        currentName={selectedTeamForRename?.name || null}
        onSuccess={() => onRefresh?.()}
      />

      <ConfirmDialog
        open={teamToRegenCode !== null}
        onOpenChange={(open) => {
          if (!open) setTeamToRegenCode(null)
        }}
        title="Regenerate Invite Code"
        description={`Are you sure you want to regenerate the invite code for "${teamToRegenCode?.name}"? The previous code will become invalid immediately.`}
        confirmLabel="Regenerate"
        cancelLabel="Cancel"
        onConfirm={async () => {
          if (!teamToRegenCode) return
          setIsSubmitting(true)
          const result = await adminRegenerateInviteCode(teamToRegenCode.id)
          setIsSubmitting(false)
          if (result.invite_code) {
            toast.success(`Invite code for "${teamToRegenCode.name}" updated successfully!`)
            setTeamToRegenCode(null)
            onRefresh?.()
          } else {
            toast.error(result.error || 'Failed to regenerate invite code')
          }
        }}
      />

      <ConfirmDialog
        open={teamToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setTeamToDelete(null)
        }}
        title="Delete Team"
        description={`Are you sure you want to delete "${teamToDelete?.name}"? This will disband the team. Members will not be deleted, but they will no longer belong to a team.`}
        confirmLabel="Disband & Delete"
        cancelLabel="Cancel"
        onConfirm={async () => {
          if (!teamToDelete) return
          setIsSubmitting(true)
          const result = await adminDeleteTeam(teamToDelete.id)
          setIsSubmitting(false)
          if (result.success) {
            toast.success(`Team "${teamToDelete.name}" disbanded and deleted successfully!`)
            setTeamToDelete(null)
            onRefresh?.()
          } else {
            toast.error(result.error || 'Failed to disband team')
          }
        }}
      />
    </AdminDataSurface>
  )
}
