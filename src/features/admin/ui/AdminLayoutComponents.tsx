import React, { type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import EmptyState from '@/shared/components/EmptyState'
import {
  AppTabs,
  type AppTabItem,
  Badge,
  DataSurface,
  FilterInput,
  FilterSelect,
  FilterToolbar,
  type FilterSelectOption,
} from '@/shared/ui'

export const ADMIN_STICKY_TOOLBAR_CLASS =
  'sticky top-14 z-30 -mx-4 border-b border-gray-200/60 bg-white/95 px-4 py-2.5 backdrop-blur-md dark:border-gray-800/60 dark:bg-[#0b0f19]/95 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8'

export const ADMIN_CONTROL_CLASS =
  'h-9 rounded-xl text-xs font-semibold'

export const ADMIN_ROW_CLASS =
  'border-b border-gray-100/80 transition-colors duration-150 ease-in-out last:border-b-0 hover:bg-blue-50/40 dark:border-gray-800/70 dark:hover:bg-blue-900/10'

interface AdminPageSurfaceProps {
  children: ReactNode
  className?: string
}

export function AdminPageSurface({ children, className }: AdminPageSurfaceProps) {
  return (
    <div className={cn("w-full", className)}>
      {children}
    </div>
  )
}

interface AdminStickyToolbarProps {
  tabs?: ReactNode
  filters?: ReactNode
  actions?: ReactNode
  className?: string
  contentClassName?: string
}

export function AdminStickyToolbar({
  tabs,
  filters,
  actions,
  className,
  contentClassName,
}: AdminStickyToolbarProps) {
  return (
    <div className={cn(ADMIN_STICKY_TOOLBAR_CLASS, className)}>
      <div className={cn('flex flex-col gap-2.5', contentClassName)}>
        {(tabs || actions) && (
          <div className={cn(
            'flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between',
            filters && 'border-b border-gray-100/60 pb-2 dark:border-gray-800/40'
          )}>
            {tabs && <div className="min-w-0">{tabs}</div>}
            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
          </div>
        )}
        {filters}
      </div>
    </div>
  )
}

interface AdminTabsProps<T extends string> {
  items: AppTabItem<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
  stretch?: boolean
}

export function AdminTabs<T extends string>({
  items,
  value,
  onChange,
  className,
  stretch,
}: AdminTabsProps<T>) {
  return (
    <AppTabs
      items={items}
      value={value}
      onValueChange={onChange}
      variant="panel"
      className={className}
      stretch={stretch}
      ariaLabel="Admin tabs"
    />
  )
}

interface AdminListSurfaceProps {
  children: ReactNode
  className?: string
}

export function AdminListSurface({ children, className }: AdminListSurfaceProps) {
  return (
    <div className={cn("divide-y divide-gray-150 dark:divide-gray-850", className)}>
      {children}
    </div>
  )
}

interface AdminTableSurfaceProps {
  children: ReactNode
  className?: string
}

export function AdminTableSurface({ children, className }: AdminTableSurfaceProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      {children}
    </div>
  )
}

interface AdminDataSurfaceProps {
  children: ReactNode
  toolbar?: ReactNode
  empty?: ReactNode
  className?: string
  contentClassName?: string
}

export function AdminDataSurface({
  children,
  toolbar,
  empty,
  className,
  contentClassName,
}: AdminDataSurfaceProps) {
  return (
    <DataSurface
      toolbar={toolbar}
      empty={empty}
      className={className}
      contentClassName={contentClassName}
    >
      {children}
    </DataSurface>
  )
}

interface AdminSectionProps {
  title?: ReactNode
  description?: string
  children: ReactNode
  className?: string
}

export function AdminSection({ title, description, children, className }: AdminSectionProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {description}
            </p>
          )}
        </div>
      )}
      <div>
        {children}
      </div>
    </div>
  )
}

export const AdminFilterToolbar = FilterToolbar
export const AdminFilterInput = FilterInput

type AdminFilterSelectProps<T extends string = string> = Omit<React.ComponentProps<typeof FilterSelect>, 'onChange' | 'value' | 'defaultValue'> & {
  value: T
  defaultValue?: T
  onValueChange: (value: T) => void
  options: FilterSelectOption[]
}

export function AdminFilterSelect<T extends string>({ onValueChange, ...props }: AdminFilterSelectProps<T>) {
  return <FilterSelect onChange={onValueChange as (value: string) => void} {...props} />
}

const ADMIN_STATUS_BADGE_CLASS = {
  neutral: 'border-gray-300/80 bg-gray-100/60 text-gray-600 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-300',
  muted: 'border-gray-300/80 bg-gray-100/60 text-gray-500 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-400',
  info: 'border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  success: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  warning: 'border-yellow-500/25 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
  danger: 'border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300',
} as const

export type AdminStatusBadgeTone = keyof typeof ADMIN_STATUS_BADGE_CLASS

interface AdminStatusBadgeProps extends React.ComponentProps<typeof Badge> {
  tone?: AdminStatusBadgeTone
}

export function AdminStatusBadge({
  tone = 'neutral',
  className,
  variant = 'outline',
  ...props
}: AdminStatusBadgeProps) {
  return (
    <Badge
      variant={variant}
      className={cn(ADMIN_STATUS_BADGE_CLASS[tone], className)}
      {...props}
    />
  )
}

interface AdminErrorStateProps {
  title?: string
  description?: React.ReactNode
  action?: React.ReactNode
}

export function AdminErrorState({
  title = "Something went wrong",
  description = "There was an error loading the data. Please try again.",
  action,
}: AdminErrorStateProps) {
  return (
    <div className="py-10 border border-dashed border-red-200/40 dark:border-red-900/40 rounded-2xl bg-red-50/10 dark:bg-red-950/5 flex items-center justify-center">
      <EmptyState
        icon={<AlertTriangle className="w-8 h-8 text-red-500 dark:text-red-400" />}
        title={title}
        description={description}
        containerHeight="py-2"
        action={action}
      />
    </div>
  )
}
