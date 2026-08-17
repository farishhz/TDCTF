'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/shared/ui'
import {
  Sparkles,
  AlertTriangle,
  Info,
  Flame,
  Wrench,
  ExternalLink,
  CheckCircle2,
  X,
} from 'lucide-react'
import type { ClientAnnouncement } from '../types'
import { getTypeBadge, getPriorityBadge } from '@/features/admin/announcements/components/AnnouncementPreviewModal'

interface AnnouncementModalPopupProps {
  announcement: ClientAnnouncement | null
  onMarkAsRead: (announcement: ClientAnnouncement, triggerCta?: boolean) => void
  onDismiss: (announcement: ClientAnnouncement) => void
}

export default function AnnouncementModalPopup({
  announcement,
  onMarkAsRead,
  onDismiss,
}: AnnouncementModalPopupProps) {
  if (!announcement) return null

  const typeInfo = getTypeBadge(announcement.type)
  const priorityInfo = getPriorityBadge(announcement.priority)
  const TypeIcon = typeInfo.icon

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99] flex items-center justify-center p-4 sm:p-6 select-none overflow-y-auto">
        {/* Backdrop blur overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (announcement.is_dismissible) {
              onDismiss(announcement)
            }
          }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md transition-all"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-white/20 dark:border-white/10 bg-[#0c121e]/95 p-6 text-gray-100 shadow-[0_25px_70px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-2xl"
        >
          {/* Banner Image */}
          {announcement.banner_image_url && (
            <div className="mb-4 overflow-hidden rounded-2xl border border-white/10 bg-black/40 aspect-[21/9] relative shadow-inner">
              <img
                src={announcement.banner_image_url}
                alt={announcement.title}
                className="h-full w-full object-cover object-center"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}

          {/* Badges & Header Bar */}
          <div className="flex items-center justify-between gap-2 pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${typeInfo.className}`}
              >
                <TypeIcon className="h-3 w-3" />
                {typeInfo.label}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] ${priorityInfo.className}`}
              >
                {priorityInfo.label}
              </span>
            </div>

            {announcement.is_dismissible && (
              <button
                type="button"
                onClick={() => onDismiss(announcement)}
                className="rounded-xl p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Title */}
          <h3 className="mt-2.5 text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
            {announcement.title}
          </h3>

          {/* Short Description */}
          {announcement.short_description && (
            <p className="mt-1.5 text-xs text-gray-300 font-medium leading-relaxed">
              {announcement.short_description}
            </p>
          )}

          {/* Markdown Content */}
          <div className="mt-4 max-h-64 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs leading-relaxed text-gray-300 scroll-hidden prose prose-invert prose-xs max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
              {announcement.content}
            </ReactMarkdown>
          </div>

          {/* Actions Footer */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
            <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold text-gray-400">TDCTF Broadcast</span>
            </div>

            <div className="flex items-center gap-2.5">
              {announcement.cta_text && announcement.cta_link && (
                <Button
                  onClick={() => onMarkAsRead(announcement, true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-1.5 transition-all active:scale-[0.98]"
                >
                  <span>{announcement.cta_text}</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => onMarkAsRead(announcement, false)}
                className="border-white/20 bg-white/5 hover:bg-white/15 text-white text-xs h-9 px-4 rounded-xl font-medium flex items-center gap-1.5 transition-all active:scale-[0.98]"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Saya Mengerti</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
