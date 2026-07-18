import React from 'react'
import { ArrowUpDown, CheckSquare, Minus, Plus, XCircle } from 'lucide-react'
import { Button } from '@/shared/ui'
import { formatCategory } from '@/features/challenges/lib/challenge-utils'
import {
  ADMIN_ROW_CLASS,
  AdminDataSurface,
  AdminEmptyState,
  AdminFilterInput,
  AdminFilterSelect,
  AdminFilterToolbar,
  AdminStatusBadge,
} from '@/features/admin/ui'
import { DEFAULT_EVENT_FILTERS } from '../lib'
import type { ChallengeLite, Event, FilterState } from '../types'

interface BulkAssignChallengesCardProps {
  events: Event[]
  filters: FilterState
  onFilterChange: React.Dispatch<React.SetStateAction<FilterState>>
  categories: string[]
  difficulties: string[]
  onSelectAllFiltered: () => void
  onClearSelection: () => void
  bulkEventId: string
  onBulkEventChange: (eventId: string) => void
  onBulkAssign: () => void
  onBulkRemove: () => void
  bulkSubmitting: boolean
  filteredChallenges: ChallengeLite[]
  selectedIds: string[]
  onToggleSelect: (challengeId: string) => void
}

const EVENT_FILTER_OPTIONS = [
  { value: 'all', label: 'All Events' },
  { value: 'main', label: 'Main Event' },
]

const BulkAssignChallengesCard: React.FC<BulkAssignChallengesCardProps> = ({
  events,
  filters,
  onFilterChange,
  categories,
  difficulties,
  onSelectAllFiltered,
  onClearSelection,
  bulkEventId,
  onBulkEventChange,
  onBulkAssign,
  onBulkRemove,
  bulkSubmitting,
  filteredChallenges,
  selectedIds,
  onToggleSelect,
}) => {
  const isFilterDirty =
    filters.search ||
    filters.category !== 'all' ||
    filters.difficulty !== 'all' ||
    filters.sourceEventId !== 'all' ||
    filters.visibility !== 'all' ||
    filters.service !== 'all' ||
    filters.sortBy !== 'points_desc'

  return (
    <AdminDataSurface className="h-[calc(100dvh-8.5rem)] min-h-[520px]" contentClassName="flex h-full min-h-0 flex-col p-0">
      <div className="shrink-0 border-b border-gray-200/70 bg-white/95 p-3 backdrop-blur-md dark:border-gray-800/70 dark:bg-[#0b0f19]/95">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
            <div className="w-full min-w-0">
              <AdminFilterSelect
                value={bulkEventId || 'none'}
                defaultValue="none"
                onValueChange={(value) => onBulkEventChange(value === 'none' ? '' : value)}
                className="w-full"
                options={[
                  { value: 'none', label: 'Target Event' },
                  ...events.map((event) => ({ value: event.id, label: event.name })),
                ]}
              />
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button onClick={onBulkAssign} disabled={bulkSubmitting} size="sm" className="gap-1.5 rounded-xl">
                <Plus className="h-3.5 w-3.5" />
                Assign
              </Button>
              <Button variant="secondary" onClick={onBulkRemove} disabled={bulkSubmitting} size="sm" className="gap-1.5 rounded-xl">
                <Minus className="h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            {selectedIds.length > 0 && (
              <AdminStatusBadge tone="info">
                {selectedIds.length} selected
              </AdminStatusBadge>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={onClearSelection}
              className="gap-1.5 rounded-xl"
              aria-label="Clear selected challenges"
              title="Clear Select"
            >
              <XCircle className="h-4 w-4" />
              Clear
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onSelectAllFiltered}
              className="gap-1.5 rounded-xl"
              aria-label="Select all filtered challenges"
              title="Select All"
            >
              <CheckSquare className="h-4 w-4" />
              Select All
            </Button>
          </div>
        </div>

        <div className="mt-2 grid gap-2 xl:grid-cols-[minmax(0,520px)_minmax(0,1fr)] xl:items-center">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
            <AdminFilterInput
              type="text"
              value={filters.search}
              defaultValue=""
              onChange={(value) => onFilterChange((prev) => ({ ...prev, search: value }))}
              placeholder="Search challenges..."
              wrapperClassName="w-full sm:flex-1"
            />
            <AdminFilterSelect
              value={filters.sourceEventId}
              defaultValue="all"
              onValueChange={(value) => onFilterChange((prev) => ({ ...prev, sourceEventId: value }))}
              className="w-full sm:w-[160px]"
              options={[
                ...EVENT_FILTER_OPTIONS,
                ...events.map((event) => ({ value: event.id, label: event.name })),
              ]}
            />
          </div>

          <AdminFilterToolbar
            actions={(
              <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                <AdminFilterSelect
                  value={filters.category}
                  onValueChange={(value) => onFilterChange((prev) => ({ ...prev, category: value }))}
                  className="w-full sm:w-[150px]"
                  options={[
                    { value: 'all', label: 'All Categories' },
                    ...categories.map((category) => ({ value: category, label: category })),
                  ]}
                />
                <AdminFilterSelect
                  value={filters.difficulty}
                  onValueChange={(value) => onFilterChange((prev) => ({ ...prev, difficulty: value }))}
                  className="w-full sm:w-[145px]"
                  options={[
                    { value: 'all', label: 'All Difficulties' },
                    ...difficulties.map((difficulty) => ({ value: difficulty, label: difficulty, className: 'capitalize' })),
                  ]}
                />
                <AdminFilterSelect
                  value={filters.visibility}
                  onValueChange={(value) => onFilterChange((prev) => ({ ...prev, visibility: value as FilterState['visibility'] }))}
                  className="w-full sm:w-[140px]"
                  options={[
                    { value: 'all', label: 'All Visibility' },
                    { value: 'active', label: 'Active / Visible' },
                    { value: 'inactive', label: 'Inactive / Hidden' },
                    { value: 'maintenance', label: 'Maintenance' },
                  ]}
                />
                <AdminFilterSelect
                  value={filters.service}
                  onValueChange={(value) => onFilterChange((prev) => ({ ...prev, service: value as FilterState['service'] }))}
                  className="w-full sm:w-[130px]"
                  options={[
                    { value: 'all', label: 'All Services' },
                    { value: 'services', label: 'Services' },
                    { value: 'placeholder', label: 'Placeholder' },
                    { value: 'tasks', label: 'Tasks' },
                  ]}
                />
                <AdminFilterSelect
                  value={filters.sortBy || 'points_desc'}
                  defaultValue="points_desc"
                  onValueChange={(value) => onFilterChange((prev) => ({ ...prev, sortBy: value }))}
                  className="w-full sm:w-[150px]"
                  icon={<ArrowUpDown className="h-3.5 w-3.5 shrink-0" />}
                  options={[
                    { value: 'points_desc', label: 'Points desc' },
                    { value: 'points_asc', label: 'Points asc' },
                    { value: 'difficulty_asc', label: 'Difficulty asc' },
                    { value: 'difficulty_desc', label: 'Difficulty desc' },
                    { value: 'title_asc', label: 'Name A-Z' },
                    { value: 'title_desc', label: 'Name Z-A' },
                  ]}
                />
              </div>
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {isFilterDirty && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onFilterChange(DEFAULT_EVENT_FILTERS)}
                  className="h-9 shrink-0 rounded-xl px-3.5 text-xs font-bold"
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </AdminFilterToolbar>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scroll-hidden">
        {filteredChallenges.length === 0 ? (
          <div className="p-6">
            <AdminEmptyState
              title="No challenges found"
              description="Try adjusting your filters or search terms."
            />
          </div>
        ) : (
          filteredChallenges.map((challenge) => (
            <label
              key={challenge.id}
              className={`${ADMIN_ROW_CLASS} flex cursor-pointer items-center gap-3 px-3.5 py-3`}
            >
              <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(challenge.id)}
                  onChange={() => onToggleSelect(challenge.id)}
                  className="peer sr-only"
                />
                <span className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-gray-300/80 bg-white transition-all duration-150 peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/40 dark:border-gray-600 dark:bg-[#151b2a] dark:peer-checked:border-blue-500 dark:peer-checked:bg-blue-500">
                  <svg
                    className="h-3 w-3 scale-0 text-white transition-transform duration-150 peer-checked:scale-100"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">{challenge.title}</div>
                <div className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                  {formatCategory(challenge.category) || 'Uncategorized'} {' / '}
                  {challenge.difficulty || 'Unknown'} {' / '}
                  {typeof challenge.points === 'number' ? `${challenge.points} pts` : 'No points'} {' / '}
                  {challenge.event_id ? (events.find((event) => event.id === challenge.event_id)?.name || 'Event') : 'Main Event'}
                </div>
              </div>
              <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                {challenge.is_maintenance && <AdminStatusBadge tone="warning">Maintenance</AdminStatusBadge>}
                {!challenge.is_active && <AdminStatusBadge tone="muted">Hidden</AdminStatusBadge>}
                {Array.isArray(challenge.services) && challenge.services.length > 0 && <AdminStatusBadge tone="info">Service</AdminStatusBadge>}
                {challenge.has_questions && <AdminStatusBadge tone="success">Tasks</AdminStatusBadge>}
              </div>
            </label>
          ))
        )}
      </div>
    </AdminDataSurface>
  )
}

export default BulkAssignChallengesCard
