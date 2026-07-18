import { ChallengeWithSolve } from '@/shared/types'

export type UserDetail = {
  id: string
  username: string
  rank: number | null
  score: number
  picture?: string | null
  profile_picture_url?: string | null
  bio?: string | null
  sosmed?: {
    linkedin?: string
    instagram?: string
    discord?: string
    web?: string
    [key: string]: string | undefined
  } | null
  created_at?: string | null
  last_login_at?: string | null
  solved_challenges: ChallengeWithSolve[]
  flag_stats?: { correct_submissions: number; incorrect_submissions: number } | null
  tags?: string[] | null
}

export type UserProfileProps = {
  userId: string | null
  loading: boolean
  error?: string | null
  onBack?: () => void
  isCurrentUser?: boolean
}

export type Badge = {
  label: string
  color: string
  icon: JSX.Element
}

export type TeamInfo = {
  team: any
  members: any[]
}

export type UserEventAccess = {
  event_id: string
  event_name: string
  join_mode: 'open' | 'request' | 'key'
  is_member: boolean
  request_status: 'pending' | 'approved' | 'rejected' | null
  has_solve: boolean
  challenge_count: number
  start_time?: string | null
  end_time?: string | null
  always_show_challenges?: boolean | null
  image_url?: string | null
}
