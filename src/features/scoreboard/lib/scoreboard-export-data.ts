import {
  getFirstBloodLeaderboard,
  getLeaderboardSummary,
  getTopProgressByUsernames,
} from '@/shared/lib'
import type { LeaderboardEntry } from '@/shared/types'
import APP from '@/config'
import { buildScoreboard, getScoreboardEventParam } from './build-scoreboard'
import type { LeaderboardSummaryRow } from '../types'

export type ScoreboardExportMode = 'points' | 'first-blood'

export type ScoreboardExportSnapshot = {
  tableEntries: unknown[]
  chartEntries: unknown[]
  exportedAt: string
  mode: ScoreboardExportMode
  eventLabel: string
  sourceUrl: string
  scope: string
  fileType: string
  fromRank: number
  toRank: number
}

export async function fetchScoreboardExportSnapshot({
  selectedEvent,
  eventLabel,
  sourceUrl,
  scope = 'individu',
  mode,
  fromRank,
  toRank,
}: {
  selectedEvent: string | number
  eventLabel: string
  sourceUrl: string
  scope?: string
  mode: ScoreboardExportMode
  fromRank: number
  toRank: number
}): Promise<ScoreboardExportSnapshot> {
  const eventParam = getScoreboardEventParam(selectedEvent)
  const safeFromRank = Math.max(1, Math.floor(fromRank))
  const safeToRank = Math.max(safeFromRank, Math.floor(toRank))
  const fetchLimit = Math.max(10, safeToRank)

  if (mode === 'first-blood') {
    const leaderboard = await getFirstBloodLeaderboard(fetchLimit, 0, eventParam)
    return {
      tableEntries: leaderboard.slice(safeFromRank - 1, safeToRank),
      chartEntries: leaderboard.slice(0, 10),
      exportedAt: new Date().toISOString(),
      mode,
      eventLabel,
      sourceUrl,
      scope,
      fileType: 'first_blood',
      fromRank: safeFromRank,
      toRank: safeToRank,
    }
  }

  const summary = await getLeaderboardSummary(fetchLimit, 0, eventParam)
  const topUsernames = summary.slice(0, 10).map((row: LeaderboardSummaryRow) => row.username)
  const progressMap = await getTopProgressByUsernames(topUsernames, eventParam)
  const result = buildScoreboard(summary, {
    nameKey: 'username',
    scoreKey: 'score',
    limit: fetchLimit,
    progressMap,
  })

  return {
    tableEntries: result.entries.slice(safeFromRank - 1, safeToRank),
    chartEntries: result.entries.slice(0, 10),
    exportedAt: new Date().toISOString(),
    mode,
    eventLabel,
    sourceUrl,
    scope,
    fileType: 'point',
    fromRank: safeFromRank,
    toRank: safeToRank,
  }
}

export function createScoreboardExportFilename(snapshot: ScoreboardExportSnapshot) {
  const platformName = slugFilenamePart(APP.shortName || APP.fullName || 'nxctf') || 'nxctf'
  const scope = slugFilenamePart(snapshot.scope) || 'scoreboard'
  const eventName = slugFilenamePart(snapshot.eventLabel) || 'scoreboard'
  const type = slugFilenamePart(snapshot.fileType) || 'point'
  const date = snapshot.exportedAt.slice(0, 10)
  return `${platformName}-${scope}-${eventName}-${type}-${date}.png`
}

export function slugFilenamePart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_|_$)/g, '')
}
