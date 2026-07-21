import type React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export type StatColorScheme = 'amber' | 'cyan' | 'emerald' | 'rose' | 'purple' | 'blue'

type UserStatProps = {
  icon: LucideIcon
  label: string
  value: React.ReactNode
  detail?: React.ReactNode
  onClick?: () => void
  className?: string
  colorScheme?: StatColorScheme
}

const COLOR_MAP: Record<StatColorScheme, {
  iconBg: string
  iconText: string
  ring: string
  hoverBorder: string
  hoverShadow: string
  valueAccent: string
}> = {
  amber: {
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/15',
    iconText: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-500/25',
    hoverBorder: 'hover:border-amber-500/40',
    hoverShadow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.12)]',
    valueAccent: 'group-hover:text-amber-500 dark:group-hover:text-amber-400',
  },
  cyan: {
    iconBg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
    iconText: 'text-cyan-600 dark:text-cyan-400',
    ring: 'ring-cyan-500/25',
    hoverBorder: 'hover:border-cyan-500/40',
    hoverShadow: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.12)]',
    valueAccent: 'group-hover:text-cyan-500 dark:group-hover:text-cyan-400',
  },
  emerald: {
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-500/25',
    hoverBorder: 'hover:border-emerald-500/40',
    hoverShadow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]',
    valueAccent: 'group-hover:text-emerald-500 dark:group-hover:text-emerald-400',
  },
  rose: {
    iconBg: 'bg-rose-500/10 dark:bg-rose-500/15',
    iconText: 'text-rose-600 dark:text-rose-400',
    ring: 'ring-rose-500/25',
    hoverBorder: 'hover:border-rose-500/40',
    hoverShadow: 'hover:shadow-[0_0_20px_rgba(244,63,94,0.12)]',
    valueAccent: 'group-hover:text-rose-500 dark:group-hover:text-rose-400',
  },
  purple: {
    iconBg: 'bg-purple-500/10 dark:bg-purple-500/15',
    iconText: 'text-purple-600 dark:text-purple-400',
    ring: 'ring-purple-500/25',
    hoverBorder: 'hover:border-purple-500/40',
    hoverShadow: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.12)]',
    valueAccent: 'group-hover:text-purple-500 dark:group-hover:text-purple-400',
  },
  blue: {
    iconBg: 'bg-blue-500/10 dark:bg-blue-500/15',
    iconText: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-500/25',
    hoverBorder: 'hover:border-blue-500/40',
    hoverShadow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.12)]',
    valueAccent: 'group-hover:text-blue-500 dark:group-hover:text-blue-400',
  },
}

export function UserStat({
  icon: Icon,
  label,
  value,
  detail,
  onClick,
  className,
  colorScheme = 'blue',
}: UserStatProps) {
  const Component = onClick ? 'button' : 'div'
  const colors = COLOR_MAP[colorScheme] || COLOR_MAP.blue

  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'group relative flex min-h-[76px] w-full items-center gap-3.5 p-3.5 text-left sm:min-h-[88px]',
        'rounded-xl border border-gray-200/80 bg-white/50 backdrop-blur-md dark:border-gray-800/80 dark:bg-gray-900/40',
        'transition-all duration-300',
        colors.hoverBorder,
        colors.hoverShadow,
        onClick && 'cursor-pointer hover:-translate-y-0.5',
        className
      )}
    >
      <div className={cn(
        'flex h-10 w-10 flex-none items-center justify-center rounded-xl ring-1 transition-all duration-300 group-hover:scale-110 sm:h-11 sm:w-11',
        colors.iconBg,
        colors.iconText,
        colors.ring
      )}>
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className={cn(
          'text-xl sm:text-2xl font-black font-mono tracking-tight text-gray-900 dark:text-white leading-none transition-colors duration-200',
          colors.valueAccent
        )}>
          {value}
        </div>
        <div className="mt-1 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {label}
        </div>
        {detail && (
          <div className="mt-0.5 truncate text-xs font-semibold text-gray-400 dark:text-gray-500">
            {detail}
          </div>
        )}
      </div>
    </Component>
  )
}
