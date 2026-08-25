import type { Metadata } from 'next'
import { AuthPageShell } from '@/features/auth/components/ui/AuthPageShell'
import ForgotPasswordForm from '@/features/auth/components/ForgotPasswordForm'
import { BASE_URL } from '@/_vars/const'

export const metadata: Metadata = {
  title: 'Reset Password | TDCTF Capture The Flag',
  description: 'Atur ulang kata sandi akun TDCTF Capture The Flag Anda dengan aman.',
  alternates: {
    canonical: `${BASE_URL}/forgot-password`,
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell>
      <ForgotPasswordForm />
    </AuthPageShell>
  )
}
