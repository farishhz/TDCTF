'use client'

import { RouteError } from '@/shared/components'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <RouteError
      title="Teams could not load"
      description="Please retry loading the teams page."
      reset={reset}
    />
  )
}

