'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/shared/contexts/AuthContext'
import Loader from '@/shared/components/Loader'
import { AuthPageShell } from '@/features/auth/components/ui/AuthPageShell'
import AuthFormTabs from '@/features/auth/components/AuthFormTabs'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && user) {
      const redirectTo = searchParams.get('redirectTo') || '/challenges'
      router.replace(redirectTo)
      const timer = setTimeout(() => {
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/register')) {
          window.location.href = redirectTo
        }
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [user, authLoading, router, searchParams])

  useEffect(() => {
    const error = searchParams.get('error')
    if (!error) return
    import('react-hot-toast').then(({ default: toast }) => {
      if (error === 'oauth_failed') {
        toast.error('Google sign-in failed. Please try again.', { id: 'oauth-error' })
      } else if (error === 'oauth_timeout') {
        toast.error('Sign-in timed out. Please try again.', { id: 'oauth-error' })
      } else if (error === 'profile_creation_failed') {
        const details = searchParams.get('details') || ''
        const decoded = decodeURIComponent(details).toLowerCase()
        if (decoded.includes('schema cache') || decoded.includes('connection') || decoded.includes('timeout')) {
          toast.error('Database connection was synchronizing. Please try signing in again.', { id: 'oauth-error', duration: 6000 })
        } else {
          toast.error('Failed to load profile. Please try signing in again.', { id: 'oauth-error', duration: 6000 })
        }
      }

      // Clean up URL parameters without page refresh
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState({}, '', window.location.pathname)
      }
    })
  }, [searchParams])

  if (authLoading || user) {
    return <Loader fullscreen />
  }

  return (
    <AuthPageShell>
      <AuthFormTabs defaultTab="register" />
    </AuthPageShell>
  )
}
