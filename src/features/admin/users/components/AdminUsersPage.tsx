"use client"

import { useState } from 'react'
import { ShieldCheck, Users, Tag } from 'lucide-react'
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
import { useAdminUsersData } from '../hooks/useAdminUsersData'
import UserRolesTab from './UserRolesTab'
import UsersTableCard from './UsersTableCard'
import UserTagsTab from './UserTagsTab'
import BatchImportDialog from './BatchImportDialog'
import AddUserDialog from './AddUserDialog'

type AdminUsersTab = 'users' | 'roles' | 'tags'

const USER_TABS = [
  { value: 'users' as const, label: 'Users', icon: Users },
  { value: 'roles' as const, label: 'Roles', icon: ShieldCheck },
  { value: 'tags' as const, label: 'Tags', icon: Tag },
]
export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useTabState<AdminUsersTab>('tab', 'users')
  const [importOpen, setImportOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const adminUsersData = useAdminUsersData()
  const { user, authLoading, accessReady, isAllowed, isLoading } = adminUsersData
  const hasActiveUserFilters =
    adminUsersData.query.trim().length > 0 ||
    adminUsersData.searchQuery.trim().length > 0 ||
    adminUsersData.roleFilter !== 'all' ||
    adminUsersData.sortMode !== 'newest' ||
    adminUsersData.pageSize !== 100 ||
    adminUsersData.statusFilter !== 'all'

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
            items={USER_TABS}
            value={activeTab}
            onChange={setActiveTab}
          />
        }
        filters={
          activeTab === 'users' ? (
            <AdminFilterToolbar
              actions={
                <>
                  <AdminFilterSelect
                    value={adminUsersData.roleFilter}
                    onValueChange={(value) => {
                      adminUsersData.setRoleFilter(value as 'all' | 'admin' | 'user')
                      adminUsersData.setPage(1)
                    }}
                    placeholder="Role"
                    className="w-full sm:w-[130px]"
                    options={[
                      { value: 'all', label: 'All roles' },
                      { value: 'admin', label: 'Admin' },
                      { value: 'user', label: 'User' },
                    ]}
                  />

                  <AdminFilterSelect
                    value={adminUsersData.statusFilter}
                    onValueChange={(value) => {
                      adminUsersData.setStatusFilter(value as 'all' | 'banned' | 'active')
                      adminUsersData.setPage(1)
                    }}
                    placeholder="Status"
                    className="w-full sm:w-[130px]"
                    options={[
                      { value: 'all', label: 'All status' },
                      { value: 'banned', label: 'Suspended' },
                      { value: 'active', label: 'Active' },
                    ]}
                  />

                  <AdminFilterSelect
                    value={adminUsersData.sortMode}
                    defaultValue="newest"
                    onValueChange={(value) => {
                      adminUsersData.setSortMode(value as 'newest' | 'oldest' | 'username_asc' | 'updated_desc' | 'role')
                      adminUsersData.setPage(1)
                    }}
                    placeholder="Sort"
                    className="w-full sm:w-[150px]"
                    options={[
                      { value: 'newest', label: 'Newest' },
                      { value: 'oldest', label: 'Oldest' },
                      { value: 'username_asc', label: 'Username' },
                      { value: 'updated_desc', label: 'Recently updated' },
                      { value: 'role', label: 'Role' },
                    ]}
                  />

                  <AdminFilterSelect
                    value={String(adminUsersData.pageSize)}
                    defaultValue="100"
                    onValueChange={(value) => {
                      adminUsersData.setPageSize(Number(value))
                      adminUsersData.setPage(1)
                    }}
                    placeholder="Rows"
                    className="w-full sm:w-[120px]"
                    options={[100, 500, 1000].map((option) => ({
                      value: String(option),
                      label: `${option} rows`,
                    }))}
                  />

                  <Button
                    type="button"
                    onClick={() => setAddOpen(true)}
                    className="h-9 shrink-0 rounded-xl bg-gray-800 hover:bg-gray-700 dark:bg-[#1f2937]/50 dark:hover:bg-[#1f2937] text-white font-bold text-xs border border-gray-300 dark:border-gray-700"
                  >
                    Add User
                  </Button>

                  <Button
                    type="button"
                    onClick={() => setImportOpen(true)}
                    className="h-9 shrink-0 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                  >
                    Import Users
                  </Button>
                </>
              }
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  adminUsersData.setSearchQuery(adminUsersData.query)
                  adminUsersData.setPage(1)
                }}
                className="flex items-center gap-2 flex-1 max-w-[320px]"
              >
                <AdminFilterInput
                  value={adminUsersData.query}
                  defaultValue=""
                  onChange={(value) => {
                    adminUsersData.setQuery(value)
                  }}
                  placeholder="Search username, ID, bio... [Enter]"
                  wrapperClassName="w-full"
                />

                {hasActiveUserFilters && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      adminUsersData.setQuery('')
                      adminUsersData.setSearchQuery('')
                      adminUsersData.setRoleFilter('all')
                      adminUsersData.setStatusFilter('all')
                      adminUsersData.setSortMode('newest')
                      adminUsersData.setPageSize(100)
                      adminUsersData.setPage(1)
                    }}
                    className="h-9 shrink-0 rounded-xl border-blue-600 bg-blue-600 px-3.5 text-xs font-bold text-white hover:border-blue-500 hover:bg-blue-500 dark:border-blue-600 dark:bg-blue-600 dark:text-white"
                  >
                    Clear
                  </Button>
                )}
              </form>
            </AdminFilterToolbar>
          ) : null
        }
      />

      <div className="space-y-0 mt-2">
        {activeTab === 'users' ? (
          <UsersTableCard {...adminUsersData} />
        ) : activeTab === 'roles' ? (
          <UserRolesTab />
        ) : (
          <UserTagsTab users={adminUsersData.users} onRefresh={adminUsersData.onRefresh} />
        )}
      </div>

      <BatchImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onSuccess={adminUsersData.onRefresh}
      />

      <AddUserDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={adminUsersData.onRefresh}
      />
    </AdminPageShell>
  )
}
