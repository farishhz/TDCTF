'use client'

import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
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
  Layers,
  Bell,
} from 'lucide-react'
import type { AnnouncementFormData, AnnouncementItem, AnnouncementPriority, AnnouncementType } from '../types'

interface AnnouncementPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: AnnouncementFormData | AnnouncementItem | null
}

export function getTypeBadge(type: AnnouncementType) {
  switch (type) {
    case 'maintenance':
      return {
        label: 'MAINTENANCE',
        icon: Wrench,
        className: 'bg-amber-500/10 text-amber-500 border-amber-500/25',
      }
    case 'warning':
      return {
        label: 'WARNING',
        icon: AlertTriangle,
        className: 'bg-rose-500/10 text-rose-500 border-rose-500/25',
      }
    case 'event':
      return {
        label: 'EVENT CTF',
        icon: Flame,
        className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25',
      }
    case 'update':
      return {
        label: 'UPDATE',
        icon: Sparkles,
        className: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/25',
      }
    default:
      return {
        label: 'INFO',
        icon: Info,
        className: 'bg-blue-500/10 text-blue-500 border-blue-500/25',
      }
  }
}

export function getPriorityBadge(priority: AnnouncementPriority) {
  switch (priority) {
    case 'critical':
      return {
        label: 'CRITICAL',
        className: 'bg-red-500 text-white font-extrabold shadow-sm shadow-red-500/30',
      }
    case 'high':
      return {
        label: 'HIGH',
        className: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold',
      }
    case 'low':
      return {
        label: 'LOW',
        className: 'bg-gray-500/10 text-gray-400 border border-gray-500/20 font-medium',
      }
    default:
      return {
        label: 'NORMAL',
        className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold',
      }
  }
}

export default function AnnouncementPreviewModal({
  open,
  onOpenChange,
  data,
}: AnnouncementPreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'modal' | 'banner' | 'card' | 'notif'>('modal')

  if (!data) return null

  const typeInfo = getTypeBadge(data.type)
  const priorityInfo = getPriorityBadge(data.priority)
  const TypeIcon = typeInfo.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 border border-white/20 dark:border-gray-800 bg-[#0c121e]/95 backdrop-blur-2xl shadow-2xl text-gray-100"
        aria-describedby={undefined}
      >
        {/* Header Preview Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-4 bg-white/5">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-400" />
            <DialogTitle className="text-base font-bold text-white tracking-wide">
              Live Preview
            </DialogTitle>
            <span className="text-xs text-gray-400 font-mono">
              [Tampilan Real-time User]
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 rounded-xl bg-black/40 p-1 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('modal')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
                activeTab === 'modal'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🪟 Modal Popup
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('banner')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
                activeTab === 'banner'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📌 Top Banner
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('card')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
                activeTab === 'card'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              💬 Floating Card
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('notif')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
                activeTab === 'notif'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🔔 Notification
            </button>
          </div>
        </div>

        {/* Preview Canvas Area */}
        <div className="p-6 bg-gradient-to-b from-[#0a0e17] to-[#0f172a] min-h-[380px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {activeTab === 'modal' && (
              <motion.div
                key="modal-preview"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-lg max-h-[75vh] flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-[#0b101b]/98 text-gray-100 shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
              >
                {/* Close Button */}
                {data.is_dismissible && (
                  <div className="absolute top-3 right-3 z-30 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-gray-300">
                    <X className="h-4 w-4" />
                  </div>
                )}

                {/* Banner Hero Image */}
                {data.banner_image_url && (
                  <div className="shrink-0 relative w-full h-32 sm:h-36 overflow-hidden border-b border-white/10 bg-black/50">
                    <img
                      src={data.banner_image_url}
                      alt={data.title}
                      className="h-full w-full object-cover object-center"
                      onError={(e) => {
                        e.currentTarget.parentElement?.remove()
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b101b] via-transparent to-transparent opacity-80" />
                  </div>
                )}

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
                  {/* Badges */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`select-none text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${typeInfo.className}`}
                    >
                      {typeInfo.label}
                    </span>

                    {data.priority === 'critical' && (
                      <span className="select-none text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-red-500/10 text-red-400 border-red-500/25">
                        Critical
                      </span>
                    )}

                    {data.priority === 'high' && (
                      <span className="select-none text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border bg-amber-500/10 text-amber-400 border-amber-500/25">
                        High Priority
                      </span>
                    )}
                  </div>

                  {/* Title & Short Description */}
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                      {data.title || 'Judul Pengumuman...'}
                    </h2>
                    {data.short_description && (
                      <p className="mt-1 text-xs text-gray-300 leading-relaxed font-normal">
                        {data.short_description}
                      </p>
                    )}
                  </div>

                  {/* Markdown Content */}
                  <div className="text-xs sm:text-sm text-gray-300 leading-relaxed space-y-2.5 prose prose-invert prose-p:my-1 prose-headings:text-white prose-headings:font-bold prose-headings:text-sm prose-code:bg-black/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-white/10 prose-code:text-blue-300 prose-ul:my-1 prose-li:my-0.5 max-w-none">
                    {data.content ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                        {data.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="italic text-gray-500">Konten pengumuman kosong...</p>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="shrink-0 p-3.5 sm:p-4.5 border-t border-white/10 bg-[#0b101b]/90 backdrop-blur-md flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 sm:h-9 px-3 sm:px-4 rounded-xl border border-white/15 bg-white/5 text-xs font-semibold text-gray-200"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mr-1.5" />
                    <span>Saya Mengerti</span>
                  </Button>

                  {data.cta_text && (
                    <Button
                      size="sm"
                      className="h-8 sm:h-9 px-3.5 sm:px-4.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 flex items-center gap-1.5"
                    >
                      <span>{data.cta_text}</span>
                      <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'banner' && (
              <motion.div
                key="banner-preview"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full max-w-2xl overflow-hidden rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-950/80 via-[#0f1d3a]/90 to-indigo-950/80 p-3 shadow-xl backdrop-blur-xl"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-bold shrink-0 ${typeInfo.className}`}
                    >
                      <TypeIcon className="h-2.5 w-2.5" />
                      {typeInfo.label}
                    </span>
                    <span className="font-bold text-xs text-white truncate">
                      {data.title || 'Judul Pengumuman'}
                    </span>
                    {data.short_description && (
                      <span className="text-[11px] text-gray-300 truncate hidden sm:inline">
                        — {data.short_description}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {data.cta_text && (
                      <button
                        type="button"
                        className="flex items-center gap-1 rounded-lg bg-blue-600 hover:bg-blue-500 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors"
                      >
                        <span>{data.cta_text}</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      className="rounded p-1 text-gray-400 hover:bg-white/10 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'card' && (
              <motion.div
                key="card-preview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="w-[340px] overflow-hidden rounded-2xl border border-white/15 bg-[#0b0f17]/90 p-4 text-gray-200 shadow-2xl backdrop-blur-2xl"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex items-center gap-1 text-[10px] font-bold uppercase rounded-md px-2 py-0.5 border ${typeInfo.className}`}
                    >
                      <TypeIcon className="h-3 w-3" />
                      {typeInfo.label}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="py-3">
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {data.title || 'Judul Pengumuman'}
                  </h4>
                  <p className="mt-1 text-xs text-gray-300 leading-normal">
                    {data.short_description || data.content?.slice(0, 100) || 'Deskripsi singkat pengumuman...'}
                  </p>
                </div>

                {data.cta_text && (
                  <Button
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-8 rounded-xl"
                  >
                    {data.cta_text}
                  </Button>
                )}
              </motion.div>
            )}

            {activeTab === 'notif' && (
              <motion.div
                key="notif-preview"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full max-w-md overflow-hidden rounded-xl border border-white/15 bg-[#0f172a]/95 p-3.5 shadow-xl backdrop-blur-xl"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-500/20 border border-blue-500/30 p-2 text-blue-400 shrink-0">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white truncate">
                        {data.title || 'Judul Pengumuman'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">Baru saja</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-300 line-clamp-2">
                      {data.short_description || data.content || 'Konten pengumuman...'}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold border ${typeInfo.className}`}
                      >
                        {typeInfo.label}
                      </span>
                      {data.cta_text && (
                        <span className="text-[10px] font-semibold text-blue-400 hover:underline cursor-pointer">
                          {data.cta_text} →
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
