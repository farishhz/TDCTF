import { supabase } from '@/lib/supabase/client'
import type { 
  AnnouncementItem, 
  AnnouncementStats, 
  AnnouncementFormData 
} from '../types'

const client = supabase as any

export async function getAdminAnnouncements(
  search = '',
  status = '',
  type = '',
  limit = 50,
  offset = 0
): Promise<AnnouncementItem[]> {
  const { data, error } = await client.rpc('admin_get_announcements', {
    p_search: search || null,
    p_status: status || null,
    p_type: type || null,
    p_limit: limit,
    p_offset: offset,
  })

  if (error) {
    console.error('Error fetching admin announcements:', error)
    throw new Error(error.message)
  }

  return (data || []) as unknown as AnnouncementItem[]
}

export async function getAdminAnnouncementStats(): Promise<AnnouncementStats> {
  const { data, error } = await client.rpc('admin_get_announcement_stats')

  if (error) {
    console.error('Error fetching announcement stats:', error)
    return {
      total: 0,
      published: 0,
      scheduled: 0,
      active: 0,
      expired: 0,
      draft: 0,
      total_views: 0,
      total_reads: 0,
    }
  }

  return data as unknown as AnnouncementStats
}

export async function createAnnouncement(formData: AnnouncementFormData): Promise<string> {
  const { data, error } = await client.rpc('admin_create_announcement', {
    p_title: formData.title,
    p_short_description: formData.short_description || null,
    p_content: formData.content,
    p_banner_image_url: formData.banner_image_url || null,
    p_type: formData.type,
    p_priority: formData.priority,
    p_channels: formData.channels,
    p_popup_style: formData.popup_style,
    p_status: formData.status,
    p_target_type: formData.target_type,
    p_target_roles: formData.target_roles,
    p_target_tags: formData.target_tags,
    p_target_event_id: formData.target_event_id || null,
    p_starts_at: formData.starts_at ? new Date(formData.starts_at).toISOString() : new Date().toISOString(),
    p_ends_at: formData.ends_at ? new Date(formData.ends_at).toISOString() : null,
    p_display_rule: formData.display_rule,
    p_cooldown_hours: formData.cooldown_hours,
    p_is_dismissible: formData.is_dismissible,
    p_cta_text: formData.cta_text || null,
    p_cta_link: formData.cta_link || null,
    p_cta_target: formData.cta_target || '_self',
  })

  if (error) {
    console.error('Error creating announcement:', error)
    throw new Error(error.message)
  }

  return data as string
}

export async function updateAnnouncement(id: string, formData: AnnouncementFormData): Promise<boolean> {
  const { data, error } = await client.rpc('admin_update_announcement', {
    p_id: id,
    p_title: formData.title,
    p_short_description: formData.short_description || null,
    p_content: formData.content,
    p_banner_image_url: formData.banner_image_url || null,
    p_type: formData.type,
    p_priority: formData.priority,
    p_channels: formData.channels,
    p_popup_style: formData.popup_style,
    p_status: formData.status,
    p_target_type: formData.target_type,
    p_target_roles: formData.target_roles,
    p_target_tags: formData.target_tags,
    p_target_event_id: formData.target_event_id || null,
    p_starts_at: formData.starts_at ? new Date(formData.starts_at).toISOString() : new Date().toISOString(),
    p_ends_at: formData.ends_at ? new Date(formData.ends_at).toISOString() : null,
    p_display_rule: formData.display_rule,
    p_cooldown_hours: formData.cooldown_hours,
    p_is_dismissible: formData.is_dismissible,
    p_cta_text: formData.cta_text || null,
    p_cta_link: formData.cta_link || null,
    p_cta_target: formData.cta_target || '_self',
  })

  if (error) {
    console.error('Error updating announcement:', error)
    throw new Error(error.message)
  }

  return !!data
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  const { data, error } = await client.rpc('admin_delete_announcement', {
    p_id: id,
  })

  if (error) {
    console.error('Error deleting announcement:', error)
    throw new Error(error.message)
  }

  return !!data
}

export async function duplicateAnnouncement(id: string): Promise<string> {
  const { data, error } = await client.rpc('admin_duplicate_announcement', {
    p_id: id,
  })

  if (error) {
    console.error('Error duplicating announcement:', error)
    throw new Error(error.message)
  }

  return data as string
}

export async function getEventsForTargeting(): Promise<Array<{ id: string; title: string }>> {
  const { data, error } = await client
    .from('events')
    .select('id, name')
    .order('created_at', { ascending: false })

  if (error) {
    console.warn('Error fetching events for targeting:', error)
    return []
  }

  return ((data || []) as Array<{ id: string; name: string }>).map((e) => ({
    id: e.id,
    title: e.name,
  }))
}

export async function getActiveUserTags(): Promise<string[]> {
  const { data, error } = await client.rpc('get_active_user_tags')
  if (error) {
    console.warn('Error fetching user tags:', error)
    return ['Pelajar', 'Mahasiswa', 'Umum', 'VIP']
  }
  return (data || []) as string[]
}
