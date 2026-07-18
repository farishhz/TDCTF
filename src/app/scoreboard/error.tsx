'use client'

import { RouteError } from '@/shared/components'

export default function Error({ reset }: { reset: () => void }) {
  return (
    <RouteError
      title="Scoreboard could not load"
      description="Please retry loading the scoreboard."
      reset={reset}
    />
  )
}

