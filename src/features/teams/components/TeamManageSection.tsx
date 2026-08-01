'use client'

import React from 'react'
import { Copy, Eye, EyeOff, KeyRound, LogOut, RefreshCw, ShieldAlert, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { SURFACE_GLASS_CARD_CLASS, SURFACE_GLASS_CARD_COMPACT_CLASS } from '@/shared/styles'
import { TeamInfo } from '../types'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase/client'

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

  const [eventTokens, setEventTokens] = React.useState<any[]>([])
  const [loadingTokens, setLoadingTokens] = React.useState(false)

  React.useEffect(() => {
    const fetchEventTokens = async () => {
      if (!team?.id || !canManage) return
      setLoadingTokens(true)
      try {
        const { data, error } = await (supabase as any)
          .from('event_teams')
          .select('registration_token, status, events(name)')
          .eq('team_id', team.id)
          .not('registration_token', 'is', null)

        if (data) {
          const mapped = data.map((row: any) => ({
            event_name: row.events?.name || 'Unnamed Event',
            token: row.registration_token,
            status: row.status,
          }))
          setEventTokens(mapped)
        }
      } catch (err) {
        console.error('Error fetching event tokens:', err)
      } finally {
        setLoadingTokens(false)
      }
    }
    void fetchEventTokens()
  }, [team?.id, canManage])

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

      {canManage && eventTokens.length > 0 && (
        <ManageCard
          title="Event Registration Tokens"
          icon={<KeyRound size={18} className="text-blue-500" />}
        >
          <div className="space-y-3.5">
            <p className="text-[11px] font-medium text-gray-500 leading-normal">
              Berikut adalah token registrasi unik yang diberikan oleh Admin untuk event-event bertipe tim. Hanya Kapten Tim yang dapat melihat daftar token ini.
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {eventTokens.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-gray-150 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/30 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[200px]" title={item.event_name}>
                      {item.event_name}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                      item.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={item.token}
                        readOnly
                        className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 pr-10 font-mono text-xs font-bold text-gray-950 shadow-sm focus:border-blue-500 outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 select-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          void navigator.clipboard.writeText(item.token)
                          toast.success('Token disalin!')
                        }}
                        className="absolute right-1 top-1 h-7 px-2 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Copy token"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ManageCard>
      )}

      <Card className={SURFACE_GLASS_CARD_CLASS}>
        <CardHeader className="px-5 !pb-3 !pt-5">
          <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white">
            <ShieldAlert size={18} className="text-red-500" />
            Team Access
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 !pb-5 !pt-2">
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
        </CardContent>
      </Card>
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
