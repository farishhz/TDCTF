'use client'

import React, { useMemo, useState } from 'react'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { useRegister } from '../hooks'
import { isValidUsername } from '../lib/auth-utils'
import GoogleLoginButton from './GoogleLoginButton'
import {
  AuthButton,
  AuthDivider,
  AuthInput,
  AuthStatusMessage,
  AuthTurnstile,
  PasswordMatchIndicator,
} from './ui'
import { SignupDisabled } from './ui'

/** Form content only — used inside AuthFormTabs */
export default function RegisterFormContent() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const {
    formData,
    handleChange,
    handleRegister,
    loading,
    error,
    success,
    setCaptchaToken,
    turnstileKey,
    captchaEnabled,
    captchaSiteKey,
    signupDisabled,
    checkingSettings,
  } = useRegister()

  const usernameError = useMemo(() => {
    if (!formData.username) return ''
    return isValidUsername(formData.username) ?? ''
  }, [formData.username])

  if (checkingSettings) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        <p className="text-sm text-gray-500">Checking registration status...</p>
      </div>
    )
  }

  if (signupDisabled) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/8 p-4 space-y-2">
        <p className="text-sm font-semibold text-red-400">Pendaftaran Dinonaktifkan</p>
        <p className="text-xs leading-relaxed text-gray-500">
          Registrasi saat ini sedang ditutup oleh administrator. Silakan hubungi panitia.
        </p>
      </div>
    )
  }

  return (
    <form className="space-y-4" onSubmit={handleRegister}>
      <div className="space-y-3">
        <AuthInput
          id="reg-username"
          name="username"
          type="text"
          required
          placeholder="Username"
          icon={User}
          error={usernameError}
          value={formData.username}
          onChange={handleChange}
        />
        <AuthInput
          id="reg-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="Email address"
          icon={Mail}
          value={formData.email}
          onChange={handleChange}
        />
        <AuthInput
          id="reg-password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          placeholder="Password"
          icon={Lock}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="rounded-lg p-1 text-gray-500 transition-colors hover:text-blue-400 focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          value={formData.password}
          onChange={handleChange}
        />
        <AuthInput
          id="reg-confirmPassword"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          placeholder="Confirm Password"
          icon={Lock}
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="rounded-lg p-1 text-gray-500 transition-colors hover:text-blue-400 focus:outline-none"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          value={formData.confirmPassword}
          onChange={handleChange}
        />
        <PasswordMatchIndicator
          password={formData.password}
          confirmPassword={formData.confirmPassword}
        />
      </div>

      {error && <AuthStatusMessage tone="error">{error}</AuthStatusMessage>}
      {success && (
        <AuthStatusMessage tone="success" title="Check your email">
          {success}
        </AuthStatusMessage>
      )}

      {captchaEnabled && (
        <AuthTurnstile
          turnstileKey={turnstileKey}
          siteKey={captchaSiteKey}
          onSuccess={(token) => setCaptchaToken(token)}
          onExpire={() => setCaptchaToken(null)}
        />
      )}

      <AuthButton type="submit" loading={loading}>
        Create Account
      </AuthButton>

      <AuthDivider />
      <GoogleLoginButton />
    </form>
  )
}
