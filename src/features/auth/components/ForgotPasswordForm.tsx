'use client'

import React from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'
import { useForgotPassword } from '../hooks'
import {
  AuthButton,
  AuthCard,
  AuthHeader,
  AuthInput,
  AuthStatusMessage,
  AuthTurnstile,
} from './ui'

export default function ForgotPasswordForm() {
  const {
    email,
    setEmail,
    handleSubmit,
    loading,
    error,
    success,
    setCaptchaToken,
    turnstileKey,
    captchaEnabled,
    captchaSiteKey
  } = useForgotPassword()

  return (
    <AuthCard>
      <AuthHeader
        badge="Password Recovery"
        title="Reset your password"
        subtitle="We'll send a reset link to your email"
      />

      <form className="space-y-4" onSubmit={handleSubmit}>
        <AuthInput
          type="email"
          name="email"
          required
          placeholder="Email address"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {captchaEnabled && (
          <AuthTurnstile
            turnstileKey={turnstileKey}
            siteKey={captchaSiteKey}
            onSuccess={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken(null)}
          />
        )}

        {error && (
          <AuthStatusMessage tone="error">{error}</AuthStatusMessage>
        )}

        {success && (
          <AuthStatusMessage tone="success" title="Check your email">
            {success}
          </AuthStatusMessage>
        )}

        <AuthButton type="submit" loading={loading}>
          Send Reset Email
        </AuthButton>
      </form>

      <div className="mt-5 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-blue-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Login
        </Link>
      </div>
    </AuthCard>
  )
}
