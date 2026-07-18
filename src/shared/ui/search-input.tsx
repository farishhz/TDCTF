"use client"

import * as React from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Input } from './input'

export type SearchInputSize = 'sm' | 'md'

type SearchInputProps = Omit<React.ComponentProps<typeof Input>, 'value' | 'defaultValue' | 'onChange' | 'size'> & {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onClear?: () => void
  debounceMs?: number
  size?: SearchInputSize
  showClearButton?: boolean
  showSearchIcon?: boolean
  containerClassName?: string
  inputClassName?: string
  clearButtonClassName?: string
  icon?: React.ReactNode
  clearAriaLabel?: string
}

const SIZE_CLASS: Record<SearchInputSize, string> = {
  sm: 'h-9 text-xs',
  md: 'h-10 text-sm',
}

export const SEARCH_INPUT_CLEAR_BUTTON_CLASS =
  'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:pointer-events-none disabled:opacity-50'

export function SearchInput({
  value,
  defaultValue = '',
  onChange,
  onClear,
  debounceMs,
  size = 'sm',
  showClearButton = true,
  showSearchIcon = true,
  containerClassName,
  inputClassName,
  clearButtonClassName,
  className,
  disabled,
  icon,
  clearAriaLabel = 'Clear search',
  ...props
}: SearchInputProps) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const currentValue = isControlled ? value : internalValue
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const iconNode = showSearchIcon ? (icon ?? <Search className="h-4 w-4 text-gray-400 dark:text-gray-400" />) : null
  const showClear = showClearButton && !disabled && currentValue !== defaultValue

  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const emitChange = (nextValue: string) => {
    if (!onChange) return
    if (!debounceMs || debounceMs <= 0) {
      onChange(nextValue)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onChange(nextValue), debounceMs)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value
    if (!isControlled) setInternalValue(nextValue)
    emitChange(nextValue)
  }

  const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!isControlled) setInternalValue(defaultValue)
    if (onClear) onClear()
    else onChange?.(defaultValue)
  }

  return (
    <div className={cn('relative w-full max-w-md', containerClassName)}>
      <Input
        value={currentValue}
        disabled={disabled}
        onChange={handleChange}
        className={cn(
          'rounded-xl',
          SIZE_CLASS[size],
          iconNode && 'pl-9',
          showClear && 'pr-10',
          inputClassName,
          className
        )}
        {...props}
      />
      {iconNode && (
        <div className="pointer-events-none absolute left-3 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center">
          {iconNode}
        </div>
      )}
      {showClear && (
        <button
          type="button"
          aria-label={clearAriaLabel}
          onClick={handleClear}
          className={cn(
            SEARCH_INPUT_CLEAR_BUTTON_CLASS,
            'absolute right-1 top-1 z-10 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200',
            clearButtonClassName
          )}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
