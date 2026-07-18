import type { Challenge, Event } from '@/shared/types'
import type { NxctlServiceEntry } from '@/features/challenges/lib/nxctl-services'
import type { NxctlStatusDetail } from '@/features/challenges/lib/nxctl-service-utils'

export type AdminServiceStatus = 'running' | 'stopped' | 'container_only' | 'expired' | 'error' | 'unknown'

export type AdminServiceAction = 'up' | 'down' | 'restart' | 'extend'

export type AdminServiceTab = 'platform' | 'live'

export type AdminServiceComparisonStatus =
  | 'valid'
  | 'invalid'
  | 'key_missing'
  | 'configured_not_running'
  | 'missing_from_platform'
  | 'running_unregistered'
  | 'disabled_running'
  | 'unknown'

export type AdminServiceSource = 'platform' | 'live' | 'both'

export type AdminServiceEndpoint = {
  key: string
  endpoint: string
  label: string
  copyText: string
  type: string
  provider: string
  isHttp: boolean
}

export type AdminNxctlStatusDetail = NxctlStatusDetail & {
  raw: unknown
}

export type AdminServiceRow = {
  id: string
  service: NxctlServiceEntry
  challenge: Challenge
  event: Event | null
  details: AdminNxctlStatusDetail | null
  error: string | null
  fetchedAt: number | null
}

export type AdminNxctlActionTarget = {
  id: string
  name: string
  key: string
  details: AdminNxctlStatusDetail | null
  error: string | null
  fetchedAt: number | null
  force?: boolean
}

export type AdminPlatformChallengeEntry = {
  id: string
  name: string
  serviceName: string
  key: string
  requiresKey: boolean
  keyAvailable: boolean
  keySource: string
  enabled: boolean
  raw: unknown
  matchedServiceRows: AdminServiceRow[]
  challenge: Challenge | null
  event: Event | null
  liveDetails: AdminNxctlStatusDetail | null
  comparison: AdminServiceComparisonStatus
}

export type AdminPlatformChallengeKeyGroup = {
  key: string
  entries: AdminPlatformChallengeEntry[]
}

export type AdminPlatformChallengeGroup = {
  id: string
  name: string
  entries: AdminPlatformChallengeEntry[]
  keyGroups: AdminPlatformChallengeKeyGroup[]
  matchedServiceRows: AdminServiceRow[]
  challenge: Challenge | null
  event: Event | null
  keyCount: number
  serviceCount: number
  liveCount: number
  enabled: boolean | null
  requiresKey: boolean
  keyAvailable: boolean | null
  keyMissingCount: number
  comparison: AdminServiceComparisonStatus
  source: AdminServiceSource
}

export type AdminLiveServiceRow = {
  id: string
  name: string
  serviceName: string
  details: AdminNxctlStatusDetail
  status: AdminServiceStatus
  fetchedAt: number | null
  platformEntries: AdminPlatformChallengeEntry[]
  matchedServiceRows: AdminServiceRow[]
  challenge: Challenge | null
  event: Event | null
  comparison: AdminServiceComparisonStatus
  source: AdminServiceSource
}

export type AdminRuntimeStatusSnapshot = {
  details: AdminNxctlStatusDetail[]
  fetchedAt: number | null
  error: string | null
  isComplete: boolean
}

export type AdminServicesFilters = {
  search: string
  key: string
  enabled: 'all' | 'enabled' | 'disabled'
  requiresKey: 'all' | 'required' | 'not_required'
  keyAvailable: 'all' | 'available' | 'missing'
  validity:
    | 'all'
    | 'valid'
    | 'invalid'
    | 'key_missing'
    | 'configured_not_running'
    | 'missing_from_platform'
    | 'running_unregistered'
    | 'disabled_running'
    | 'unknown'
  source: 'all' | AdminServiceSource
  runtimeStatus: 'all' | AdminServiceStatus
}

export type AdminServicesSummaryCounts = {
  platformGroups: number
  platformEntries: number
  liveServices: number
  valid: number
  invalid: number
  configuredNotRunning: number
  runningUnregistered: number
}
