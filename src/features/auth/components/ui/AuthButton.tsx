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
        'relative flex h-11 w-full items-center justify-center overflow-hidden rounded-full',
        'bg-gradient-to-b from-blue-400/70 to-blue-600/70 text-sm font-semibold text-white',
        'border border-white/20 backdrop-blur-xl',
        'shadow-[0_8px_32px_0_rgba(37,99,235,0.25),inset_0_1px_1px_rgba(255,255,255,0.5)]',
        'transition-all duration-300',
        'hover:from-blue-400/90 hover:to-blue-600/90 hover:shadow-[0_8px_32px_0_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.7)]',
        'dark:from-blue-500/40 dark:to-blue-700/40 dark:border-white/10 dark:shadow-[0_8px_32px_0_rgba(37,99,235,0.15),inset_0_1px_1px_rgba(255,255,255,0.2)]',
        'dark:hover:from-blue-500/60 dark:hover:to-blue-700/60',
        'active:scale-[0.98]',
        'disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none',
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
