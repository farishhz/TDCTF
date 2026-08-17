'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, X } from 'lucide-react'
import { Button } from '@/shared/ui'
import type { ClientAnnouncement } from '../types'
import { getTypeBadge } from '@/features/admin/announcements/components/AnnouncementPreviewModal'

interface AnnouncementFloatingCardProps {
  announcement: ClientAnnouncement | null
  onMarkAsRead: (announcement: ClientAnnouncement, triggerCta?: boolean) => void
  onDismiss: (announcement: ClientAnnouncement) => void
}

export default function AnnouncementFloatingCard({
  announcement,
  onMarkAsRead,
  onDismiss,
}: AnnouncementFloatingCardProps) {
  if (!announcement) return null

  const typeInfo = getTypeBadge(announcement.type)
  const TypeIcon = typeInfo.icon

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 right-6 z-50 pointer-events-none select-none">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="pointer-events-auto w-[340px] overflow-hidden rounded-2xl border border-white/15 bg-[#0b0f17]/90 p-4 text-gray-200 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1 text-[10px] font-bold uppercase rounded-md px-2 py-0.5 border ${typeInfo.className}`}
              >
                <TypeIcon className="h-3 w-3" />
                {typeInfo.label}
              </span>
            </div>

            {announcement.is_dismissible && (
              <button
                type="button"
                onClick={() => onDismiss(announcement)}
                className="rounded-lg p-1 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="py-3">
            <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
              {announcement.title}
            </h4>
            <p className="mt-1 text-xs text-gray-300 leading-normal line-clamp-3">
              {announcement.short_description || announcement.content}
            </p>
          </div>

          {/* Action */}
          <div className="pt-1 flex items-center gap-2">
            {announcement.cta_text && announcement.cta_link && (
              <Button
                size="sm"
                onClick={() => onMarkAsRead(announcement, true)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs h-8 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20"
              >
                <span>{announcement.cta_text}</span>
                <ExternalLink className="h-3 w-3 opacity-80" />
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => onMarkAsRead(announcement, false)}
              className="border-white/20 hover:bg-white/10 text-white text-xs h-8 px-3 rounded-xl font-medium"
            >
              Tutup
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
