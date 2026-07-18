import React, { type ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import { cn } from '@/shared/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface AdminPanelProps {
  title?: React.ReactNode
  description?: string
  icon?: LucideIcon
  action?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  headerClassName?: string
}

export default function AdminPanel({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
  contentClassName,
  headerClassName,
}: AdminPanelProps) {
  const hasHeader = title || description || action
  return (
    <Card
      className={cn(
        "bg-white/70 dark:bg-[#111622]/80 backdrop-blur-xl border border-gray-200/80 dark:border-gray-700/80 rounded-2xl overflow-hidden shadow-sm",
        className
      )}
    >
      {hasHeader && (
        <CardHeader
          className={cn(
            "flex flex-row items-center justify-between gap-4 border-b border-gray-200/50 px-5 py-4 dark:border-gray-800/60",
            headerClassName
          )}
        >
          <div className="space-y-1 min-w-0">
            {title && (
              <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white">
                {Icon && <Icon size={16} className="text-blue-500 dark:text-blue-400" />}
                {typeof title === 'string' ? <span>{title}</span> : title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-normal">
                {description}
              </CardDescription>
            )}
          </div>
          {action && <div className="flex shrink-0 items-center">{action}</div>}
        </CardHeader>
      )}
      <CardContent className={cn("p-5", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  )
}
