'use client'

import React from 'react'
import APP from '@/config'
import { AlertCircle } from 'lucide-react'
import { AuthCard } from './AuthCard'
import { AuthFooter } from './AuthFooter'
import { AuthHeader } from './AuthHeader'

export function SignupDisabled() {
  return (
    <AuthCard>
      <AuthHeader
        badge="Closed"
        title="Registration Closed"
        subtitle={`Join ${APP.fullName} event`}
      />

      <div className="my-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
        {/* Row 1: Icon and Title side-by-side */}
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle className="h-4.5 w-4.5 text-red-500" />
          <span>Pendaftaran Dinonaktifkan</span>
        </div>
        {/* Row 2: Description underneath */}
        <p className="mt-2 text-xs opacity-90 leading-relaxed">
          Registrasi saat ini sedang ditutup oleh administrator. Silakan hubungi panitia jika Anda membutuhkan bantuan.
        </p>
      </div>

      <AuthFooter text="Sudah punya akun?" href="/login" linkText="Masuk" />
    </AuthCard>
  )
}
