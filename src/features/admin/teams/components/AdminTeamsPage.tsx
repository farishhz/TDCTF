"use client"

import React from 'react'
import { Users } from 'lucide-react'
import { Button } from '@/shared/ui'
import {
  AdminContentLoading,
  AdminPageShell,
  AdminStickyToolbar,
  AdminTabs,
  AdminFilterInput,
  AdminFilterSelect,
  AdminFilterToolbar,
  useTabState,
} from '../../ui'
import { useAdminTeamsData } from '../hooks/useAdminTeamsData'
import TeamsTableCard from './TeamsTableCard'

type AdminTeamsTab = 'teams'

const TEAM_TABS = [
  { value: 'teams' as const, label: 'Teams', icon: Users },
]

export default function AdminTeamsPage() {
  const [activeTab, setActiveTab] = useTabState<AdminTeamsTab>('tab', 'teams')
  const adminTeamsData = useAdminTeamsData()
  const { user, authLoading, accessReady, isAllowed, isLoading } = adminTeamsData

  const hasActiveFilters =
    adminTeamsData.query.trim().length > 0 ||
    adminTeamsData.searchQuery.trim().length > 0 ||
    adminTeamsData.sortMode !== 'newest' ||
    adminTeamsData.pageSize !== 100

  if (authLoading || !accessReady) return <AdminContentLoading variant="users" />
  if (!user || !isAllowed) return null

  if (isLoading) {
    return (
      <AdminPageShell>
        <AdminContentLoading variant="users" />
      </AdminPageShell>
    )
  }

  return (
    <AdminPageShell>
      <AdminStickyToolbar
        tabs={
          <AdminTabs
            items={TEAM_TABS}
            value={activeTab}
            onChange={setActiveTab}
          />
        }
        filters={
          <AdminFilterToolbar
            actions={
              <>
                <AdminFilterSelect
                  value={adminTeamsData.sortMode}
                  defaultValue="newest"
                  onValueChange={(value) => {
                    adminTeamsData.setSortMode(value as 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'member_count')
                    adminTeamsData.setPage(1)
                  }}
                  placeholder="Sort"
                  className="w-full sm:w-[155px]"
                  options={[
                    { value: 'newest', label: 'Newest' },
                    { value: 'oldest', label: 'Oldest' },
                    { value: 'name_asc', label: 'Name (A-Z)' },
                    { value: 'name_desc', label: 'Name (Z-A)' },
                    { value: 'member_count', label: 'Member Count' },
                  ]}
                />

                <AdminFilterSelect
                  value={String(adminTeamsData.pageSize)}
                  defaultValue="100"
                  onValueChange={(value) => {
                    adminTeamsData.setPageSize(Number(value))
                    adminTeamsData.setPage(1)
                  }}
                  placeholder="Rows"
                  className="w-full sm:w-[120px]"
                  options={[100, 500, 1000].map((option) => ({
                    value: String(option),
                    label: `${option} rows`,
                  }))}
                />
              </>
            }
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                adminTeamsData.setSearchQuery(adminTeamsData.query)
                adminTeamsData.setPage(1)
              }}
              className="flex items-center gap-2 flex-1 max-w-[320px]"
            >
              <AdminFilterInput
                value={adminTeamsData.query}
                defaultValue=""
                onChange={(value) => {
                  adminTeamsData.setQuery(value)
                }}
                placeholder="Search team name... [Enter]"
                wrapperClassName="w-full"
              />

              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    adminTeamsData.setQuery('')
                    adminTeamsData.setSearchQuery('')
                    adminTeamsData.setSortMode('newest')
                    adminTeamsData.setPageSize(100)
                    adminTeamsData.setPage(1)
                  }}
                  className="h-9 shrink-0 rounded-xl border-blue-600 bg-blue-600 px-3.5 text-xs font-bold text-white hover:border-blue-500 hover:bg-blue-500 dark:border-blue-600 dark:bg-blue-600 dark:text-white"
                >
                  Clear
                </Button>
              )}
            </form>
          </AdminFilterToolbar>
        }
      />

      <div className="space-y-0 mt-2">
        <TeamsTableCard {...adminTeamsData} />
      </div>
    </AdminPageShell>
  )
}
