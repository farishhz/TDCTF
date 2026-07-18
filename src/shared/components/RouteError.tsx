'use client'

import { AlertTriangle, RefreshCcw } from 'lucide-react'
import EmptyState from '@/shared/components/EmptyState'
import { Button } from '@/shared/ui/button'

interface RouteErrorProps {
  title?: string
  description?: string
  reset?: () => void
}

export function RouteError({
  title = 'Page could not load',
  description = 'Please try again.',
  reset,
}: RouteErrorProps) {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <EmptyState
        icon={<AlertTriangle />}
        title={title}
        description={description}
        containerHeight="py-16"
        action={
          reset ? (
            <Button type="button" variant="outline" onClick={reset}>
              <RefreshCcw />
              Try again
            </Button>
          ) : null
        }
      />
    </main>
  )
}

