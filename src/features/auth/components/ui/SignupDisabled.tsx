'use client'

import React from 'react'
import APP from '@/config'
import { ShieldOff } from 'lucide-react'
import { AuthCard } from './AuthCard'
import { AuthFooter } from './AuthFooter'

export function SignupDisabled() {
  return (
    <AuthCard>
      <div className="mb-6 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-red-400">Closed</p>
        <h2 className="text-2xl font-black tracking-tight text-white">Registration Closed</h2>
        <p className="text-sm text-gray-500">Join {APP.fullName} event</p>
      </div>

      <div className="rounded-xl border border-red-500/20 bg-red-500/8 p-4">
        <div className="flex items-center gap-2.5">
          <ShieldOff className="h-5 w-5 shrink-0 text-red-400" />
          <span className="text-sm font-semibold text-red-400">Pendaftaran Dinonaktifkan</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          Registrasi saat ini sedang ditutup oleh administrator. Silakan hubungi panitia jika Anda membutuhkan bantuan.
        </p>
      </div>

      <AuthFooter text="Sudah punya akun?" href="/login" linkText="Masuk" />
    </AuthCard>
  )
}
