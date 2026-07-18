import { supabase } from '@/lib/supabase/client'
import type { AdminTeamRow, AdminTeamMember } from '../types'

export async function getAdminTeams(params?: {
  search?: string
  sortBy?: 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'member_count'
  limit?: number
  offset?: number
}): Promise<{ teams: AdminTeamRow[]; totalCount: number }> {
  try {
    const search = params?.search?.trim() || ''
    const limit = params?.limit || 100
    const offset = params?.offset || 0
    const sortBy = params?.sortBy || 'newest'

    let query = supabase
      .from('teams')
      .select(`
        id,
        name,
        invite_code,
        captain_user_id,
        created_at,
        updated_at,
        captain:users!captain_user_id(username),
        team_members(user_id)
      `, { count: 'exact' })

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false })
    } else if (sortBy === 'oldest') {
      query = query.order('created_at', { ascending: true })
    } else if (sortBy === 'name_asc') {
      query = query.order('name', { ascending: true })
    } else if (sortBy === 'name_desc') {
      query = query.order('name', { ascending: false })
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching admin teams:', error)
      return { teams: [], totalCount: 0 }
    }

    const teams: AdminTeamRow[] = (data || []).map((row: any) => {
      return {
        id: row.id,
        name: row.name,
        invite_code: row.invite_code,
        captain_user_id: row.captain_user_id,
        captain_username: row.captain?.username || null,
        member_count: Array.isArray(row.team_members) ? row.team_members.length : 0,
        created_at: row.created_at,
        updated_at: row.updated_at
      }
    })

    if (sortBy === 'member_count') {
      teams.sort((a, b) => b.member_count - a.member_count)
    }

    const totalCount = count || 0
    const slicedTeams = teams.slice(offset, offset + limit)

    return {
      teams: slicedTeams,
      totalCount
    }
  } catch (err) {
    console.error('Error in getAdminTeams:', err)
    return { teams: [], totalCount: 0 }
  }
}

export async function adminGetTeamMembers(teamId: string): Promise<{ members: AdminTeamMember[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        user_id,
        joined_at,
        user:users(username),
        team:teams(captain_user_id)
      `)
      .eq('team_id', teamId)

    if (error) return { members: [], error: error.message }

    const members: AdminTeamMember[] = (data || []).map((row: any) => {
      const isCaptain = row.user_id === row.team?.captain_user_id
      return {
        user_id: row.user_id,
        username: row.user?.username || '',
        role: isCaptain ? 'captain' : 'member',
        joined_at: row.joined_at
      }
    })

    // Sort to place Captain first
    members.sort((a, b) => (a.role === 'captain' ? -1 : 1))

    return { members }
  } catch (err: any) {
    return { members: [], error: err.message }
  }
}

export async function adminRenameTeam(teamId: string, newName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await (supabase as any).rpc('update_team_profile', {
      p_team_id: teamId,
      p_new_name: newName,
      p_picture_url: null
    })
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function adminDeleteTeam(teamId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await (supabase as any).rpc('delete_team', {
      p_team_id: teamId
    })
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function adminTransferCaptain(teamId: string, newCaptainUserId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await (supabase as any).rpc('transfer_team_captain', {
      p_team_id: teamId,
      p_new_captain_user_id: newCaptainUserId
    })
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function adminKickMember(teamId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await (supabase as any).rpc('kick_team_member', {
      p_team_id: teamId,
      p_user_id: userId
    })
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function adminRegenerateInviteCode(teamId: string): Promise<{ invite_code?: string; error?: string }> {
  try {
    const { data, error } = await (supabase as any).rpc('regenerate_team_invite_code', {
      p_team_id: teamId
    })
    if (error) return { error: error.message }
    return { invite_code: data as string }
  } catch (err: any) {
    return { error: err.message }
  }
}
