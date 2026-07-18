export function normalizeChallengeCategory(category: string | null | undefined) {
  return String(category ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '')
}
