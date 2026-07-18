import * as React from 'react'
import { cn } from '@/shared/lib/utils'
import {
  SURFACE_GLASS_BASE_CLASS,
  SURFACE_INTERACTIVE_HOVER_CLASS,
} from '@/shared/styles'

export type SurfaceVariant = 'default' | 'muted' | 'glass' | 'data' | 'flat' | 'interactive'
export type SurfacePadding = 'none' | 'sm' | 'md' | 'lg'

type SurfaceBaseProps = {
  variant?: SurfaceVariant
  padding?: SurfacePadding
  interactive?: boolean
}

type SurfaceDivProps = React.HTMLAttributes<HTMLDivElement> & SurfaceBaseProps & {
  as?: 'div'
}

type SurfaceButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & SurfaceBaseProps & {
  as: 'button'
}

type SurfaceCardProps = SurfaceDivProps | SurfaceButtonProps

const surfaceVariantClass: Record<SurfaceVariant, string> = {
  default: `${SURFACE_GLASS_BASE_CLASS} rounded-2xl shadow-sm`,
  muted: 'rounded-2xl border border-gray-200/70 bg-gray-50/50 shadow-sm dark:border-gray-800/80 dark:bg-black/10',
  glass: `${SURFACE_GLASS_BASE_CLASS} rounded-2xl shadow-sm`,
  data: 'w-full',
  flat: 'w-full',
  interactive: `${SURFACE_GLASS_BASE_CLASS} rounded-2xl shadow-sm ${SURFACE_INTERACTIVE_HOVER_CLASS}`,
}

const surfacePaddingClass: Record<SurfacePadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-6',
}

export function SurfaceCard({
  children,
  className,
  variant = 'glass',
  padding = 'none',
  interactive = false,
  as: Component = 'div',
  ...props
}: SurfaceCardProps) {
  const surfaceClassName = cn(
    surfaceVariantClass[interactive ? 'interactive' : variant],
    surfacePaddingClass[padding],
    className
  )

  if (Component === 'button') {
    const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>

    return (
      <button
        type={buttonProps.type ?? 'button'}
        className={surfaceClassName}
        {...buttonProps}
      >
        {children}
      </button>
    )
  }

  return (
    <div
      className={surfaceClassName}
      {...(props as React.HTMLAttributes<HTMLDivElement>)}
    >
      {children}
    </div>
  )
}

type DataSurfaceProps = React.HTMLAttributes<HTMLDivElement> & {
  toolbar?: React.ReactNode
  empty?: React.ReactNode
  contentClassName?: string
  emptyClassName?: string
}

export function DataSurface({
  children,
  toolbar,
  empty,
  className,
  contentClassName,
  emptyClassName,
  ...props
}: DataSurfaceProps) {
  return (
    <SurfaceCard variant="data" className={className} {...props}>
      {toolbar}
      {empty ? (
        <div className={cn('p-5 sm:p-6', emptyClassName)}>{empty}</div>
      ) : (
        <div className={contentClassName}>{children}</div>
      )}
    </SurfaceCard>
  )
}

type SurfaceHeaderProps = React.HTMLAttributes<HTMLDivElement>

export function SurfaceHeader({ children, className, ...props }: SurfaceHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-b border-gray-200/70 px-4 py-3.5 dark:border-gray-800/80 sm:px-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

type SurfaceRowProps = React.HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean
}

export function SurfaceRow({
  children,
  className,
  interactive = true,
  ...props
}: SurfaceRowProps) {
  return (
    <div
      className={cn(
        'border-b border-gray-100/80 last:border-b-0 dark:border-gray-800/70',
        interactive && 'transition-colors duration-150 ease-in-out hover:bg-blue-50/40 dark:hover:bg-blue-900/10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
