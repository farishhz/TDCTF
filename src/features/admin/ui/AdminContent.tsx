import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

type AdminContentProps = {
  children: ReactNode
  className?: string
}

export default function AdminContent({ children, className }: AdminContentProps) {
  return (
    <main className={cn('min-w-0 flex-1 px-4 sm:px-6 lg:px-8 flex flex-col', className)}>
      {children}
    </main>
  )
}
