'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { EditActionButton } from '@/shared/components'
import { DIALOG_GLASS_CONTENT_MD_CLASS } from '@/shared/styles'
import { isValidTeamName } from '@/features/auth'

interface EditTeamModalProps {
  currentName: string
  currentPictureUrl?: string | null
  onSave: (newName: string, pictureUrl?: string | null) => Promise<{ success: boolean; error?: string }>
  disabled?: boolean
  trigger?: React.ReactNode
}

export default function EditTeamModal({
  currentName,
  currentPictureUrl,
  onSave,
  disabled,
  trigger,
}: EditTeamModalProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(currentName)
  const [pictureUrl, setPictureUrl] = useState(currentPictureUrl || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOpenChange = (val: boolean) => {
    setOpen(val)
    if (val) {
      setName(currentName)
      setPictureUrl(currentPictureUrl || '')
      setError(null)
    }
  }

  const handleSave = async () => {
    const trimmed = name.trim()
    const normalizedPictureUrl = pictureUrl.trim() || null

    const nameError = isValidTeamName(trimmed)
    if (nameError) {
      toast.error(nameError)
      return
    }

    if (!trimmed || (trimmed === currentName && normalizedPictureUrl === (currentPictureUrl || null))) {
      setOpen(false)
      return
    }

    setLoading(true)
    setError(null)

    const res = await onSave(trimmed, normalizedPictureUrl)
    setLoading(false)

    if (res.success) {
      setOpen(false)
    } else {
      setError(res.error || 'Failed to update team name')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <EditActionButton label="Edit Team" disabled={disabled} />
        )}
      </DialogTrigger>

      <DialogContent className={DIALOG_GLASS_CONTENT_MD_CLASS}>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
            Edit Team
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500 dark:text-gray-400">
            Update your team information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => { e.preventDefault(); handleSave() }}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Team Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                maxLength={50}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Team Image URL
              </label>
              <Input
                value={pictureUrl}
                onChange={(e) => setPictureUrl(e.target.value)}
                disabled={loading}
                maxLength={2048}
                placeholder="https://example.com/team.png"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Leave empty to use initials.
              </p>
            </div>

            {error && (
              <div className="text-red-500 dark:text-red-400 text-sm text-center font-semibold">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                !name.trim() ||
                (name.trim() === currentName && (pictureUrl.trim() || null) === (currentPictureUrl || null))
              }
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all"
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
