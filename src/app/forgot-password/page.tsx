import { AuthPageShell } from '@/features/auth/components/ui/AuthPageShell'
import ForgotPasswordForm from '@/features/auth/components/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell>
      <ForgotPasswordForm />
    </AuthPageShell>
  )
}
