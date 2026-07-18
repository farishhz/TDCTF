import React from 'react'
import { Card, CardContent } from '@/shared/ui/card'
import { cn } from '@/shared/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { TYPO_STAT_VALUE_CLASS, TYPO_MUTED_CLASS } from '@/shared/styles'

interface AdminStatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  description?: string
  className?: string
  iconClassName?: string
}

export default function AdminStatCard({
  label,
  value,
  icon: Icon,
  description,
  className,
  iconClassName,
}: AdminStatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/30 hover:shadow-[0_8px_20px_rgba(59,130,246,0.06)] bg-white/70 dark:bg-[#111622]/80 backdrop-blur-xl border border-gray-200/80 dark:border-gray-700/80 rounded-2xl",
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block truncate">
              {label}
            </span>
            <span className={cn(TYPO_STAT_VALUE_CLASS, "block leading-none")}>
              {value}
            </span>
          </div>
          {Icon && (
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
                iconClassName
              )}
            >
              <Icon size={18} />
            </div>
          )}
        </div>
        {description && (
          <p className={cn(TYPO_MUTED_CLASS, "mt-3 font-medium text-gray-500")}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
