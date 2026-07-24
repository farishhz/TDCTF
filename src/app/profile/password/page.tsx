'use client'

import Link from 'next/link'
import { useAuth } from '@/shared/contexts/AuthContext'
import Loader from '@/shared/components/Loader'
import { AuthCard } from '@/features/auth/components/ui/AuthCard'
import { AuthHeader } from '@/features/auth/components/ui/AuthHeader'
import { AuthPageShell } from '@/features/auth/components/ui/AuthPageShell'
import ResetPasswordForm from '@/features/auth/components/ResetPasswordForm'

export default function ChangePasswordPage() {
  const { user, loading: authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader fullscreen color="text-blue-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <AuthPageShell>
        <AuthCard>
          <AuthHeader
            badge="Access Required"
            title="Login required"
            subtitle="You must be logged in to change your password"
          />
          <Link
            href="/login"
            className="flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:bg-blue-500 active:scale-[0.98]"
          >
            Go to Login
          </Link>
        </AuthCard>
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell>
      <ResetPasswordForm />
    </AuthPageShell>
  )
}
