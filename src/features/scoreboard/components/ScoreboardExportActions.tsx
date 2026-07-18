import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Download, Loader2 } from 'lucide-react'
import { toPng } from 'html-to-image'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { cn } from '@/shared/lib/utils'
import APP from '@/config'
import type { LeaderboardEntry } from '@/shared/types'
import ScoreboardChart from './ScoreboardChart'
import ScoreboardTable from './ScoreboardTable'
import {
  createScoreboardExportFilename,
  fetchScoreboardExportSnapshot,
  type ScoreboardExportMode,
  type ScoreboardExportSnapshot,
} from '../lib/scoreboard-export-data'

type ExportRange = { fromRank: number; toRank: number }
type RankInputValue = number | ''

type ScoreboardExportActionsProps = {
  selectedEvent: string | number
  eventLabel: string
  mode: ScoreboardExportMode
  fetchSnapshot?: (options: ExportRange & { sourceUrl: string }) => Promise<ScoreboardExportSnapshot>
  modeLabel?: string
  renderChart?: (snapshot: ScoreboardExportSnapshot) => React.ReactNode
  renderTable?: (snapshot: ScoreboardExportSnapshot) => React.ReactNode
}

type RankPreset = '1-10' | '1-25' | '1-50' | '1-100' | '101-200' | 'custom'

const RANK_PRESETS: Array<{ value: RankPreset; label: string; from: number; to: number }> = [
  { value: '1-10', label: 'Rank 1-10', from: 1, to: 10 },
  { value: '1-25', label: 'Rank 1-25', from: 1, to: 25 },
  { value: '1-50', label: 'Rank 1-50', from: 1, to: 50 },
  { value: '1-100', label: 'Rank 1-100', from: 1, to: 100 },
  { value: '101-200', label: 'Rank 101-200', from: 101, to: 200 },
  { value: 'custom', label: 'Custom', from: 1, to: 25 },
]

function formatExportDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value))
}

function normalizeRankInput(value: string): RankInputValue {
  const normalized = value.replace(/^0+(?=\d)/, '')
  if (normalized === '') return ''
  return Number(normalized)
}

function getPresetRange(preset: RankPreset, customFrom: RankInputValue, customTo: RankInputValue) {
  if (preset === 'custom') {
    const from = Math.max(1, Math.floor(customFrom || 1))
    const to = Math.max(from, Math.floor(customTo || from))
    return { from, to }
  }

  const selected = RANK_PRESETS.find((item) => item.value === preset) ?? RANK_PRESETS[1]
  return { from: selected.from, to: selected.to }
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}

function ScoreboardExportSnapshotView({
  snapshot,
  includeChart,
  modeLabel: customModeLabel,
  renderChart,
  renderTable,
}: {
  snapshot: ScoreboardExportSnapshot
  includeChart: boolean
  modeLabel?: string
  renderChart?: (snapshot: ScoreboardExportSnapshot) => React.ReactNode
  renderTable?: (snapshot: ScoreboardExportSnapshot) => React.ReactNode
}) {
  const modeLabel = customModeLabel ?? (snapshot.mode === 'first-blood' ? 'First Blood' : 'Points')
  const isFirstPage = snapshot.fromRank === 1
  const displayedToRank = Math.min(snapshot.toRank, snapshot.fromRank + snapshot.tableEntries.length - 1)
  const platformName = APP.fullName || APP.shortName || 'NXCTF'
  const exportDescription = `Top ${modeLabel} Rank ${snapshot.fromRank}-${displayedToRank}`

  return (
    <div className="w-[1180px] bg-gray-50 p-6 text-gray-950 dark:bg-[#060912] dark:text-gray-100">
      <div className="mb-4 rounded-2xl border border-gray-200/80 bg-white/90 px-6 py-5 shadow-sm dark:border-gray-800/80 dark:bg-[#0b0f19]/95">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(300px,auto)] gap-x-8 gap-y-3">
          <div className="min-w-0">
            <div className="text-[11px] font-black uppercase tracking-[0.28em] text-blue-600 dark:text-blue-400">{platformName}</div>
            <h1 className="mt-2 truncate text-3xl font-black tracking-tight text-gray-950 dark:text-white">{snapshot.eventLabel}</h1>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Exported at</div>
            <div className="mt-2 text-lg font-black text-gray-950 dark:text-white">{formatExportDate(snapshot.exportedAt)} WIB</div>
          </div>

          <div className="min-w-0">
            <div className="text-base font-bold text-gray-600 dark:text-gray-300">{exportDescription}</div>
          </div>
          <div className="min-w-0 text-right">
            <div className="truncate font-mono text-xs font-semibold text-gray-500 dark:text-gray-400">{snapshot.sourceUrl}</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {includeChart && isFirstPage && snapshot.chartEntries.length > 0 && (
          renderChart ? renderChart(snapshot) : <ScoreboardChart leaderboard={snapshot.chartEntries as LeaderboardEntry[]} />
        )}
        {renderTable ? renderTable(snapshot) : (
          <ScoreboardTable
            leaderboard={snapshot.tableEntries as LeaderboardEntry[]}
            scoreColumnLabel={modeLabel}
            scoreColumnRenderer={(entry) => entry.score}
            rankOffset={snapshot.fromRank - 1}
            missingLabel="Not ranked yet"
          />
        )}
      </div>
    </div>
  )
}

export default function ScoreboardExportActions({
  selectedEvent,
  eventLabel,
  mode,
  fetchSnapshot,
  modeLabel,
  renderChart,
  renderTable,
}: ScoreboardExportActionsProps) {
  const exportRef = useRef<HTMLDivElement | null>(null)
  const [snapshot, setSnapshot] = useState<ScoreboardExportSnapshot | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [includeChart, setIncludeChart] = useState(true)
  const [rankPreset, setRankPreset] = useState<RankPreset>('1-25')
  const [customFrom, setCustomFrom] = useState<RankInputValue>(1)
  const [customTo, setCustomTo] = useState<RankInputValue>(25)

  const { from, to } = getPresetRange(rankPreset, customFrom, customTo)
  const canIncludeChart = from === 1

  const handleExportPng = async () => {
    if (isExporting) return

    setIsExporting(true)
    try {
      const sourceUrl = window.location.href
      const freshSnapshot = fetchSnapshot
        ? await fetchSnapshot({ fromRank: from, toRank: to, sourceUrl })
        : await fetchScoreboardExportSnapshot({
          selectedEvent,
          eventLabel,
          sourceUrl,
          scope: 'individu',
          mode,
          fromRank: from,
          toRank: to,
        })

      flushSync(() => setSnapshot(freshSnapshot))
      await new Promise((resolve) => window.requestAnimationFrame(() => requestAnimationFrame(resolve)))
      if (includeChart && canIncludeChart) {
        await new Promise((resolve) => window.setTimeout(resolve, 800))
      }
      if (!exportRef.current) return

      const dataUrl = await toPng(exportRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#060912' : '#f9fafb',
      })
      downloadDataUrl(dataUrl, createScoreboardExportFilename(freshSnapshot))
      setIsSettingsOpen(false)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="relative flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsSettingsOpen((open) => !open)}
        disabled={isExporting}
        className="w-full rounded-xl sm:w-fit"
      >
        {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {isExporting ? 'Exporting...' : 'Export'}
      </Button>

      {isSettingsOpen && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-[min(92vw,360px)] rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-[#0b0f19]">
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Rank range</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {RANK_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setRankPreset(preset.value)}
                    className={cn(
                      'rounded-xl border px-3 py-2 text-left text-xs font-bold transition-colors',
                      rankPreset === preset.value
                        ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900/50'
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {rankPreset === 'custom' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">From rank</Label>
                  <Input
                    type="number"
                    min={1}
                    value={customFrom}
                    onChange={(event) => setCustomFrom(normalizeRankInput(event.target.value))}
                    className="mt-1 h-9 rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400">To rank</Label>
                  <Input
                    type="number"
                    min={customFrom || 1}
                    value={customTo}
                    onChange={(event) => setCustomTo(normalizeRankInput(event.target.value))}
                    className="mt-1 h-9 rounded-xl"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-3 py-2 dark:border-gray-800">
              <div>
                <Label className="text-sm font-bold text-gray-800 dark:text-gray-100">Include chart</Label>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Chart is exported for ranges starting at rank 1.</p>
              </div>
              <Switch checked={includeChart && canIncludeChart} onCheckedChange={setIncludeChart} disabled={!canIncludeChart} />
            </div>

            <Button
              type="button"
              onClick={handleExportPng}
              disabled={isExporting}
              className="w-full rounded-xl"
            >
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {isExporting ? 'Exporting...' : 'Export PNG'}
            </Button>
          </div>
        </div>
      )}

      <div className="pointer-events-none fixed -left-[9999px] top-0 overflow-hidden" aria-hidden="true">
        <div ref={exportRef}>
          {snapshot && (
            <ScoreboardExportSnapshotView
              snapshot={snapshot}
              includeChart={includeChart && canIncludeChart}
              modeLabel={modeLabel}
              renderChart={renderChart}
              renderTable={renderTable}
            />
          )}
        </div>
      </div>
    </div>
  )
}
