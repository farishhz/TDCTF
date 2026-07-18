"use client"

import { useState } from 'react'
import { RefreshCcw, Power, PowerOff, Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui'
import ConfirmDialog from '@/shared/components/ConfirmDialog'
import { AdminFilterSelect, AdminFilterToolbar } from '@/features/admin/ui'
import type { AdminServicesFilters, AdminServiceTab } from '../types'

type AdminServicesToolbarProps = {
  filters: AdminServicesFilters
  keyOptions: string[]
  isRefreshing: boolean
  statusLoading: boolean
  onFiltersChange: (filters: AdminServicesFilters) => void
  onRefresh: () => void
  activeTab: AdminServiceTab
  isGlobalAdmin: boolean
  globalActionLoading: 'up' | 'down' | null
  onGlobalAction: (action: 'up' | 'down') => void
}

export default function AdminServicesToolbar({
  filters,
  keyOptions,
  isRefreshing,
  statusLoading,
  onFiltersChange,
  onRefresh,
  activeTab,
  isGlobalAdmin,
  globalActionLoading,
  onGlobalAction,
}: AdminServicesToolbarProps) {
  const [confirmAction, setConfirmAction] = useState<'up' | 'down' | null>(null)

  const updateFilter = <K extends keyof AdminServicesFilters>(
    key: K,
    value: AdminServicesFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const handleGlobalAction = (action: 'up' | 'down') => {
    setConfirmAction(action)
  }

  const handleConfirmGlobal = () => {
    if (confirmAction) {
      onGlobalAction(confirmAction)
      setConfirmAction(null)
    }
  }

  const showValidity = activeTab === 'platform'
  const actionButtonClass = 'h-9 rounded-xl border-gray-200/50 font-semibold text-gray-700 hover:border-blue-500/40 dark:border-gray-800/50 dark:text-gray-200'

  return (
    <>
    <AdminFilterToolbar
      actions={
        <>
          {activeTab === 'live' && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={actionButtonClass}
                onClick={() => handleGlobalAction('up')}
                disabled={!isGlobalAdmin || globalActionLoading !== null}
                title={isGlobalAdmin ? 'Start all NXCTL services' : 'Only global admins can start all services'}
              >
                {globalActionLoading === 'up' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Power className="h-3.5 w-3.5" />}
                Up all
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={`${actionButtonClass} hover:border-red-500/40 hover:text-red-600 dark:hover:text-red-300`}
                onClick={() => handleGlobalAction('down')}
                disabled={!isGlobalAdmin || globalActionLoading !== null}
                title={isGlobalAdmin ? 'Stop all NXCTL services' : 'Only global admins can stop all services'}
              >
                {globalActionLoading === 'down' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PowerOff className="h-3.5 w-3.5" />}
                Down all
              </Button>
            </>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={onRefresh}
            disabled={isRefreshing || statusLoading}
            className={actionButtonClass}
          >
            <RefreshCcw className={(isRefreshing || statusLoading) ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            Refresh
          </Button>
        </>
      }
    >
        {showValidity && (
          <AdminFilterSelect
            value={filters.validity}
            onValueChange={(value) => updateFilter('validity', value as AdminServicesFilters['validity'])}
            placeholder="Validity"
            className="w-full sm:w-[170px]"
            options={[
              { value: 'all', label: 'All services' },
              { value: 'valid', label: 'Valid services' },
              { value: 'invalid', label: 'Invalid services' },
            ]}
          />
        )}

        <AdminFilterSelect
          value={filters.key}
          onValueChange={(value) => updateFilter('key', value)}
          placeholder="Key"
          className="w-full sm:w-[190px]"
          contentClassName="max-h-[300px]"
          options={[
            { value: 'all', label: 'All keys' },
            { value: 'no_key', label: 'No key' },
            ...keyOptions.map((key) => ({ value: key, label: key })),
          ]}
        />
    </AdminFilterToolbar>

      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={() => setConfirmAction(null)}
        title={confirmAction === 'up' ? 'Start All Services' : 'Stop All Services'}
        variant={confirmAction === 'down' ? 'destructive' : 'default'}
        description={
          <p>
            Are you sure you want to {confirmAction === 'up' ? 'start' : 'stop'} all NXCTL services?
          </p>
        }
        confirmLabel={confirmAction === 'up' ? 'Start All' : 'Stop All'}
        onConfirm={handleConfirmGlobal}
      />
    </>
  )
}
