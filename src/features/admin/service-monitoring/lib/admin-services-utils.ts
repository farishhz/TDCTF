import type { Challenge, Event } from '@/shared/types'
import { parseNxctlService } from '@/features/challenges/lib/nxctl-services'
import {
  buildNxctlHeaders,
  buildNxctlLiveServicesUrl,
  buildNxctlStatusHeaders as buildNxctlServiceStatusHeaders,
  buildNxctlStatusUrl as buildNxctlServiceStatusUrl,
  firstBoolean,
  firstString,
  getNxctlErrorMessage,
} from '@/features/challenges/lib/nxctl-service-utils'
import {
  formatDateTime,
  formatDuration,
  getLiveServiceEndpoints,
  getNxctlStatusMap,
  getRemainingSeconds,
  getRemainingSecondsFromDetail,
  getRuntimeStatusFromDetail,
  getServiceEndpoints,
  getServiceStatus,
  getServiceType,
  getUniqueOptions,
  normalizeLookup,
  normalizeNxctlStatusDetail,
  normalizeNxctlStatusList,
} from './admin-service-status-utils'
import type {
  AdminLiveServiceRow,
  AdminNxctlStatusDetail,
  AdminPlatformChallengeEntry,
  AdminPlatformChallengeGroup,
  AdminPlatformChallengeKeyGroup,
  AdminServiceComparisonStatus,
  AdminServiceEndpoint,
  AdminServiceRow,
  AdminServicesFilters,
  AdminServicesSummaryCounts,
  AdminServiceSource,
  AdminServiceStatus,
} from '../types'

export { buildNxctlHeaders, getNxctlErrorMessage }
export {
  formatDateTime,
  formatDuration,
  getLiveServiceEndpoints,
  getNxctlStatusMap,
  getRemainingSeconds,
  getRemainingSecondsFromDetail,
  getRuntimeStatusFromDetail,
  getServiceEndpoints,
  getServiceStatus,
  getServiceType,
  getUniqueOptions,
  normalizeNxctlStatusDetail,
  normalizeNxctlStatusList,
}

const COMPARISON_SEVERITY: Record<AdminServiceComparisonStatus, number> = {
  invalid: 60,
  disabled_running: 50,
  running_unregistered: 45,
  missing_from_platform: 43,
  configured_not_running: 40,
  key_missing: 35,
  unknown: 20,
  valid: 0,
}

export function buildNxctlStatusHeaders(rows: AdminServiceRow[]): Record<string, string> {
  return buildNxctlServiceStatusHeaders(rows.map((row) => row.service))
}

export function buildNxctlStatusUrl(rows: AdminServiceRow[]) {
  return buildNxctlServiceStatusUrl(rows.map((row) => row.service))
}

export function buildLiveServicesUrl(rows: AdminServiceRow[]) {
  return buildNxctlLiveServicesUrl(rows.map((row) => row.service))
}

export function buildServiceRows(challenges: Challenge[], events: Event[]): AdminServiceRow[] {
  const eventById = new Map(events.map((event) => [String(event.id), event]))

  return challenges.flatMap((challenge) => {
    const rawServices = Array.isArray(challenge.services) ? challenge.services : []

    return rawServices
      .map(parseNxctlService)
      .filter((service) => service.name.trim() !== '')
      .map((service, index) => ({
        id: `${challenge.id}:${service.name}:${index}`,
        service,
        challenge,
        event: challenge.event_id ? eventById.get(String(challenge.event_id)) ?? null : null,
        details: null,
        error: null,
        fetchedAt: null,
      }))
  })
}

function getPlatformServiceName(item: Record<string, unknown>, name: string) {
  return firstString(
    item.service,
    item.service_name,
    item.challenge,
    item.challenge_name,
    item.child,
    item.target,
    item.instance,
    name
  )
}

export function normalizePlatformChallengeEntries(data: unknown): AdminPlatformChallengeEntry[] {
  if (!Array.isArray(data)) return []

  const entries: AdminPlatformChallengeEntry[] = []

  data.forEach((item, index) => {
    const record = item && typeof item === 'object' ? item as Record<string, unknown> : {}
    const name = firstString(record.name, record.platform_name, record.challenge_name)
    if (!name) return

    const key = firstString(record.key, record.challenge_key, record.access_key)
    const requiresKey = firstBoolean(record.requires_key, record.requiresKey) ?? Boolean(key)
    const keyAvailable = firstBoolean(record.key_available, record.keyAvailable) ?? (!requiresKey || Boolean(key))
    const enabled = firstBoolean(record.enabled, record.is_enabled, record.active, record.is_active) ?? true
    const serviceName = getPlatformServiceName(record, name)

    entries.push({
      id: `${name}:${key || 'no-key'}:${serviceName}:${index}`,
      name,
      serviceName,
      key,
      requiresKey,
      keyAvailable,
      keySource: firstString(record.key_source, record.keySource, record.source),
      enabled,
      raw: item,
      matchedServiceRows: [],
      challenge: null,
      event: null,
      liveDetails: null,
      comparison: 'unknown',
    })
  })

  return entries
}

function getCandidateNames(...values: string[]) {
  return new Set(values.map(normalizeLookup).filter(Boolean))
}

function matchServiceRows(rows: AdminServiceRow[], names: Set<string>) {
  return rows.filter((row) => {
    return (
      names.has(normalizeLookup(row.service.name)) ||
      names.has(normalizeLookup(row.challenge.title))
    )
  })
}

function platformEntryMatchesService(entry: AdminPlatformChallengeEntry, serviceName: string) {
  const normalizedServiceName = normalizeLookup(serviceName)
  return (
    normalizeLookup(entry.name) === normalizedServiceName ||
    normalizeLookup(entry.serviceName) === normalizedServiceName
  )
}

function platformEntryMatchesServiceKey(entry: AdminPlatformChallengeEntry, row: AdminServiceRow) {
  if (!platformEntryMatchesService(entry, row.service.name)) return false
  return normalizeLookup(entry.key) === normalizeLookup(row.service.key)
}

function matchPlatformEntries(entries: AdminPlatformChallengeEntry[], names: Set<string>) {
  return entries.filter((entry) => {
    return (
      names.has(normalizeLookup(entry.name)) ||
      names.has(normalizeLookup(entry.serviceName))
    )
  })
}

function matchLiveDetail(details: AdminNxctlStatusDetail[], names: Set<string>) {
  return details.find((detail) => names.has(normalizeLookup(detail.challenge.name))) || null
}

function dedupeServiceRows(rows: AdminServiceRow[]) {
  const seen = new Set<string>()
  return rows.filter((row) => {
    if (seen.has(row.id)) return false
    seen.add(row.id)
    return true
  })
}

function getPlatformEntryComparison(
  entry: AdminPlatformChallengeEntry,
  liveDetails: AdminNxctlStatusDetail | null,
  liveFetchedAt: number | null,
  now = Date.now()
): AdminServiceComparisonStatus {
  if (entry.requiresKey && !entry.keyAvailable) return 'key_missing'

  const runtimeStatus = getRuntimeStatusFromDetail(liveDetails, null, liveFetchedAt, now)
  const isRunning = runtimeStatus === 'running'

  if (!entry.enabled && isRunning) return 'disabled_running'
  if (!entry.enabled && !isRunning) return 'valid'
  if (entry.enabled && isRunning) return 'valid'
  if (entry.enabled && runtimeStatus === 'unknown') return 'configured_not_running'
  if (entry.enabled && runtimeStatus !== 'running') return 'configured_not_running'

  return 'unknown'
}

function getLiveComparison(
  rowStatus: AdminServiceStatus,
  platformEntries: AdminPlatformChallengeEntry[]
): AdminServiceComparisonStatus {
  if (platformEntries.length === 0) {
    return rowStatus === 'running' || rowStatus === 'container_only' ? 'running_unregistered' : 'missing_from_platform'
  }
  if (platformEntries.some((entry) => entry.requiresKey && !entry.keyAvailable)) return 'key_missing'
  if (platformEntries.every((entry) => !entry.enabled)) {
    return rowStatus === 'running' || rowStatus === 'container_only' ? 'disabled_running' : 'valid'
  }
  if (rowStatus === 'running' || rowStatus === 'container_only') return 'valid'
  if (rowStatus === 'unknown') return 'unknown'
  return 'configured_not_running'
}

function getWorstComparison(statuses: AdminServiceComparisonStatus[]) {
  return statuses.reduce<AdminServiceComparisonStatus>((worst, status) => {
    return COMPARISON_SEVERITY[status] > COMPARISON_SEVERITY[worst] ? status : worst
  }, 'valid')
}

function getMixedBoolean(values: boolean[]) {
  const unique = Array.from(new Set(values))
  return unique.length === 1 ? unique[0] : null
}

function groupEntriesByKey(entries: AdminPlatformChallengeEntry[]): AdminPlatformChallengeKeyGroup[] {
  const groups = new Map<string, AdminPlatformChallengeEntry[]>()
  entries.forEach((entry) => {
    const key = entry.key || 'No key'
    groups.set(key, [...(groups.get(key) || []), entry])
  })

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, keyEntries]) => ({
      key,
      entries: keyEntries.sort((a, b) => a.serviceName.localeCompare(b.serviceName)),
    }))
}

export function buildPlatformChallengeGroups(
  entries: AdminPlatformChallengeEntry[],
  serviceRows: AdminServiceRow[],
  liveDetails: AdminNxctlStatusDetail[],
  liveFetchedAt: number | null,
  now = Date.now()
): AdminPlatformChallengeGroup[] {
  const serviceRowsByConfig = new Map<string, AdminServiceRow[]>()

  serviceRows.forEach((row) => {
    const serviceName = row.service.name.trim()
    if (!serviceName) return

    const configKey = `${normalizeLookup(serviceName)}:${normalizeLookup(row.service.key)}`
    serviceRowsByConfig.set(configKey, [...(serviceRowsByConfig.get(configKey) || []), row])
  })

  const enrichedEntries: AdminPlatformChallengeEntry[] = Array.from(serviceRowsByConfig.values()).map((rows, index) => {
    const firstRow = rows[0]
    const serviceName = firstRow.service.name.trim()
    const serviceKey = firstRow.service.key.trim()
    const exactPlatformEntry = entries.find((entry) => platformEntryMatchesServiceKey(entry, firstRow))
    const relatedPlatformEntries = entries.filter((entry) => platformEntryMatchesService(entry, serviceName))
    const relatedKeys = relatedPlatformEntries
      .map((entry) => entry.key)
      .filter(Boolean)
    const liveDetail = matchLiveDetail(liveDetails, getCandidateNames(serviceName))

    if (exactPlatformEntry) {
      return {
        ...exactPlatformEntry,
        matchedServiceRows: rows,
        challenge: firstRow.challenge,
        event: firstRow.event,
        liveDetails: liveDetail,
        comparison: getPlatformEntryComparison(exactPlatformEntry, liveDetail, liveFetchedAt, now),
      }
    }

    return {
      id: `supabase:${serviceName}:${serviceKey || 'no-key'}:${index}`,
      name: serviceName,
      serviceName,
      key: serviceKey,
      requiresKey: Boolean(serviceKey),
      keyAvailable: Boolean(serviceKey),
      keySource: relatedKeys.length > 0
        ? `Supabase challenge.services; NXCTL keys: ${relatedKeys.join(', ')}`
        : 'Supabase challenge.services',
      enabled: true,
      raw: null,
      matchedServiceRows: rows,
      challenge: firstRow.challenge,
      event: firstRow.event,
      liveDetails: liveDetail,
      comparison: liveDetail ? 'missing_from_platform' : 'configured_not_running',
    }
  })

  const groupsByName = new Map<string, AdminPlatformChallengeEntry[]>()
  enrichedEntries.forEach((entry) => {
    const groupKey = normalizeLookup(entry.name)
    groupsByName.set(groupKey, [...(groupsByName.get(groupKey) || []), entry])
  })

  return Array.from(groupsByName.values())
    .map((groupEntries) => {
      const name = groupEntries[0]?.name || 'Unknown challenge'
      const matchedServiceRows = dedupeServiceRows(groupEntries.flatMap((entry) => entry.matchedServiceRows))
      const keyValues = getUniqueOptions(groupEntries.map((entry) => entry.key))
      const serviceValues = getUniqueOptions(groupEntries.map((entry) => entry.serviceName || entry.name))
      const liveCount = groupEntries.filter((entry) => Boolean(entry.liveDetails)).length
      const keyMissingCount = groupEntries.filter((entry) => entry.requiresKey && !entry.keyAvailable).length
      const comparison = getWorstComparison(groupEntries.map((entry) => entry.comparison))

      return {
        id: normalizeLookup(name),
        name,
        entries: groupEntries.sort((a, b) => a.serviceName.localeCompare(b.serviceName)),
        keyGroups: groupEntriesByKey(groupEntries),
        matchedServiceRows,
        challenge: matchedServiceRows[0]?.challenge || null,
        event: matchedServiceRows[0]?.event || null,
        keyCount: keyValues.length,
        serviceCount: serviceValues.length,
        liveCount,
        enabled: getMixedBoolean(groupEntries.map((entry) => entry.enabled)),
        requiresKey: groupEntries.some((entry) => entry.requiresKey),
        keyAvailable: getMixedBoolean(groupEntries.map((entry) => entry.keyAvailable)),
        keyMissingCount,
        comparison,
        source: liveCount > 0 ? 'both' : 'platform' as AdminServiceSource,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function buildLiveServiceRows(
  liveDetails: AdminNxctlStatusDetail[],
  serviceRows: AdminServiceRow[],
  platformEntries: AdminPlatformChallengeEntry[],
  liveFetchedAt: number | null,
  now = Date.now()
): AdminLiveServiceRow[] {
  const detailsByName = new Map<string, AdminNxctlStatusDetail>()
  liveDetails.forEach((detail) => {
    const key = normalizeLookup(detail.challenge.name)
    if (key && !detailsByName.has(key)) detailsByName.set(key, detail)
  })

  return Array.from(detailsByName.values())
    .map((detail) => {
      const name = detail.challenge.name || 'Unknown service'
      const names = getCandidateNames(name)
      const matchedServiceRows = matchServiceRows(serviceRows, names)
      const matchedPlatformEntries = matchPlatformEntries(platformEntries, names)
      const status = getRuntimeStatusFromDetail(detail, null, liveFetchedAt, now)

      return {
        id: normalizeLookup(name),
        name,
        serviceName: name,
        details: detail,
        status,
        fetchedAt: liveFetchedAt,
        platformEntries: matchedPlatformEntries,
        matchedServiceRows,
        challenge: matchedServiceRows[0]?.challenge || matchedPlatformEntries[0]?.challenge || null,
        event: matchedServiceRows[0]?.event || matchedPlatformEntries[0]?.event || null,
        comparison: getLiveComparison(status, matchedPlatformEntries),
        source: matchedPlatformEntries.length > 0 ? 'both' : 'live' as AdminServiceSource,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function getComparisonLabel(status: AdminServiceComparisonStatus) {
  const labels: Record<AdminServiceComparisonStatus, string> = {
    valid: 'Valid',
    invalid: 'Invalid',
    key_missing: 'Key missing',
    configured_not_running: 'Configured but not running',
    missing_from_platform: 'Missing from platform config',
    running_unregistered: 'Running but not registered',
    disabled_running: 'Disabled but running',
    unknown: 'Unknown',
  }

  return labels[status]
}

function isInvalidComparison(status: AdminServiceComparisonStatus) {
  return [
    'invalid',
    'key_missing',
    'configured_not_running',
    'missing_from_platform',
    'running_unregistered',
    'disabled_running',
  ].includes(status)
}

function matchesValidity(status: AdminServiceComparisonStatus, filter: AdminServicesFilters['validity']) {
  if (filter === 'all') return true
  if (filter === 'valid') return status === 'valid'
  if (filter === 'invalid') return isInvalidComparison(status)
  return status === filter
}

function isPlatformEntryKeyInvalid(entry: AdminPlatformChallengeEntry) {
  if (!entry.liveDetails) return false
  return (
    !entry.key ||
    entry.comparison === 'missing_from_platform' ||
    (entry.requiresKey && !entry.keyAvailable)
  )
}

function isPlatformGroupInvalid(group: AdminPlatformChallengeGroup) {
  return group.entries.some((entry) => {
    const hasChallengeIssue = entry.matchedServiceRows.length === 0
    const hasServiceIssue = !entry.enabled || !entry.liveDetails
    return hasChallengeIssue || hasServiceIssue || isPlatformEntryKeyInvalid(entry)
  })
}

function matchesPlatformGroupValidity(
  group: AdminPlatformChallengeGroup,
  filter: AdminServicesFilters['validity']
) {
  if (filter === 'all') return true
  if (filter === 'valid') return group.liveCount > 0
  if (filter === 'invalid') return group.liveCount === 0
  if (filter === 'key_missing') return group.entries.some(isPlatformEntryKeyInvalid)
  if (filter === 'configured_not_running') return group.entries.some((entry) => !entry.liveDetails)
  if (filter === 'missing_from_platform') {
    return group.entries.some((entry) => Boolean(entry.liveDetails) && entry.comparison === 'missing_from_platform')
  }
  return matchesValidity(group.comparison, filter)
}

function matchesSourceFilter(hasPlatform: boolean, hasLive: boolean, filter: AdminServicesFilters['source']) {
  if (filter === 'all') return true
  if (filter === 'platform') return hasPlatform
  if (filter === 'live') return hasLive
  return hasPlatform && hasLive
}

function valuesMatchKeyword(values: Array<string | null | undefined>, keyword: string) {
  if (!keyword) return true
  return values.some((value) => String(value || '').toLowerCase().includes(keyword))
}

function matchesPlatformFilters(entries: AdminPlatformChallengeEntry[], filters: AdminServicesFilters) {
  if (filters.key === 'no_key' && entries.some((entry) => !!entry.key && entry.key.trim() !== '')) return false
  if (filters.key !== 'all' && filters.key !== 'no_key' && !entries.some((entry) => entry.key === filters.key)) return false
  if (filters.enabled === 'enabled' && !entries.some((entry) => entry.enabled)) return false
  if (filters.enabled === 'disabled' && !entries.some((entry) => !entry.enabled)) return false
  if (filters.requiresKey === 'required' && !entries.some((entry) => entry.requiresKey)) return false
  if (filters.requiresKey === 'not_required' && !entries.some((entry) => !entry.requiresKey)) return false
  if (filters.keyAvailable === 'available' && !entries.some((entry) => entry.keyAvailable)) return false
  if (filters.keyAvailable === 'missing' && !entries.some((entry) => !entry.keyAvailable)) return false
  return true
}

export function getFilteredPlatformGroups(
  groups: AdminPlatformChallengeGroup[],
  filters: AdminServicesFilters,
  now = Date.now()
) {
  const keyword = filters.search.trim().toLowerCase()

  return groups.filter((group) => {
    if (!matchesPlatformGroupValidity(group, filters.validity)) return false
    if (!matchesSourceFilter(true, group.liveCount > 0, filters.source)) return false
    if (!matchesPlatformFilters(group.entries, filters)) return false

    if (filters.runtimeStatus !== 'all') {
      const hasRuntimeStatus = group.entries.some((entry) => {
        return getRuntimeStatusFromDetail(entry.liveDetails, null, undefined, now) === filters.runtimeStatus
      })
      if (!hasRuntimeStatus) return false
    }

    return valuesMatchKeyword([
      group.name,
      group.challenge?.title,
      group.event?.name,
      ...group.entries.map((entry) => entry.serviceName),
      ...group.entries.map((entry) => entry.key),
      ...group.entries.map((entry) => entry.keySource),
    ], keyword)
  })
}

export function getFilteredLiveRows(
  rows: AdminLiveServiceRow[],
  filters: AdminServicesFilters
) {
  const keyword = filters.search.trim().toLowerCase()

  return rows.filter((row) => {
    const hasPlatform = row.platformEntries.length > 0
    if (filters.validity === 'valid' && !hasPlatform) return false
    if (filters.validity === 'invalid' && hasPlatform) return false
    if (!['all', 'valid', 'invalid'].includes(filters.validity) && !matchesValidity(row.comparison, filters.validity)) return false
    if (!matchesSourceFilter(hasPlatform, true, filters.source)) return false
    if (filters.runtimeStatus !== 'all' && row.status !== filters.runtimeStatus) return false

    if (hasPlatform) {
      if (!matchesPlatformFilters(row.platformEntries, filters)) return false
    } else if (
      filters.key !== 'all' ||
      filters.enabled !== 'all' ||
      filters.requiresKey !== 'all' ||
      filters.keyAvailable !== 'all'
    ) {
      return false
    }

    return valuesMatchKeyword([
      row.name,
      row.challenge?.title,
      row.event?.name,
      row.details.runtime.container_id,
      row.details.challenge.type,
      ...row.platformEntries.map((entry) => entry.key),
      ...row.platformEntries.map((entry) => entry.keySource),
      ...row.matchedServiceRows.map((serviceRow) => serviceRow.service.key),
    ], keyword)
  })
}

export function getServicesSummary(
  groups: AdminPlatformChallengeGroup[],
  liveRows: AdminLiveServiceRow[]
): AdminServicesSummaryCounts {
  const invalidPlatformGroups = groups.filter(isPlatformGroupInvalid)

  return {
    platformGroups: groups.length,
    platformEntries: groups.reduce((count, group) => count + group.entries.length, 0),
    liveServices: liveRows.length,
    valid: groups.length - invalidPlatformGroups.length,
    invalid: invalidPlatformGroups.length,
    configuredNotRunning: groups.filter((group) => group.comparison === 'configured_not_running').length,
    runningUnregistered: liveRows.filter((row) => row.comparison === 'running_unregistered').length,
  }
}
