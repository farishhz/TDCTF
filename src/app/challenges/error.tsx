'use client'

import { RouteError } from '@/shared/components'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <RouteError
      title="Challenges could not load"
      description="Please retry loading the challenge list."
      reset={reset}
    />
  )
}

