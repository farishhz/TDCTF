import React from 'react'
import { cn } from '@/shared/lib/utils'

export type AppTabsVariant = 'panel' | 'pill' | 'compact'
export type AppTabsSize = 'sm' | 'md' | 'lg'

export type AppTabItem<T extends string> = {
  value: T
  label: React.ReactNode
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>
  disabled?: boolean
}

type AppTabsProps<T extends string> = {
  items: AppTabItem<T>[]
  value: T
  onValueChange: (value: T) => void
  className?: string
  itemClassName?: string
  variant?: AppTabsVariant
  size?: AppTabsSize
  stretch?: boolean
  hideActiveLabel?: boolean
  hideInactiveLabel?: boolean
  collapseActive?: boolean
  collapseInactive?: boolean
  ariaLabel?: string
}

const containerClasses: Record<AppTabsVariant, string> = {
  panel:
    'flex w-fit max-w-full flex-nowrap gap-1 overflow-x-auto rounded-full border border-white/20 bg-white/20 p-1 shadow-sm backdrop-blur-xl scroll-hidden dark:border-white/10 dark:bg-white/5',
  pill:
    'inline-flex max-w-full flex-nowrap overflow-x-auto rounded-full border border-white/20 bg-white/20 p-1 shadow-sm backdrop-blur-xl scroll-hidden dark:border-white/10 dark:bg-white/5',
  compact:
    'flex max-w-full flex-nowrap gap-1 overflow-x-auto rounded-full border border-white/20 bg-white/20 p-1 shadow-sm backdrop-blur-xl scroll-hidden dark:border-white/10 dark:bg-white/5',
}

const sizeClasses: Record<AppTabsSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm sm:px-5',
  lg: 'px-5 py-2.5 text-sm sm:px-6',
}

const activeClasses: Record<AppTabsVariant, string> = {
  panel: 'bg-gradient-to-b from-blue-400/80 to-blue-600/80 text-white border border-white/20 backdrop-blur-xl shadow-[0_8px_24px_0_rgba(37,99,235,0.3),inset_0_1px_1px_rgba(255,255,255,0.5)] dark:from-blue-500/50 dark:to-blue-700/50 dark:border-white/20',
  pill: 'bg-gradient-to-b from-blue-400/80 to-blue-600/80 text-white border border-white/20 backdrop-blur-xl shadow-[0_8px_24px_0_rgba(37,99,235,0.3),inset_0_1px_1px_rgba(255,255,255,0.5)] dark:from-blue-500/50 dark:to-blue-700/50 dark:border-white/20',
  compact: 'bg-gradient-to-b from-blue-400/80 to-blue-600/80 text-white border border-white/20 backdrop-blur-xl shadow-[0_8px_24px_0_rgba(37,99,235,0.3),inset_0_1px_1px_rgba(255,255,255,0.5)] dark:from-blue-500/50 dark:to-blue-700/50 dark:border-white/20',
}

const inactiveClasses: Record<AppTabsVariant, string> = {
  panel: 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
  pill: 'text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white',
  compact: 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
}

function renderIcon(icon: AppTabItem<string>['icon'], isActive: boolean) {
  if (!icon) return null
  const iconClassName = cn('h-4 w-4 shrink-0', isActive && 'text-blue-600 dark:text-blue-400')

  if (React.isValidElement<{ className?: string }>(icon)) {
    return React.cloneElement(icon, {
      className: cn(icon.props.className, iconClassName),
    })
  }

  const Icon = icon as React.ComponentType<{ className?: string }>
  return <Icon className={iconClassName} />
}

export function AppTabs<T extends string>({
  items,
  value,
  onValueChange,
  className,
  itemClassName,
  variant = 'panel',
  size = 'md',
  stretch = false,
  hideActiveLabel = false,
  hideInactiveLabel = false,
  collapseActive = false,
  collapseInactive = false,
  ariaLabel = 'Tabs',
}: AppTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(containerClasses[variant], stretch && 'w-full', className)}
    >
      {items.map((item) => {
        const isActive = item.value === value
        const showLabel = isActive ? !hideActiveLabel : !hideInactiveLabel

        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={item.disabled}
            onClick={() => onValueChange(item.value)}
            className={cn(
              'flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-bold caret-transparent transition-all duration-300 focus-visible:outline-none active:scale-[0.98]',
              sizeClasses[size],
              stretch && !collapseActive && !collapseInactive && 'flex-1 basis-0',
              stretch && collapseActive && (isActive ? 'w-10 flex-none px-0 sm:px-0' : 'flex-1 basis-0'),
              stretch && collapseInactive && (!isActive ? 'w-10 flex-none px-0 sm:px-0' : 'flex-1 basis-0'),
              isActive ? activeClasses[variant] : inactiveClasses[variant],
              itemClassName
            )}
          >
            {renderIcon(item.icon, isActive)}
            {showLabel && item.label}
          </button>
        )
      })}
    </div>
  )
}
