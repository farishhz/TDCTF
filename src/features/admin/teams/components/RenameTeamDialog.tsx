"use client"

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Button, Input } from '@/shared/ui'
import { DIALOG_GLASS_CONTENT_MD_CLASS } from '@/shared/styles'
import { ADMIN_INPUT_CLASS } from '@/features/admin/ui/form-field-styles'
import { adminRenameTeam } from '../services/admin-teams.service'
import { Edit3, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface RenameTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId: string | null
  currentName: string | null
  onSuccess: () => void
}

export default function RenameTeamDialog({
  open,
  onOpenChange,
  teamId,
  currentName,
  onSuccess,
}: RenameTeamDialogProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && currentName) {
      setName(currentName)
    } else {
      setName('')
    }
  }, [open, currentName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamId || !name.trim()) return

    const trimmed = name.trim()
    if (!/^[a-zA-Z0-9_. -]+$/.test(trimmed)) {
      toast.error('Team name can only contain letters, numbers, spaces, ".", "_", and "-".')
      return
    }

    setLoading(true)
    try {
      const res = await adminRenameTeam(teamId, trimmed)
      if (res.success) {
        toast.success('Team renamed successfully')
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error(res.error || 'Failed to rename team')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to rename team')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DIALOG_GLASS_CONTENT_MD_CLASS}>
        <DialogHeader className="border-b pb-3 dark:border-gray-800">
          <DialogTitle className="text-base font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Edit3 className="h-5 w-5 text-blue-500" />
            <span>Rename Team</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter new team name"
              required
              disabled={loading}
              className={ADMIN_INPUT_CLASS}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || !name.trim() || name.trim() === currentName}
              className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold px-5"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
