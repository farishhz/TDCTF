import type { NxctlServiceEntry } from './nxctl-services'
import {
  buildNxctlEndpointInfo,
  firstBoolean,
  firstNumber,
  formatDuration,
} from './nxctl-service-utils'

export type ServiceAction = 'up' | 'restart' | 'extend'
export type ServiceActionLoadingState = ServiceAction | null

export type ChallengeServiceEndpoint = {
  key: string
  endpoint: string
  provider: string
  port: string
  status: string
  type: string
  isTcp: boolean
  isSsh: boolean
  command: string
  password: string
  copyText: string
  copyMessage: string
}

export function formatShortDuration(seconds?: number | null) {
  if (!seconds || seconds <= 0) return null
  if (seconds < 60) return `${Math.ceil(seconds)}s`
  return `${Math.ceil(seconds / 60)}m`
}

export function formatExtendWaitDuration(seconds?: number | null) {
  if (!seconds || seconds <= 0) return null
  return `${Math.max(1, Math.ceil(seconds / 60))}m`
}

export function getServiceDisplayName(name: string) {
  const normalized = name.trim().replace(/\\/g, '/')
  const parts = normalized.split('/').filter(Boolean)
  return parts.at(-1) || name
}

export function getRestartState(details: any) {
  const restart = details?.runtime?.restart || details?.restart || null
  const enabled = firstBoolean(
    restart?.enabled,
    details?.runtime?.can_restart,
    details?.challenge?.can_restart,
    details?.can_restart
  )
  const cooldownSeconds = firstNumber(
    restart?.cooldown_remaining_seconds,
    details?.runtime?.restart_cooldown,
    details?.restart_cooldown
  )

  return {
    enabled: enabled ?? true,
    cooldownSeconds: Math.max(0, Math.floor(cooldownSeconds ?? 0)),
    restart,
  }
}

export function getExtendState(details: any, remainingSec: number | null, timeSinceFetch: number) {
  const extend = details?.runtime?.extend || details?.extend || null
  const thresholdSeconds = Math.max(0, Math.floor(firstNumber(extend?.threshold_seconds) ?? 300))
  const rawCooldownSeconds = firstNumber(
    extend?.cooldown_remaining_seconds,
    details?.runtime?.extend_cooldown,
    details?.extend_cooldown
  ) ?? 0
  const cooldownSeconds = Math.max(0, Math.floor(rawCooldownSeconds - timeSinceFetch))
  const isWindowOpen = remainingSec !== null && remainingSec <= thresholdSeconds
  const waitSeconds = remainingSec !== null && remainingSec > thresholdSeconds
    ? remainingSec - thresholdSeconds
    : 0
  const backendCanExtend = firstBoolean(extend?.can_extend) === true

  return {
    canExtend: backendCanExtend || (remainingSec !== null && isWindowOpen && cooldownSeconds === 0),
    cooldownSeconds,
    thresholdSeconds,
    waitSeconds,
  }
}

export function isNxctlNotFoundError(status: number, data: any): boolean {
  const getCode = (val: any): string | null => {
    if (!val) return null
    if (typeof val === 'string') return val
    if (typeof val === 'object') {
      if (typeof val.error === 'string') return val.error
      if (typeof val.code === 'string') return val.code
    }
    return null
  }

  const code = getCode(data?.detail) || getCode(data?.error) || getCode(data)
  if (code === 'challenge_not_found_or_not_authorized') return false
  return status === 404 || code === 'challenge_not_found'
}

export function getChallengeServiceEndpoints(service: NxctlServiceEntry, details: any): ChallengeServiceEndpoint[] {
  const serviceType = String(details?.challenge?.type || '').toLowerCase()
  const exports: unknown[] = Array.isArray(details?.exports) ? details.exports : []

  return exports
    .map((item: unknown, exportIdx: number): ChallengeServiceEndpoint | null => {
      const endpoint = buildNxctlEndpointInfo(item, serviceType, service.options)
      if (!endpoint) return null

      const endpointRecord = item && typeof item === 'object' ? item as Record<string, unknown> : {}

      return {
        key: `${endpoint.endpoint}-${exportIdx}`,
        endpoint: endpoint.endpoint,
        provider: endpoint.provider,
        port: endpointRecord.port ? String(endpointRecord.port) : '',
        status: endpointRecord.status ? String(endpointRecord.status) : '',
        type: endpoint.type,
        isTcp: endpoint.type === 'tcp' || endpoint.endpoint.toLowerCase().startsWith('tcp://'),
        isSsh: endpoint.isSsh,
        command: endpoint.label,
        password: endpoint.password,
        copyText: endpoint.copyText,
        copyMessage: endpoint.isSsh ? 'Copied SSH command' : 'Copied endpoint',
      }
    })
    .filter((endpoint: ChallengeServiceEndpoint | null): endpoint is ChallengeServiceEndpoint => Boolean(endpoint))
}

export function getTimerClass(remainingSec: number | null, thresholdSec: number) {
  if (remainingSec === null) return 'border-gray-700/60 bg-gray-900/40 text-gray-500'
  if (remainingSec <= 60) return 'border-red-500/30 bg-red-500/10 text-red-300'
  if (remainingSec <= thresholdSec) return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300'
  return 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300'
}

export function getExtendButtonAlertClass(canExtend: boolean, isRunning: boolean, remainingSec: number | null) {
  if (!canExtend || !isRunning || remainingSec === null) return ''
  if (remainingSec <= 60) {
    return 'border-red-500/40 bg-red-500/15 text-red-200 shadow-red-500/10 hover:border-red-400/70 hover:bg-red-500/25 dark:border-red-400/40 dark:bg-red-500/15 dark:text-red-200 dark:hover:bg-red-500/25'
  }
  return 'border-amber-500/40 bg-amber-500/15 text-amber-200 shadow-amber-500/10 hover:border-amber-400/70 hover:bg-amber-500/25 dark:border-amber-400/40 dark:bg-amber-500/15 dark:text-amber-200 dark:hover:bg-amber-500/25'
}

export function formatServiceSeconds(seconds: number) {
  return formatDuration(seconds)
}
