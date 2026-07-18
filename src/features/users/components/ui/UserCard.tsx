'use client'

import React from 'react'
import { cn } from '@/shared/lib/utils'
import { SurfaceCard } from '@/shared/ui'

type UserCardProps = {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function UserCard({ children, className, hover = true }: UserCardProps) {
  return (
    <SurfaceCard
      variant="glass"
      className={cn(
        'rounded-xl',
        className
      )}
      interactive={hover}
    >
      {children}
    </SurfaceCard>
  )
}
