'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, X } from 'lucide-react'
import type { ClientAnnouncement } from '../types'
import { getTypeBadge } from '@/features/admin/announcements/components/AnnouncementPreviewModal'

interface AnnouncementTopBannerProps {
  announcement: ClientAnnouncement | null
  onMarkAsRead: (announcement: ClientAnnouncement, triggerCta?: boolean) => void
  onDismiss: (announcement: ClientAnnouncement) => void
}

export default function AnnouncementTopBanner({
  announcement,
  onMarkAsRead,
  onDismiss,
}: AnnouncementTopBannerProps) {
  if (!announcement) return null

  const typeInfo = getTypeBadge(announcement.type)
  const TypeIcon = typeInfo.icon

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="relative z-40 w-full overflow-hidden border-b border-blue-500/30 bg-gradient-to-r from-blue-950/90 via-[#0b162c]/95 to-indigo-950/90 backdrop-blur-xl shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold shrink-0 border ${typeInfo.className}`}
            >
              <TypeIcon className="h-3 w-3" />
              {typeInfo.label}
            </span>

            <p className="font-bold text-white truncate">
              {announcement.title}
              {announcement.short_description && (
                <span className="font-normal text-gray-300 ml-2 hidden md:inline">
                  — {announcement.short_description}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {announcement.cta_text && announcement.cta_link && (
              <button
                type="button"
                onClick={() => onMarkAsRead(announcement, true)}
                className="flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1 text-[11px] font-semibold text-white transition-all shadow-sm active:scale-95"
              >
                <span>{announcement.cta_text}</span>
                <ExternalLink className="h-3 w-3 opacity-80" />
              </button>
            )}

            {announcement.is_dismissible && (
              <button
                type="button"
                onClick={() => onDismiss(announcement)}
                className="rounded-lg p-1 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
