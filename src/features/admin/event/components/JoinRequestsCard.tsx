import React from 'react'
import { Button, Label } from '@/shared/ui'
import { ADMIN_NATIVE_SELECT_CLASS } from '@/features/admin/ui/form-field-styles'
import { AdminDataSurface } from '@/features/admin/ui'
import type { Event, EventJoinRequestRow } from '../types'

interface JoinRequestsCardProps {
  events: Event[]
  manageEventId: string
  onManageEventChange: (eventId: string) => void
  joinRequests: EventJoinRequestRow[]
  loadingJoinRequests: boolean
  reviewingRequestId: string | null
  onReviewRequest: (requestId: string, approve: boolean) => void
}

const JoinRequestsCard: React.FC<JoinRequestsCardProps> = ({
  events,
  manageEventId,
  onManageEventChange,
  joinRequests,
  loadingJoinRequests,
  reviewingRequestId,
  onReviewRequest,
}) => {
  return (
    <AdminDataSurface className="p-6" contentClassName="space-y-6">
      <div className="border-b border-gray-150 dark:border-gray-800/60 pb-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">Join Requests</h2>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Event</Label>
          <select
            value={manageEventId}
            onChange={(event) => onManageEventChange(event.target.value)}
            className={`mt-1.5 ${ADMIN_NATIVE_SELECT_CLASS}`}
          >
            <option value="">Select event</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </select>
        </div>

        <div className="divide-y divide-gray-150 dark:divide-gray-800/85 rounded-xl bg-gray-50/25 dark:bg-black/10 overflow-hidden">
          {loadingJoinRequests ? (
            <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">Loading requests...</div>
          ) : joinRequests.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">No pending requests</div>
          ) : (
            joinRequests.map((request) => (
              <div key={request.request_id} className="flex flex-col gap-3 px-3.5 py-3.5 md:flex-row md:items-center md:justify-between hover:!bg-transparent dark:hover:!bg-transparent">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{request.username || request.user_id}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Requested at {new Date(request.requested_at).toLocaleString()}</p>
                  {request.note && <p className="text-xs mt-1.5 text-gray-600 dark:text-gray-300">Note: {request.note}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => onReviewRequest(request.request_id, true)}
                    disabled={reviewingRequestId === request.request_id}
                    className="rounded-xl"
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onReviewRequest(request.request_id, false)}
                    disabled={reviewingRequestId === request.request_id}
                    className="rounded-xl"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminDataSurface>
  )
}

export default JoinRequestsCard
