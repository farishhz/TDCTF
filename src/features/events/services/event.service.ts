import { supabase } from '@/lib/supabase/client'
import { Event, EventJoinRequestRow, EventJoinSettings, EventMembershipStatus, EventMemberRow } from '@/shared/types'

function normalizeEventJoinMode(value: string | null): Event['join_mode'] {
  if (value === 'open' || value === 'request' || value === 'key') return value
  return undefined
}

function normalizeEvent(row: any): Event {
  return {
    ...row,
    join_mode: normalizeEventJoinMode(row.join_mode),
    created_at: row.created_at ?? undefined,
    updated_at: row.updated_at ?? undefined,
  }
}

export async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('start_time', { ascending: true, nullsFirst: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching events:', error)
    return []
  }

  return (data || []).map(normalizeEvent)
}

export async function addEvent(payload: {
  name: string
  description?: string | null
  start_time?: string | null
  end_time?: string | null
  always_show_challenges?: boolean | null
  image_url?: string | null
  is_team_event?: boolean | null
  writeup_deadline?: string | null
  max_team_members?: number | null
}) {
  const { data, error } = await supabase.rpc('add_event', {
    p_name: payload.name,
    p_description: payload.description ?? '',
    p_start_time: payload.start_time ?? null,
    p_end_time: payload.end_time ?? null,
    p_always_show_challenges: payload.always_show_challenges ?? false,
    p_image_url: payload.image_url ?? null,
    p_is_team_event: payload.is_team_event ?? false,
    p_writeup_deadline: payload.writeup_deadline ?? null,
    p_max_team_members: payload.max_team_members ?? null,
  } as any)

  if (error) {
    console.error('Error adding event:', error)
    throw error
  }

  return data
}

export async function updateEvent(eventId: string, payload: {
  name?: string | null
  description?: string | null
  start_time?: string | null
  end_time?: string | null
  always_show_challenges?: boolean | null
  image_url?: string | null
  is_team_event?: boolean | null
  writeup_deadline?: string | null
  max_team_members?: number | null
}) {
  const { data, error } = await supabase.rpc('update_event', {
    p_event_id: eventId,
    p_name: payload.name ?? null,
    p_description: payload.description ?? null,
    p_start_time: payload.start_time ?? null,
    p_end_time: payload.end_time ?? null,
    p_always_show_challenges: payload.always_show_challenges ?? null,
    p_image_url: payload.image_url ?? null,
    p_is_team_event: payload.is_team_event ?? null,
    p_writeup_deadline: payload.writeup_deadline ?? null,
    p_max_team_members: payload.max_team_members ?? null,
  } as any)

  if (error) {
    console.error('Error updating event:', error)
    throw error
  }

  return data
}

export async function deleteEvent(eventId: string) {
  const { data, error } = await supabase.rpc('delete_event', {
    p_event_id: eventId,
  })

  if (error) {
    console.error('Error deleting event:', error)
    throw error
  }

  return data
}

export async function setChallengesEvent(eventId: string | null, challengeIds: string[]) {
  const { data, error } = await supabase.rpc('set_challenges_event', {
    p_event_id: eventId,
    p_challenge_ids: challengeIds,
  } as any)

  if (error) {
    console.error('Error setting challenges event:', error)
    throw error
  }

  return data
}

export async function getActiveEvents(now: string = new Date().toISOString()): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .or(`start_time.is.null,start_time.lte.${now}`)
    .or(`end_time.is.null,end_time.gte.${now}`)
    .order('start_time', { ascending: true, nullsFirst: true })

  if (error) {
    console.error('Error fetching active events:', error)
    return []
  }

  return (data || []).map(normalizeEvent)
}

function eventHasStarted(event: Event, referenceTimeMs: number) {
  if (event.always_show_challenges) {
    return true
  }

  if (!event.start_time) {
    return true
  }

  const startMs = Date.parse(event.start_time)
  if (Number.isNaN(startMs)) {
    return true
  }

  return startMs <= referenceTimeMs
}

export function filterStartedEvents(events: Event[], referenceTimeMs = Date.now()) {
  return events.filter((event) => eventHasStarted(event, referenceTimeMs))
}

export async function getEventJoinSettings(eventId: string): Promise<EventJoinSettings | null> {
  const { data, error } = await supabase.rpc('get_event_join_settings', {
    p_event_id: eventId,
  })

  if (error) {
    console.error('Error fetching event join settings:', error)
    return null
  }

  return (data as unknown as EventJoinSettings) || null
}

export async function getMyEventMembership(eventId: string): Promise<EventMembershipStatus | null> {
  const { data, error } = await supabase.rpc('get_my_event_membership', {
    p_event_id: eventId,
  })

  if (error) {
    console.error('Error fetching my event membership:', error)
    return null
  }

  return (data as unknown as EventMembershipStatus) || null
}

export async function getAllMyEventMemberships(): Promise<EventMembershipStatus[]> {
  const { data, error } = await supabase.rpc('get_all_my_event_memberships')

  if (error) {
    console.error('Error fetching all event memberships:', error)
    return []
  }

  return (data as unknown as EventMembershipStatus[]) || []
}

export async function joinEvent(eventId: string, joinKey?: string | null, note?: string | null) {
  const { data, error } = await supabase.rpc('join_event', {
    p_event_id: eventId,
    p_join_key: joinKey ?? null,
    p_note: note ?? null,
  } as any)

  if (error) {
    console.error('Error joining event:', error)
    throw error
  }

  return data as unknown as { success: boolean; status?: string; message?: string }
}

export async function setEventJoinSettings(
  eventId: string,
  joinMode: 'open' | 'request' | 'key',
  joinKey?: string | null
) {
  const { data, error } = await supabase.rpc('set_event_join_settings', {
    p_event_id: eventId,
    p_join_mode: joinMode,
    p_join_key: joinKey ?? null,
  } as any)

  if (error) {
    console.error('Error setting event join settings:', error)
    throw error
  }

  return data as unknown as EventJoinSettings
}

export async function regenerateEventJoinKey(eventId: string): Promise<string> {
  const { data, error } = await supabase.rpc('regenerate_event_join_key', {
    p_event_id: eventId,
  })

  if (error) {
    console.error('Error regenerating event join key:', error)
    throw error
  }

  return String(data || '')
}

export async function listEventJoinRequests(
  eventId: string,
  status: 'pending' | 'approved' | 'rejected' | 'any' = 'pending'
): Promise<EventJoinRequestRow[]> {
  const { data, error } = await supabase.rpc('list_event_join_requests', {
    p_event_id: eventId,
    p_status: status,
  })

  if (error) {
    console.error('Error listing event join requests:', error)
    return []
  }

  return (data || []) as unknown as EventJoinRequestRow[]
}

export async function reviewEventJoinRequest(requestId: string, approve: boolean) {
  const { data, error } = await supabase.rpc('review_event_join_request', {
    p_request_id: requestId,
    p_approve: approve,
  })

  if (error) {
    console.error('Error reviewing event join request:', error)
    throw error
  }

  return data as unknown as { success: boolean; status?: 'approved' | 'rejected'; message?: string }
}

export async function listEventMembers(eventId: string): Promise<EventMemberRow[]> {
  const { data, error } = await supabase.rpc('list_event_members', {
    p_event_id: eventId,
  })

  if (error) {
    console.error('Error listing event members:', error)
    return []
  }

  return (data || []) as unknown as EventMemberRow[]
}

export async function adminAddEventMember(eventId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('admin_add_event_member', {
    p_event_id: eventId,
    p_user_id: userId,
  })

  if (error) {
    console.error('Error adding event member:', error)
    throw error
  }

  return Boolean(data)
}

export async function getSolvedEventIds(): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_solved_event_ids')

  if (error) {
    console.error('Error fetching solved event IDs:', error)
    return []
  }

  return ((data || []) as { event_id: string }[]).map((d) => String(d.event_id))
}

export async function adminRemoveEventMember(eventId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('admin_remove_event_member', {
    p_event_id: eventId,
    p_user_id: userId,
  })

  if (error) {
    console.error('Error removing event member:', error)
    throw error
  }

  return Boolean(data)
}

export async function joinTeamEvent(eventId: string, registrationToken?: string | null): Promise<{ success: boolean; message: string }> {
  const { data, error } = await (supabase as any).rpc('join_team_event', {
    p_event_id: eventId,
    p_registration_token: registrationToken ?? null,
  })

  if (error) {
    console.error('Error joining team event:', error)
    throw error
  }

  return (data as any) || { success: false, message: 'Gagal mendaftarkan tim.' }
}

export async function reviewTeamEvent(eventId: string, teamId: string, approve: boolean): Promise<{ success: boolean; status?: string }> {
  const { data, error } = await (supabase as any).rpc('review_team_event', {
    p_event_id: eventId,
    p_team_id: teamId,
    p_approve: approve,
  })

  if (error) {
    console.error('Error reviewing team event:', error)
    throw error
  }

  return (data as any) || { success: false }
}

export interface EventTeamRow {
  team_id: string
  team_name: string
  picture_url?: string | null
  status: 'pending' | 'approved' | 'rejected'
  requested_at: string
  requested_by_username: string
  reviewed_at?: string | null
  member_count: number
}

export async function listEventTeams(eventId: string): Promise<EventTeamRow[]> {
  const { data, error } = await (supabase as any).rpc('list_event_teams', {
    p_event_id: eventId,
  })

  if (error) {
    console.error('Error listing event teams:', error)
    return []
  }

  return (data as unknown as EventTeamRow[]) || []
}

export interface MyTeamEventStatus {
  success: boolean
  has_team: boolean
  team_id?: string | null
  team_name?: string | null
  is_captain: boolean
  registration_status?: 'pending' | 'approved' | 'rejected' | null
  is_roster_member: boolean
  message?: string
}

export async function getMyTeamEventStatus(eventId: string): Promise<MyTeamEventStatus> {
  const { data, error } = await (supabase as any).rpc('get_my_team_event_status', {
    p_event_id: eventId,
  })

  if (error) {
    console.error('Error fetching my team event status:', error)
    return { success: false, has_team: false, is_captain: false, is_roster_member: false }
  }

  return (data as unknown as MyTeamEventStatus) || { success: false, has_team: false, is_captain: false, is_roster_member: false }
}

export async function submitEventWriteup(eventId: string, fileUrl: string, filename: string): Promise<{ success: boolean; message: string }> {
  const { data, error } = await (supabase as any).rpc('submit_event_writeup', {
    p_event_id: eventId,
    p_file_url: fileUrl,
    p_filename: filename,
  })

  if (error) {
    console.error('Error submitting writeup:', error)
    throw error
  }

  return (data as any) || { success: false, message: 'Gagal mengumpulkan writeup.' }
}

export async function reviewEventWriteup(writeupId: string, status: string, scoreAdjustment: number, adminNotes: string): Promise<{ success: boolean; message: string }> {
  const { data, error } = await (supabase as any).rpc('review_event_writeup', {
    p_writeup_id: writeupId,
    p_status: status,
    p_score_adjustment: scoreAdjustment,
    p_admin_notes: adminNotes,
  })

  if (error) {
    console.error('Error reviewing writeup:', error)
    throw error
  }

  return (data as any) || { success: false, message: 'Gagal mereview writeup.' }
}

export interface EventWriteupRow {
  writeup_id: string
  team_id?: string | null
  team_name?: string | null
  user_id: string
  username: string
  file_url: string
  filename: string
  submitted_at: string
  status: 'pending' | 'reviewed'
  score_adjustment: number
  admin_notes: string
}

export async function listEventWriteups(eventId: string): Promise<EventWriteupRow[]> {
  const { data, error } = await (supabase as any).rpc('list_event_writeups', {
    p_event_id: eventId,
  })

  if (error) {
    console.error('Error listing event writeups:', error)
    return []
  }

  return (data as unknown as EventWriteupRow[]) || []
}

export interface MyTeamWriteupStatus {
  success: boolean
  has_submitted: boolean
  id?: string
  file_url?: string
  filename?: string
  submitted_at?: string
  status?: 'pending' | 'reviewed'
  score_adjustment?: number
  admin_notes?: string
  message?: string
}

export async function getMyTeamWriteup(eventId: string): Promise<MyTeamWriteupStatus> {
  const { data, error } = await (supabase as any).rpc('get_my_team_writeup', {
    p_event_id: eventId,
  })

  if (error) {
    console.error('Error fetching my team writeup:', error)
    return { success: false, has_submitted: false }
  }

  return (data as unknown as MyTeamWriteupStatus) || { success: false, has_submitted: false }
}

export async function adminGenerateTeamToken(eventId: string, teamId: string): Promise<{ success: boolean; token?: string; message?: string }> {
  const { data, error } = await (supabase as any).rpc('admin_generate_team_token', {
    p_event_id: eventId,
    p_team_id: teamId,
  })

  if (error) {
    console.error('Error generating team token:', error)
    return { success: false, message: error.message }
  }

  return { success: true, token: data as string }
}

export interface UnregisteredTeamRow {
  id: string
  name: string
  captain_username?: string
}

export async function listUnregisteredTeams(eventId: string): Promise<UnregisteredTeamRow[]> {
  const { data, error } = await (supabase as any).rpc('list_unregistered_teams', {
    p_event_id: eventId,
  })

  if (error) {
    console.error('Error listing unregistered teams:', error)
    return []
  }

  return (data as unknown as UnregisteredTeamRow[]) || []
}
