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
 * Mendukung dua flow Supabase:
 * 1. PKCE (default Supabase v2): /auth/callback?code=XXXX
 *    → Panggil exchangeCodeForSession(code)
 * 2. Implicit (lama): /auth/callback#access_token=...
 *    → getSession() otomatis membaca hash
 *
 * Jika keduanya gagal → redirect ke /register?error=oauth_failed
 */
export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuth()
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    // Timeout 15 detik — jika masih loading, redirect ke register
    const timeout = setTimeout(() => {
      console.error('[auth/callback] Timeout — taking too long')
      router.replace('/register?error=oauth_timeout')
    }, 15000)

    async function handleCallback() {
      try {
        const code = searchParams.get('code')
        let sessionOk = false

        // ── PKCE Flow ──────────────────────────────────────────────────────
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (!error && data?.session) {
            sessionOk = true
          } else {
            console.error('[auth/callback] PKCE exchange failed:', error?.message)
          }
        }

        // ── Implicit / Fallback: cek apakah session sudah ada ─────────────
        if (!sessionOk) {
          const { data: { session }, error } = await supabase.auth.getSession()
          if (!error && session) {
            sessionOk = true
          } else {
            console.error('[auth/callback] No session found:', error?.message)
          }
        }

        if (!sessionOk) {
          clearTimeout(timeout)
          router.replace('/register?error=oauth_failed')
          return
        }

        // ── Buat profil jika user baru ────────────────────────────────────
        const currentUser = await AuthService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
        }

        clearTimeout(timeout)
        const next = searchParams.get('next') || '/challenges'
        router.replace(next)
      } catch (err) {
        console.error('[auth/callback] Unexpected error:', err)
        clearTimeout(timeout)
        router.replace('/register?error=oauth_failed')
      }
    }

    handleCallback()

    return () => clearTimeout(timeout)
  }, [router, searchParams, setUser])

  return <Loader fullscreen />
}
