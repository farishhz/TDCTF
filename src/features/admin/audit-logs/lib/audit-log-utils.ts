export const ACTION_OPTIONS = [
  { value: 'all', label: 'All actions' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'PUBLISH', label: 'Publish' },
  { value: 'UNPUBLISH', label: 'Unpublish' },
  { value: 'GRANT_ADMIN', label: 'Grant Admin' },
  { value: 'REVOKE_ADMIN', label: 'Revoke Admin' },
  { value: 'ADD_MEMBER', label: 'Add Member' },
  { value: 'REMOVE_MEMBER', label: 'Remove Member' },
  { value: 'APPROVE', label: 'Approve' },
  { value: 'REJECT', label: 'Reject' },
]

export const ENTITY_OPTIONS = [
  { value: 'all', label: 'All entities' },
  { value: 'challenge', label: 'Challenge' },
  { value: 'event', label: 'Event' },
  { value: 'event_member', label: 'Event Member' },
  { value: 'event_join_request', label: 'Join Request' },
  { value: 'role', label: 'Role' },
  { value: 'solve', label: 'Solve' },
]

export const LIMIT_OPTIONS = [25, 50, 100, 250]

const SENSITIVE_FIELD_PATTERN = /(password|token|session|secret|credential|flag|join_key|key)$/i
const SENSITIVE_FIELD_NAMES = new Set(['flag', 'flag_hash', 'join_key', 'services'])

export type AuditDetailTab = 'summary' | 'changes' | 'data' | 'metadata'

export const AUDIT_DETAIL_TABS = [
  { value: 'summary' as const, label: 'Summary' },
  { value: 'changes' as const, label: 'Changes' },
  { value: 'data' as const, label: 'Data' },
  { value: 'metadata' as const, label: 'Metadata' },
]

export function getActionStyle(action: string) {
  switch (action) {
    case 'CREATE': return { tone: 'success' as const, color: 'text-green-500', icon: '+' }
    case 'UPDATE': return { tone: 'info' as const, color: 'text-blue-500', icon: '~' }
    case 'DELETE': return { tone: 'danger' as const, color: 'text-red-500', icon: 'x' }
    case 'PUBLISH': return { tone: 'success' as const, color: 'text-emerald-500', icon: '^' }
    case 'UNPUBLISH': return { tone: 'warning' as const, color: 'text-yellow-500', icon: 'v' }
    case 'APPROVE': return { tone: 'success' as const, color: 'text-emerald-500', icon: 'ok' }
    case 'REJECT': return { tone: 'danger' as const, color: 'text-red-500', icon: '!' }
    default: return { tone: 'neutral' as const, color: 'text-gray-500', icon: '-' }
  }
}

export function toIsoOrNull(value: string) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

export function getFieldValue(data: Record<string, unknown> | null, field: string) {
  if (!data || !(field in data)) return null
  return data[field]
}

export function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function isSensitiveField(field: string) {
  const normalized = field.toLowerCase()
  return SENSITIVE_FIELD_NAMES.has(normalized) || SENSITIVE_FIELD_PATTERN.test(normalized)
}

export function sanitizeRecord(data: Record<string, unknown> | null) {
  if (!data) return null
  return Object.fromEntries(Object.entries(data).filter(([key]) => !isSensitiveField(key)))
}

export function formatPrimitive(value: unknown) {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return value
  return String(value)
}

export function formatFieldLabel(field: string) {
  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function formatJakartaDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
    timeZoneName: 'short',
  }).format(date)
}

export function shortenValue(value: string | null | undefined, start = 8, end = 5) {
  if (!value) return '-'
  if (value.length <= start + end + 3) return value
  return `${value.slice(0, start)}...${value.slice(-end)}`
}

export function parseUserAgent(userAgent: string | null | undefined) {
  const ua = userAgent || ''
  if (!ua) return { browser: 'Unknown browser', os: 'Unknown OS' }

  const edge = ua.match(/Edg\/([\d.]+)/)
  const chrome = ua.match(/Chrome\/([\d.]+)/)
  const firefox = ua.match(/Firefox\/([\d.]+)/)
  const safari = ua.match(/Version\/([\d.]+).*Safari/)

  const browser = edge
    ? `Edge ${edge[1].split('.')[0]}`
    : chrome
      ? `Chrome ${chrome[1].split('.')[0]}`
      : firefox
        ? `Firefox ${firefox[1].split('.')[0]}`
        : safari
          ? `Safari ${safari[1].split('.')[0]}`
          : 'Unknown browser'

  const os = /Windows NT 10/.test(ua)
    ? 'Windows 10/11'
    : /Windows NT 6\.3/.test(ua)
      ? 'Windows 8.1'
      : /Windows NT 6\.1/.test(ua)
        ? 'Windows 7'
        : /Mac OS X/.test(ua)
          ? 'macOS'
          : /Android/.test(ua)
            ? 'Android'
            : /iPhone|iPad/.test(ua)
              ? 'iOS'
              : /Linux/.test(ua)
                ? 'Linux'
                : 'Unknown OS'

  return { browser, os }
}
