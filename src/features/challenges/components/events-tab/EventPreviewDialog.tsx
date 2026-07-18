'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui'
import { DIALOG_GLASS_CONTENT_MD_CLASS } from '@/shared/styles'
import type { EnrichedChallengeEvent } from '../../types'
import { MarkdownRenderer } from '@/shared/markdown/MarkdownRenderer'
import { Calendar, Clock, ImageIcon, ArrowRight, Lock, Unlock, CheckCircle, AlertTriangle } from 'lucide-react'
import {
  getEventStatus,
  getTimeRemaining,
  formatEventDateTime,
  normalizeEventImageUrl,
} from '../../lib/event-display'

type EventPreviewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: EnrichedChallengeEvent | null
  now: Date
  fallbackImageUrl: string | null
  onConfirm: () => void
}

export default function EventPreviewDialog({
  open,
  onOpenChange,
  event,
  now,
  fallbackImageUrl,
  onConfirm,
}: EventPreviewDialogProps) {
  if (!event) return null

  const imageUrl = normalizeEventImageUrl(event.image_url) || fallbackImageUrl
  const status = getEventStatus(event)
  const timeRemaining = getTimeRemaining(event)
  const startFormatted = formatEventDateTime(event.start_time)
  const endFormatted = formatEventDateTime(event.end_time)

  const isEnded = status?.label === 'Ended'
  const isLocked = event.isLocked

  // Determine button text and disabled state
  let buttonLabel = "Proceed to Event"
  let buttonDisabled = false
  let actionIcon = <ArrowRight className="h-3 w-3" />

  if (isLocked) {
    if (isEnded) {
      buttonLabel = "Registration Closed"
      buttonDisabled = true
      actionIcon = <Lock className="h-3 w-3" />
    } else {
      if (event.join_mode === 'key') {
        buttonLabel = "Enter Access Key"
      } else if (event.join_mode === 'request') {
        buttonLabel = "Request Access"
      } else {
        buttonLabel = "Join Event"
      }
      actionIcon = <Lock className="h-3 w-3" />
    }
  } else {
    buttonLabel = isEnded ? "View Archive / Challenges" : "Enter Event"
    actionIcon = <Unlock className="h-3 w-3" />
  }

  const handleProceed = () => {
    if (buttonDisabled) return
    onOpenChange(false)
    onConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DIALOG_GLASS_CONTENT_MD_CLASS}>
        <DialogHeader className="pb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              Event Details
            </DialogTitle>
            {status && (
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                {status.label}
              </span>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4 my-3 max-h-[60vh] overflow-y-auto pr-1">
          {/* Banner Image */}
          <div className="relative h-40 w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={event.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-blue-500/20">
                <ImageIcon className="h-10 w-10" />
              </div>
            )}
          </div>

          {/* Access Banner (Alert/Badge in center-ish layout) */}
          {isLocked ? (
            <div className="flex items-center gap-2.5 p-3 rounded-xl border border-red-500/10 bg-red-500/5 text-red-600 dark:text-red-400">
              <Lock className="h-4 w-4 shrink-0" />
              <div className="text-[11px] leading-normal font-medium">
                {isEnded ? (
                  <span>This event has ended and is locked. You cannot register or join.</span>
                ) : (
                  <span>Access required. You need to join this event to view its challenges.</span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 p-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <div className="text-[11px] leading-normal font-medium">
                <span>Access Granted. You have full access to this event&apos;s challenges.</span>
              </div>
            </div>
          )}

          {/* Title & Metadata */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
              {event.name}
            </h3>

            {/* Date and Time Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl border border-blue-500/10 bg-blue-500/[0.02]">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                  <Calendar className="h-3.5 w-3.5 shrink-0 opacity-60 text-blue-500" />
                  <span>Start Time</span>
                </div>
                <div className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 pl-5">
                  {startFormatted || 'Indefinite'}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                  <Calendar className="h-3.5 w-3.5 shrink-0 opacity-60 text-blue-500" />
                  <span>End Time</span>
                </div>
                <div className="text-[11px] font-semibold text-gray-800 dark:text-gray-200 pl-5">
                  {endFormatted || 'Indefinite'}
                </div>
              </div>

              {timeRemaining && (
                <div className="col-span-1 sm:col-span-2 flex items-center gap-1.5 border-t border-blue-500/5 pt-2 mt-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{timeRemaining}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description (Markdown) */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Description
            </h4>
            <div className="prose prose-sm dark:prose-invert max-w-none text-xs rounded-xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/20 p-3.5 leading-relaxed text-gray-600 dark:text-gray-300">
              {event.description ? (
                <MarkdownRenderer content={event.description} />
              ) : (
                <span className="italic text-gray-400 dark:text-gray-500">No description provided for this event.</span>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleProceed}
            disabled={buttonDisabled}
            className={`rounded-xl px-5 font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-1.5 ${
              buttonDisabled
                ? "bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
            }`}
          >
            <span>{buttonLabel}</span>
            {actionIcon}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

