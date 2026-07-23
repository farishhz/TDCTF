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
 * Menangani dua flow Supabase:
 *
 * 1. PKCE Flow (supabase v2 default di beberapa config):
 *    URL: /auth/callback?code=XXXX
 *    → panggil exchangeCodeForSession(code)
 *
 * 2. Implicit Flow (token di hash):
 *    URL: /auth/callback#access_token=...
 *    → Supabase JS memproses hash secara async, lalu fire SIGNED_IN via onAuthStateChange
 *    → JANGAN panggil getSession() langsung, harus tunggu event terlebih dahulu
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
        const currentUser = await AuthService.getCurrentUser()
        if (currentUser) setUser(currentUser)
      } catch {
        // profile creation error — tetap redirect, user bisa login ulang
      }

      router.replace(redirectTo)
    }

    const fail = () => {
      if (done.current) return
      done.current = true
      unsubscribe?.()
      clearTimeout(timeoutId)
      router.replace('/login?error=oauth_failed')
    }

    // Hard timeout 20 detik
    const timeoutId = setTimeout(fail, 20000)

    async function init() {
      // ── PKCE Flow: ada ?code= di query param ─────────────────────────
      const code = searchParams.get('code')
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error && data?.session) {
          await succeed(searchParams.get('next') || '/challenges')
          return
        }
        // PKCE gagal — lanjut coba implicit
      }

      // ── Implicit Flow: tunggu Supabase selesai memproses hash ─────────
      // Supabase membaca window.location.hash secara async, lalu fire event
      // Jangan panggil getSession() sebelum event ini muncul
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
          await succeed(searchParams.get('next') || '/challenges')
        } else if (event === 'INITIAL_SESSION' && !session) {
          // Supabase selesai cek, tidak ada session
          fail()
        }
      })

      unsubscribe = () => subscription.unsubscribe()

      // Fallback: kalau event sudah fire sebelum kita subscribe,
      // getSession() akan return session yang sudah ada
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
