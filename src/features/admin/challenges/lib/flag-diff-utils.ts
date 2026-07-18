"use client"

export type DiffType = 'correct' | 'case' | 'wrong' | 'missing'

export type DiffItem = {
  char: string
  type: DiffType
}

export function diffFlag(correct: string, input: string): DiffItem[] {
  const result: DiffItem[] = []
  const minLen = Math.min(correct.length, input.length)

  for (let i = 0; i < minLen; i++) {
    const c = correct[i]
    const t = input[i]
    if (c === t) {
      result.push({ char: t, type: 'correct' })
    } else if (c.toLowerCase() === t.toLowerCase()) {
      result.push({ char: t, type: 'case' })
    } else {
      result.push({ char: t, type: 'wrong' })
    }
  }

  for (let i = input.length; i < correct.length; i++) {
    result.push({ char: correct[i], type: 'missing' })
  }

  for (let i = correct.length; i < input.length; i++) {
    result.push({ char: input[i], type: 'wrong' })
  }

  return result
}

export function diffSummary(items: DiffItem[]) {
  const counts = { correct: 0, case: 0, wrong: 0, missing: 0 }
  for (const item of items) {
    counts[item.type]++
  }
  return counts
}

export const DIFF_STYLES: Record<DiffType, string> = {
  correct: 'text-emerald-500',
  case: 'text-blue-500',
  wrong: 'text-red-500',
  missing: 'text-yellow-500 dark:text-yellow-400',
}
