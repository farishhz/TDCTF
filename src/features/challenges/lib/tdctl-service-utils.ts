import type { TDCTLServiceEntry, TDCTLServiceOptions } from './tdctl-services'

export const CHALLENGE_KEY_HEADER = 'X-TDCTL-Challenge-Key'

export type TDCTLStatusDetail = {
  challenge: {
    name: string
    type: string | null
    port: number | null
    ports: unknown[]
    can_restart: boolean | null
  }
  runtime: {
    status: string
    container_id: string | null
    remaining_seconds: number | null
    can_restart: boolean | null
    restart_cooldown: number
    restart: unknown
    extend_cooldown: number
    extend: unknown
  }
  exports: unknown[]
  raw?: unknown
}

export type TDCTLEndpointInfo = {
  endpoint: string
  label: string
  copyText: string
  type: string
  provider: string
  isHttp: boolean
  isSsh: boolean
  password: string
}

type NamedService = Pick<TDCTLServiceEntry, 'name' | 'key'>

export function buildTDCTLHeaders(serviceKey?: string, json = false, accessToken?: string | null) {
  const headers: Record<string, string> = {}
  if (json) headers['Content-Type'] = 'application/json'
  if (serviceKey) headers[CHALLENGE_KEY_HEADER] = serviceKey
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`
  return headers
}

export function buildTDCTLServiceHeaders(service: Pick<TDCTLServiceEntry, 'key'>, json = false) {
  return buildTDCTLHeaders(service.key, json)
}

export function buildTDCTLStatusHeaders(services: NamedService[]): Record<string, string> {
  const keys = Array.from(new Set(
    services
      .map((service) => service.key?.trim())
      .filter((key): key is string => Boolean(key))
  ))

  if (keys.length === 0) return {}
  return { [CHALLENGE_KEY_HEADER]: keys.join(',') }
}

export function buildTDCTLStatusUrl(services: NamedService[]) {
  return buildTDCTLActionUrl('status', services)
}

export function buildTDCTLLiveServicesUrl(services: NamedService[]) {
  return buildTDCTLActionUrl('live-services', services)
}

function buildTDCTLActionUrl(action: string, services: NamedService[]) {
  const params = new URLSearchParams({ action })
  const names = Array.from(new Set(
    services
      .map((service) => service.name.trim())
      .filter(Boolean)
  ))

  if (names.length > 0) params.set('filter', names.join(','))
  return `/api/tdctl?${params.toString()}`
}

export function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') return value.trim()
    if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  }

  return ''
}

export function firstBoolean(...values: unknown[]): boolean | null {
  for (const value of values) {
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value !== 0
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase()
      if (['true', 'yes', '1', 'enabled'].includes(normalized)) return true
      if (['false', 'no', '0', 'disabled'].includes(normalized)) return false
    }
  }

  return null
}

export function firstNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) return parsed
    }
  }

  return null
}

export function getTDCTLStatusName(item: any) {
  return String(item?.name || item?.challenge?.name || '').trim()
}

export function normalizeTDCTLStatusDetail(item: any): TDCTLStatusDetail {
  const restart = item?.runtime?.restart || item?.restart || null
  const restartEnabled = firstBoolean(
    restart?.enabled,
    item?.runtime?.can_restart,
    item?.challenge?.can_restart,
    item?.can_restart
  )
  const restartCooldown = firstNumber(
    restart?.cooldown_remaining_seconds,
    item?.runtime?.restart_cooldown,
    item?.restart_cooldown
  )
  const remainingSeconds = firstNumber(
    item?.runtime?.remaining_seconds,
    item?.remaining_seconds
  )
  const port = firstNumber(
    item?.port,
    item?.challenge?.port
  )
  const extendCooldown = firstNumber(
    item?.runtime?.extend_cooldown,
    item?.extend_cooldown
  )

  return {
    challenge: {
      name: getTDCTLStatusName(item),
      type: item?.type || item?.challenge?.type || null,
      port,
      ports: Array.isArray(item?.ports) ? item.ports : Array.isArray(item?.challenge?.ports) ? item.challenge.ports : [],
      can_restart: restartEnabled,
    },
    runtime: {
      status: String(item?.runtime?.status || item?.status || 'unknown'),
      container_id: item?.runtime?.container_id || item?.container_id || null,
      remaining_seconds: remainingSeconds,
      can_restart: restartEnabled,
      restart_cooldown: restartCooldown ?? 0,
      restart,
      extend_cooldown: extendCooldown ?? 0,
      extend: item?.runtime?.extend || item?.extend || null,
    },
    exports: Array.isArray(item?.exports) ? item.exports : [],
    raw: item,
  }
}

export function stringifyTDCTLDetail(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value !== 'object') return String(value)

  const detail = value as Record<string, unknown>
  const code = typeof detail.error === 'string' ? detail.error : ''
  const message = typeof detail.message === 'string' ? detail.message : ''

  if (code === 'challenge_not_found_or_not_authorized') return 'Challenge not found, disabled, or missing/invalid challenge key.'
  if (code === 'challenge_not_found') return 'Challenge not found in TDCTL.'
  if (code === 'invalid_or_missing_api_token') return 'TDCTL API token is missing or invalid.'
  if (code === 'invalid_or_missing_admin_secret') return 'TDCTL admin secret is missing or invalid.'
  if (code === 'api_admin_secret_not_configured') return 'TDCTL admin secret is not configured.'
  if (code === 'restart_disabled') return 'Restart is disabled for this challenge.'
  if (message) return message
  if (code) return code

  try {
    return JSON.stringify(value)
  } catch {
    return null
  }
}

export function getTDCTLErrorMessage(data: any, fallback = 'Unknown TDCTL error') {
  return (
    stringifyTDCTLDetail(data?.detail) ||
    stringifyTDCTLDetail(data?.error) ||
    stringifyTDCTLDetail(data?.message) ||
    fallback
  )
}

export function getExportEndpoint(item: any) {
  return String(item?.endpoint || item?.url || '').trim()
}

export function isHttpEndpoint(endpoint: string) {
  return /^https?:\/\//i.test(endpoint)
}

export function isTcpEndpoint(item: any, fallbackType?: string) {
  const endpoint = getExportEndpoint(item).toLowerCase()
  const type = String(item?.type || fallbackType || '').toLowerCase()
  return type === 'tcp' || endpoint.startsWith('tcp://')
}

export function parseTcpEndpoint(endpoint: string) {
  const match = endpoint.match(/^tcp:\/\/([^/:]+):(\d+)/i)
  if (match) return { host: match[1], port: match[2] }

  const fallbackMatch = endpoint.match(/^([^/:]+):(\d+)$/i)
  return fallbackMatch ? { host: fallbackMatch[1], port: fallbackMatch[2] } : null
}

export function toTcpCommand(endpoint: string) {
  const parsed = parseTcpEndpoint(endpoint)
  return parsed ? `nc ${parsed.host} ${parsed.port}` : endpoint
}

export function toSshCommand(endpoint: string, user?: string) {
  const parsed = parseTcpEndpoint(endpoint)
  if (!parsed) return endpoint

  return `ssh ${user?.trim() || 'username'}@${parsed.host} -p ${parsed.port}`
}

export function toSshCopyCommand(endpoint: string, user?: string) {
  const command = toSshCommand(endpoint, user)
  return command.startsWith('ssh ')
    ? command.replace(/^ssh\s+/, 'ssh -o StrictHostKeyChecking=no ')
    : command
}

export function buildTDCTLEndpointInfo(item: any, serviceType = '', serviceOptions: TDCTLServiceOptions = {}): TDCTLEndpointInfo | null {
  const endpoint = getExportEndpoint(item)
  if (!endpoint) return null

  const endpointType = String(item?.type || serviceType || '').toLowerCase()
  const isHttp = isHttpEndpoint(endpoint)
  const isReturnedTcp =
    endpointType === 'tcp' ||
    endpoint.toLowerCase().startsWith('tcp://') ||
    (!isHttp && parseTcpEndpoint(endpoint) !== null)
  const isSsh = isReturnedTcp && serviceOptions.type === 'ssh'
  const label = isSsh
    ? toSshCommand(endpoint, serviceOptions.user)
    : isReturnedTcp
      ? toTcpCommand(endpoint)
      : endpoint

  return {
    endpoint,
    label,
    copyText: isSsh ? toSshCopyCommand(endpoint, serviceOptions.user) : label,
    type: endpointType || (isHttp ? 'http' : isReturnedTcp ? 'tcp' : 'unknown'),
    provider: item?.provider ? String(item.provider) : '',
    isHttp,
    isSsh,
    password: isSsh ? serviceOptions.pass || '' : '',
  }
}

export function formatDuration(seconds: number) {
  if (seconds <= 0) return '0s'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const sec = seconds % 60
  if (h > 0) return `${h}h ${m}m ${sec}s`
  return `${m}m ${sec}s`
}
