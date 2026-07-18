"use client"

import React, { useState, useMemo } from 'react'
import {
  Tag,
  UserPlus,
  UserMinus,
  ListRestart,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Trash2,
  Search,
  Users
} from 'lucide-react'
import { Button, Textarea, Input } from '@/shared/ui'
import { ADMIN_CARD_CLASS, ADMIN_CARD_TITLE_CLASS } from '@/features/admin/ui/card-styles'
import {
  ADMIN_INPUT_CLASS,
  ADMIN_TEXTAREA_CLASS,
  ADMIN_NATIVE_SELECT_CLASS,
  ADMIN_FORM_FIELD_CLASS,
} from '../../ui/form-field-styles'
import type { AdminUserRow } from '../types'
import { adminAssignTagsBulk } from '../services/admin-users.service'
import toast from 'react-hot-toast'

interface UserTagsTabProps {
  users: AdminUserRow[]
  onRefresh: () => void
}

export default function UserTagsTab({ users, onRefresh }: UserTagsTabProps) {
  const [identifiers, setIdentifiers] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [action, setAction] = useState<'add' | 'remove' | 'set'>('add')
  const [submitting, setSubmitting] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [selectedUsernames, setSelectedUsernames] = useState<string[]>([])

  const usersWithSelectedTag = useMemo(() => {
    if (!selectedTag) return []
    return users.filter((u) => u.tags && Array.isArray(u.tags) && u.tags.includes(selectedTag))
  }, [users, selectedTag])

  const filteredUsersWithTag = useMemo(() => {
    const q = userSearchQuery.toLowerCase().trim()
    if (!q) return usersWithSelectedTag
    return usersWithSelectedTag.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q))
    )
  }, [usersWithSelectedTag, userSearchQuery])

  const handleRemoveTagFromUser = async (username: string, tagToRemove: string) => {
    const confirm = window.confirm(`Are you sure you want to remove tag "${tagToRemove}" from user "${username}"?`)
    if (!confirm) return

    try {
      const res = await adminAssignTagsBulk([username], [tagToRemove], 'remove')
      if (res.success) {
        toast.success(`Successfully removed tag "${tagToRemove}" from "${username}"`)
        onRefresh()
      } else {
        toast.error(res.error || 'Failed to remove tag.')
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred.')
    }
  }

  const handleRemoveTagFromAll = async (tagToRemove: string) => {
    const userNames = usersWithSelectedTag.map((u) => u.username)
    if (userNames.length === 0) return

    const confirm = window.confirm(
      `Are you sure you want to remove tag "${tagToRemove}" from all ${userNames.length} users?`
    )
    if (!confirm) return

    setSubmitting(true)
    try {
      const res = await adminAssignTagsBulk(userNames, [tagToRemove], 'remove')
      if (res.success) {
        toast.success(`Successfully removed tag "${tagToRemove}" from all users!`)
        setSelectedTag(null)
        onRefresh()
      } else {
        toast.error(res.error || 'Failed to remove tags.')
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRemoveTagFromSelected = async (tagToRemove: string) => {
    if (selectedUsernames.length === 0) return

    const confirm = window.confirm(
      `Are you sure you want to remove tag "${tagToRemove}" from the ${selectedUsernames.length} selected users?`
    )
    if (!confirm) return

    setSubmitting(true)
    try {
      const res = await adminAssignTagsBulk(selectedUsernames, [tagToRemove], 'remove')
      if (res.success) {
        toast.success(`Successfully removed tag "${tagToRemove}" from selected users!`)
        setSelectedUsernames([])
        onRefresh()
      } else {
        toast.error(res.error || 'Failed to remove tags.')
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  // Aggregate distinct tags and their count from the current loaded users
  const tagSummary = useMemo(() => {
    const summary: Record<string, number> = {}
    users.forEach((u) => {
      if (u.tags && Array.isArray(u.tags)) {
        u.tags.forEach((tag) => {
          const t = tag.trim()
          if (t) {
            summary[t] = (summary[t] || 0) + 1
          }
        })
      }
    })
    return Object.entries(summary).sort((a, b) => b[1] - a[1])
  }, [users])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const cleanIdents = identifiers
      .split(/[\n,]+/)
      .map((i) => i.trim())
      .filter((i) => i.length > 0)

    const cleanTags = tagsInput
      .split(/[\n,]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    if (cleanIdents.length === 0) {
      toast.error('Please enter at least one email or username.')
      return
    }

    if (cleanTags.length === 0 && action !== 'set') {
      toast.error('Please enter at least one tag.')
      return
    }

    setSubmitting(true)
    try {
      const res = await adminAssignTagsBulk(cleanIdents, cleanTags, action)
      if (res.success) {
        toast.success(`Successfully updated tags for ${res.successCount} users!`)
        if (res.notFound && res.notFound.length > 0) {
          toast.error(`Could not find ${res.notFound.length} users: ${res.notFound.join(', ')}`, {
            duration: 5000,
          })
        }
        setIdentifiers('')
        setTagsInput('')
        onRefresh()
      } else {
        toast.error(res.error || 'Failed to update tags.')
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* Bulk Assigner Card */}
      <div className={`lg:col-span-2 p-6 rounded-2xl ${ADMIN_CARD_CLASS}`}>
        <div className="flex items-center gap-2 mb-4">
          <Tag className="h-5 w-5 text-blue-500" />
          <h2 className={`font-bold text-lg ${ADMIN_CARD_TITLE_CLASS}`}>Bulk Assign Tags</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={ADMIN_FORM_FIELD_CLASS}>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              User Identifiers (Email or Username)
            </label>
            <Textarea
              className={`${ADMIN_TEXTAREA_CLASS} h-32`}
              placeholder="Enter usernames or emails separated by commas or new lines (e.g. user1@gmail.com, student2, smk_user)"
              value={identifiers}
              onChange={(e) => setIdentifiers(e.target.value)}
              disabled={submitting}
            />
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              Matches users case-insensitively using their registered username or login email.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={ADMIN_FORM_FIELD_CLASS}>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Action
              </label>
              <select
                className={ADMIN_NATIVE_SELECT_CLASS}
                value={action}
                onChange={(e) => setAction(e.target.value as any)}
                disabled={submitting}
              >
                <option value="add">Add tags (Keep existing)</option>
                <option value="remove">Remove tags</option>
                <option value="set">Overwrite tags (Replace entirely)</option>
              </select>
            </div>

            <div className={ADMIN_FORM_FIELD_CLASS}>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Tags
              </label>
              <Input
                className={ADMIN_INPUT_CLASS}
                placeholder="e.g. mahasiswa, smk, senior (comma-separated)"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-5 h-10 flex items-center gap-2"
            >
              {action === 'add' && <UserPlus className="h-4 w-4" />}
              {action === 'remove' && <UserMinus className="h-4 w-4" />}
              {action === 'set' && <ListRestart className="h-4 w-4" />}
              {submitting ? 'Applying Changes...' : 'Apply Changes'}
            </Button>
          </div>
        </form>
      </div>

      {/* Tags Summary Side Card */}
      <div className={`p-6 rounded-2xl ${ADMIN_CARD_CLASS} flex flex-col h-[520px] min-h-[520px]`}>
        {selectedTag ? (
          <>
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedTag(null)
                    setSelectedUsernames([])
                    setUserSearchQuery('')
                  }}
                  className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-0">
                  <h2 className={`font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 leading-tight`}>
                    Users with:
                  </h2>
                  <span className="inline-flex items-center text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 truncate max-w-[120px]">
                    {selectedTag}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 shrink-0">
                {usersWithSelectedTag.length} users
              </span>
            </div>

            <div className="relative mb-3 shrink-0">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                className={`${ADMIN_INPUT_CLASS} pl-9 h-9 text-xs`}
                placeholder="Search username..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
              />
            </div>

            {filteredUsersWithTag.length > 0 && (
              <div className="flex items-center justify-between px-2.5 py-1.5 mb-2 bg-gray-50/50 dark:bg-black/30 border border-gray-200/50 dark:border-gray-800/50 rounded-xl shrink-0">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filteredUsersWithTag.length > 0 && selectedUsernames.length === filteredUsersWithTag.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsernames(filteredUsersWithTag.map((u) => u.username))
                      } else {
                        setSelectedUsernames([])
                      }
                    }}
                    className="h-4 w-4 shrink-0 rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-800"
                  />
                  <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400">
                    Select All ({filteredUsersWithTag.length})
                  </span>
                </label>
                {selectedUsernames.length > 0 && (
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    {selectedUsernames.length} selected
                  </span>
                )}
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto pr-1 space-y-2">
              {filteredUsersWithTag.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-gray-500 dark:text-gray-400">
                  <Users className="h-8 w-8 text-gray-300 dark:text-gray-700 mb-2" />
                  <p className="text-sm font-semibold">No users found</p>
                </div>
              ) : (
                filteredUsersWithTag.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-gray-50/50 dark:bg-black/20 border border-gray-200/50 dark:border-gray-800/50"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedUsernames.includes(u.username)}
                        onChange={() => {
                          setSelectedUsernames((prev) =>
                            prev.includes(u.username)
                              ? prev.filter((name) => name !== u.username)
                              : [...prev, u.username]
                          )
                        }}
                        className="h-4 w-4 shrink-0 rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-800"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate font-mono">
                          {u.username}
                        </p>
                        {u.email && (
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                            {u.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTagFromUser(u.username, selectedTag)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            {usersWithSelectedTag.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200/60 dark:border-gray-800/60 shrink-0">
                {selectedUsernames.length > 0 ? (
                  <Button
                    onClick={() => handleRemoveTagFromSelected(selectedTag)}
                    className="w-full text-xs font-bold flex items-center justify-center gap-1.5 h-9 bg-blue-600 hover:bg-blue-500 text-white rounded-xl"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove Tag from Selected ({selectedUsernames.length})
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleRemoveTagFromAll(selectedTag)}
                    className="w-full text-xs font-bold flex items-center justify-center gap-1.5 h-9 bg-red-600 hover:bg-red-500 text-white rounded-xl"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove Tag from All
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4 shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <h2 className={`font-bold text-lg ${ADMIN_CARD_TITLE_CLASS}`}>Current Tags Overview</h2>
            </div>

            {tagSummary.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-gray-500 dark:text-gray-400">
                <AlertTriangle className="h-8 w-8 text-yellow-500/60 mb-2" />
                <p className="text-sm">No tags found on the current page of users.</p>
                <p className="text-xs mt-1">Assign tags to users to get started.</p>
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto pr-1 space-y-2.5">
                {tagSummary.map(([tag, count]) => (
                  <div
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50/50 dark:bg-black/20 border border-gray-200/50 dark:border-gray-800/50 cursor-pointer hover:border-blue-500/50 dark:hover:border-blue-500/40 hover:bg-blue-500/[0.02] transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 font-mono">
                        {tag}
                      </span>
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {count} {count === 1 ? 'user' : 'users'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
