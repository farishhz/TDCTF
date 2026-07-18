import { ChevronDown, ChevronRight, Clock, Copy, ExternalLink, Loader2, Play, Power, PowerOff, RefreshCcw } from 'lucide-react'
import { useEffect, useState, Fragment, type ReactNode } from 'react'
import toast from 'react-hot-toast'
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/shared/ui'
import { ADMIN_ROW_CLASS, AdminEmptyState, AdminTableSurface } from '@/features/admin/ui'
import type { AdminLiveServiceRow, AdminNxctlActionTarget, AdminServiceAction } from '../types'
import AdminServiceStatusBadge from './AdminServiceStatusBadge'
import { formatDuration, getRemainingSecondsFromDetail, getLiveServiceEndpoints } from '../lib/admin-services-utils'

type AdminLiveServicesTableProps = {
  rows: AdminLiveServiceRow[]
  isGlobalAdmin: boolean
  actionLoading: Record<string, AdminServiceAction | null>
  globalActionLoading: 'up' | 'down' | null
  onNxctlAction: (target: AdminNxctlActionTarget, action: AdminServiceAction) => void
  onGlobalAction: (action: 'up' | 'down') => void
}

function EndpointChip({ endpoint }: { endpoint: any }) {
  const isSsh = endpoint.isSsh
  const isTcp = endpoint.type === 'tcp' || endpoint.isTcp
  const isHttp = endpoint.isHttp

  const colorClass = isSsh
    ? 'border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
    : isTcp
      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
      : 'border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300'

  return (
    <div className="flex w-full min-w-0 items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1.5 flex-1">
        <code
          className={`min-w-0 flex-1 truncate rounded border px-2 py-1 font-mono text-[11px] ${colorClass}`}
          title={endpoint.label}
        >
          {endpoint.label}
        </code>
        {isSsh && endpoint.password && (
          <code
            className="shrink-0 rounded border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] text-amber-700 dark:text-amber-300"
            title={`Password: ${endpoint.password}`}
          >
            <span className="select-none pr-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-500/70">pw</span>
            {endpoint.password}
          </code>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          className="rounded p-1 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={(e) => {
            e.stopPropagation()
            navigator.clipboard?.writeText(endpoint.copyText)
            toast.success(isSsh ? 'Copied SSH command' : 'Copied endpoint')
          }}
          aria-label="Copy endpoint"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        {isHttp && (
          <a
            href={endpoint.endpoint}
            target="_blank"
            rel="noreferrer"
            className="rounded p-1 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
            aria-label="Open endpoint"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  )
}

function getActionTarget(row: AdminLiveServiceRow): AdminNxctlActionTarget | null {
  const platformEntry = row.platformEntries.find((entry) => entry.key) || row.platformEntries[0]
  if (!platformEntry) return null

  return {
    id: `live:${row.id}:${platformEntry.id}`,
    name: row.name,
    key: platformEntry.key,
    details: row.details,
    error: null,
    fetchedAt: row.fetchedAt,
  }
}

function getExtendState(row: AdminLiveServiceRow, now = Date.now()) {
  const remaining = getRemainingSecondsFromDetail(row.details, row.fetchedAt, now)
  const extend = row.details.runtime.extend && typeof row.details.runtime.extend === 'object'
    ? row.details.runtime.extend as Record<string, unknown>
    : {}
  const thresholdSeconds = Number(extend.threshold_seconds || 300)
  const cooldownSeconds = Math.max(0, Number(row.details.runtime.extend_cooldown || 0))
  const backendCanExtend = extend.can_extend === true

  return {
    remaining,
    canExtend: remaining !== null && (backendCanExtend || (remaining <= thresholdSeconds && cooldownSeconds === 0)),
  }
}

function LiveNxctlActions({
  row,
  target,
  isGlobalAdmin,
  loadingAction,
  onAction,
  now,
}: {
  row: AdminLiveServiceRow
  target: AdminNxctlActionTarget
  isGlobalAdmin: boolean
  loadingAction: AdminServiceAction | null
  onAction: (target: AdminNxctlActionTarget, action: AdminServiceAction) => void
  now: number
}) {
  const isRunning = row.status === 'running' || row.status === 'container_only'
  const isBusy = loadingAction !== null
  const hasKey = target.key.trim() !== ''
  const restartCooldown = Math.max(0, Number(row.details.runtime.restart_cooldown || 0))
  const restartEnabled = row.details.runtime.can_restart !== false
  const canForceRestart = isGlobalAdmin
  const extendState = getExtendState(row, now)
  const actionButtonClass = 'h-8 rounded-lg px-2.5 text-xs'

  const renderIcon = (action: AdminServiceAction, fallback: ReactNode) => (
    loadingAction === action ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : fallback
  )

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={actionButtonClass}
        onClick={() => onAction(target, 'up')}
        disabled={isBusy || isRunning || !hasKey}
        title={!hasKey ? 'Challenge key is missing from NXCTL admin config' : isRunning ? 'Service is already running' : 'Start service'}
      >
        {renderIcon('up', <Play className="h-3.5 w-3.5" />)}
        Start
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className={actionButtonClass}
        onClick={() => onAction({ ...target, force: canForceRestart }, 'restart')}
        disabled={isBusy || !isRunning || !hasKey || ((!restartEnabled || restartCooldown > 0) && !canForceRestart)}
        title={!restartEnabled && canForceRestart ? 'Force restart service' : !restartEnabled ? 'Restart disabled for this service' : restartCooldown > 0 && canForceRestart ? 'Force restart during cooldown' : 'Restart service'}
      >
        {renderIcon('restart', <RefreshCcw className="h-3.5 w-3.5" />)}
        Restart
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className={actionButtonClass}
        onClick={() => onAction(target, 'extend')}
        disabled={isBusy || !isRunning || !hasKey || !extendState.canExtend}
        title={extendState.remaining === null ? 'No expiration data available' : 'Extend service time'}
      >
        {renderIcon('extend', <Clock className="h-3.5 w-3.5" />)}
        Extend
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className={actionButtonClass}
        onClick={() => onAction(target, 'down')}
        disabled={isBusy || !isRunning || !isGlobalAdmin}
        title={isGlobalAdmin ? 'Stop service' : 'Only global admins can stop services'}
      >
        {renderIcon('down', <PowerOff className="h-3.5 w-3.5" />)}
        Stop
      </Button>
    </div>
  )
}

export default function AdminLiveServicesTable({
  rows,
  isGlobalAdmin,
  actionLoading,
  globalActionLoading,
  onNxctlAction,
  onGlobalAction,
}: AdminLiveServicesTableProps) {
  const [now, setNow] = useState(() => Date.now())
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const toggleRow = (rowId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }))
  }

  if (rows.length === 0) {
    return (
      <div className="p-5">
        <AdminEmptyState
          title="No live services found"
          description="Try adjusting filters, or refresh once NXCTL runtime data is available."
        />
      </div>
    )
  }

  return (
    <>
      <AdminTableSurface>
        <Table>
          <TableBody>
            {rows.map((row) => {
              const endpoints = getLiveServiceEndpoints(row)
              const actionTarget = getActionTarget(row)
              const extendState = getExtendState(row, now)
              const remaining = extendState.remaining
              const isExpanded = !!expandedRows[row.id]
              const hasEndpoints = endpoints.length > 0

              return (
                <Fragment key={row.id}>
                  <TableRow
                    className={`${ADMIN_ROW_CLASS} ${
                      hasEndpoints ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => hasEndpoints && toggleRow(row.id)}
                  >
                    <TableCell className="pl-6 w-10" onClick={(e) => e.stopPropagation()}>
                      {hasEndpoints && (
                        <button
                          type="button"
                          onClick={() => toggleRow(row.id)}
                          className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          aria-label={isExpanded ? 'Collapse endpoints' : 'Expand endpoints'}
                        >
                          <ChevronRight
                            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                      )}
                    </TableCell>

                    <TableCell className="min-w-[160px]">
                      <div className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {row.name}
                      </div>
                    </TableCell>

                    <TableCell className="pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-2.5">
                        {(row.status === 'running' || row.status === 'container_only') && remaining !== null ? (
                          <span className="inline-flex items-center gap-1 whitespace-nowrap font-mono text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                            <Clock className="h-3 w-3 shrink-0" />
                            {formatDuration(remaining)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-600"></span>
                        )}
                        <AdminServiceStatusBadge status={row.status} />
                        {actionTarget ? (
                          <LiveNxctlActions
                            row={row}
                            target={actionTarget}
                            isGlobalAdmin={isGlobalAdmin}
                            loadingAction={actionLoading[actionTarget.id] ?? null}
                            onAction={onNxctlAction}
                            now={now}
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>

                  {hasEndpoints && isExpanded && (
                    <TableRow className="border-b border-gray-100/80 bg-gray-50/10 hover:bg-gray-50/10 dark:border-gray-800/70 dark:bg-gray-950/5 dark:hover:bg-gray-950/5">
                      <TableCell colSpan={3} className="pl-16 pr-6 py-3">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {endpoints.map((ep) => (
                            <div key={ep.key} className="flex items-center min-w-0">
                              <EndpointChip endpoint={ep} />
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
      </AdminTableSurface>
    </>
  )
}
