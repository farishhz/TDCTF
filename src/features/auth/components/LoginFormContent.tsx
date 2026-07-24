'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import APP from '@/config'
import { useLogin } from '../hooks'
import GoogleLoginButton from './GoogleLoginButton'
import {
  AuthButton,
  AuthDivider,
  AuthInput,
  AuthStatusMessage,
  AuthTurnstile,
} from './ui'

/** Form content only — used inside AuthFormTabs */
export default function LoginFormContent() {
  const [showPassword, setShowPassword] = useState(false)
  const {
    formData,
    handleChange,
    handleLogin,
    loading,
    error,
    setCaptchaToken,
    turnstileKey,
    captchaEnabled,
    captchaSiteKey,
  } = useLogin()

  return (
    <form className="space-y-4" onSubmit={handleLogin}>
      <div className="space-y-3">
        <AuthInput
          id="login-identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          required
          placeholder="Email or username"
          icon={Mail}
          value={formData.identifier}
          onChange={handleChange}
        />
        <AuthInput
          id="login-password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
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
      </div>

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-xs font-medium text-gray-500 transition-colors hover:text-blue-400"
        >
          Forgot password?
        </Link>
      </div>

      {error && <AuthStatusMessage tone="error">{error}</AuthStatusMessage>}

      {captchaEnabled && (
        <AuthTurnstile
          turnstileKey={turnstileKey}
          siteKey={captchaSiteKey}
          onSuccess={(token) => setCaptchaToken(token)}
          onExpire={() => setCaptchaToken(null)}
        />
      )}

      <AuthButton type="submit" loading={loading}>
        Sign In
      </AuthButton>

      <AuthDivider />
      <GoogleLoginButton />
    </form>
  )
}
