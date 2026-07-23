'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/shared/contexts/AuthContext'
import Loader from '@/shared/components/Loader'
import { AuthPageShell } from '@/features/auth/components/ui/AuthPageShell'
import RegisterForm from '@/features/auth/components/RegisterForm'

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

  // Tampilkan toast jika kembali dari OAuth gagal
  useEffect(() => {
    const error = searchParams.get('error')
    if (!error) return
    import('react-hot-toast').then(({ default: toast }) => {
      if (error === 'oauth_failed') {
        toast.error('Google sign-in failed. Please try again.', { id: 'oauth-error' })
      } else if (error === 'oauth_timeout') {
        toast.error('Sign-in timed out. Please try again.', { id: 'oauth-error' })
      }
    })
  }, [searchParams])

  if (authLoading) {
    return <Loader fullscreen />
  }

  return (
    <AuthPageShell>
      <div className="w-full max-w-lg">
        <RegisterForm />
      </div>
    </AuthPageShell>
  )
}
