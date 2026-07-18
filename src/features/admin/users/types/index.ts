export type UserSocialLinks = Record<string, unknown> | null

export type AdminUserRow = {
  id: string
  username: string
  email: string | null
  is_admin: boolean
  bio: string | null
  sosmed: UserSocialLinks
  profile_picture_url: string | null
  tags: string[]
  banned_until: string | null
  ban_reason: string | null
  created_at: string
  updated_at: string
}
