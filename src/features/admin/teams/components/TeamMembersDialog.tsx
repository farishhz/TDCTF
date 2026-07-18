"use client"

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui'
import { DIALOG_GLASS_CONTENT_MD_CLASS } from '@/shared/styles'
import { adminGetTeamMembers, adminKickMember, adminTransferCaptain } from '../services/admin-teams.service'
import type { AdminTeamMember } from '../types'
import { Users, Crown, Calendar, Loader2, LogOut, ArrowUpCircle } from 'lucide-react'
import ConfirmDialog from '@/shared/components/ConfirmDialog'
import toast from 'react-hot-toast'

interface TeamMembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId: string | null
  teamName: string | null
}

export default function TeamMembersDialog({
  open,
  onOpenChange,
  teamId,
  teamName,
}: TeamMembersDialogProps) {
  const [members, setMembers] = useState<AdminTeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [memberToAction, setMemberToAction] = useState<{ member: AdminTeamMember; action: 'kick' | 'captain' } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchMembers = () => {
    if (!open || !teamId) return
    setLoading(true)
    setError(null)
    adminGetTeamMembers(teamId)
      .then((res) => {
        if (res.error) {
          setError(res.error)
        } else {
          setMembers(res.members)
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch members')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    if (open && teamId) {
      fetchMembers()
    } else {
      setMembers([])
      setMemberToAction(null)
    }
  }, [open, teamId])

  const handleConfirmAction = async () => {
    if (!teamId || !memberToAction) return
    setActionLoading(true)

    const { member, action } = memberToAction
    let res: { success: boolean; error?: string }

    if (action === 'kick') {
      res = await adminKickMember(teamId, member.user_id)
    } else {
      res = await adminTransferCaptain(teamId, member.user_id)
    }

    setActionLoading(false)

    if (res.success) {
      const msg = action === 'kick'
        ? `${member.username} has been kicked from the team`
        : `${member.username} is now the captain`
      toast.success(msg)
      setMemberToAction(null)
      fetchMembers()
    } else {
      toast.error(res.error || `Failed to ${action === 'kick' ? 'kick member' : 'transfer captain'}`)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={DIALOG_GLASS_CONTENT_MD_CLASS}>
          <DialogHeader className="border-b pb-3 dark:border-gray-800">
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Users className="h-5 w-5 text-blue-500" />
              <span>Members of {teamName}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 select-none">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-2">
                <Loader2 className="animate-spin text-blue-500" size={20} />
                <span className="text-xs text-gray-500 dark:text-gray-400">Loading members...</span>
              </div>
            ) : error ? (
              <div className="text-center text-xs text-red-500 py-4">{error}</div>
            ) : members.length === 0 ? (
              <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-4">No members found in this team.</div>
            ) : (
              <div className="max-h-[280px] overflow-y-auto pr-1 scroll-hidden space-y-2">
                {members.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-gray-200/50 dark:border-gray-800/60 bg-gray-50/50 dark:bg-[#111622]/30"
                  >
                    <div className="flex items-center gap-2.5">
                      {member.role === 'captain' ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                          <Crown size={14} />
                        </div>
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                          <Users size={14} />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-950 dark:text-white flex items-center gap-1.5">
                          {member.username}
                          {member.role === 'captain' && (
                            <span className="text-[9px] font-bold uppercase bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded">
                              Captain
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                          <Calendar size={9} /> Joined: {new Date(member.joined_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {member.role !== 'captain' && (
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMemberToAction({ member, action: 'captain' })}
                          className="rounded-xl h-7 px-2 text-[11px] font-bold text-amber-600 hover:text-amber-500 border-amber-200/50 hover:border-amber-400 dark:border-amber-950/40 dark:hover:border-amber-800 hover:bg-amber-500/10 shrink-0"
                        >
                          <ArrowUpCircle className="h-3 w-3 mr-1" /> Captain
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMemberToAction({ member, action: 'kick' })}
                          className="rounded-xl h-7 px-2 text-[11px] font-bold text-red-500 hover:text-red-600 border-red-200/50 hover:border-red-400 dark:border-red-950/40 dark:hover:border-red-800 hover:bg-red-500/10 shrink-0"
                        >
                          <LogOut className="h-3 w-3 mr-1" /> Kick
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-3 border-t dark:border-gray-800">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={memberToAction !== null}
        onOpenChange={(open) => {
          if (!open) setMemberToAction(null)
        }}
        title={memberToAction?.action === 'kick' ? 'Kick Member' : 'Transfer Captain'}
        description={
          memberToAction?.action === 'kick'
            ? `Are you sure you want to kick "${memberToAction?.member?.username}" from the team? They can rejoin later with a valid invite code.`
            : `Are you sure you want to make "${memberToAction?.member?.username}" the new captain? The current captain will become a regular member.`
        }
        confirmLabel={memberToAction?.action === 'kick' ? 'Kick Member' : 'Transfer Captain'}
        cancelLabel="Cancel"
        onConfirm={handleConfirmAction}
      />
    </>
  )
}
