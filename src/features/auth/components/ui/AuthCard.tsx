'use client'

import React from 'react'
import { cn } from '@/shared/lib/utils'

interface AuthCardProps {
  children: React.ReactNode
  className?: string
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div className={cn('w-full', className)}>
      {children}
    </div>
  )
}
