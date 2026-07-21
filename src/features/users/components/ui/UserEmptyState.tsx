import React from 'react'
import type { LucideIcon } from 'lucide-react'
import EmptyState from '@/shared/components/EmptyState'
import { cn } from '@/shared/lib/utils'

type UserEmptyStateProps = {
  icon: LucideIcon
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function UserEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: UserEmptyStateProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-gray-200/80 bg-white/40 backdrop-blur-sm dark:border-gray-800/80 dark:bg-gray-900/40',
        className
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
      <EmptyState
        icon={<Icon className="h-full w-full text-blue-500 dark:text-blue-400" />}
        title={title}
        description={description}
        action={action}
        containerHeight="py-10"
        className="relative z-10 [&_div:first-child]:bg-blue-500/10 [&_div:first-child]:text-blue-500 [&_div:first-child]:ring-1 [&_div:first-child]:ring-blue-500/25 shadow-[0_0_15px_rgba(59,130,246,0.05)]"
      />
    </div>
  )
}
