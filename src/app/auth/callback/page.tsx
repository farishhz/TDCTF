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
 * Supabase meredirect user ke sini setelah OAuth (Google) berhasil.
 * URL akan mengandung hash fragment (#access_token=...&refresh_token=...)
 * yang perlu diproses oleh Supabase JS client di sisi client (tidak bisa di server).
 *
 * Flow:
 * 1. Supabase Google OAuth redirect → /auth/callback#access_token=...
 * 2. Page ini memproses hash → supabase.auth.getSession() membuat session
 * 3. Jika user baru, create_profile dipanggil otomatis via getCurrentUser()
 * 4. Redirect ke /challenges (atau next param)
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
        // Supabase JS client secara otomatis memproses hash fragment (#access_token=...)
        // dari URL dan membuat session ketika getSession() dipanggil
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error || !session) {
          // Session gagal dibuat — kemungkinan token expired atau invalid
          console.error('[auth/callback] Failed to get session:', error?.message)
          router.replace('/login?error=oauth_failed')
          return
        }

        // Session berhasil — ambil/buat profil user (handles new Google user profile creation)
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
