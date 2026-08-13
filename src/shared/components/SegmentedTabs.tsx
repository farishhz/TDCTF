import React from 'react'
import { cn } from '@/shared/lib/utils'

type SegmentedTabsVariant = 'pill' | 'panel' | 'panelLarge' | 'compact'

type SegmentedTabsItem<T extends string> = {
  value: T
  label: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
}

type SegmentedTabsProps<T extends string> = {
  items: SegmentedTabsItem<T>[]
  value: T
  onChange: (value: T) => void
  variant?: SegmentedTabsVariant
  className?: string
  stretch?: boolean
}

const containerClasses: Record<SegmentedTabsVariant, string> = {
  pill:
    'inline-flex max-w-full flex-nowrap overflow-x-auto rounded-full border border-white/20 bg-white/20 p-1 backdrop-blur-xl scroll-hidden dark:border-white/10 dark:bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]',
  panel:
    'flex w-fit max-w-full flex-nowrap gap-1.5 overflow-x-auto rounded-full border border-white/20 bg-white/20 p-1.5 backdrop-blur-xl scroll-hidden dark:border-white/10 dark:bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]',
  panelLarge:
    'flex max-w-full flex-nowrap gap-1.5 overflow-x-auto rounded-full border border-white/20 bg-white/20 p-1 backdrop-blur-xl scroll-hidden dark:border-white/10 dark:bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]',
  compact:
    'flex max-w-full flex-nowrap gap-1 overflow-x-auto rounded-full border border-white/20 bg-white/20 p-1 backdrop-blur-xl scroll-hidden dark:border-white/10 dark:bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]',
}

const buttonClasses: Record<SegmentedTabsVariant, string> = {
  pill:
    'flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold caret-transparent transition-all duration-300 focus-visible:outline-none active:scale-[0.98]',
  panel:
    'flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider caret-transparent transition-all duration-300 focus-visible:outline-none active:scale-[0.98]',
  panelLarge:
    'flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-2.5 text-[10px] font-black uppercase tracking-widest caret-transparent transition-all duration-300 focus-visible:outline-none active:scale-[0.98]',
  compact:
    'shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-center text-xs font-bold caret-transparent transition-all duration-300 focus-visible:outline-none active:scale-[0.98]',
}

const activeClasses: Record<SegmentedTabsVariant, string> = {
  pill:
    'bg-gradient-to-b from-blue-400/80 to-blue-600/80 text-white border border-white/20 backdrop-blur-xl shadow-[0_8px_24px_0_rgba(37,99,235,0.3),inset_0_1px_1px_rgba(255,255,255,0.5)] dark:from-blue-500/50 dark:to-blue-700/50 dark:border-white/20',
  panel:
    'bg-gradient-to-b from-blue-400/80 to-blue-600/80 text-white border border-white/20 backdrop-blur-xl shadow-[0_8px_24px_0_rgba(37,99,235,0.3),inset_0_1px_1px_rgba(255,255,255,0.5)] dark:from-blue-500/50 dark:to-blue-700/50 dark:border-white/20',
  panelLarge:
    'bg-gradient-to-b from-blue-400/80 to-blue-600/80 text-white border border-white/20 backdrop-blur-xl shadow-[0_8px_24px_0_rgba(37,99,235,0.3),inset_0_1px_1px_rgba(255,255,255,0.5)] dark:from-blue-500/50 dark:to-blue-700/50 dark:border-white/20',
  compact:
    'bg-gradient-to-b from-blue-400/80 to-blue-600/80 text-white border border-white/20 backdrop-blur-xl shadow-[0_8px_24px_0_rgba(37,99,235,0.3),inset_0_1px_1px_rgba(255,255,255,0.5)] dark:from-blue-500/50 dark:to-blue-700/50 dark:border-white/20',
}

const inactiveClasses: Record<SegmentedTabsVariant, string> = {
  pill:
    'text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white',
  panel:
    'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
  panelLarge:
    'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
  compact:
    'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
}

export function SegmentedTabs<T extends string>({
  items,
  value,
  onChange,
  variant = 'panel',
  className,
  stretch = false,
}: SegmentedTabsProps<T>) {
  return (
    <div className={cn(containerClasses[variant], stretch && 'w-full', className)}>
      {items.map((item) => {
        const Icon = item.icon
        const isActive = item.value === value

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              buttonClasses[variant],
              stretch && 'flex-1 basis-0',
              isActive ? activeClasses[variant] : inactiveClasses[variant]
            )}
          >
            {Icon ? (
              <Icon
                className={cn(
                  variant === 'compact' ? 'h-4 w-4' : 'h-4 w-4',
                  isActive && 'text-blue-600 dark:text-blue-400'
                )}
              />
            ) : null}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
