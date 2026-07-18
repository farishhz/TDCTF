import { Globe, Bomb, Binary, Cpu, Search, Puzzle, Shield, Terminal, Lightbulb, Eye, Wifi, Bot, Link2, Server } from 'lucide-react'
import React from 'react'
import type { ElementType } from 'react'
import { ImageIcon } from 'lucide-react'
import type { ChallengeWithSolve } from '@/shared/types'

export interface CategoryDetails {
  color: string
  borderColor: string
  badgeColor: string
}

export function getCategoryDetails(category: string): CategoryDetails {
  const cat = (category || '').toLowerCase()
  if (cat.includes('intro'))        return { color: 'text-yellow-500',  borderColor: 'border-yellow-500/30',  badgeColor: 'bg-yellow-500/15 text-yellow-500'   }
  if (cat.includes('boot to root')) return { color: 'text-emerald-500', borderColor: 'border-emerald-500/30', badgeColor: 'bg-emerald-500/15 text-emerald-500'  }
  if (cat.includes('linux'))        return { color: 'text-sky-500',     borderColor: 'border-sky-500/30',     badgeColor: 'bg-sky-500/15 text-sky-500'          }
  if (cat.includes('web'))          return { color: 'text-blue-500',    borderColor: 'border-blue-500/30',    badgeColor: 'bg-blue-500/15 text-blue-500'        }
  if (cat.includes('forensic'))     return { color: 'text-teal-500',    borderColor: 'border-teal-500/30',    badgeColor: 'bg-teal-500/15 text-teal-500'        }
  if (cat.includes('osint'))        return { color: 'text-cyan-500',    borderColor: 'border-cyan-500/30',    badgeColor: 'bg-cyan-500/15 text-cyan-500'        }
  if (cat.includes('crypto'))       return { color: 'text-purple-500',  borderColor: 'border-purple-500/30',  badgeColor: 'bg-purple-500/15 text-purple-500'    }
  if (cat.includes('rev'))          return { color: 'text-orange-500',  borderColor: 'border-orange-500/30',  badgeColor: 'bg-orange-500/15 text-orange-500'    }
  if (cat.includes('pwn') || cat.includes('exploit')) return { color: 'text-red-500', borderColor: 'border-red-500/30', badgeColor: 'bg-red-500/15 text-red-500' }
  if (cat.includes('steg'))         return { color: 'text-pink-500',    borderColor: 'border-pink-500/30',    badgeColor: 'bg-pink-500/15 text-pink-500'        }
  if (cat.includes('network'))      return { color: 'text-indigo-500',  borderColor: 'border-indigo-500/30',  badgeColor: 'bg-indigo-500/15 text-indigo-500'    }
  if (cat.includes('blockchain') || cat.includes('web3')) return { color: 'text-fuchsia-500', borderColor: 'border-fuchsia-500/30', badgeColor: 'bg-fuchsia-500/15 text-fuchsia-500' }
  if (cat.includes('ai'))           return { color: 'text-violet-500',  borderColor: 'border-violet-500/30',  badgeColor: 'bg-violet-500/15 text-violet-500'    }
  if (cat.includes('misc'))         return { color: 'text-gray-500',    borderColor: 'border-gray-500/30',    badgeColor: 'bg-gray-500/15 text-gray-500'        }
  return                                   { color: 'text-gray-500',    borderColor: 'border-gray-500/30',    badgeColor: 'bg-gray-500/15 text-gray-500'        }
}

const CATEGORY_ICON_MAP: Record<string, ElementType> = {
  'text-yellow-500': Lightbulb,
  'text-emerald-500': Terminal,
  'text-sky-500': Server,
  'text-blue-500': Globe,
  'text-teal-500': Search,
  'text-cyan-500': Eye,
  'text-purple-500': Binary,
  'text-orange-500': Cpu,
  'text-red-500': Bomb,
  'text-pink-500': ImageIcon,
  'text-indigo-500': Wifi,
  'text-violet-500': Bot,
  'text-fuchsia-500': Link2,
  'text-gray-500': Puzzle,
}

export function getCategoryIcon(category: string): ElementType {
  const { color } = getCategoryDetails(category)
  return CATEGORY_ICON_MAP[color] ?? Shield
}

export interface DifficultyStyle {
  dotClass: string
  textClass: string
  badgeClass: string
}

export function getDifficultyStyle(colorName: string): DifficultyStyle {
  const map: Record<string, DifficultyStyle> = {
    cyan:   { dotClass: 'bg-cyan-500',   textClass: 'text-cyan-600 dark:text-cyan-400',   badgeClass: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20'     },
    green:  { dotClass: 'bg-green-500',  textClass: 'text-green-600 dark:text-green-400',  badgeClass: 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20'   },
    yellow: { dotClass: 'bg-yellow-500', textClass: 'text-yellow-600 dark:text-yellow-500', badgeClass: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20' },
    red:    { dotClass: 'bg-red-500',    textClass: 'text-red-600 dark:text-red-400',    badgeClass: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20'     },
    purple: { dotClass: 'bg-purple-500', textClass: 'text-purple-600 dark:text-purple-400', badgeClass: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20' },
  }
  return map[colorName] ?? { dotClass: 'bg-gray-400', textClass: 'text-gray-500 dark:text-gray-400', badgeClass: 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20' }
}


export function normalizeChallengeHints(raw: unknown): string[] {
  let hints: string[] = []

  if (Array.isArray(raw)) {
    hints = raw.filter((hint): hint is string => typeof hint === 'string')
  } else if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) hints = parsed.filter((hint): hint is string => typeof hint === 'string')
      else if (typeof parsed === 'string') hints = [parsed]
    } catch {
      if (raw.trim() !== '') hints = [raw]
    }
  } else if (raw && typeof raw !== 'object') {
    hints = [String(raw)]
  }

  return hints
}

export function getDifficultyOrder(difficultyStyles?: Record<string, unknown>): string[] {
  return Object.keys(difficultyStyles || {}).map((key) => String(key).trim().toLowerCase())
}

export function getDifficultyRank(difficulty: unknown, difficultyOrder: string[]): number {
  if (!difficulty) return difficultyOrder.length

  const normalized = String(difficulty).trim().toLowerCase()
  if (normalized === 'imposible') {
    const fixedIndex = difficultyOrder.indexOf('impossible')
    return fixedIndex === -1 ? difficultyOrder.length : fixedIndex
  }

  const index = difficultyOrder.indexOf(normalized)
  return index === -1 ? difficultyOrder.length : index
}

export function sortChallengesByDisplayPriority<T extends Pick<ChallengeWithSolve, 'points' | 'total_solves' | 'difficulty' | 'title'>>(
  list: T[],
  difficultyOrder: string[]
): T[] {
  return [...list].sort((a, b) => {
    if ((a.points ?? 0) !== (b.points ?? 0)) return (a.points ?? 0) - (b.points ?? 0)

    const solvesA = a.total_solves ?? 0
    const solvesB = b.total_solves ?? 0
    if (solvesA !== solvesB) return solvesB - solvesA

    const rankA = getDifficultyRank(a.difficulty, difficultyOrder)
    const rankB = getDifficultyRank(b.difficulty, difficultyOrder)
    if (rankA !== rankB) return rankA - rankB

    return String(a.title || '').localeCompare(String(b.title || ''))
  })
}

export function sortChallengesByNewest<T extends Pick<ChallengeWithSolve, 'created_at' | 'title'>>(
  list: T[]
): T[] {
  return [...list].sort((a, b) => {
    const createdA = a.created_at ? new Date(a.created_at).getTime() : 0
    const createdB = b.created_at ? new Date(b.created_at).getTime() : 0

    if (createdA !== createdB) return createdB - createdA

    return String(a.title || '').localeCompare(String(b.title || ''))
  })
}

export function buildFuzzyOrderedList(
  preferredOrder: string[],
  values: string[],
  subCategoryOrder?: string[]
): string[] {
  const normalizedOrder = preferredOrder.map(c => c.toLowerCase())
  const normalizedSubOrder = (subCategoryOrder || []).map(c => c.toLowerCase())

  const getSortKey = (cat: string) => {
    const parts = cat.split('/')
    const parent = parts[0].toLowerCase()
    const sub = parts.slice(1).join('/').toLowerCase()

    let parentIndex = normalizedOrder.indexOf(parent)
    if (parentIndex === -1) parentIndex = normalizedOrder.length

    let subIndex: number
    if (!sub) {
      subIndex = -1
    } else {
      subIndex = normalizedSubOrder.indexOf(sub)
      if (subIndex === -1) subIndex = normalizedSubOrder.length
    }

    return { parentIndex, subIndex, catLower: cat.toLowerCase() }
  }

  return [...values].sort((a, b) => {
    const keyA = getSortKey(a)
    const keyB = getSortKey(b)
    if (keyA.parentIndex !== keyB.parentIndex) return keyA.parentIndex - keyB.parentIndex
    if (keyA.subIndex !== keyB.subIndex) return keyA.subIndex - keyB.subIndex
    return keyA.catLower.localeCompare(keyB.catLower)
  })
}

export function groupChallengesByCategory(
  challenges: ChallengeWithSolve[],
  splitSubCategories: boolean = true
): Record<string, ChallengeWithSolve[]> {
  return challenges.reduce((acc, challenge) => {
    const key = splitSubCategories ? challenge.category : getCategoryParent(challenge.category)
    if (!acc[key]) acc[key] = []
    acc[key].push(challenge)
    return acc
  }, {} as Record<string, ChallengeWithSolve[]>)
}

export function getCategoryParent(category: string | null | undefined): string {
  if (!category) return ''
  return category.split('/')[0]
}

export function formatCategory(category: string | null | undefined): string {
  if (!category) return ''
  return category.replace(/\//g, ' / ')
}

export function isCategoryMatch(challengeCategory: string | null | undefined, filterCategory: string): boolean {
  if (filterCategory === 'all') return true
  const challengeCatLower = String(challengeCategory || '').toLowerCase()
  const filterCatLower = filterCategory.toLowerCase()
  const isExact = challengeCatLower === filterCatLower
  const isSub = challengeCatLower.startsWith(filterCatLower + '/')
  return isExact || isSub
}

export interface CardHoverStyles {
  glowHover: string
  titleHover: string
  accentLine: string
}

export function getCategoryCardHoverStyles(categoryColorClass: string): CardHoverStyles {
  const parts = categoryColorClass.split('-')
  const base = parts[1] || 'gray' // e.g. 'yellow', 'emerald', etc.
  
  const map: Record<string, CardHoverStyles> = {
    yellow:    { glowHover: 'group-hover:bg-yellow-500/[0.04]',    titleHover: 'group-hover:text-yellow-600 dark:group-hover:text-yellow-300',    accentLine: 'via-yellow-500/80' },
    emerald:   { glowHover: 'group-hover:bg-emerald-500/[0.04]',   titleHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-300',  accentLine: 'via-emerald-500/80' },
    sky:       { glowHover: 'group-hover:bg-sky-500/[0.04]',       titleHover: 'group-hover:text-sky-600 dark:group-hover:text-sky-300',          accentLine: 'via-sky-500/80' },
    blue:      { glowHover: 'group-hover:bg-blue-500/[0.04]',      titleHover: 'group-hover:text-blue-600 dark:group-hover:text-blue-300',        accentLine: 'via-blue-500/80' },
    teal:      { glowHover: 'group-hover:bg-teal-500/[0.04]',      titleHover: 'group-hover:text-teal-600 dark:group-hover:text-teal-300',        accentLine: 'via-teal-500/80' },
    cyan:      { glowHover: 'group-hover:bg-cyan-500/[0.04]',      titleHover: 'group-hover:text-cyan-600 dark:group-hover:text-cyan-300',        accentLine: 'via-cyan-500/80' },
    purple:    { glowHover: 'group-hover:bg-purple-500/[0.04]',    titleHover: 'group-hover:text-purple-600 dark:group-hover:text-purple-300',    accentLine: 'via-purple-500/80' },
    orange:    { glowHover: 'group-hover:bg-orange-500/[0.04]',    titleHover: 'group-hover:text-orange-600 dark:group-hover:text-orange-300',    accentLine: 'via-orange-500/80' },
    red:       { glowHover: 'group-hover:bg-red-500/[0.04]',       titleHover: 'group-hover:text-red-600 dark:group-hover:text-red-300',          accentLine: 'via-red-500/80' },
    pink:      { glowHover: 'group-hover:bg-pink-500/[0.04]',      titleHover: 'group-hover:text-pink-600 dark:group-hover:text-pink-300',        accentLine: 'via-pink-500/80' },
    indigo:    { glowHover: 'group-hover:bg-indigo-500/[0.04]',    titleHover: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-300',    accentLine: 'via-indigo-500/80' },
    fuchsia:   { glowHover: 'group-hover:bg-fuchsia-500/[0.04]',   titleHover: 'group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-300',  accentLine: 'via-fuchsia-500/80' },
    violet:    { glowHover: 'group-hover:bg-violet-500/[0.04]',    titleHover: 'group-hover:text-violet-600 dark:group-hover:text-violet-300',    accentLine: 'via-violet-500/80' },
    gray:      { glowHover: 'group-hover:bg-gray-500/[0.04]',      titleHover: 'group-hover:text-gray-600 dark:group-hover:text-gray-300',        accentLine: 'via-gray-500/80' },
  }
  
  return map[base] || map.gray
}
