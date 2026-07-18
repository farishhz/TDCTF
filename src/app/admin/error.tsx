'use client'

import { RouteError } from '@/shared/components'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <RouteError
      title="Admin page could not load"
      description="Please retry loading the admin workspace."
      reset={reset}
    />
  )
}

