"use client"

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { SearchInput } from './search-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

export const FILTER_CONTROL_CLASS =
  'h-9 rounded-xl text-xs font-semibold'

export const FILTER_CONTROL_IDLE_CLASS =
  'border-gray-200/80 bg-white/70 text-gray-700 hover:border-blue-500/40 dark:border-gray-700/80 dark:bg-[#111622]/80 dark:text-gray-200'

export const FILTER_CONTROL_ACTIVE_CLASS =
  'border-blue-600 bg-blue-600 text-white shadow-inner hover:border-blue-600 hover:bg-blue-600 dark:border-blue-600 dark:bg-blue-600 dark:text-white'

const FILTER_CLEAR_BUTTON_CLASS =
  'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:pointer-events-none disabled:opacity-50'

type FilterToolbarProps = {
  children: React.ReactNode
  actions?: React.ReactNode
  className?: string
  controlsClassName?: string
}

export function FilterToolbar({
  children,
  actions,
  className,
  controlsClassName,
}: FilterToolbarProps) {
  return (
    <div className={cn('flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className={cn('flex min-w-0 flex-1 flex-wrap items-center gap-2 text-xs', controlsClassName)}>
        {children}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">{actions}</div>}
    </div>
  )
}

type FilterInputProps = Omit<React.ComponentProps<typeof SearchInput>, 'value' | 'defaultValue' | 'onChange' | 'size'> & {
  value: string
  defaultValue?: string
  onChange: (value: string) => void
  onClear?: () => void
  active?: boolean
  clearable?: boolean
  icon?: React.ReactNode
  wrapperClassName?: string
}

export function FilterInput({
  value,
  defaultValue = '',
  onChange,
  onClear,
  active,
  clearable = true,
  icon,
  wrapperClassName,
  className,
  disabled,
  ...props
}: FilterInputProps) {
  const isActive = active ?? value !== defaultValue

  return (
    <SearchInput
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      onChange={onChange}
      onClear={() => {
        if (onClear) onClear()
        else onChange(defaultValue)
      }}
      showClearButton={clearable}
      showSearchIcon={icon !== null}
      icon={icon}
      containerClassName={wrapperClassName}
      inputClassName={cn(
        FILTER_CONTROL_CLASS,
        isActive && FILTER_CONTROL_ACTIVE_CLASS,
        isActive && 'placeholder:text-white/70 dark:placeholder:text-white/70',
        className
      )}
      clearButtonClassName={isActive
        ? 'text-white/80 hover:bg-white/15 hover:text-white'
        : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200'
      }
      clearAriaLabel="Clear filter"
      {...props}
    />
  )
}

export type FilterSelectOption = {
  value: string
  label: React.ReactNode
  className?: string
}

type FilterSelectProps = {
  options: FilterSelectOption[]
  value: string
  defaultValue?: string
  onChange: (value: string) => void
  onClear?: () => void
  placeholder?: string
  active?: boolean
  clearable?: boolean
  disabled?: boolean
  className?: string
  triggerClassName?: string
  contentClassName?: string
  icon?: React.ReactNode
}

export function FilterSelect({
  options,
  value,
  defaultValue = 'all',
  onChange,
  onClear,
  placeholder,
  active,
  clearable = true,
  disabled,
  className,
  triggerClassName,
  contentClassName,
  icon,
}: FilterSelectProps) {
  const isActive = active ?? value !== defaultValue
  const showClear = clearable && !disabled && value !== defaultValue

  const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (onClear) onClear()
    else onChange(defaultValue)
  }

  return (
    <div className={cn('relative w-full sm:w-[130px]', className)}>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          className={cn(
            FILTER_CONTROL_CLASS,
            isActive ? FILTER_CONTROL_ACTIVE_CLASS : FILTER_CONTROL_IDLE_CLASS,
            'justify-start gap-2 overflow-hidden pr-9 [&>svg:last-child]:absolute [&>svg:last-child]:right-3 [&>svg:last-child]:shrink-0',
            showClear && '[&>svg:last-child]:hidden',
            triggerClassName
          )}
        >
          {icon && <span className="flex h-4 w-4 shrink-0 items-center justify-center">{icon}</span>}
          <span className="min-w-0 flex-1 truncate text-left">
            <SelectValue placeholder={placeholder} />
          </span>
        </SelectTrigger>
        <SelectContent className={contentClassName}>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className={option.className}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showClear && (
        <button
          type="button"
          aria-label="Clear filter"
          onClick={handleClear}
          className={cn(
            FILTER_CLEAR_BUTTON_CLASS,
            'absolute right-1 top-1 z-10 text-white/80 hover:bg-white/15 hover:text-white'
          )}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
