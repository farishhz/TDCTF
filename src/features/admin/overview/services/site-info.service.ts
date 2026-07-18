import { supabase } from '@/lib/supabase/client'

export type SiteInfo = {
  total_users: number
  total_admins: number
  total_solves: number
  unique_solvers: number
  total_challenges: number
  active_challenges: number
}

export async function getInfo(): Promise<SiteInfo | null> {
  try {
    const { data, error } = await supabase.rpc('get_info')
    if (error || !data) {
      console.error('Error fetching site info:', error)
      return null
    }

    const info = data as Partial<Record<keyof SiteInfo, number | string | null>>

    return {
      total_users: Number(info.total_users || 0),
      total_admins: Number(info.total_admins || 0),
      total_solves: Number(info.total_solves || 0),
      unique_solvers: Number(info.unique_solvers || 0),
      total_challenges: Number(info.total_challenges || 0),
      active_challenges: Number(info.active_challenges || 0),
    }
  } catch (err) {
    console.error('Error in getInfo:', err)
    return null
  }
}
