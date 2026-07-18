'use client'

import { Trophy, Globe } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { AppTabs } from '@/shared/ui'
import { useTransition } from 'react'

type ScoreboardScopeTabsProps = {
  view: 'top' | 'all'
  onViewChange: (view: 'top' | 'all') => void
  className?: string
}

export default function ScoreboardScopeTabs({
  view,
  onViewChange,
  className,
}: ScoreboardScopeTabsProps) {
  const [, startTransition] = useTransition()

  const handleChange = (nextView: 'top' | 'all') => {
    startTransition(() => {
      onViewChange(nextView)
    })
  }

  return (
    <div
      className={cn(
        'flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center',
        className
      )}
    >
      <AppTabs
        items={[
          { value: 'top', label: 'Top 100', icon: Trophy },
          { value: 'all', label: 'Top 1000', icon: Globe },
        ]}
        value={view}
        onValueChange={handleChange}
        className="w-full sm:w-auto"
        size="sm"
        ariaLabel="Scoreboard scope"
      />
    </div>
  )
}
