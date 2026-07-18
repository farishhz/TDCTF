export type AdminTeamRow = {
  id: string
  name: string
  invite_code: string
  captain_user_id: string
  captain_username: string | null
  member_count: number
  created_at: string
  updated_at: string
}

export type AdminTeamMember = {
  user_id: string
  username: string
  role: 'captain' | 'member'
  joined_at: string
}
