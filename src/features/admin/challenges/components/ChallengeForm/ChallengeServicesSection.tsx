import React from 'react'
import { Label, Input, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui'
import { Loader2, X as XIcon } from 'lucide-react'
import { ChallengeFormData } from '../../types'
import { parseNxctlService, serializeNxctlService, type NxctlServiceOptions } from '@/features/challenges/lib/nxctl-services'
import { getChallengesList } from '@/shared/lib'
import toast from 'react-hot-toast'
import {
  ADMIN_FORM_HELPER_CLASS,
  ADMIN_MUTED_INPUT_CLASS,
  ADMIN_SELECT_CONTENT_CLASS,
  ADMIN_SELECT_TRIGGER_CLASS,
} from '@/features/admin/ui/form-field-styles'

interface ChallengeServicesSectionProps {
  formData: ChallengeFormData
  onChange: (data: ChallengeFormData) => void
}

type NxctlServiceQuickPick = {
  id: string
  name: string
  key: string
  options: NxctlServiceOptions
  source: 'nxctl' | 'supabase'
  label?: string
  enabled: boolean | null
  keyAvailable: boolean | null
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') return value.trim()
  }
  return ''
}

function firstBoolean(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase()
      if (['true', '1', 'yes', 'enabled'].includes(normalized)) return true
      if (['false', '0', 'no', 'disabled'].includes(normalized)) return false
    }
  }
  return null
}

function getPlatformName(item: Record<string, unknown>) {
  return firstString(
    item.service,
    item.service_name,
    item.challenge,
    item.challenge_name,
    item.name
  )
}

export const ChallengeServicesSection: React.FC<ChallengeServicesSectionProps> = ({
  formData,
  onChange,
}) => {
  const [nxctlOptions, setNxctlOptions] = React.useState<NxctlServiceQuickPick[]>([])
  const [supabaseOptions, setSupabaseOptions] = React.useState<NxctlServiceQuickPick[]>([])
  const [nxctlLoaded, setNxctlLoaded] = React.useState(false)
  const [supabaseLoaded, setSupabaseLoaded] = React.useState(false)
  const [nxctlLoading, setNxctlLoading] = React.useState(false)
  const [supabaseLoading, setSupabaseLoading] = React.useState(false)

  const updateService = (index: number, patch: Partial<{ name: string; key: string; options: NxctlServiceOptions }>) => {
    const current = parseNxctlService(formData.services[index] || '')
    const next = [...formData.services]
    next[index] = serializeNxctlService({ ...current, ...patch })
    onChange({ ...formData, services: next })
  }

  const loadNxctlOptions = React.useCallback(async () => {
    if (nxctlLoaded || nxctlLoading) return
    setNxctlLoading(true)
    try {
      const { supabase } = await import('@/lib/supabase/client')
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (!accessToken) return

      const headers = { Authorization: `Bearer ${accessToken}` }
      const nxctlRes = await fetch('/api/nxctl?action=admin-challenges', { headers })
      const nxctlData = nxctlRes.ok ? await nxctlRes.json() : []
      const picks = new Map<string, NxctlServiceQuickPick>()

      if (Array.isArray(nxctlData)) {
        nxctlData.forEach((item) => {
          const record = item && typeof item === 'object' ? item as Record<string, unknown> : {}
          const name = getPlatformName(record)
          if (!name) return
          const key = firstString(record.key, record.challenge_key, record.access_key)
          if (!key) return
          const nameLower = name.toLowerCase()
          const existing = picks.get(nameLower)
          picks.set(nameLower, {
            id: nameLower,
            name,
            key: key || (existing ? existing.key : ''),
            options: {},
            source: 'nxctl',
            enabled: firstBoolean(record.enabled, record.is_enabled, record.active, record.is_active) ?? true,
            keyAvailable: !!(key || (existing ? existing.key : '')),
          })
        })
      }

      const sorted = Array.from(picks.values()).sort((a, b) => {
        const aValid = !!a.key
        const bValid = !!b.key
        if (aValid && !bValid) return -1
        if (!aValid && bValid) return 1
        return a.name.localeCompare(b.name)
      })
      setNxctlOptions(sorted)
      setNxctlLoaded(true)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load NXCTL services')
    } finally {
      setNxctlLoading(false)
    }
  }, [nxctlLoaded, nxctlLoading])

  const loadSupabaseOptions = React.useCallback(async () => {
    if (supabaseLoaded || supabaseLoading) return
    setSupabaseLoading(true)
    try {
      const challenges = await getChallengesList(undefined, true, 'all')
      const picks = new Map<string, NxctlServiceQuickPick>()

      challenges.forEach((challenge: any) => {
        const rawServices = Array.isArray(challenge?.services) ? challenge.services : []
        rawServices.forEach((rawService: string, index: number) => {
          const service = parseNxctlService(rawService)
          if (!service.name.trim()) return
          const serialized = serializeNxctlService(service)
          const id = `${service.name.toLowerCase()}:${serialized}`
          if (picks.has(id)) return
          picks.set(id, {
            id,
            name: service.name,
            key: service.key,
            options: service.options,
            source: 'supabase',
            label: `${service.name} from ${challenge?.title || `challenge ${index + 1}`}`,
            enabled: null,
            keyAvailable: service.key.trim() ? true : null,
          })
        })
      })

      setSupabaseOptions(Array.from(picks.values()).sort((a, b) => {
        if (a.name !== b.name) return a.name.localeCompare(b.name)
        return String(a.label || '').localeCompare(String(b.label || ''))
      }))
      setSupabaseLoaded(true)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load Supabase services')
    } finally {
      setSupabaseLoading(false)
    }
  }, [supabaseLoaded, supabaseLoading])

  const applyQuickPick = (pick: NxctlServiceQuickPick) => {
    const existing = formData.services.map(raw => parseNxctlService(raw))
    const alreadyExists = existing.some(s => s.name.toLowerCase() === pick.name.toLowerCase())

    if (alreadyExists) {
      toast.error(`Service "${pick.name}" is already added`)
      return
    }

    const serialized = serializeNxctlService({ name: pick.name, key: pick.key, options: pick.options })
    onChange({ ...formData, services: [...formData.services, serialized] })
    toast.success(`Successfully added service "${pick.name}"`)
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Label className="text-sm font-semibold">NXCTL Services</Label>
        <div className="flex flex-wrap gap-2 pt-0">
          <Select
            value=""
            onValueChange={(id) => {
              const pick = nxctlOptions.find(o => o.id === id)
              if (pick) applyQuickPick(pick)
            }}
            onOpenChange={(open) => { if (open) loadNxctlOptions() }}
          >
            <SelectTrigger className={`${ADMIN_SELECT_TRIGGER_CLASS} h-8 w-[180px] text-xs`}>
              <SelectValue placeholder="Add from NXCTL" />
            </SelectTrigger>
            <SelectContent className={`${ADMIN_SELECT_CONTENT_CLASS} max-h-[250px] overflow-y-auto`}>
              {nxctlLoading && (
                <div className="flex items-center justify-center py-3 gap-2 text-xs text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" /> Loading...
                </div>
              )}
              {!nxctlLoading && nxctlLoaded && nxctlOptions.length === 0 && (
                <div className="py-3 text-center text-xs text-muted-foreground">No NXCTL services with keys found</div>
              )}
              {nxctlOptions.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.name} (Key: {opt.key})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value=""
            onValueChange={(id) => {
              const pick = supabaseOptions.find(o => o.id === id)
              if (pick) applyQuickPick(pick)
            }}
            onOpenChange={(open) => { if (open) loadSupabaseOptions() }}
          >
            <SelectTrigger className={`${ADMIN_SELECT_TRIGGER_CLASS} h-8 w-[180px] text-xs`}>
              <SelectValue placeholder="Add from Supabase" />
            </SelectTrigger>
            <SelectContent className={`${ADMIN_SELECT_CONTENT_CLASS} max-h-[250px] overflow-y-auto`}>
              {supabaseLoading && (
                <div className="flex items-center justify-center py-3 gap-2 text-xs text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" /> Loading...
                </div>
              )}
              {!supabaseLoading && supabaseLoaded && supabaseOptions.length === 0 && (
                <div className="py-3 text-center text-xs text-muted-foreground">No Supabase service configs found</div>
              )}
              {supabaseOptions.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.label || opt.name}
                  {opt.options.type === 'ssh' ? ` (SSH${opt.options.user ? `: ${opt.options.user}` : ''})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange({ ...formData, services: [...formData.services, ''] })}
            className="h-8 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900"
          >
            + Add Manual
          </Button>
        </div>
      </div>
      {formData.services.length === 0 && <p className={ADMIN_FORM_HELPER_CLASS}>No NXCTL services added</p>}
      <div className="space-y-2">
        {formData.services.map((rawService, idx) => {
          const service = parseNxctlService(rawService)
          const isSshService = service.options.type === 'ssh'

          return (
            <div key={idx} className="rounded-xl border border-gray-200/70 bg-gray-50/40 p-2 dark:border-gray-800/80 dark:bg-gray-900/20">
              <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px_auto]">
                <Input
                  value={service.name}
                  onChange={e => updateService(idx, { name: e.target.value })}
                  placeholder="service-name"
                  className={ADMIN_MUTED_INPUT_CLASS}
                />
                <Input
                  value={service.key}
                  onChange={e => updateService(idx, { key: e.target.value })}
                  placeholder="challenge key (optional)"
                  type="password"
                  className={ADMIN_MUTED_INPUT_CLASS}
                />
                <Select
                  value={isSshService ? 'ssh' : 'default'}
                  onValueChange={(value) => updateService(idx, {
                    options: value === 'ssh'
                      ? { ...service.options, type: 'ssh' }
                      : {},
                  })}
                >
                  <SelectTrigger className={ADMIN_MUTED_INPUT_CLASS}>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className={ADMIN_SELECT_CONTENT_CLASS}>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="ssh">SSH</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="ghost"
                  aria-label="Remove service"
                  title="Remove service"
                  onClick={() => onChange({ ...formData, services: formData.services.filter((_, i) => i !== idx) })}
                >
                  <XIcon size={14} />
                </Button>
              </div>
              {isSshService && (
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Input
                    value={service.options.user || ''}
                    onChange={e => updateService(idx, { options: { ...service.options, type: 'ssh', user: e.target.value } })}
                    placeholder="ssh user"
                    className={ADMIN_MUTED_INPUT_CLASS}
                  />
                  <Input
                    value={service.options.pass || ''}
                    onChange={e => updateService(idx, { options: { ...service.options, type: 'ssh', pass: e.target.value } })}
                    placeholder="ssh password (optional)"
                    type="password"
                    className={ADMIN_MUTED_INPUT_CLASS}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
