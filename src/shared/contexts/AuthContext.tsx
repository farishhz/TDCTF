'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import type { User } from '@/shared/types'
import { BannedOverlay } from '@/features/auth'

type AuthContextType = {
  user: User | null
  setUser: (user: User | null) => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Jika getCurrentUser tidak selesai dalam 10 detik, paksa loading = false
// Ini mencegah "LOADING ARENA" stuck saat Supabase lambat/paused
const AUTH_TIMEOUT_MS = 10000

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // ── Initial load: cek session yang sudah ada ─────────────────────────────
  useEffect(() => {
    let active = true

    // Hard timeout: paksa loading = false setelah 10 detik
    // Mencegah stuck saat Supabase database paused/lambat
    const timeout = setTimeout(() => {
      if (active) setLoading(false)
    }, AUTH_TIMEOUT_MS)

    import('@/features/auth/services/auth.service')
      .then(({ AuthService }) => AuthService.getCurrentUser())
      .then((currentUser) => {
        if (active) {
          setUser(currentUser)
          if (currentUser) {
            import('@/lib/supabase/client').then(({ supabase }) => {
              void (supabase as any).rpc('touch_user_activity')
            }).catch(() => {})
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) {
          clearTimeout(timeout)
          setLoading(false)
        }
      })

    return () => {
      active = false
      clearTimeout(timeout)
    }
  }, [])

  // ── Hanya listen SIGNED_OUT untuk clear user saat logout ─────────────────
  // TIDAK memanggil getCurrentUser() di sini untuk menghindari double-call
  // yang menyebabkan loading lambat. Google OAuth callback langsung
  // memanggil setUser() dari /auth/callback/page.tsx
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null

    import('@/lib/supabase/client').then(({ supabase }) => {
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      })
      subscription = data.subscription
    }).catch(() => {})

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // ── Cek session aktif secara berkala ─────────────────────────────────────
  useEffect(() => {
    if (!user) return

    let timer: ReturnType<typeof setInterval>

    const checkSession = async () => {
      try {
        const { AuthService } = await import('@/features/auth/services/auth.service')
        const active = await AuthService.isCurrentSessionActive()
        if (!active) {
          // Verify with a 2-second double check before declaring session expired to prevent false positives during token refresh
          await new Promise((resolve) => setTimeout(resolve, 2000))
          const doubleCheckActive = await AuthService.isCurrentSessionActive()
          if (!doubleCheckActive) {
            await AuthService.signOut()
            setUser(null)
            const toast = (await import('react-hot-toast')).default
            toast.error('Sesi Anda telah berakhir karena Anda masuk di perangkat lain.', {
              id: 'session-expired-toast',
              duration: 6000,
            })
          }
        }
      } catch (err) {
        console.error('Session check failed:', err)
      }
    }

    timer = setInterval(checkSession, 30000)

    const handleFocus = () => { void checkSession() }
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', handleFocus)
    }
  }, [user])

  const isBanned = user && !user.is_admin && user.banned_until && new Date(user.banned_until) > new Date()

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {isBanned ? <BannedOverlay user={user} variant="fullscreen" /> : children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
