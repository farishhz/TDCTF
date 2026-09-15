import { supabase } from '@/lib/supabase/client'
import type { ClientAnnouncement } from '../types'

const client = supabase as any

export async function fetchActiveAnnouncements(): Promise<ClientAnnouncement[]> {
  try {
    const { data, error } = await client.rpc('get_active_announcements')

    if (!error && data) {
      return (data || []) as unknown as ClientAnnouncement[]
    }
  } catch {
    // Fallback to table query if RPC is not present
  }

  try {
    const { data, error } = await client
      .from('announcements')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (error) {
      return []
    }

    return (data || []) as unknown as ClientAnnouncement[]
  } catch {
    return []
  }
}

export async function recordInteraction(
  announcementId: string,
  action: 'view' | 'read' | 'dismiss'
): Promise<boolean> {
  const { data, error } = await client.rpc('record_announcement_interaction', {
    p_announcement_id: announcementId,
    p_action: action,
  })

  if (error) {
    console.warn('Error recording announcement interaction:', error)
    return false
  }

  return !!data
}

export function subscribeToRealtimeAnnouncements(onUpdate: () => void) {
  const channel = supabase
    .channel('public:announcements')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'announcements' },
      () => {
        onUpdate()
      }
    )
    .subscribe()

  return () => {
    void supabase.removeChannel(channel)
  }
}
