import type { Event, EventJoinRequestRow, EventMemberRow } from '@/shared/types'
import type { UserLite } from '@/features/admin/services/admin.service'

export type { Event, EventJoinRequestRow, EventMemberRow, UserLite }

export type ChallengeLite = {
  id: string
  title: string
  description?: string | null
  category?: string
  difficulty?: string
  event_id?: string | null
  is_active?: boolean
  is_maintenance?: boolean
  points?: number
  services?: string[]
  has_questions?: boolean
}

export type FilterState = {
  category: string
  difficulty: string
  search: string
  sourceEventId: string
  visibility: 'all' | 'active' | 'inactive' | 'maintenance'
  service: 'all' | 'services' | 'placeholder' | 'tasks'
  sortBy: string
}

export type EventJoinMode = 'open' | 'request' | 'key'

export type EventFormData = {
  name: string
  description: string
  join_mode: EventJoinMode
  join_key: string
  start_time: string
  end_time: string
  always_show_challenges: boolean
  image_url: string
}
