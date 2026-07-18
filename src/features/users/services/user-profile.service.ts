import { PostgrestSingleResponse } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { User, ChallengeWithSolve } from '@/shared/types'
import type { UserEventAccess } from '../types'

function callUserRpc<T = any>(name: string, args?: Record<string, unknown>) {
  return (supabase as any).rpc(name, args) as Promise<PostgrestSingleResponse<T>>
}

export type UserDetail = {
  id: string
  username: string
  rank: number | null
  score: number
  picture?: string | null
  profile_picture_url?: string | null
  bio?: string
  sosmed?: Record<string, string>
  created_at?: string | null
  last_login_at?: string | null
  solved_challenges: ChallengeWithSolve[]
  flag_stats: { correct_submissions: number; incorrect_submissions: number }
  tags?: string[] | null
}

export type UserProfileLite = {
  id: string
  username: string
  picture?: string | null
  profile_picture_url?: string | null
  solved_event_ids: string[]
  has_main_solved: boolean
}

function normalizeJoinMode(value: unknown): UserEventAccess['join_mode'] {
  return value === 'request' || value === 'key' ? value : 'open'
}

const normalizeTimestamp = (value?: string | null): string | null => {
  if (!value) return null
  let normalized = value.trim()
  if (normalized.includes(' ') && !normalized.includes('T')) {
    normalized = normalized.replace(' ', 'T')
  }
  if (/([+-]\d{2})$/.test(normalized)) {
    normalized = normalized.replace(/([+-]\d{2})$/, '$1:00')
  } else if (/([+-]\d{2})(\d{2})$/.test(normalized)) {
    normalized = normalized.replace(/([+-]\d{2})(\d{2})$/, '$1:$2')
  }
  return normalized
}

export async function getUserDetail(userId: string, eventId?: string | null, eventMode?: string): Promise<UserDetail | null> {
  try {
    const { data, error } = await callUserRpc('detail_user', {
      p_id: userId,
      p_event_id: eventId ?? null,
      p_event_mode: eventMode ?? (eventId ? 'equals' : 'any')
    })
    if (error || !data || !data.success) {
      console.error('Error fetching user detail:', error || data?.message)
      return null
    }
    return {
      id: data.user.id,
      username: data.user.username,
      rank: data.user.rank ?? null,
      score: data.user.score ?? 0,
      picture: data.user.picture ?? null,
      profile_picture_url: data.user.profile_picture_url ?? null,
      bio: data.user.bio ?? '',
      sosmed: data.user.sosmed ?? {},
      created_at: normalizeTimestamp(data.user.created_at),
      last_login_at: normalizeTimestamp(data.user.last_login_at),
      solved_challenges: (data.solved_challenges || []).map((c: any) => ({
        id: c.challenge_id,
        title: c.title,
        category: c.category,
        points: c.points,
        difficulty: c.difficulty,
        is_solved: true,
        solved_at: c.solved_at,
      })),
      flag_stats: {
        correct_submissions: data.flag_stats?.correct_submissions ?? 0,
        incorrect_submissions: data.flag_stats?.incorrect_submissions ?? 0,
      },
      tags: data.user.tags ?? [],
    }
  } catch (error) {
    console.error('Error fetching user detail:', error)
    return null
  }
}

export type UserDetailLite = {
  rank: number | null
  solved_count: number
}

export async function getUserDetailLite(
  userId: string,
  eventId?: string | null,
  eventMode?: string
): Promise<UserDetailLite | null> {
  try {
    const { data, error } = await callUserRpc('detail_user_lite', {
      p_id: userId,
      p_event_id: eventId ?? null,
      p_event_mode: eventMode ?? (eventId ? 'equals' : 'any'),
    })
    if (error || !data || !data.success) {
      console.error('Error fetching user detail lite:', error || data?.message)
      return null
    }
    return {
      rank: data.rank ?? null,
      solved_count: data.solved_count ?? 0,
    }
  } catch (error) {
    console.error('Error fetching user detail lite:', error)
    return null
  }
}

export async function getUserProfileLite(userId: string): Promise<UserProfileLite | null> {
  try {
    const { data, error } = await callUserRpc('get_user_profile', { p_id: userId })
    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
    const row = Array.isArray(data) ? data[0] : data
    if (!row) return null

    const solvedIds = Array.isArray(row.solved_event_ids)
      ? row.solved_event_ids.filter(Boolean).map((id: any) => String(id))
      : []

    return {
      id: row.id,
      username: row.username,
      picture: row.picture ?? null,
      profile_picture_url: row.profile_picture_url ?? null,
      solved_event_ids: solvedIds,
      has_main_solved: !!row.has_main_solved,
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export async function getUserEventAccess(userId: string): Promise<UserEventAccess[]> {
  try {
    const { data, error } = await callUserRpc('get_user_event_access', {
      p_user_id: userId,
    })

    if (error) {
      console.error('Error fetching user event access:', error)
      return []
    }

    return ((data as any[]) || []).map((row) => ({
      event_id: String(row.event_id),
      event_name: String(row.event_name || 'Untitled event'),
      join_mode: normalizeJoinMode(row.join_mode),
      is_member: Boolean(row.is_member),
      request_status: row.request_status === 'pending' || row.request_status === 'approved' || row.request_status === 'rejected'
        ? row.request_status
        : null,
      has_solve: Boolean(row.has_solve),
      challenge_count: Number(row.challenge_count || 0),
      start_time: normalizeTimestamp(row.start_time),
      end_time: normalizeTimestamp(row.end_time),
      always_show_challenges: Boolean(row.always_show_challenges),
      image_url: row.image_url ?? null,
    }))
  } catch (error) {
    console.error('Error fetching user event access:', error)
    return []
  }
}

export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (error) {
      console.error('Error fetching user by username:', error)
      return null
    }

    return {
      id: data.id,
      username: data.username,
      score: 0,
      is_admin: (data as any).is_admin ?? undefined,
      created_at: data.created_at ?? '',
      updated_at: data.updated_at ?? '',
      profile_picture_url: data.profile_picture_url ?? null,
      picture: data.profile_picture_url ?? undefined,
    }
  } catch (error) {
    console.error('Error fetching user by username:', error)
    return null
  }
}

export async function updateUsername(userId: string, newUsername: string): Promise<{ error: string | null, username?: string }> {
  try {
    const { data, error } = await callUserRpc('update_username', {
      p_id: userId,
      p_username: newUsername
    })
    if (error || !data) {
      return { error: error?.message || 'Failed to update username' }
    }
    if (!data.success) {
      return { error: data.message || 'Failed to update username' }
    }
    return { error: null, username: data.username }
  } catch (error) {
    return { error: 'Failed to update username' }
  }
}

export async function updateBio(userId: string, newBio: string): Promise<{ error: string | null, bio?: string }> {
  try {
    const { data, error } = await callUserRpc('update_bio', {
      p_id: userId,
      p_bio: newBio
    })
    if (error || !data) {
      return { error: error?.message || 'Failed to update bio' }
    }
    if (!data.success) {
      return { error: data.message || 'Failed to update bio' }
    }
    return { error: null, bio: data.bio }
  } catch (error) {
    return { error: 'Failed to update bio' }
  }
}

export async function updateSosmed(userId: string, newSosmed: Record<string, string>): Promise<{ error: string | null, sosmed?: Record<string, string> }> {
  try {
    const { data, error } = await callUserRpc('update_sosmed', {
      p_id: userId,
      p_sosmed: newSosmed
    })
    if (error || !data) {
      return { error: error?.message || 'Failed to update sosmed' }
    }
    if (!data.success) {
      return { error: data.message || 'Failed to update sosmed' }
    }
    return { error: null, sosmed: data.sosmed }
  } catch (error) {
    return { error: 'Failed to update sosmed' }
  }
}

export async function updateProfilePicture(userId: string, profilePictureUrl: string): Promise<{ error: string | null, profile_picture_url?: string | null }> {
  try {
    const { data, error } = await callUserRpc('update_profile_picture', {
      p_id: userId,
      p_profile_picture_url: profilePictureUrl
    })
    if (error || !data) {
      return { error: error?.message || 'Failed to update profile picture' }
    }
    if (!data.success) {
      return { error: data.message || 'Failed to update profile picture' }
    }
    return { error: null, profile_picture_url: data.profile_picture_url ?? null }
  } catch (error) {
    return { error: 'Failed to update profile picture' }
  }
}


