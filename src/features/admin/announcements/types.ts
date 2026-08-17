export type AnnouncementType = 'info' | 'event' | 'maintenance' | 'update' | 'warning'
export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'critical'
export type AnnouncementChannel = 'modal' | 'top_banner' | 'floating_card' | 'notification'
export type AnnouncementStatus = 'draft' | 'scheduled' | 'published' | 'archived'
export type AnnouncementComputedStatus = 'draft' | 'scheduled' | 'published' | 'expired' | 'archived'
export type AnnouncementTargetType = 'all' | 'role' | 'tags' | 'event' | 'team' | 'specific_users'
export type AnnouncementDisplayRule = 'until_read' | 'once_per_session' | 'first_visit' | 'always'

export interface AnnouncementItem {
  id: string
  title: string
  short_description?: string | null
  content: string
  banner_image_url?: string | null
  type: AnnouncementType
  priority: AnnouncementPriority
  channels: AnnouncementChannel[]
  popup_style: string
  status: AnnouncementStatus
  computed_status?: AnnouncementComputedStatus
  target_type: AnnouncementTargetType
  target_roles?: string[]
  target_tags?: string[]
  target_event_id?: string | null
  event_title?: string | null
  target_team_ids?: string[]
  target_user_ids?: string[]
  starts_at?: string | null
  ends_at?: string | null
  display_rule: AnnouncementDisplayRule
  cooldown_hours: number
  is_dismissible: boolean
  cta_text?: string | null
  cta_link?: string | null
  cta_target?: string | null
  views_count: number
  reads_count: number
  created_by?: string | null
  author_username?: string | null
  created_at: string
  updated_at?: string | null
}

export interface AnnouncementStats {
  total: number
  published: number
  scheduled: number
  active: number
  expired: number
  draft: number
  total_views: number
  total_reads: number
}

export interface AnnouncementFormData {
  title: string
  short_description: string
  content: string
  banner_image_url: string
  type: AnnouncementType
  priority: AnnouncementPriority
  channels: AnnouncementChannel[]
  popup_style: string
  status: AnnouncementStatus
  target_type: AnnouncementTargetType
  target_roles: string[]
  target_tags: string[]
  target_event_id: string | null
  target_team_ids: string[]
  target_user_ids: string[]
  starts_at: string
  ends_at: string
  display_rule: AnnouncementDisplayRule
  cooldown_hours: number
  is_dismissible: boolean
  cta_text: string
  cta_link: string
  cta_target: '_self' | '_blank'
}
