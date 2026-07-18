import {
  buildNxctlEndpointInfo,
  normalizeNxctlStatusDetail as normalizeBaseNxctlStatusDetail,
} from '@/features/challenges/lib/nxctl-service-utils'
import type {
  AdminLiveServiceRow,
  AdminNxctlStatusDetail,
  AdminServiceEndpoint,
  AdminServiceRow,
  AdminServiceStatus,
} from '../types'

export function normalizeLookup(value: string) {
  return value.trim().toLowerCase()
}

export function normalizeNxctlStatusDetail(item: any): AdminNxctlStatusDetail {
  return normalizeBaseNxctlStatusDetail(item) as AdminNxctlStatusDetail
}

export function normalizeNxctlStatusList(data: unknown) {
  if (!Array.isArray(data)) return []
  return data.map(normalizeNxctlStatusDetail)
}

export function getNxctlStatusMap(data: unknown) {
  const statusByName = new Map<string, AdminNxctlStatusDetail>()
  const rows = Array.isArray(data) ? data.map(normalizeNxctlStatusDetail) : []

  rows.forEach((item) => {
    const name = item.challenge.name
    if (name) statusByName.set(name, item)
  })

  return statusByName
}

export function getRemainingSecondsFromDetail(
  detail: AdminNxctlStatusDetail | null | undefined,
  fetchedAt: number | null | undefined,
  now = Date.now()
) {
  const value = detail?.runtime.remaining_seconds
  if (value === null || value === undefined || !fetchedAt) return null

  const elapsed = Math.max(0, (now - fetchedAt) / 1000)
  return Math.max(0, value - elapsed)
}

export function getRuntimeStatusFromDetail(
  detail: AdminNxctlStatusDetail | null | undefined,
  error?: string | null,
  fetchedAt?: number | null,
  now = Date.now()
): AdminServiceStatus {
  if (error) return 'error'
  if (!detail) return 'unknown'

  const runtimeStatus = detail.runtime.status?.toLowerCase()
  if (!runtimeStatus) return 'unknown'

  if (runtimeStatus === 'running') {
    const remaining = getRemainingSecondsFromDetail(detail, fetchedAt, now)
    if (remaining !== null && remaining <= 0) return 'expired'
    if ((detail.challenge.port === null || detail.challenge.port === 0) && detail.exports.length === 0) {
      return 'container_only'
    }
    return 'running'
  }

  if (['down', 'stopped', 'exited', 'created', 'not_running'].includes(runtimeStatus)) {
    return 'stopped'
  }

  if (['error', 'unhealthy', 'failed'].includes(runtimeStatus)) return 'error'
  return 'unknown'
}

export function getRemainingSeconds(row: AdminServiceRow, now = Date.now()) {
  return getRemainingSecondsFromDetail(row.details, row.fetchedAt, now)
}

export function getServiceStatus(row: AdminServiceRow, now = Date.now()): AdminServiceStatus {
  return getRuntimeStatusFromDetail(row.details, row.error, row.fetchedAt, now)
}

export function formatDuration(seconds?: number | null) {
  if (seconds === null || seconds === undefined) return '-'
  const safeSeconds = Math.max(0, Math.floor(seconds))
  const h = Math.floor(safeSeconds / 3600)
  const m = Math.floor((safeSeconds % 3600) / 60)
  const sec = safeSeconds % 60
  if (h > 0) return `${h}h ${m}m ${sec}s`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

export function formatDateTime(value?: string | number | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getServiceEndpoints(row: AdminServiceRow): AdminServiceEndpoint[] {
  const exports = row.details?.exports || []
  const serviceType = String(row.details?.challenge.type || '').toLowerCase()

  return exports
    .map((item: any, index) => {
      const endpoint = buildNxctlEndpointInfo(item, serviceType, row.service.options)
      if (!endpoint) return null

      return {
        key: `${row.id}:${index}`,
        endpoint: endpoint.endpoint,
        label: endpoint.label,
        copyText: endpoint.copyText,
        type: endpoint.type,
        provider: endpoint.provider,
        isHttp: endpoint.isHttp,
      }
    })
    .filter((item): item is AdminServiceEndpoint => Boolean(item))
}

export function getLiveServiceEndpoints(row: AdminLiveServiceRow): (AdminServiceEndpoint & { isSsh: boolean; password?: string })[] {
  const exports = row.details?.exports || []
  const serviceType = String(row.details?.challenge.type || '').toLowerCase()
  const serviceRow = row.matchedServiceRows[0]
  const serviceOptions = serviceRow?.service.options || {}

  return exports
    .map((item: any, index): (AdminServiceEndpoint & { isSsh: boolean; password?: string }) | null => {
      const endpoint = buildNxctlEndpointInfo(item, serviceType, serviceOptions)
      if (!endpoint) return null

      return {
        key: `${row.id}:${index}`,
        endpoint: endpoint.endpoint,
        label: endpoint.label,
        copyText: endpoint.copyText,
        type: endpoint.type,
        provider: endpoint.provider,
        isHttp: endpoint.isHttp,
        isSsh: endpoint.isSsh,
        password: endpoint.password,
      }
    })
    .filter((item): item is AdminServiceEndpoint & { isSsh: boolean; password?: string } => Boolean(item))
}

export function getServiceType(row: AdminServiceRow) {
  if (row.service.options.type) return row.service.options.type
  const endpoints = getServiceEndpoints(row)
  const firstEndpointType = endpoints[0]?.type
  return firstEndpointType || row.details?.challenge.type || 'unknown'
}

export function getUniqueOptions(values: Array<string | null | undefined>) {
  return Array.from(new Set(
    values
      .map((value) => String(value || '').trim())
      .filter(Boolean)
  )).sort((a, b) => a.localeCompare(b))
}
