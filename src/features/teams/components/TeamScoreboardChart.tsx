import BaseScoreboardChart, { type ChartSeries } from '@/features/scoreboard/components/base/BaseScoreboardChart'
import { TeamProgressSeries } from '../types'

interface TeamScoreboardChartProps {
  series: TeamProgressSeries[]
  isDark?: boolean
  scoreLabel?: string
}

export default function TeamScoreboardChart({ series, scoreLabel = 'Score' }: TeamScoreboardChartProps) {
  const chartSeries: ChartSeries[] = series.slice(0, 10).map(entry => ({
    name: entry.team_name,
    data: entry.history.map(p => ({ date: p.date, score: p.score })),
  }))

  return (
    <BaseScoreboardChart
      title="Top 10 Teams"
      series={chartSeries}
      yAxisTitle={scoreLabel}
    />
  )
}
