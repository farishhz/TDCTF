'use client'

import React from 'react'
import { ArrowLeft, Wrench, LayoutDashboard } from 'lucide-react'
import { UserTabs } from '@/features/users/components/ui/UserTabs'
import BackButton from '@/shared/components/BackButton'

type TeamTabValue = 'overview' | 'manage'

type TeamTabsProps = {
  activeTab: TeamTabValue
  setActiveTab: (tab: TeamTabValue) => void
  onBack?: () => void
  canManage?: boolean
  isMember?: boolean
  editAction?: React.ReactNode
}

export default function TeamTabs({ activeTab, setActiveTab, onBack, canManage, isMember, editAction }: TeamTabsProps) {
  const tabs = [
    { value: 'overview', label: 'Overview', icon: LayoutDashboard },
  ]

  if (isMember) {
    tabs.push({ value: 'manage', label: canManage ? 'Admin' : 'Settings', icon: Wrench })
  }

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div className="flex items-center justify-center gap-3 sm:justify-start">
        {onBack && (
          <BackButton onClick={onBack} label="Go Back" />
        )}
        {editAction}
      </div>

      <UserTabs
        activeTab={activeTab}
        onChange={setActiveTab as any}
        tabs={tabs as any}
      />
    </div>
  )
}
