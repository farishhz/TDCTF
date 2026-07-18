"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/dialog"
import { Button, Input } from "@/shared/ui"
import { DIALOG_GLASS_CONTENT_MD_CLASS } from "@/shared/styles"
import { Event } from "@/shared/types"
import { joinEvent } from "@/features/events/services/event.service"
import { getEventStatus, getTimeRemaining, formatEventDateTime, normalizeEventImageUrl } from "@/features/challenges/lib/event-display"
import { Calendar, Clock, ImageIcon } from "lucide-react"
import toast from "react-hot-toast"

type JoinEventDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: Event | null
  joinMode: 'open' | 'key' | 'request'
  membershipData: any
  onSuccess: () => void
}

export default function JoinEventDialog({
  open,
  onOpenChange,
  event,
  joinMode,
  membershipData,
  onSuccess,
}: JoinEventDialogProps) {
  const [loading, setLoading] = useState(false)
  const [joinKey, setJoinKey] = useState("")
  const [joinNote, setJoinNote] = useState("")

  const handleJoin = async () => {
    if (!event) return

    if (joinMode === 'key' && !joinKey.trim()) {
      toast.error('Join key is required')
      return
    }

    setLoading(true)
    try {
      const result = await joinEvent(
        event.id,
        joinMode === 'key' ? joinKey.trim() : null,
        joinMode === 'request' ? joinNote.trim() : null
      )
      if (result?.success) {
        toast.success(result.message || 'Join request submitted')
        onSuccess()
      } else {
        toast.error(result?.message || 'Failed to join event')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to join event')
    } finally {
      setLoading(false)
    }
  }

  const isPending = membershipData?.request_status === 'pending'
  const isRejected = membershipData?.request_status === 'rejected'

  const imageUrl = event ? normalizeEventImageUrl(event.image_url) : null
  const status = event ? getEventStatus(event) : null
  const timeRemaining = event ? getTimeRemaining(event) : null
  const startFormatted = formatEventDateTime(event?.start_time)
  const endFormatted = formatEventDateTime(event?.end_time)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DIALOG_GLASS_CONTENT_MD_CLASS}>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
            Join Event
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => { e.preventDefault(); handleJoin() }}>
          <div className="space-y-3">
            {/* Event hero card */}
            <div className="overflow-hidden rounded-xl border border-blue-500/10 bg-blue-500/[0.03]">
              {/* Event image */}
              {imageUrl ? (
                <div className="relative h-32 w-full overflow-hidden bg-gray-900/10 dark:bg-gray-800/30">
                  <img
                    src={imageUrl}
                    alt={event?.name || 'Event'}
                    className="h-full w-full object-cover"
                  />
                  {/* Gradient overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {/* Status badge on image */}
                  {status && (
                    <span className={`absolute top-2 right-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                      {status.label}
                    </span>
                  )}
                </div>
              ) : (
                /* No image — show a compact header with icon placeholder */
                <div className="relative flex items-center gap-3 px-3 pt-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  {status && (
                    <span className={`ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                      {status.label}
                    </span>
                  )}
                </div>
              )}

              {/* Event info */}
              <div className="space-y-2 p-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                  {event?.name || 'Unknown Event'}
                </h3>

                {/* Description */}
                {event?.description && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                    {event.description}
                  </p>
                )}

                {/* Date range */}
                {(startFormatted || endFormatted) && (
                  <div className="flex flex-col gap-1 pt-1">
                    {startFormatted && (
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3 shrink-0 opacity-60" />
                        <span>Start: <span className="font-medium text-gray-700 dark:text-gray-300">{startFormatted}</span></span>
                      </div>
                    )}
                    {endFormatted && (
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3 shrink-0 opacity-60" />
                        <span>End: <span className="font-medium text-gray-700 dark:text-gray-300">{endFormatted}</span></span>
                      </div>
                    )}
                  </div>
                )}

                {/* Time remaining pill */}
                {timeRemaining && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-gray-100/80 dark:bg-gray-800/50 px-2.5 py-1.5 w-fit">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">{timeRemaining}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Join requirements info */}
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              You need to join this event to access its challenges.
              {joinMode === 'key' && ' Enter the access key provided by the organizer.'}
              {joinMode === 'request' && ' Submit a join request for admin approval.'}
              {joinMode === 'open' && ' This event is open — click the button below to join.'}
            </p>

            {joinMode === 'key' && (
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Event Access Key
                </label>
                <Input
                  value={joinKey}
                  onChange={(e) => setJoinKey(e.target.value)}
                  placeholder="Enter access key..."
                  autoFocus
                />
              </div>
            )}

            {joinMode === 'request' && (
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Join Request Note
                </label>
                <textarea
                  value={joinNote}
                  onChange={(e) => setJoinNote(e.target.value)}
                  placeholder="Tell us why you'd like to join..."
                  rows={3}
                  className="w-full rounded-xl border border-gray-200/80 bg-white px-4 py-2.5 text-sm text-gray-900 caret-blue-500 shadow-sm outline-none transition-all placeholder:text-gray-500 hover:border-blue-500/40 focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/30 resize-none dark:border-gray-700/80 dark:bg-[#111622]/80 dark:text-gray-100"
                  autoFocus
                />
              </div>
            )}

            {isPending ? (
              <div className="p-3 bg-amber-500/5 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-xl flex items-center justify-center">
                Your request is currently pending admin approval.
              </div>
            ) : isRejected ? (
              <div className="p-3 bg-red-500/5 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl flex items-center justify-center">
                Your previous request was declined. You can try again.
              </div>
            ) : null}
          </div>

          <DialogFooter className="gap-2 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all"
            >
              {loading ? "Processing..." : joinMode === 'request' ? 'Submit Request' : joinMode === 'key' ? 'Verify & Join' : 'Join Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

