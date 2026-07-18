'use client'

import { AppTabs } from '@/shared/ui'
import type { ChallengeDialogTab } from '../../types'

type ChallengeDialogTabsProps = {
  challengeId: string
  tabs: Array<{ key: ChallengeDialogTab; label: string }>
  activeTab: ChallengeDialogTab
  onTabChange: (tab: ChallengeDialogTab, challengeId?: string) => void
}

export default function ChallengeDialogTabs({
  challengeId,
  tabs,
  activeTab,
  onTabChange,
}: ChallengeDialogTabsProps) {
  return (
    <AppTabs
      items={tabs.map((tab) => ({ value: tab.key, label: tab.label }))}
      value={activeTab}
      onValueChange={(tab) => onTabChange(tab, challengeId)}
      variant="panel"
      stretch
      ariaLabel="Challenge dialog tabs"
    />
  )
}
