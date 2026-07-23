'use client'
import { createContext, useContext, useState, useEffect, useRef } from 'react'
import type { User } from '@/shared/types'
import { BannedOverlay } from '@/features/auth'

type AuthContextType = {
  user: User | null
  setUser: (user: User | null) => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  // Ref agar onAuthStateChange tidak override user yang sudah di-set
  const initialLoadDone = useRef(false)

  // ── Initial load: cek session yang sudah ada ─────────────────────────────
  useEffect(() => {
    let active = true

    import('@/features/auth/services/auth.service')
      .then(({ AuthService }) => AuthService.getCurrentUser())
      .then((currentUser) => {
        if (active) {
          setUser(currentUser)
          initialLoadDone.current = true
          if (currentUser) {
            import('@/lib/supabase/client').then(({ supabase }) => {
              void (supabase as any).rpc('touch_user_activity')
            }).catch(() => {})
          }
        }
      })
      .catch(() => {
        if (active) initialLoadDone.current = true
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  // ── Listen perubahan auth state (login Google OAuth, logout, dll) ─────────
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null

    import('@/lib/supabase/client').then(({ supabase }) => {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Hindari race condition: jangan override jika initial load sedang berjalan
          // dan sudah ada user (misal dari callback page yang set lebih dulu)
          const { AuthService } = await import('@/features/auth/services/auth.service')
          const currentUser = await AuthService.getCurrentUser()

          // PENTING: hanya update jika berhasil dapat user (jangan set null)
          // supaya tidak menimpa user yang sudah diset oleh /auth/callback page
          if (currentUser) {
            setUser(currentUser)
          }
          // Pastikan loading selesai
          setLoading(false)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setLoading(false)
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Token di-refresh, tidak perlu reload user profile
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

    let timer: any

    const checkSession = async () => {
      try {
        const { AuthService } = await import('@/features/auth/services/auth.service')
        const active = await AuthService.isCurrentSessionActive()
        if (!active) {
          await AuthService.signOut()
          setUser(null)
          const toast = (await import('react-hot-toast')).default
          toast.error('Sesi Anda telah berakhir karena Anda masuk di perangkat lain.', {
            id: 'session-expired-toast',
            duration: 6000,
          })
        }
      } catch (err) {
        console.error('Session check failed:', err)
      }
    }

    // Check periodically every 20 seconds
    timer = setInterval(checkSession, 20000)

    // Check when window gets focused
    const handleFocus = () => {
      void checkSession()
    }
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
