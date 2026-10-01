import { supabase } from '@/lib/supabase/client'
import { User } from '@/shared/types'
import { AuthResponse, AuthIdentity } from '../types'
import { mergeProfilePicture, getAuthAvatarUrl } from '../lib/auth-utils'
import { SUPABASE_URL } from '@/_vars/const'

/**
 * Checks whether a Supabase/PostgREST/Network error is transient and safe to retry.
 */
function isTransientError(error: any): boolean {
  if (!error) return false
  const msg = String(error?.message || error?.details || error?.hint || error || '').toLowerCase()
  const code = String(error?.code || '').toLowerCase()

  return (
    msg.includes('schema cache') ||
    msg.includes('could not query the database') ||
    msg.includes('connection') ||
    msg.includes('timeout') ||
    msg.includes('network') ||
    msg.includes('fetch') ||
    msg.includes('failed to fetch') ||
    msg.includes('503') ||
    msg.includes('502') ||
    msg.includes('504') ||
    msg.includes('500') ||
    msg.includes('starting up') ||
    msg.includes('recovery') ||
    code === 'pgrst000' ||
    code === 'pgrst001' ||
    code === 'pgrst002' ||
    code === 'pgrst003' ||
    code === '57p03' || // cannot_connect_now
    code === '57p01'    // admin_shutdown
  )
}

/**
 * Retry helper for asynchronous database/RPC operations with exponential backoff and jitter.
 */
async function retryOperation<T = any>(
  fn: () => PromiseLike<{ data: T | null; error: any }>,
  retries = 5,
  initialDelay = 600
): Promise<{ data: T | null; error: any }> {
  let lastResult: { data: T | null; error: any } = { data: null, error: null }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      lastResult = await fn()
      if (!lastResult.error) {
        return lastResult
      }

      if (!isTransientError(lastResult.error) || attempt === retries) {
        return lastResult
      }
    } catch (err: any) {
      lastResult = { data: null, error: err }
      if (!isTransientError(err) || attempt === retries) {
        return lastResult
      }
    }

    // Exponential backoff + small random jitter
    const delay = Math.round(initialDelay * Math.pow(1.6, attempt) + Math.random() * 200)
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  return lastResult
}

/**
 * Sanitize username for database storage and profile creation
 */
function sanitizeUsername(rawUsername: string, userId: string): string {
  const sanitized = (rawUsername || '')
    .replace(/[^a-zA-Z0-9_. -]/g, '_')
    .replace(/^[^a-zA-Z0-9]+/, '')
    .slice(0, 28)

  return sanitized || 'user_' + userId.substring(0, 8)
}

/**
 * Create a safe fallback User object from Supabase Auth user metadata
 * Used when DB is in a cold restart or PostgREST schema reload to prevent login lockout
 */
function createFallbackUser(authUser: any): User {
  const fallbackUsername =
    authUser.user_metadata?.username ||
    authUser.user_metadata?.name ||
    (authUser.email ? authUser.email.split('@')[0] : 'user_' + authUser.id.substring(0, 8))

  return {
    id: authUser.id,
    username: fallbackUsername,
    score: 0,
    rank: undefined,
    picture: getAuthAvatarUrl(authUser) || undefined,
    profile_picture_url: null,
    is_admin: false,
    banned_until: null,
    ban_reason: null,
    created_at: authUser.created_at || new Date().toISOString(),
    updated_at: authUser.updated_at || new Date().toISOString(),
  }
}

/**
 * Resiliently fetch or auto-provision user profile.
 * Employs multi-tier queries (RPC + Table fallback) and handles schema cache reload gracefully.
 */
async function fetchOrEnsureUserProfile(authUser: any): Promise<User> {
  if (!authUser?.id) {
    throw new Error('Invalid auth user')
  }

  // Tier 1: Try RPC get_user_profile with retry
  const { data: rpcData, error: rpcError } = await retryOperation<any[]>(() =>
    supabase.rpc('get_user_profile', { p_id: authUser.id })
  )

  let userData = Array.isArray(rpcData) && rpcData.length > 0 ? rpcData[0] : null

  // Tier 2: Direct table query fallback if RPC didn't return data
  if (!userData) {
    const { data: tableData } = await retryOperation<any>(() =>
      supabase.from('users').select('*').eq('id', authUser.id).maybeSingle()
    )
    if (tableData) {
      userData = tableData
    }
  }

  // If user profile already exists, merge with auth picture and return
  if (userData) {
    return mergeProfilePicture(userData as any, authUser, userData)
  }

  // If user profile truly doesn't exist (new OAuth or missing profile row), provision profile
  const baseUsername =
    authUser.user_metadata?.username ||
    authUser.user_metadata?.name ||
    (authUser.email ? authUser.email.split('@')[0] : 'user_' + authUser.id.substring(0, 8))

  const cleanUsername = sanitizeUsername(baseUsername, authUser.id)

  // Attempt RPC create_profile
  let createResult = await retryOperation(() =>
    supabase.rpc('create_profile', {
      p_id: authUser.id,
      p_username: cleanUsername,
    })
  )

  // Handle unique constraint / duplicate key error gracefully
  if (createResult.error) {
    const errStr = String(createResult.error.message || '').toLowerCase()
    if (errStr.includes('unique') || errStr.includes('duplicate') || errStr.includes('already exists')) {
      // Profile might have been created concurrently in another tab or request
      const { data: checkData } = await retryOperation<any[]>(() =>
        supabase.rpc('get_user_profile', { p_id: authUser.id })
      )
      if (Array.isArray(checkData) && checkData.length > 0) {
        return mergeProfilePicture(checkData[0] as any, authUser, checkData[0])
      }

      // Username collided with an existing user, retry with unique suffix
      const uniqueUsername = `${cleanUsername.slice(0, 22)}_${Math.random().toString(36).substring(2, 7)}`
      createResult = await retryOperation(() =>
        supabase.rpc('create_profile', {
          p_id: authUser.id,
          p_username: uniqueUsername,
        })
      )
    }
  }

  // If RPC create_profile still failed (e.g. schema cache or RPC permission), try direct table insert
  if (createResult.error) {
    console.warn('[fetchOrEnsureUserProfile] create_profile RPC failed, trying direct insert fallback:', createResult.error)
    await retryOperation(() =>
      supabase.from('users').insert({
        id: authUser.id,
        username: cleanUsername,
        score: 0,
      } as any)
    )
  }

  // Re-fetch profile after creation attempt
  const { data: postCreateRpc } = await retryOperation<any[]>(() =>
    supabase.rpc('get_user_profile', { p_id: authUser.id })
  )
  if (Array.isArray(postCreateRpc) && postCreateRpc.length > 0) {
    return mergeProfilePicture(postCreateRpc[0] as any, authUser, postCreateRpc[0])
  }

  const { data: postCreateTable } = await retryOperation<any>(() =>
    supabase.from('users').select('*').eq('id', authUser.id).maybeSingle()
  )
  if (postCreateTable) {
    return mergeProfilePicture(postCreateTable as any, authUser, postCreateTable)
  }

  // Ultimate resilience fallback: return metadata-derived user object rather than throwing error
  console.warn('[fetchOrEnsureUserProfile] Using fallback user profile for auth session')
  return createFallbackUser(authUser)
}

/**
 * Authentication Service
 * Handles all direct interactions with Supabase Auth and User tables
 */
export const AuthService = {
  /**
   * Check if an OAuth provider is enabled in Supabase
   */
  async checkProviderEnabled(provider: string): Promise<boolean> {
    try {
      if (!SUPABASE_URL) return true

      const baseUrl = SUPABASE_URL.replace(/\/$/, '')

      const res = await fetch(`${baseUrl}/auth/v1/authorize?provider=${provider}`, {
        method: 'GET',
        redirect: 'manual'
      })

      if (res.status === 400) {
        const data = await res.json()
        if (data.msg?.toLowerCase().includes('provider is not enabled')) {
          console.warn(`AuthService: Provider ${provider} is disabled in Supabase config.`, data)
          return false
        }
      }
      return true
    } catch (error) {
      return true
    }
  },

  /**
   * Sign in with Google OAuth
   */
  async loginWithGoogle(): Promise<AuthResponse> {
    try {
      const isEnabled = await this.checkProviderEnabled('google')
      if (!isEnabled) {
        return { user: null, error: 'Google Sign-In is not enabled on this platform. Please contact the administrator.' }
      }

      const redirectUrl = `${window.location.origin}/auth/callback`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      })

      if (error) {
        return { user: null, error: error.message }
      }
      return { user: null, error: null }
    } catch (error) {
      return { user: null, error: 'Google sign-in failed' }
    }
  },

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, captchaToken?: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/profile/password`,
        ...(captchaToken && { captchaToken })
      })
      if (error) {
        return { error: error.message }
      }
      return { error: null }
    } catch (error) {
      return { error: 'Failed to send reset email' }
    }
  },

  /**
   * Update current user's password
   */
  async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        return { error: 'User not authenticated' }
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        return { error: error.message }
      }
      return { error: null }
    } catch (error) {
      return { error: 'Failed to update password' }
    }
  },

  /**
   * Register a new user
   */
  async signUp(email: string, password: string, username: string, captchaToken?: string): Promise<AuthResponse> {
    try {
      const { data: usernameExists } = await retryOperation(() =>
        supabase.rpc('check_username_exists', { p_username: username })
      )

      if (usernameExists) {
        return { user: null, error: 'Username already taken' }
      }

      const { data: emailExists } = await retryOperation(() =>
        supabase.rpc('check_email_exists', { p_email: email })
      )

      if (emailExists) {
        return { user: null, error: 'Email already registered' }
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          },
          emailRedirectTo: `${window.location.origin}/login`,
          ...(captchaToken && { captchaToken })
        }
      })

      if (authError) {
        return { user: null, error: authError.message }
      }

      if (!authData.user) {
        return { user: null, error: 'Failed to create account' }
      }

      if (!authData.session) {
        return {
          user: null,
          error: null,
          emailConfirmationRequired: true,
          message: 'Registration successful. Please check your email to confirm your account before signing in.'
        }
      }

      const user = await fetchOrEnsureUserProfile(authData.user)
      return { user, error: null }
    } catch (error: any) {
      console.error('[signUp] Unexpected error:', error)
      return { user: null, error: error?.message || 'Registration failed' }
    }
  },

  /**
   * Sign in with email/username and password
   */
  async signIn(identifier: string, password: string, captchaToken?: string): Promise<AuthResponse> {
    try {
      let email = identifier

      if (!identifier.includes('@')) {
        const { data: rpcEmail, error: rpcError } = await retryOperation<string>(() =>
          supabase.rpc('get_email_by_username', {
            p_username: identifier
          })
        )

        if (rpcError || !rpcEmail) {
          return { user: null, error: 'User not found' }
        }

        email = rpcEmail
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          ...(captchaToken && { captchaToken })
        }
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (!data.user) {
        return { user: null, error: 'Login failed' }
      }

      const user = await fetchOrEnsureUserProfile(data.user)
      return { user, error: null }
    } catch (error: any) {
      console.error('[signIn] Unexpected error:', error)
      return { user: null, error: error?.message || 'Login failed' }
    }
  },

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    await supabase.auth.signOut({ scope: 'local' })
  },

  /**
   * Get current user details from DB and Auth
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) return null

      return await fetchOrEnsureUserProfile(user)
    } catch (error: any) {
      console.error('[getCurrentUser] Unexpected error:', error)
      return null
    }
  },

  /**
   * Check if current user is admin
   */
  async isAdmin(): Promise<boolean> {
    try {
      const { data, error } = await retryOperation(() => supabase.rpc('is_admin'))
      if (error) return false
      return data || false
    } catch (error) {
      return false
    }
  },

  /**
   * Check if current user is global admin
   */
  async isGlobalAdmin(): Promise<boolean> {
    return this.isAdmin()
  },

  /**
   * Get administrative scope for current user
   */
  async getAdminScope(): Promise<{ is_global_admin: boolean; event_ids: string[] }> {
    const { data, error } = await retryOperation(() => supabase.rpc('get_admin_scope'))
    if (error || !data) return { is_global_admin: false, event_ids: [] }

    const is_global_admin = !!(data as any).is_global_admin
    const event_ids_raw = (data as any).event_ids
    const event_ids = Array.isArray(event_ids_raw) ? event_ids_raw.map((x) => String(x)) : []
    return { is_global_admin, event_ids }
  },

  /**
   * Get current auth identities (Google, Email, etc)
   */
  async getCurrentAuthInfo(): Promise<AuthIdentity[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      if (user.identities && user.identities.length > 0) {
        return user.identities.map((id: any) => ({
          provider: id.provider,
          email: id.identity_data?.email || id.email || '',
        }))
      }

      if (user.app_metadata?.provider) {
        return [{ provider: user.app_metadata.provider, email: user.email || '' }]
      }

      return [{ provider: 'email', email: user.email || '' }]
    } catch {
      return []
    }
  },

  /**
   * Bind Google account
   */
  async bindGoogle(): Promise<{ error: string | null }> {
    try {
      const isEnabled = await this.checkProviderEnabled('google')
      if (!isEnabled) {
        return { error: 'Google integration is not enabled on this platform.' }
      }

      const { error } = await supabase.auth.linkIdentity({ provider: 'google' })
      if (error) return { error: error.message }
      return { error: null }
    } catch {
      return { error: 'Failed to link Google account' }
    }
  },

  /**
   * Unbind Google account
   */
  async unbindGoogle(): Promise<{ error: string | null }> {
    try {
      const { data: identities, error: identitiesError } = await supabase.auth.getUserIdentities()
      if (identitiesError) return { error: identitiesError.message }
      if (!identities || !identities.identities) return { error: 'No identities found.' }

      const googleIdentity = identities.identities.find((identity: any) => identity.provider === 'google')
      if (!googleIdentity) return { error: 'Google identity not linked.' }

      const { error } = await supabase.auth.unlinkIdentity(googleIdentity)
      if (error) return { error: error.message }

      return { error: null }
    } catch {
      return { error: 'Failed to unlink Google account.' }
    }
  },

  /**
   * Check if the current session is still active in the database
   */
  async isCurrentSessionActive(): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_current_session_active')
      if (error) {
        // Log warning but return true to prevent transient network errors from logging out users
        console.warn('[isCurrentSessionActive] RPC warning:', error.message)
        return true
      }
      return data === true
    } catch (err) {
      console.warn('[isCurrentSessionActive] Network exception caught:', err)
      return true
    }
  }
}
