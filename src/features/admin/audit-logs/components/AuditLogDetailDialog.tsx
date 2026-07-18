"use client"

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { AppTabs, Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui'
import { DIALOG_CONTENT_CLASS_4XL } from '@/shared/styles/dialog'
import { cn } from '@/shared/lib/utils'
import type { AuditLogEntry } from '@/features/logs/lib/audit-service'
import { AdminStatusBadge } from '../../ui'
import {
  AUDIT_DETAIL_TABS,
  formatFieldLabel,
  formatJakartaDate,
  formatPrimitive,
  getActionStyle,
  getFieldValue,
  isPlainRecord,
  isSensitiveField,
  parseUserAgent,
  sanitizeRecord,
  shortenValue,
  type AuditDetailTab,
} from '../lib/audit-log-utils'

function CopyableValue({ value, compact = true }: { value: string | null | undefined; compact?: boolean }) {
  const [copied, setCopied] = useState(false)
  const display = compact ? shortenValue(value) : (value || '-')
  const canCopy = Boolean(value)

  const handleCopy = async () => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  return (
    <span className="inline-flex max-w-full items-center gap-1.5 align-middle" title={value || undefined}>
      <span className="min-w-0 truncate font-mono text-xs font-semibold text-gray-700 dark:text-gray-200">
        {display}
      </span>
      {canCopy && (
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-blue-500/10 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 dark:hover:text-blue-300"
          aria-label="Copy value"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      )}
    </span>
  )
}

function AuditSummary({
  log,
  parsedUserAgent,
}: {
  log: AuditLogEntry
  parsedUserAgent: ReturnType<typeof parseUserAgent>
}) {
  const rows = [
    { label: 'Actor name', value: log.actor_snapshot },
    { label: 'Actor role', value: log.actor_role === 'global_admin' ? 'Global Admin' : 'Admin' },
    { label: 'Actor ID', value: <CopyableValue value={log.actor_user_id} /> },
    { label: 'Action', value: log.action },
    { label: 'Entity type', value: formatFieldLabel(log.entity_type) },
    { label: 'Entity ID', value: <CopyableValue value={log.entity_id} /> },
    { label: 'IP address', value: log.ip_address || '-' },
    { label: 'Created time', value: formatJakartaDate(log.created_at) },
    { label: 'Browser', value: `${parsedUserAgent.browser} - ${parsedUserAgent.os}` },
  ]

  return (
    <section className="rounded-2xl border border-gray-200/70 bg-white/70 shadow-sm dark:border-gray-800/70 dark:bg-[#0d121d]/70">
      <div className="border-b border-gray-200/70 px-4 py-3 dark:border-gray-800/70">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Activity Summary</h3>
      </div>
      <dl className="grid gap-px bg-gray-200/60 dark:bg-gray-800/70 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label} className="min-w-0 bg-white/80 px-4 py-3 dark:bg-[#0d121d]/85">
            <dt className="text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">{row.label}</dt>
            <dd className="mt-1 min-w-0 break-words text-sm font-semibold text-gray-800 dark:text-gray-100">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function AuditValue({ value, tone = 'neutral' }: { value: unknown; tone?: 'before' | 'after' | 'neutral' }) {
  const toneClass = tone === 'before'
    ? 'border-gray-200/80 bg-gray-50/80 text-gray-600 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-300'
    : tone === 'after'
      ? 'border-blue-500/20 bg-blue-500/5 text-gray-800 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-gray-100'
      : 'border-gray-200/70 bg-gray-50/70 dark:border-gray-800 dark:bg-[#0d121d]/70'

  if (typeof value === 'boolean') {
    return <AdminStatusBadge tone={value ? 'success' : 'muted'}>{value ? 'Yes' : 'No'}</AdminStatusBadge>
  }

  if (Array.isArray(value) || isPlainRecord(value)) {
    return (
      <pre className={cn('whitespace-pre-wrap break-words rounded-xl border p-3 font-mono text-xs leading-relaxed text-gray-700 dark:text-gray-200', toneClass)}>
        {JSON.stringify(value, null, 2)}
      </pre>
    )
  }

  return (
    <div className={cn('min-h-10 break-words rounded-xl border px-3 py-2 text-sm font-semibold', toneClass)}>
      {formatPrimitive(value)}
    </div>
  )
}

function AuditInlineValue({ value }: { value: unknown }) {
  if (typeof value === 'boolean') {
    return <AdminStatusBadge tone={value ? 'success' : 'muted'}>{value ? 'Yes' : 'No'}</AdminStatusBadge>
  }

  if (Array.isArray(value) || isPlainRecord(value)) {
    return (
      <code className="block max-h-28 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-gray-200/70 bg-gray-50/70 px-2.5 py-2 font-mono text-[11px] leading-relaxed text-gray-700 dark:border-gray-800 dark:bg-gray-900/40 dark:text-gray-200 scroll-hidden">
        {JSON.stringify(value, null, 2)}
      </code>
    )
  }

  return <span className="break-words text-sm font-semibold text-gray-800 dark:text-gray-100">{formatPrimitive(value)}</span>
}

function ChangedFields({ log, fields }: { log: AuditLogEntry; fields: string[] }) {
  const visibleFields = fields.filter((field) => !isSensitiveField(field))

  return (
    <section className="min-w-0">
      <div className="flex flex-col gap-1 border-b border-gray-200/70 pb-2 dark:border-gray-800/70 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Changed Fields</h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Only fields that changed are shown.</p>
        </div>
        <AdminStatusBadge tone={visibleFields.length > 0 ? 'info' : 'muted'}>{visibleFields.length} fields</AdminStatusBadge>
      </div>

      {visibleFields.length > 0 ? (
        <div className="divide-y divide-gray-100 dark:divide-gray-800/80">
          {visibleFields.map((field) => (
            <div key={field} className="grid gap-2 py-3 lg:grid-cols-[190px_minmax(0,1fr)] lg:items-start">
              <div className="min-w-0">
                <div className="truncate text-xs font-bold text-gray-600 dark:text-gray-300">{formatFieldLabel(field)}</div>
              </div>
              <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-start">
                <div className="min-w-0 rounded-lg bg-gray-50/70 px-3 py-2 dark:bg-gray-900/35">
                  <AuditInlineValue value={getFieldValue(log.before_data, field)} />
                </div>
                <span className="hidden pt-2 text-xs font-bold text-gray-400 sm:block">to</span>
                <div className="min-w-0 rounded-lg bg-blue-500/5 px-3 py-2 dark:bg-blue-500/10">
                  <AuditInlineValue value={getFieldValue(log.after_data, field)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">No changed fields were recorded.</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">This action may only contain metadata.</p>
        </div>
      )}
    </section>
  )
}

function FieldListCard({ title, entries }: { title: string; entries: Array<[string, unknown]> }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white/70 shadow-sm dark:border-gray-800/70 dark:bg-[#0d121d]/70">
      <div className="border-b border-gray-200/70 px-4 py-3 dark:border-gray-800/70">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">{title}</h3>
      </div>
      {entries.length > 0 ? (
        <dl className="divide-y divide-gray-100 dark:divide-gray-800">
          {entries.map(([key, value]) => (
            <div key={key} className="grid gap-2 px-4 py-2.5 sm:grid-cols-[190px_minmax(0,1fr)] sm:items-start">
              <dt className="min-w-0">
                <div className="truncate text-xs font-bold text-gray-700 dark:text-gray-200">{formatFieldLabel(key)}</div>
              </dt>
              <dd className="min-w-0 break-words text-sm font-semibold text-gray-800 dark:text-gray-100">
                <AuditInlineValue value={value} />
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">No data available.</div>
      )}
    </section>
  )
}

function FieldRowSection({ title, entries }: { title: string; entries: Array<[string, unknown]> }) {
  return (
    <section className="min-w-0">
      <div className="border-b border-gray-200/70 pb-2 dark:border-gray-800/70">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">{title}</h3>
      </div>
      {entries.length > 0 ? (
        <dl className="divide-y divide-gray-100 dark:divide-gray-800/80">
          {entries.map(([key, value]) => (
            <div key={key} className="grid gap-2 py-2.5 sm:grid-cols-[190px_minmax(0,1fr)] sm:items-start">
              <dt className="truncate text-xs font-bold text-gray-600 dark:text-gray-300">{formatFieldLabel(key)}</dt>
              <dd className="min-w-0 break-words text-sm font-semibold text-gray-800 dark:text-gray-100">
                <AuditInlineValue value={value} />
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="py-4 text-sm text-gray-500 dark:text-gray-400">No data available.</div>
      )}
    </section>
  )
}

function SnapshotViewer({ before, after }: { before: Record<string, unknown> | null; after: Record<string, unknown> | null }) {
  const [activeSnapshot, setActiveSnapshot] = useState<'before' | 'after'>('after')
  const data = activeSnapshot === 'before' ? sanitizeRecord(before) : sanitizeRecord(after)
  const entries = data ? Object.entries(data).filter(([key]) => !isSensitiveField(key)) : []

  return (
    <section className="rounded-2xl border border-gray-200/70 bg-white/70 shadow-sm dark:border-gray-800/70 dark:bg-[#0d121d]/70">
      <div className="flex flex-col gap-3 border-b border-gray-200/70 px-4 py-3 dark:border-gray-800/70 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Full Snapshot</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Sensitive fields are hidden from this view.</p>
        </div>
        <div className="inline-flex w-fit rounded-xl border border-gray-200 bg-white/70 p-1 dark:border-gray-800 dark:bg-gray-900/70">
          {(['before', 'after'] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setActiveSnapshot(item)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
                activeSnapshot === item
                  ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                  : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {entries.length > 0 ? (
        <dl className="grid gap-x-6 gap-y-4 p-4 md:grid-cols-2">
          {entries.map(([key, value]) => (
            <div key={key} className="min-w-0">
              <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400">{formatFieldLabel(key)}</dt>
              <dd className="mt-1 min-w-0"><AuditValue value={value} /></dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No snapshot data available.</div>
      )}
    </section>
  )
}

function ChangesDetails({ log, fields }: { log: AuditLogEntry; fields: string[] }) {
  return <div className="max-w-none"><ChangedFields log={log} fields={fields} /></div>
}

function DataDetails({ log }: { log: AuditLogEntry }) {
  return <div className="max-w-none"><SnapshotViewer before={log.before_data} after={log.after_data} /></div>
}

function MetadataDetails({ log, parsedUserAgent }: { log: AuditLogEntry; parsedUserAgent: ReturnType<typeof parseUserAgent> }) {
  const requestEntries: Array<[string, unknown]> = [
    ['ip_address', log.ip_address || 'Not captured'],
    ['browser', parsedUserAgent.browser],
    ['operating_system', parsedUserAgent.os],
    ['user_agent', log.user_agent || 'Not captured'],
  ]

  return <div className="max-w-none"><FieldRowSection title="Request Context" entries={requestEntries} /></div>
}

export default function AuditLogDetailDialog({
  log,
  onOpenChange,
}: {
  log: AuditLogEntry | null
  onOpenChange: (open: boolean) => void
}) {
  const fields = log?.changed_fields ?? []
  const actionStyle = log ? getActionStyle(log.action) : getActionStyle('')
  const parsedUserAgent = parseUserAgent(log?.user_agent)
  const [activeTab, setActiveTab] = useState<AuditDetailTab>('summary')

  return (
    <Dialog open={Boolean(log)} onOpenChange={onOpenChange}>
      <DialogContent className={`${DIALOG_CONTENT_CLASS_4XL} max-h-[90dvh] overflow-y-auto scroll-hidden`}>
        {log && (
          <div className="mx-auto w-full max-w-5xl space-y-3 p-4 sm:p-5">
            <DialogHeader className="sticky top-0 z-20 -mx-4 -mt-4 border-b border-gray-200/70 bg-white/95 px-4 pb-2 pt-3 backdrop-blur-md dark:border-gray-800/70 dark:bg-[#0b0f19]/95 sm:-mx-5 sm:-mt-5 sm:px-5 sm:pt-4">
              <DialogTitle className="sr-only">Admin audit log detail</DialogTitle>
              <div className="flex flex-col gap-2.5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Button type="button" variant="outline" size="sm" className="w-fit rounded-xl" onClick={() => onOpenChange(false)}>
                    Back to list
                  </Button>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <AdminStatusBadge tone={actionStyle.tone}>{log.action}</AdminStatusBadge>
                    <AdminStatusBadge tone={log.actor_role === 'global_admin' ? 'info' : 'neutral'}>
                      {log.actor_role === 'global_admin' ? 'Global Admin' : 'Admin'}
                    </AdminStatusBadge>
                    <AdminStatusBadge tone="muted">{formatFieldLabel(log.entity_type)}</AdminStatusBadge>
                  </div>
                </div>

                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <DialogDescription className="flex min-w-0 flex-wrap items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    <span>{log.actor_snapshot}</span>
                    <span className="text-gray-400">changed</span>
                    <span className="font-mono text-gray-900 dark:text-gray-100" title={log.entity_id || undefined}>{shortenValue(log.entity_id)}</span>
                  </DialogDescription>
                  <span className="shrink-0 text-xs font-bold text-gray-500 dark:text-gray-400" title={log.created_at}>
                    {formatJakartaDate(log.created_at)}
                  </span>
                </div>

                <AppTabs
                  items={AUDIT_DETAIL_TABS}
                  value={activeTab}
                  onValueChange={setActiveTab}
                  variant="panel"
                  stretch
                  ariaLabel="Audit log detail tabs"
                />
              </div>
            </DialogHeader>

            {activeTab === 'summary' && <AuditSummary log={log} parsedUserAgent={parsedUserAgent} />}
            {activeTab === 'changes' && <ChangesDetails log={log} fields={fields} />}
            {activeTab === 'data' && <DataDetails log={log} />}
            {activeTab === 'metadata' && <MetadataDetails log={log} parsedUserAgent={parsedUserAgent} />}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
