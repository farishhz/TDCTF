'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/shared/ui'
import { ExternalLink, CheckCircle2, X } from 'lucide-react'
import type { ClientAnnouncement } from '../types'

interface AnnouncementModalPopupProps {
  announcement: ClientAnnouncement | null
  onMarkAsRead: (announcement: ClientAnnouncement, triggerCta?: boolean) => void
  onDismiss: (announcement: ClientAnnouncement) => void
}

function getTypeBadgeStyle(type: string) {
  switch (type) {
    case 'event':
      return {
        label: 'Event',
        className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      }
    case 'maintenance':
      return {
        label: 'Maintenance',
        className: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
      }
    case 'update':
      return {
        label: 'Update',
        className: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
      }
    case 'warning':
      return {
        label: 'Important',
        className: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
      }
    default:
      return {
        label: 'Announcement',
        className: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
      }
  }
}

export default function AnnouncementModalPopup({
  announcement,
  onMarkAsRead,
  onDismiss,
}: AnnouncementModalPopupProps) {
  if (!announcement) return null

  const typeStyle = getTypeBadgeStyle(announcement.type)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 overflow-hidden">
        {/* Backdrop blur overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => {
            if (announcement.is_dismissible) {
              onDismiss(announcement)
            }
          }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window: Fixed flex column with max-h so buttons are NEVER cut off */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.35, bounce: 0.05 }}
          className="relative z-10 w-full max-w-lg max-h-[85vh] sm:max-h-[80vh] flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-[#0b101b]/98 text-gray-100 shadow-[0_25px_70px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
        >
          {/* Close Button */}
          {announcement.is_dismissible && (
            <button
              type="button"
              onClick={() => onDismiss(announcement)}
              className="absolute top-3 right-3 z-30 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-gray-300 hover:text-white hover:bg-white/20 transition-all active:scale-95"
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Banner Hero Image (Compact height to preserve content space) */}
          {announcement.banner_image_url && (
            <div className="shrink-0 relative w-full h-32 sm:h-40 overflow-hidden border-b border-white/10 bg-black/50">
              <img
                src={announcement.banner_image_url}
                alt={announcement.title}
                className="h-full w-full object-cover object-center"
                onError={(e) => {
                  e.currentTarget.parentElement?.remove()
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b101b] via-transparent to-transparent opacity-80" />
            </div>
          )}

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
            {/* Badges */}
            <div className="flex items-center gap-2">
              <span
                className={`select-none text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${typeStyle.className}`}
              >
                {typeStyle.label}
              </span>

              {announcement.priority === 'critical' && (
                <span className="select-none text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-red-500/10 text-red-400 border-red-500/25">
                  Critical
                </span>
              )}

              {announcement.priority === 'high' && (
                <span className="select-none text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-amber-500/10 text-amber-400 border-amber-500/25">
                  High Priority
                </span>
              )}
            </div>

            {/* Title & Short Description */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                {announcement.title}
              </h2>
              {announcement.short_description && (
                <p className="mt-1 text-xs text-gray-300 leading-relaxed font-normal">
                  {announcement.short_description}
                </p>
              )}
            </div>

            {/* Markdown Content */}
            <div className="text-xs sm:text-sm text-gray-300 leading-relaxed space-y-2.5 prose prose-invert prose-p:my-1 prose-headings:text-white prose-headings:font-bold prose-headings:text-sm prose-code:bg-black/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-white/10 prose-code:text-blue-300 prose-ul:my-1 prose-li:my-0.5 max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                {announcement.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Sticky Bottom Action Bar Footer (Always visible) */}
          <div className="shrink-0 p-3.5 sm:p-4.5 border-t border-white/10 bg-[#0b101b]/90 backdrop-blur-md flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMarkAsRead(announcement, false)}
              className="h-8 sm:h-9 px-3 sm:px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-200 transition-all active:scale-[0.98]"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mr-1.5" />
              <span>Saya Mengerti</span>
            </Button>

            {announcement.cta_text && announcement.cta_link && (
              <Button
                size="sm"
                onClick={() => onMarkAsRead(announcement, true)}
                className="h-8 sm:h-9 px-3.5 sm:px-4.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 flex items-center gap-1.5 transition-all active:scale-[0.98]"
              >
                <span>{announcement.cta_text}</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-80" />
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
