import { supabase } from '@/lib/supabase/client'

export type AdminAuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'PUBLISH'
  | 'UNPUBLISH'
  | 'GRANT_ADMIN'
  | 'REVOKE_ADMIN'
  | 'ADD_MEMBER'
  | 'REMOVE_MEMBER'
  | 'APPROVE'
  | 'REJECT'

export interface AuditLogEntry {
  id: string
  actor_user_id: string | null
  actor_snapshot: string
  actor_role: string
  action: AdminAuditAction | string
  entity_type: string
  entity_id: string | null
  changed_fields: string[]
  before_data: Record<string, unknown> | null
  after_data: Record<string, unknown> | null
  metadata: Record<string, unknown>
  ip_address: string | null
  user_agent: string | null
  created_at: string
  total_count: number
}

export interface AuthAuditLogEntry {
  id: string
  created_at: string
  ip_address: string | null
  payload: Record<string, unknown>
  user_id: string | null
  username: string | null
  email: string | null
}

export type AuditLogFilters = {
  actorUserId?: string | null
  actorSearch?: string | null
  actions?: string[] | null
  entityType?: string | null
  entityId?: string | null
  from?: string | null
  to?: string | null
}

export type AuthAuditLogFilters = {
  actions?: string[] | null
}

function callAuditRpc(args: {
  p_limit: number
  p_offset: number
  p_actor_user_id: string | null
  p_actor_search: string | null
  p_actions: string[] | null
  p_entity_type: string | null
  p_entity_id: string | null
  p_from: string | null
  p_to: string | null
}) {
  return (supabase.rpc as any)('get_admin_audit_logs', args) as ReturnType<typeof supabase.rpc>
}

function callAuthAuditRpc(args: {
  p_limit: number
  p_offset: number
  p_action_filters: string[] | null
}) {
  return (supabase.rpc as any)('get_auth_audit_logs', args) as ReturnType<typeof supabase.rpc>
}

function callAuditEntitySnapshotRpc(args: {
  p_entity_type: string
  p_entity_id: string
}) {
  return (supabase.rpc as any)('get_admin_audit_entity_snapshot', args) as ReturnType<typeof supabase.rpc>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeAuditLog(row: any): AuditLogEntry {
  return {
    id: String(row.id || ''),
    actor_user_id: row.actor_user_id ?? null,
    actor_snapshot: String(row.actor_snapshot || 'Unknown admin'),
    actor_role: String(row.actor_role || 'admin'),
    action: String(row.action || ''),
    entity_type: String(row.entity_type || ''),
    entity_id: row.entity_id ?? null,
    changed_fields: Array.isArray(row.changed_fields) ? row.changed_fields.map(String) : [],
    before_data: isRecord(row.before_data) ? row.before_data : null,
    after_data: isRecord(row.after_data) ? row.after_data : null,
    metadata: isRecord(row.metadata) ? row.metadata : {},
    ip_address: row.ip_address ?? null,
    user_agent: row.user_agent ?? null,
    created_at: String(row.created_at || ''),
    total_count: Number(row.total_count || 0),
  }
}

function normalizeAuthAuditLog(row: any): AuthAuditLogEntry {
  return {
    id: String(row.id || ''),
    created_at: String(row.created_at || ''),
    ip_address: row.ip_address ?? null,
    payload: isRecord(row.payload) ? row.payload : {},
    user_id: row.user_id ?? null,
    username: row.username ?? null,
    email: row.email ?? null,
  }
}

export async function getAuditLogs(
  limit = 50,
  offset = 0,
  filters: AuditLogFilters = {}
): Promise<{ logs: AuditLogEntry[]; totalCount: number }> {
  const { data, error } = await callAuditRpc({
    p_limit: limit,
    p_offset: offset,
    p_actor_user_id: filters.actorUserId || null,
    p_actor_search: filters.actorSearch || null,
    p_actions: filters.actions && filters.actions.length > 0 ? filters.actions : null,
    p_entity_type: filters.entityType || null,
    p_entity_id: filters.entityId || null,
    p_from: filters.from || null,
    p_to: filters.to || null,
  })

  if (error) {
    console.error('Error fetching admin audit logs RPC:', error)
    return { logs: [], totalCount: 0 }
  }

  const logs = (data ?? []).map(normalizeAuditLog)
  return {
    logs,
    totalCount: logs[0]?.total_count ?? 0,
  }
}

export async function getAuthAuditLogs(
  limit = 50,
  offset = 0,
  filters: AuthAuditLogFilters = {}
): Promise<AuthAuditLogEntry[]> {
  const { data, error } = await callAuthAuditRpc({
    p_limit: limit,
    p_offset: offset,
    p_action_filters: filters.actions && filters.actions.length > 0 ? filters.actions : null,
  })

  if (error) {
    console.error('Error fetching auth audit logs RPC:', error)
    return []
  }

  return (data ?? []).map(normalizeAuthAuditLog)
}

export async function getAuditEntitySnapshot(
  entityType: string,
  entityId: string | null
): Promise<Record<string, unknown> | null> {
  if (!entityId) return null

  const { data, error } = await callAuditEntitySnapshotRpc({
    p_entity_type: entityType,
    p_entity_id: entityId,
  })

  if (error) {
    console.error('Error fetching admin audit entity snapshot RPC:', error)
    return null
  }

  return isRecord(data) ? data : null
}

// Flag Submission Stats

export interface FlagSubmissionStatsEntry {
  user_id: string
  username: string
  challenge_id: string
  challenge_title: string
  challenge_category: string
  incorrect_attempts: number
  is_solved: boolean
  last_attempt_at: string
  solved_at: string | null
  total_count: number
}

export type FlagSubmissionStatsFilters = {
  status?: string | null
  search?: string | null
}

function callFlagSubmissionStatsRpc(args: {
  p_limit: number
  p_offset: number
  p_status: string | null
  p_search: string | null
}) {
  return (supabase.rpc as any)('get_flag_submission_stats', args) as ReturnType<typeof supabase.rpc>
}

function normalizeFlagSubmissionStats(row: any): FlagSubmissionStatsEntry {
  return {
    user_id: String(row.user_id || ''),
    username: String(row.username || ''),
    challenge_id: String(row.challenge_id || ''),
    challenge_title: String(row.challenge_title || ''),
    challenge_category: String(row.challenge_category || ''),
    incorrect_attempts: Number(row.incorrect_attempts || 0),
    is_solved: Boolean(row.is_solved),
    last_attempt_at: String(row.last_attempt_at || ''),
    solved_at: row.solved_at ? String(row.solved_at) : null,
    total_count: Number(row.total_count || 0),
  }
}

export async function getFlagSubmissionStats(
  limit = 50,
  offset = 0,
  filters: FlagSubmissionStatsFilters = {}
): Promise<{ entries: FlagSubmissionStatsEntry[]; totalCount: number }> {
  const { data, error } = await callFlagSubmissionStatsRpc({
    p_limit: limit,
    p_offset: offset,
    p_status: filters.status || null,
    p_search: filters.search || null,
  })

  if (error) {
    console.error('Error fetching flag submission stats RPC:', error)
    return { entries: [], totalCount: 0 }
  }

  const entries = (data ?? []).map(normalizeFlagSubmissionStats)
  return {
    entries,
    totalCount: entries[0]?.total_count ?? 0,
  }
}
