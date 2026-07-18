import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface ChallengeFormToggleProps {
  checked: boolean
  label: string
  icon: LucideIcon
  activeClassName: string
  onChange: (checked: boolean) => void
}

export const ChallengeFormToggle: React.FC<ChallengeFormToggleProps> = ({
  checked,
  label,
  icon: Icon,
  activeClassName,
  onChange,
}) => {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition-all",
        "border-gray-200/80 bg-white/70 text-gray-600 shadow-sm hover:border-blue-500/30 hover:text-gray-900",
        "dark:border-gray-800/80 dark:bg-[#111622]/80 dark:text-gray-300 dark:hover:text-white",
        checked && activeClassName
      )}
    >
      <Icon className={cn("h-4 w-4", checked && "fill-current")} />
      {label}
    </button>
  )
}
