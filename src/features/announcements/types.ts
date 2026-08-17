import type {
  AnnouncementType,
  AnnouncementPriority,
  AnnouncementChannel,
  AnnouncementDisplayRule,
} from '@/features/admin/announcements/types'

export interface ClientAnnouncement {
  id: string
  title: string
  short_description?: string | null
  content: string
  banner_image_url?: string | null
  type: AnnouncementType
  priority: AnnouncementPriority
  channels: AnnouncementChannel[]
  popup_style: string
  display_rule: AnnouncementDisplayRule
  cooldown_hours: number
  is_dismissible: boolean
  cta_text?: string | null
  cta_link?: string | null
  cta_target?: string | null
  starts_at?: string | null
  ends_at?: string | null
  is_read?: boolean
  is_dismissed?: boolean
  last_seen_at?: string | null
  created_at: string
}

export interface AnnouncementLocalState {
  dismissedAt?: number
  readAt?: number
  sessionDismissed?: boolean
}
