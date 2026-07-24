import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  loading?: boolean
}

export function AuthButton({ children, loading, className = '', disabled, ...props }: AuthButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'relative flex h-11 w-full items-center justify-center overflow-hidden rounded-xl',
        'bg-blue-600 text-sm font-semibold text-white',
        'shadow-lg shadow-blue-600/25',
        'transition-all duration-200',
        'hover:bg-blue-500 hover:shadow-blue-500/30',
        'active:scale-[0.98]',
        'disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:hover:bg-blue-600',
        className
      )}
    >
      <span className="flex items-center gap-2">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          children
        )}
      </span>
    </button>
  )
}
