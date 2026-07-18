'use client'

import Link from 'next/link'
import { cn } from '@/shared/lib/utils'
import {
  SURFACE_FILTER_ITEM_ACTIVE_CLASS,
  SURFACE_FILTER_ITEM_CLASS,
  SURFACE_GLASS_BASE_CLASS,
} from '@/shared/styles'
import { isAdminNavItemActive, type AdminNavItem } from './admin-navigation'

type AdminHeaderProps = {
  pathname: string
  items: AdminNavItem[]
}

export default function AdminHeader({ pathname, items }: AdminHeaderProps) {
  return (
    <header className={cn('sticky top-14 z-20 border-b border-gray-200/80 dark:border-gray-800/90 lg:hidden', SURFACE_GLASS_BASE_CLASS)}>
      <div className="px-4 py-2.5 sm:px-6">
        <nav className="flex gap-2 overflow-x-auto scroll-hidden lg:hidden" aria-label="Admin mobile navigation">
          {items.map((item) => {
            const active = isAdminNavItemActive(pathname, item)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex h-9 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-all',
                  active ? SURFACE_FILTER_ITEM_ACTIVE_CLASS : SURFACE_FILTER_ITEM_CLASS
                )}
              >
                <Icon className={cn('h-4 w-4', active ? 'text-white' : 'text-blue-500')} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
