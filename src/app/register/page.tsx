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
      router.push(redirectTo)
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
        const details = searchParams.get('details')
        const msg = details ? `: ${decodeURIComponent(details)}` : ''
        toast.error(`Failed to create or load profile${msg}. Please contact the administrator.`, { id: 'oauth-error', duration: 10000 })
      }
    })
  }, [searchParams])

  if (authLoading) {
    return <Loader fullscreen />
  }

  return (
    <AuthPageShell>
      <AuthFormTabs defaultTab="register" />
    </AuthPageShell>
  )
}
