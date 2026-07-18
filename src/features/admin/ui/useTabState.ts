"use client"

import { useCallback, useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

export function useTabState<T extends string>(
  key: string,
  defaultValue: T,
): [T, (tab: T) => void] {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const activeTab = useMemo(() => {
    const value = searchParams.get(key)
    return (value as T) ?? defaultValue
  }, [searchParams, key, defaultValue])

  const setActiveTab = useCallback(
    (tab: T) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(key, tab)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, key, pathname, router],
  )

  return [activeTab, setActiveTab]
}
