import { supabase } from '@/lib/supabase/client'
import type { ChallengeRating, RatingAnalyticsSummary } from '@/shared/types'

/**
 * Get current user's rating for a specific challenge
 */
export async function getUserChallengeRating(
  challengeId: string,
  userId: string
): Promise<ChallengeRating | null> {
  if (!challengeId || !userId) return null

  try {
    const { data, error } = await (supabase as any)
      .from('challenge_ratings')
      .select('*')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.warn('Error fetching user challenge rating:', error.message)
      return null
    }

    return data as ChallengeRating | null
  } catch (err) {
    console.error('Failed to get user challenge rating:', err)
    return null
  }
}

/**
 * Save or update user rating and feedback for a challenge
 */
export async function upsertChallengeRating(params: {
  challengeId: string
  userId: string
  rating: number
  feedback?: string
  teamId?: string | null
}): Promise<{ success: boolean; data?: ChallengeRating; message?: string }> {
  const { challengeId, userId, rating, feedback = '', teamId = null } = params

  if (!challengeId || !userId) {
    return { success: false, message: 'Challenge ID and User ID are required.' }
  }

  if (rating < 1 || rating > 5) {
    return { success: false, message: 'Rating must be between 1 and 5.' }
  }

  try {
    const payload = {
      challenge_id: challengeId,
      user_id: userId,
      rating,
      feedback: feedback.trim(),
      team_id: teamId,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await (supabase as any)
      .from('challenge_ratings')
      .upsert(payload, { onConflict: 'challenge_id,user_id' })
      .select()
      .single()

    if (error) {
      console.error('Error saving challenge rating:', error)
      return { success: false, message: error.message }
    }

    return { success: true, data: data as ChallengeRating }
  } catch (err: any) {
    console.error('Failed to upsert challenge rating:', err)
    return { success: false, message: err?.message || 'An error occurred while saving rating.' }
  }
}

export interface AdminRatingsQueryParams {
  searchQuery?: string
  ratingFilter?: number | 'all'
  eventIdFilter?: string | 'all'
  categoryFilter?: string | 'all'
  limit?: number
  offset?: number
}

/**
 * Fetch all ratings for Admin Panel with user and challenge details
 */
export async function getAdminChallengeRatings(params: AdminRatingsQueryParams = {}) {
  const {
    searchQuery = '',
    ratingFilter = 'all',
    eventIdFilter = 'all',
    categoryFilter = 'all',
    limit = 20,
    offset = 0,
  } = params

  try {
    // 1. Fetch ratings directly from DB without postgrest relational joins to prevent schema relationship errors
    let query = (supabase as any)
      .from('challenge_ratings')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (ratingFilter !== 'all' && typeof ratingFilter === 'number') {
      query = query.eq('rating', ratingFilter)
    }

    const { data: rawRatings, error, count } = await query

    if (error) {
      console.error('Error fetching admin challenge ratings:', error)
      return { data: [], total: 0 }
    }

    if (!rawRatings || rawRatings.length === 0) {
      return { data: [], total: 0 }
    }

    // 2. Batch fetch related details (users, challenges, teams) safely
    const userIds = Array.from(new Set(rawRatings.map((r: any) => r.user_id).filter(Boolean)))
    const challengeIds = Array.from(new Set(rawRatings.map((r: any) => r.challenge_id).filter(Boolean)))
    const teamIds = Array.from(new Set(rawRatings.map((r: any) => r.team_id).filter(Boolean)))

    const [usersRes, challengesRes, teamsRes] = await Promise.all([
      userIds.length > 0
        ? (supabase as any).from('users').select('id, username, picture, profile_picture_url').in('id', userIds)
        : Promise.resolve({ data: [] }),
      challengeIds.length > 0
        ? (supabase as any).from('challenges').select('id, title, category, event_id').in('id', challengeIds)
        : Promise.resolve({ data: [] }),
      teamIds.length > 0
        ? (supabase as any).from('teams').select('id, name').in('id', teamIds)
        : Promise.resolve({ data: [] }),
    ])

    const userMap = new Map((usersRes.data || []).map((u: any) => [u.id, u]))
    const challengeMap = new Map((challengesRes.data || []).map((c: any) => [c.id, c]))
    const teamMap = new Map((teamsRes.data || []).map((t: any) => [t.id, t]))

    // 3. Map raw ratings with user, challenge, and team info
    let items: ChallengeRating[] = rawRatings.map((row: any) => {
      const u: any = userMap.get(row.user_id) || {}
      const c: any = challengeMap.get(row.challenge_id) || {}
      const t: any = teamMap.get(row.team_id) || {}

      return {
        id: row.id,
        challenge_id: row.challenge_id,
        user_id: row.user_id,
        team_id: row.team_id,
        rating: row.rating,
        feedback: row.feedback || '',
        created_at: row.created_at,
        updated_at: row.updated_at,
        username: u.username || 'Unknown',
        user_picture: u.profile_picture_url || u.picture || null,
        challenge_title: c.title || 'Unknown Challenge',
        challenge_category: c.category || 'General',
        team_name: t.name || null,
        event_id: c.event_id || null,
      }
    })

    // 4. Apply client-side filters if specified
    if (eventIdFilter !== 'all') {
      if (eventIdFilter === 'main') {
        items = items.filter((item: any) => !item.event_id)
      } else {
        items = items.filter((item: any) => item.event_id === eventIdFilter)
      }
    }

    if (categoryFilter !== 'all') {
      items = items.filter((item) => item.challenge_category?.toLowerCase() === categoryFilter.toLowerCase())
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      items = items.filter(
        (item) =>
          item.challenge_title?.toLowerCase().includes(q) ||
          item.username?.toLowerCase().includes(q) ||
          item.feedback?.toLowerCase().includes(q) ||
          item.team_name?.toLowerCase().includes(q)
      )
    }

    const filteredTotal = items.length
    const paginatedItems = items.slice(offset, offset + limit)

    return {
      data: paginatedItems,
      total: count ?? filteredTotal,
    }
  } catch (err) {
    console.error('Failed to load admin challenge ratings:', err)
    return { data: [], total: 0 }
  }
}

/**
 * Get aggregate analytics summary for admin dashboard
 */
export async function getAdminRatingAnalytics(): Promise<RatingAnalyticsSummary> {
  try {
    const { data: ratingsData, error } = await (supabase as any)
      .from('challenge_ratings')
      .select('rating, challenge_id')

    if (error || !ratingsData || ratingsData.length === 0) {
      return {
        totalRatings: 0,
        averageRating: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        topRated: null,
        lowestRated: null,
      }
    }

    const challengeIds = Array.from(new Set(ratingsData.map((r: any) => r.challenge_id).filter(Boolean)))
    const { data: challengesData } = challengeIds.length > 0
      ? await (supabase as any).from('challenges').select('id, title, category').in('id', challengeIds)
      : { data: [] }

    const challengeMap = new Map((challengesData || []).map((c: any) => [c.id, c]))

    const totalRatings = ratingsData.length
    const sum = ratingsData.reduce((acc: number, row: any) => acc + (row.rating || 0), 0)
    const averageRating = Number((sum / totalRatings).toFixed(1))

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    const challengeStats: Record<string, { title: string; category: string; sum: number; count: number }> = {}

    ratingsData.forEach((row: any) => {
      const r = row.rating
      if (r >= 1 && r <= 5) {
        distribution[r] = (distribution[r] || 0) + 1
      }

      const chId = row.challenge_id
      const chInfo: any = challengeMap.get(chId) || {}
      const chTitle = chInfo.title || 'Unknown'
      const chCat = chInfo.category || 'General'

      if (!challengeStats[chId]) {
        challengeStats[chId] = { title: chTitle, category: chCat, sum: 0, count: 0 }
      }
      challengeStats[chId].sum += r
      challengeStats[chId].count += 1
    })

    const challengeList = Object.entries(challengeStats).map(([id, info]) => ({
      id,
      title: info.title,
      category: info.category,
      avgRating: Number((info.sum / info.count).toFixed(1)),
      totalCount: info.count,
    }))

    challengeList.sort((a, b) => b.avgRating - a.avgRating || b.totalCount - a.totalCount)

    const topRated = challengeList.length > 0 ? challengeList[0] : null
    const lowestRated = challengeList.length > 1 ? challengeList[challengeList.length - 1] : null

    return {
      totalRatings,
      averageRating,
      distribution,
      topRated,
      lowestRated,
    }
  } catch (err) {
    console.error('Failed to calculate rating analytics:', err)
    return {
      totalRatings: 0,
      averageRating: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      topRated: null,
      lowestRated: null,
    }
  }
}

/**
 * Delete a challenge rating record (Admin Moderation)
 */
export async function deleteChallengeRating(ratingId: string): Promise<boolean> {
  if (!ratingId) return false

  try {
    const { error } = await (supabase as any)
      .from('challenge_ratings')
      .delete()
      .eq('id', ratingId)

    if (error) {
      console.error('Error deleting challenge rating:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Failed to delete challenge rating:', err)
    return false
  }
}
