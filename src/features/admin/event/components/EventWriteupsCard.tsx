'use client'

import React, { useEffect, useState } from 'react'
import {
  listEventWriteups,
  reviewEventWriteup,
  type EventWriteupRow,
} from '@/features/events/services/event.service'
import type { Event } from '../types'
import { Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui'
import {
  AdminDataSurface,
  AdminEmptyState,
  AdminFilterSelect,
  AdminStatusBadge,
  AdminTableSurface,
} from '@/features/admin/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
import { FileText, Award, AlertCircle, Check, Loader2, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

interface EventWriteupsCardProps {
  events: Event[]
  manageEventId: string
  onManageEventChange: (eventId: string) => void
}

export default function EventWriteupsCard({
  events,
  manageEventId,
  onManageEventChange,
}: EventWriteupsCardProps) {
  const [writeups, setWriteups] = useState<EventWriteupRow[]>([])
  const [loading, setLoading] = useState(false)
  const [reviewingWriteup, setReviewingWriteup] = useState<EventWriteupRow | null>(null)

  // Review form states
  const [scoreAdjustment, setScoreAdjustment] = useState<number>(0)
  const [adminNotes, setAdminNotes] = useState<string>('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const loadWriteups = async (eventId: string) => {
    if (!eventId) {
      setWriteups([])
      return
    }
    setLoading(true)
    try {
      const data = await listEventWriteups(eventId)
      setWriteups(data)
    } catch (err) {
      console.error('Failed to load event writeups:', err)
      toast.error('Gagal mengambil data write-up.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (manageEventId) {
      void loadWriteups(manageEventId)
    }
  }, [manageEventId])

  const openReviewModal = (w: EventWriteupRow) => {
    setReviewingWriteup(w)
    setScoreAdjustment(w.score_adjustment || 0)
    setAdminNotes(w.admin_notes || '')
  }

  const closeReviewModal = () => {
    setReviewingWriteup(null)
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewingWriteup) return

    setSubmittingReview(true)
    try {
      const res = await reviewEventWriteup(
        reviewingWriteup.writeup_id,
        'reviewed',
        scoreAdjustment,
        adminNotes.trim()
      )
      if (res?.success) {
        toast.success(res.message || 'Write-up berhasil direview!')
        closeReviewModal()
        await loadWriteups(manageEventId)
      } else {
        toast.error(res?.message || 'Gagal menyimpan review.')
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'Terjadi kesalahan sistem saat menyimpan review.')
    } finally {
      setSubmittingReview(false)
    }
  }

  const selectedEvent = events.find((e) => e.id === manageEventId)
  const isTeamEvent = selectedEvent?.is_team_event === true

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
                ...events.filter(e => e.is_team_event).map((event) => ({ value: event.id, label: event.name })),
              ]}
            />
            {isTeamEvent && (
              <div className="flex flex-wrap items-center gap-2">
                <AdminStatusBadge tone={writeups.length > 0 ? 'info' : 'muted'}>
                  {writeups.length} write-ups
                </AdminStatusBadge>
                <AdminStatusBadge tone={writeups.filter(w => w.status === 'pending').length > 0 ? 'warning' : 'muted'}>
                  {writeups.filter(w => w.status === 'pending').length} pending
                </AdminStatusBadge>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {!manageEventId ? (
          <div className="p-6">
            <AdminEmptyState title="Select a team event first" description="Choose a team-based event from the dropdown to review write-up submissions." />
          </div>
        ) : !isTeamEvent ? (
          <div className="p-6">
            <AdminEmptyState title="Not a team event" description="Writeup submissions are only supported for team-based events." />
          </div>
        ) : loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mr-2" />
            <span className="text-sm font-semibold text-gray-500">Loading write-ups...</span>
          </div>
        ) : writeups.length === 0 ? (
          <div className="p-6">
            <AdminEmptyState title="No write-ups submitted yet" description="Submissions from participating teams will appear here once uploaded." />
          </div>
        ) : (
          <div className="p-4">
            <AdminTableSurface>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Team Name</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Write-Up File</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score Adj.</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {writeups.map((w) => (
                    <TableRow key={w.writeup_id}>
                      <TableCell className="pl-6 font-bold text-gray-900 dark:text-gray-100">{w.team_name || 'Solo Participant'}</TableCell>
                      <TableCell className="font-semibold text-xs text-muted-foreground">{w.username}</TableCell>
                      <TableCell>
                        <a
                          href={w.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:underline"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          {w.filename}
                        </a>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(w.submitted_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-wider ${
                          w.status === 'reviewed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                        }`}>
                          {w.status.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className={`font-mono text-xs font-bold ${
                        w.score_adjustment > 0 ? 'text-emerald-400' : w.score_adjustment < 0 ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {w.score_adjustment > 0 ? `+${w.score_adjustment}` : w.score_adjustment} PTS
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button
                          size="sm"
                          onClick={() => openReviewModal(w)}
                          className="h-8 rounded-lg text-xs"
                        >
                          {w.status === 'reviewed' ? 'Edit Evaluation' : 'Evaluate'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AdminTableSurface>
          </div>
        )}
      </div>

      {/* Evaluation/Review Modal Dialog */}
      <Dialog open={!!reviewingWriteup} onOpenChange={(open) => { if (!open) closeReviewModal() }}>
        <DialogContent className="max-w-md rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xl dark:border-gray-800/80 dark:bg-[#111622]">
          <DialogHeader>
            <DialogTitle className="text-base font-black tracking-tight text-gray-900 dark:text-white uppercase flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <span>Evaluate Write-Up</span>
            </DialogTitle>
          </DialogHeader>

          {reviewingWriteup && (
            <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
              <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-500">Tim:</span>
                  <span className="font-black text-gray-900 dark:text-white">{reviewingWriteup.team_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-500">File:</span>
                  <a href={reviewingWriteup.file_url} target="_blank" rel="noreferrer" className="font-bold text-blue-500 hover:underline flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {reviewingWriteup.filename}
                  </a>
                </div>
              </div>

              {/* Score Adjustment */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Score Adjustment (Points)
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    value={scoreAdjustment}
                    onChange={(e) => setScoreAdjustment(parseInt(e.target.value) || 0)}
                    className="pl-9 font-mono"
                    placeholder="Enter points (e.g. 50 or -25)..."
                    disabled={submittingReview}
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-medium">
                  Points will adjust the team's total score on the scoreboard (+50 for bonus, -20 for penalties).
                </p>
              </div>

              {/* Admin Notes / Evaluation Feedback */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Evaluation Feedback / Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-gray-200/80 bg-white px-3 py-2 text-xs text-gray-900 caret-blue-500 shadow-sm outline-none transition-all placeholder:text-gray-500 focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/30 resize-none dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                  placeholder="Tuliskan catatan evaluasi atau alasan perubahan skor..."
                  disabled={submittingReview}
                />
              </div>

              <DialogFooter className="gap-2 mt-4 pt-3 border-t dark:border-gray-850">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={closeReviewModal}
                  disabled={submittingReview}
                  className="text-xs font-bold uppercase tracking-widest text-gray-500"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20"
                >
                  {submittingReview ? 'Saving...' : 'Submit Evaluation'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AdminDataSurface>
  )
}
