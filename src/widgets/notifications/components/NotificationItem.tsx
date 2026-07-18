'use client'

import React from 'react'
import { Megaphone, Server, Flag, Trash2 } from 'lucide-react'
import { cn, formatRelativeDate } from '@/shared/lib/utils'

function formatNotificationText(content: string) {
  return content
    .replace(/```[\s\S]*?```/g, (match) => match.slice(3, -3))
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

type NotificationItemProps = {
  notification: {
    id: string
    title: string
    message: string
    level: string
    created_at: string
  }
  isRead: boolean
  theme: string
  globalAdminStatus: boolean
  getLevelBadgeClass: (level: string) => string
  onDelete?: (id: string) => void
  onClick?: () => void
  isExpanded?: boolean
}

function getIconAndLabel(level: string) {
  switch (level) {
    case 'info_challenges':
      return { Icon: Flag, label: 'Challenges', colorClass: 'text-blue-500 bg-blue-500/10 ring-blue-500/20 dark:text-blue-400' }
    case 'info_platform':
      return { Icon: Server, label: 'System', colorClass: 'text-indigo-500 bg-indigo-500/10 ring-indigo-500/20 dark:text-indigo-400' }
    case 'info':
    default:
      return { Icon: Megaphone, label: 'Broadcast', colorClass: 'text-orange-500 bg-orange-500/10 ring-orange-500/20 dark:text-orange-400' }
  }
}

export default function NotificationItem({
  notification,
  isRead,
  theme,
  globalAdminStatus,
  getLevelBadgeClass,
  onDelete,
  onClick,
  isExpanded = false,
}: NotificationItemProps) {
  const { Icon, label, colorClass } = getIconAndLabel(notification.level)

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        "group relative flex items-start gap-3.5 rounded-xl p-3.5 transition-all duration-200 border",
        onClick ? "cursor-pointer" : "",
        isExpanded
          ? "bg-white/85 dark:bg-[#111622]/40 border-blue-500/30 dark:border-blue-500/20 shadow-md shadow-blue-500/[0.02]"
          : !isRead
            ? "bg-blue-500/[0.03] dark:bg-blue-400/[0.04] border-blue-500/10 dark:border-blue-500/10"
            : "bg-transparent border-transparent hover:bg-gray-50/50 dark:hover:bg-gray-800/10 hover:border-gray-100 dark:hover:border-gray-800/30"
      )}
    >
      <div className={cn("mt-0.5 flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg ring-1 transition-all", 
        isExpanded ? "scale-105" : "group-hover:scale-105", 
        colorClass
      )}>
        <Icon size={15} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn(
            "text-[13px] font-bold leading-tight transition-colors", 
            isExpanded ? "whitespace-normal break-words text-blue-600 dark:text-blue-400" : "truncate", 
            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          )} title={notification.title}>
            {notification.title}
          </h4>
          <div className="flex items-center gap-2 shrink-0">
            {!isRead && (
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 ring-2 ring-blue-500/20" />
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(notification.id)
                }}
                className="p-1.5 -mr-1.5 -mt-1.5 rounded text-gray-400/50 hover:text-red-500 hover:bg-red-500/10 transition-all"
                title="Delete broadcast"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {isExpanded && (
          <>
            <div className="h-px bg-gray-200/50 dark:bg-gray-800/50 w-full" />
            <div className="text-xs leading-relaxed whitespace-pre-line break-words font-medium text-gray-750 dark:text-gray-300 transition-all duration-200">
              {formatNotificationText(notification.message)}
            </div>
          </>
        )}

        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500">
          <span className={cn(isExpanded && "text-blue-500 dark:text-blue-400")}>{label}</span>
          <span>•</span>
          <span>{notification.created_at ? formatRelativeDate(notification.created_at) : ''}</span>
        </div>
      </div>
    </div>
  )
}
