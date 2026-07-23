'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/shared/contexts/AuthContext'
import { AuthService } from '@/features/auth/services/auth.service'
import Loader from '@/shared/components/Loader'

/**
 * OAuth Callback Handler — PKCE + Implicit Flow Support
 *
 * Supabase v2 menggunakan PKCE flow secara default:
 *   → Redirect URL: /auth/callback?code=XXXX
 *   → Perlu panggil exchangeCodeForSession(code) untuk tukar code → session
 *
 * Implicit flow (lama) menggunakan hash:
 *   → Redirect URL: /auth/callback#access_token=...
 *   → getSession() akan otomatis membaca hash
 *
 * Page ini menangani KEDUANYA.
 */
export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuth()
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    async function handleCallback() {
      try {
        // ── PKCE Flow: ada ?code= di URL ─────────────────────────────────
        const code = searchParams.get('code')

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)

          if (error || !data.session) {
            console.error('[auth/callback] PKCE exchange failed:', error?.message)
            router.replace('/login?error=oauth_failed')
            return
          }
        } else {
          // ── Implicit/Hash Flow (fallback) ────────────────────────────────
          // getSession() otomatis membaca hash fragment jika ada
          const { data: { session }, error } = await supabase.auth.getSession()

          if (error || !session) {
            console.error('[auth/callback] No code & no session found:', error?.message)
            router.replace('/login?error=oauth_failed')
            return
          }
        }

        // ── Session sudah terbentuk — buat profil user jika belum ada ─────
        // getCurrentUser() memanggil create_profile RPC jika user belum punya profil
        const currentUser = await AuthService.getCurrentUser()

        if (currentUser) {
          setUser(currentUser)
        }

        // Redirect ke next param atau /challenges
        const next = searchParams.get('next') || '/challenges'
        router.replace(next)
      } catch (err) {
        console.error('[auth/callback] Unexpected error:', err)
        router.replace('/login?error=oauth_failed')
      }
    }

    handleCallback()
  }, [router, searchParams, setUser])

  return <Loader fullscreen />
}
