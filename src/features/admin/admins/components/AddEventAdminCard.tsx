import React from 'react'
import { cn } from '@/shared/lib/utils'
import {
  Button,
  SearchInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui'
import { FILTER_CONTROL_CLASS } from '@/shared/ui/filter'
import {
  ADMIN_SELECT_CONTENT_CLASS,
  ADMIN_SELECT_TRIGGER_CLASS,
} from '@/features/admin/ui/form-field-styles'
import type { Event, UserLite } from '../types'

interface AddEventAdminCardProps {
  events: Event[]
  usernameQuery: string
  userResults: UserLite[]
  selectedUser: UserLite | null
  selectedEventId: string
  selectedEventName: string | null
  submitting: boolean
  canSubmit: boolean
  onUsernameChange: (value: string) => void
  onUserSelect: (user: UserLite) => void
  onEventChange: (eventId: string) => void
  onSubmit: () => void
  onReset: () => void
}

const AddEventAdminCard: React.FC<AddEventAdminCardProps> = ({
  events,
  usernameQuery,
  userResults,
  selectedUser,
  selectedEventId,
  selectedEventName,
  submitting,
  canSubmit,
  onUsernameChange,
  onUserSelect,
  onEventChange,
  onSubmit,
  onReset,
}) => {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit() }}>
      <div className="rounded-lg border border-gray-200/70 bg-white p-3 dark:border-gray-800/70 dark:bg-[#0d121d]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-[180px] flex-1">
            <div className="relative">
              <SearchInput
                value={usernameQuery}
                onChange={onUsernameChange}
                placeholder="Type username..."
                size="sm"
                containerClassName="max-w-none"
                inputClassName={FILTER_CONTROL_CLASS}
                showSearchIcon={false}
                showClearButton={false}
              />

              {userResults.length > 0 && !selectedUser && (
                <div className="absolute z-10 mt-1 w-full rounded-md border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-hidden">
                  {userResults.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => onUserSelect(u)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{u.username}</span>
                        {u.is_admin ? <span className="text-xs text-muted-foreground">global admin</span> : null}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Select value={selectedEventId} onValueChange={onEventChange}>
            <SelectTrigger className={cn(FILTER_CONTROL_CLASS, ADMIN_SELECT_TRIGGER_CLASS, 'w-full sm:w-[180px] gap-1')}>
              <SelectValue placeholder="Pick event" />
            </SelectTrigger>
            <SelectContent className={ADMIN_SELECT_CONTENT_CLASS}>
              {events.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1.5">
            <Button type="submit" disabled={!canSubmit} className="h-9 rounded-xl px-3 text-xs font-semibold">
              {submitting ? 'Adding...' : 'Add'}
            </Button>
            <Button type="button" variant="ghost" onClick={onReset} disabled={submitting} className="h-9 rounded-xl px-3 text-xs font-semibold">
              Reset
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default AddEventAdminCard
