import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface AdminPageShellProps {
  children: ReactNode
  mainClassName?: string
}

export default function AdminPageShell({
  children,
  mainClassName = '',
}: AdminPageShellProps) {
  return (
    <div className={cn('min-w-0 flex flex-col flex-1', mainClassName)}>
      <div className="flex flex-col flex-1 min-w-0 min-h-0">{children}</div>
    </div>
  )
}

