'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/shared/contexts/AuthContext'
import { AuthService } from '@/features/auth/services/auth.service'
import Loader from '@/shared/components/Loader'

/**
 * OAuth Callback Handler
 *
 * Handles both Supabase PKCE Flow and Implicit Flow seamlessly.
 * Employs automatic retry and fallback profile resolution so database
 * schema reload/cold-starts never lock users out of the platform.
 */
export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuth()
  const done = useRef(false)

  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    const succeed = async (redirectTo = '/challenges') => {
      if (done.current) return
      done.current = true
      unsubscribe?.()
      clearTimeout(timeoutId)

      try {
        let currentUser = await AuthService.getCurrentUser()

        // If not immediately available (e.g. initial cold start), wait and retry once
        if (!currentUser) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          currentUser = await AuthService.getCurrentUser()
        }

        if (currentUser) {
          setUser(currentUser)
          router.replace(redirectTo)
        } else {
          // If AuthService returned null but Supabase Auth has a session,
          // create a minimal session user so the user can enter
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            const fallbackUser = {
              id: session.user.id,
              username:
                session.user.user_metadata?.username ||
                session.user.user_metadata?.name ||
                (session.user.email ? session.user.email.split('@')[0] : 'user_' + session.user.id.substring(0, 8)),
              score: 0,
              rank: null,
              created_at: session.user.created_at || new Date().toISOString(),
              updated_at: session.user.updated_at || new Date().toISOString(),
            } as any

            setUser(fallbackUser)
            router.replace(redirectTo)
          } else {
            console.error('[auth/callback] No active user/session found')
            router.replace('/login?error=oauth_failed')
          }
        }
      } catch (err: any) {
        console.error('[auth/callback] Error during succeed getCurrentUser:', err)
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            router.replace(redirectTo)
            return
          }
        } catch {}
        router.replace('/login?error=oauth_failed')
      }
    }

    const fail = () => {
      if (done.current) return
      done.current = true
      unsubscribe?.()
      clearTimeout(timeoutId)
      router.replace('/login?error=oauth_failed')
    }

    // Timeout 30 seconds to allow Supabase cold-starts to finish
    const timeoutId = setTimeout(fail, 30000)

    async function init() {
      // ── PKCE Flow: ?code= in query params ─────────────────────────
      const code = searchParams.get('code')
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error && data?.session) {
          await succeed(searchParams.get('next') || '/challenges')
          return
        }
      }

      // ── Implicit Flow: listen to auth state changes ─────────────────
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
          await succeed(searchParams.get('next') || '/challenges')
        } else if (event === 'INITIAL_SESSION' && !session) {
          fail()
        }
      })

      unsubscribe = () => subscription.unsubscribe()

      // Fallback: check existing session
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await succeed(searchParams.get('next') || '/challenges')
      }
    }

    init().catch(fail)

    return () => {
      unsubscribe?.()
      clearTimeout(timeoutId)
    }
  }, [router, searchParams, setUser])

  return <Loader fullscreen />
}
