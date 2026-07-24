import React from 'react'
import APP from '@/config'
import { TDCTF } from '@/_vars/const'

interface AuthHeaderProps {
  badge?: string
  title: string
  subtitle?: string
}

export function AuthHeader({ badge, title, subtitle }: AuthHeaderProps) {
  return (
    <div className="mb-6 space-y-1">
      {badge && (
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
          {badge}
        </p>
      )}
      <h2 className="text-2xl font-black tracking-tight text-white">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-gray-500">{subtitle}</p>
      )}
    </div>
  )
}
