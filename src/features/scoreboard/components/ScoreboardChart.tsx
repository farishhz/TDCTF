import { LeaderboardEntry } from '@/shared/types'
import BaseScoreboardChart, { type ChartSeries } from './base/BaseScoreboardChart'

interface ScoreboardChartProps {
  leaderboard: LeaderboardEntry[]
  isDark?: boolean
  startDate?: string | null
}

function truncate(str: string, n: number) {
  return str.length > n ? `${str.slice(0, n)}...` : str
}

export default function ScoreboardChart({ leaderboard, startDate }: ScoreboardChartProps) {
  const series: ChartSeries[] = leaderboard.slice(0, 10).map((entry) => {
    const shortName = truncate(entry.username, 16)

    return {
      name: shortName,
      data: entry.progress.map((point) => ({
        date: point.date,
        score: point.score,
      })),
    }
  })

  return <BaseScoreboardChart title="Top 10 Users" series={series} startDate={startDate ?? undefined} />
}
