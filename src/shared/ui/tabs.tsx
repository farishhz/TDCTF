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
    'flex w-fit max-w-full flex-nowrap gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white/40 p-1.5 shadow-sm backdrop-blur-sm scroll-hidden dark:border-gray-800 dark:bg-gray-900/40',
  pill:
    'inline-flex max-w-full flex-nowrap overflow-x-auto rounded-full border border-gray-200 bg-white/50 p-1 shadow-sm backdrop-blur scroll-hidden dark:border-white/10 dark:bg-gray-800/50',
  compact:
    'flex max-w-full flex-nowrap gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-black/5 p-1 shadow-sm scroll-hidden dark:border-gray-800 dark:bg-white/5',
}

const sizeClasses: Record<AppTabsSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm sm:px-5',
  lg: 'px-5 py-2.5 text-sm sm:px-6',
}

const activeClasses: Record<AppTabsVariant, string> = {
  panel: 'bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-400',
  pill: 'bg-blue-500/15 text-blue-600 shadow-sm dark:text-blue-400',
  compact: 'bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-400',
}

const inactiveClasses: Record<AppTabsVariant, string> = {
  panel: 'text-gray-500 hover:bg-white/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-gray-200',
  pill: 'text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400',
  compact: 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200',
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
              'flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-bold caret-transparent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50',
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
