"use client"

// React Imports
import React from "react"
import dynamic from "next/dynamic"
import { LayoutGrid, Zap, TrendingUp, BarChart3, Target } from "lucide-react"

// Shared Imports
import { Skeleton } from "@/shared/ui"
import { useTheme } from "@/shared/contexts"
import { ChallengeWithSolve } from "@/shared/types"
import { UserEmptyState, UserSection } from "../ui"
import APP from "@/config"

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
})

type Props = {
  solvedChallenges: ChallengeWithSolve[]
  firstBloodIds: string[]
  isDark?: boolean
  flagStats?: { correct_submissions: number; incorrect_submissions: number } | null
  categoryTotals?: { category: string; total_challenges: number }[]
}

/* ===================== THEME ===================== */

const theme = (isDark: boolean) => ({
  bg: isDark ? "rgba(17,24,39,0.2)" : "rgba(255,255,255,0.2)",
  text: isDark ? "#e5e7eb" : "#111827",
  grid: isDark ? "rgba(55,65,81,0.8)" : "rgba(229,231,235,0.9)",
})

const pieColors = [
  "#60a5fa",
  "#3b82f6",
  "#2563eb",
  "#93c5fd",
  "#1d4ed8",
]

/** Map difficulty color names from APP.difficultyStyles to actual hex values */
const DIFFICULTY_COLOR_HEX: Record<string, string> = {
  cyan:   "#06b6d4",
  green:  "#22c55e",
  yellow: "#eab308",
  red:    "#ef4444",
  purple: "#a855f7",
  gray:   "#6b7280",
}

function getDifficultyHex(difficulty: string): string {
  const rawDiff = difficulty.trim()
  const normalizedDiff = rawDiff === 'imposible' ? 'Impossible'
    : rawDiff.charAt(0).toUpperCase() + rawDiff.slice(1).toLowerCase()
  const colorName = (APP.difficultyStyles as Record<string, string>)[normalizedDiff] || 'gray'
  return DIFFICULTY_COLOR_HEX[colorName] || DIFFICULTY_COLOR_HEX.gray
}

/* ===================== HELPERS ===================== */

function groupSolvesOverTime(solved: ChallengeWithSolve[]) {
  const map: Record<string, number> = {}

  solved.forEach(s => {
    if (!s.solved_at) return
    const d = new Date(s.solved_at).toISOString().slice(0, 10)
    map[d] = (map[d] || 0) + 1
  })

  return Object.keys(map)
    .sort()
    .map(date => ({ date, count: map[date] }))
}

/* ===================== COMPONENT ===================== */

export default function UserStatsPlotly({
  solvedChallenges,
  firstBloodIds,
  isDark,
  flagStats,
  categoryTotals,
}: Props) {
  const { theme: currentTheme } = useTheme()
  const isDarkMode = typeof isDark === "boolean" ? isDark : currentTheme === "dark"

  const t = theme(isDarkMode)

  // If there are no solves, show a friendly empty state matching UserProfile
  if (!solvedChallenges || solvedChallenges.length === 0) {
    return (
      <UserEmptyState
        icon={BarChart3}
        title="No stat data available"
        description="Solve some challenges to see stats here."
      />
    )
  }

  /* ===== ACCURACY STATS ===== */
  const correct = flagStats?.correct_submissions ?? solvedChallenges.length
  const incorrect = flagStats?.incorrect_submissions ?? 0
  const total = correct + incorrect

  /* ===== CATEGORY ===== */
  const byCategory: Record<string, number> = {}
  solvedChallenges.forEach(s => {
    const rawCategory = s.category || "Uncategorized"
    const c = rawCategory.split('/')[0]
    byCategory[c] = (byCategory[c] || 0) + 1
  })

  // Build aggregated totals per parent category (for bar chart fallback)
  const categoryTotalMap: Record<string, number> = {}
  if (categoryTotals) {
    categoryTotals.forEach(({ category, total_challenges }) => {
      const parent = (category || '').split('/')[0]
      if (!parent) return
      categoryTotalMap[parent] = (categoryTotalMap[parent] || 0) + total_challenges
    })
  }

  /* ===== DIFFICULTY ===== */
  const byDifficulty: Record<string, number> = {}
  solvedChallenges.forEach(s => {
    const d = s.difficulty || "Unknown"
    byDifficulty[d] = (byDifficulty[d] || 0) + 1
  })

  const diffKeys = Object.keys(byDifficulty)
  const diffColors = diffKeys.map(key => getDifficultyHex(key))
  const firstBloodCount = firstBloodIds.length

  const categoriesCount = Object.keys(byCategory).length
  const difficultiesCount = Object.keys(byDifficulty).length

  const timeSeries = groupSolvesOverTime(solvedChallenges)

  // Radar chart data prep
  const catKeys = Object.keys(byCategory)
  const catValues = Object.values(byCategory)
  const radarTheta = catKeys.length > 0 ? [...catKeys, catKeys[0]] : []
  const radarR = catValues.length > 0 ? [...catValues, catValues[0]] : []

  const baseLayout = {
    dragmode: false as const,
    autosize: true,
    showlegend: false,
    paper_bgcolor: t.bg,
    plot_bgcolor: t.bg,
    font: { color: t.text, size: 11 },
    margin: { t: 40, b: 40, l: 60, r: 60 }, // Extra padding to prevent label clipping
    hoverlabel: {
      bgcolor: isDarkMode ? "#111827" : "#ffffff",
      font: { color: t.text },
    },
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CATEGORY (2/3 width) */}
        <div className="lg:col-span-2">
          <UserSection
            title="Solves by Category"
            description={`${categoriesCount} categories represented in your solves.`}
            icon={LayoutGrid}
          >
            {catKeys.length >= 3 ? (
              /* Radar chart — only when 3+ categories so the polygon looks proper */
              <Plot
                key={`cat-${isDarkMode}`}
                data={[
                  {
                    type: "scatterpolar",
                    r: radarR,
                    theta: radarTheta,
                    fill: "toself",
                    fillcolor: isDarkMode ? "rgba(59, 130, 246, 0.25)" : "rgba(37, 99, 235, 0.15)",
                    line: {
                      color: isDarkMode ? "#60a5fa" : "#2563eb",
                      width: 2,
                    },
                    marker: {
                      color: isDarkMode ? "#60a5fa" : "#2563eb",
                      size: 6,
                    },
                    hovertemplate: "%{theta}: %{r} solves<extra></extra>",
                  },
                ]}
                layout={{
                  ...baseLayout,
                  height: 280,
                  polar: {
                    gridshape: "linear",
                    radialaxis: {
                      visible: true,
                      showticklabels: false,
                      ticks: "",
                      gridcolor: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
                      linecolor: "transparent",
                    },
                    angularaxis: {
                      color: t.text,
                      gridcolor: isDarkMode ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
                      linecolor: isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)",
                    },
                    bgcolor: "transparent",
                  },
                }}
                style={{ width: "100%" }}
                useResizeHandler
                config={{ displayModeBar: false }}
              />
            ) : (
              /* Horizontal stacked bar fallback — for 1-2 categories where radar looks broken */
              <Plot
                key={`cat-bar-${isDarkMode}`}
                data={[
                  {
                    name: "Solved",
                    type: "bar",
                    y: catKeys,
                    x: catValues,
                    orientation: "h" as const,
                    marker: {
                      color: isDarkMode ? "#60a5fa" : "#2563eb",
                    },
                    text: catKeys.map(k => {
                      const total = categoryTotalMap[k] || catValues[catKeys.indexOf(k)]
                      return `${byCategory[k]}/${total}`
                    }),
                    textposition: "inside" as const,
                    textfont: { color: "#ffffff", size: 12 },
                    hovertemplate: "%{y}: %{x} solved<extra></extra>",
                  },
                  {
                    name: "Remaining",
                    type: "bar",
                    y: catKeys,
                    x: catKeys.map(k => {
                      const total = categoryTotalMap[k] || 0
                      const solved = byCategory[k] || 0
                      return Math.max(0, total - solved)
                    }),
                    orientation: "h" as const,
                    marker: {
                      color: isDarkMode ? "rgba(107, 114, 128, 0.3)" : "rgba(156, 163, 175, 0.3)",
                    },
                    hovertemplate: "%{y}: %{x} remaining<extra></extra>",
                  },
                ]}
                layout={{
                  ...baseLayout,
                  height: 280,
                  barmode: "stack",
                  showlegend: false,
                  xaxis: {
                    title: { text: "Challenges" },
                    gridcolor: t.grid,
                    dtick: 1,
                  },
                  yaxis: {
                    automargin: true,
                  },
                  margin: { t: 20, b: 40, l: 100, r: 20 },
                }}
                style={{ width: "100%" }}
                useResizeHandler
                config={{ displayModeBar: false }}
              />
            )}
          </UserSection>
        </div>

        {/* DIFFICULTY (1/3 width) */}
        <div className="lg:col-span-1">
          <UserSection
            title="Solves by Difficulty"
            description={`${difficultiesCount} difficulty level${difficultiesCount !== 1 ? 's' : ''} mastered.`}
            icon={Zap}
          >
            <Plot
              key={`diff-${isDarkMode}`}
              data={[
                {
                  type: "pie",
                  labels: Object.keys(byDifficulty),
                  values: Object.values(byDifficulty),
                  hole: 0.5,
                  marker: {
                    colors: diffColors,
                    line: { color: t.bg, width: 1 },
                  },
                  textinfo: "label+percent",
                  hovertemplate:
                    "%{label}<br>%{value} solves<extra></extra>",
                },
              ]}
              layout={{ ...baseLayout, height: 260, showlegend: false }}
              style={{ width: "100%" }}
              useResizeHandler
              config={{ displayModeBar: false }}
            />
          </UserSection>
        </div>

        {/* SOLVES OVER TIME (2/3 width) */}
        <div className="lg:col-span-2">
          <UserSection
            title="Solves Over Time"
            description={`${firstBloodCount} first blood${firstBloodCount !== 1 ? 's' : ''} recorded in this event scope.`}
            icon={TrendingUp}
          >
            <Plot
              key={`line-${isDarkMode}`}
              data={[
                {
                  type: "scatter",
                  mode: "lines+markers",
                  x: timeSeries.map(d => d.date),
                  y: timeSeries.map(d => d.count),
                  line: { width: 3, color: "#60a5fa" },
                  marker: {
                    size: 6,
                    color: "#93c5fd",
                    line: { color: t.bg, width: 1 },
                  },
                  hovertemplate:
                    "%{x}<br>%{y} solves<extra></extra>",
                },
              ]}
              layout={{
                ...baseLayout,
                height: 260,
                xaxis: { gridcolor: t.grid },
                yaxis: {
                  title: { text: "Solves" },
                  gridcolor: t.grid,
                },
                showlegend: false,
              }}
              style={{ width: "100%" }}
              useResizeHandler
              config={{ scrollZoom: false, displayModeBar: false }}
            />
          </UserSection>
        </div>

        {/* SUBMISSION ACCURACY (1/3 width) */}
        <div className="lg:col-span-1">
          <UserSection
            title="Submission Accuracy"
            description={`${total} flag submission${total !== 1 ? 's' : ''} recorded.`}
            icon={Target}
          >
            <Plot
              key={`accuracy-${isDarkMode}`}
              data={[
                {
                  type: "pie",
                  labels: ["Correct", "Incorrect"],
                  values: [correct, incorrect],
                  hole: 0.5,
                  marker: {
                    colors: ["#22c55e", "#ef4444"],
                    line: { color: t.bg, width: 1 },
                  },
                  textinfo: "label+percent",
                  hovertemplate:
                    "%{label}<br>%{value} submissions<extra></extra>",
                },
              ]}
              layout={{ ...baseLayout, height: 260, showlegend: false }}
              style={{ width: "100%" }}
              useResizeHandler
              config={{ displayModeBar: false }}
            />
          </UserSection>
        </div>

      </div>
    </div>
  )
}
