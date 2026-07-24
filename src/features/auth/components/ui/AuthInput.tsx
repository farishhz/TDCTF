import React, { forwardRef } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon
  rightElement?: React.ReactNode
  error?: string
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ icon: Icon, rightElement, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <div className="group relative">
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-blue-400" />
          <input
            ref={ref}
            spellCheck={false}
            className={cn(
              'h-11 w-full rounded-xl border border-white/8 bg-white/5 px-10 text-sm text-white',
              'placeholder:text-gray-600 caret-blue-400 outline-none',
              'transition-all duration-200',
              'hover:border-white/15 hover:bg-white/8',
              'focus:border-blue-500/60 focus:bg-white/8 focus:ring-2 focus:ring-blue-500/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              rightElement && 'pr-11',
              error && 'border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20',
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs font-medium text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

AuthInput.displayName = 'AuthInput'
