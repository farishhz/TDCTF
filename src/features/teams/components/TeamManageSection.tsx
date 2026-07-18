'use client'

import React from 'react'
import { Copy, Eye, EyeOff, KeyRound, LogOut, RefreshCw, ShieldAlert, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { SURFACE_GLASS_CARD_CLASS, SURFACE_GLASS_CARD_COMPACT_CLASS } from '@/shared/styles'
import { TeamInfo } from '../types'

interface TeamManageSectionProps {
  team: TeamInfo
  canManage?: boolean
  onCopyInvite?: () => void
  onRegenerateInvite?: () => void
  onLeaveTeam?: () => void
  onDeleteTeam?: () => void
  busy?: boolean
}

export default function TeamManageSection({
  team,
  canManage = false,
  onCopyInvite,
  onRegenerateInvite,
  onLeaveTeam,
  onDeleteTeam,
  busy,
}: TeamManageSectionProps) {
  const [showToken, setShowToken] = React.useState(false)
  const token = team.invite_code || ''

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ManageCard
        title="Token"
        icon={<KeyRound size={18} className="text-emerald-500" />}
      >
        <div className="grid grid-cols-1 gap-2">
          <div className={`flex h-10 items-center gap-2 px-3 font-mono text-xs ${SURFACE_GLASS_CARD_COMPACT_CLASS}`}>
            <span className="min-w-0 flex-1 truncate text-gray-700 dark:text-gray-200">
              {showToken ? token || '-' : token ? '********' : '-'}
            </span>
            <button
              type="button"
              onClick={() => setShowToken((value) => !value)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-blue-500"
              title={showToken ? 'Hide token' : 'Show token'}
            >
              {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button
              type="button"
              onClick={onCopyInvite}
              disabled={busy || !token}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-blue-500 disabled:opacity-50"
              title="Copy token"
            >
              <Copy size={14} />
            </button>
          </div>
          {canManage && (
            <Button
              variant="outline"
              onClick={onRegenerateInvite}
              disabled={busy}
              className="h-10 w-full border-emerald-500/30 bg-emerald-500/10 text-xs font-bold uppercase tracking-wider text-emerald-600 hover:bg-emerald-600 hover:text-white dark:text-emerald-400"
            >
              <RefreshCw size={14} /> Regenerate Token
            </Button>
          )}
        </div>
      </ManageCard>

      <ManageCard
        title="Team Access"
        icon={<ShieldAlert size={18} className="text-red-500" />}
      >
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant="outline"
            onClick={onLeaveTeam}
            disabled={busy}
            className="h-10 w-full border-red-200 text-xs font-bold uppercase tracking-wider text-red-600 transition-all hover:bg-red-600 hover:text-white dark:border-red-900/30 dark:text-red-400"
          >
            <LogOut size={14} /> Leave Team
          </Button>
          {canManage && (
            <Button
              variant="destructive"
              onClick={onDeleteTeam}
              disabled={busy}
              className="h-10 w-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-red-500/20"
            >
              <Trash2 size={14} /> Delete Team
            </Button>
          )}
        </div>
      </ManageCard>
    </div>
  )
}

function ManageCard({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card className={SURFACE_GLASS_CARD_CLASS}>
      <CardHeader className="px-5 !pb-3 !pt-5">
        <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 !pb-5 !pt-2">{children}</CardContent>
    </Card>
  )
}
