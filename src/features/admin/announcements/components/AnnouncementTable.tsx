'use client'

import React, { useState } from 'react'
import {
  Search,
  Filter,
  Eye,
  Edit,
  Copy,
  Trash2,
  MoreVertical,
  Layers,
  Sparkles,
  MousePointerClick,
  Bell,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
} from 'lucide-react'
import { Button, Input } from '@/shared/ui'
import { formatDate } from '@/shared/components/DateBadge'
import toast from 'react-hot-toast'
import type { AnnouncementItem, AnnouncementType, AnnouncementStatus } from '../types'
import { getTypeBadge, getPriorityBadge } from './AnnouncementPreviewModal'
import { deleteAnnouncement, duplicateAnnouncement } from '../services/announcement.service'

interface AnnouncementTableProps {
  items: AnnouncementItem[]
  loading: boolean
  onEdit: (item: AnnouncementItem) => void
  onPreview: (item: AnnouncementItem) => void
  onRefresh: () => void
  search: string
  setSearch: (val: string) => void
  typeFilter: string
  setTypeFilter: (val: string) => void
  statusFilter: string
  setStatusFilter: (val: string) => void
}

function getStatusBadge(computedStatus?: string) {
  switch (computedStatus) {
    case 'scheduled':
      return {
        label: 'SCHEDULED',
        className: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
      }
    case 'expired':
      return {
        label: 'EXPIRED',
        className: 'bg-gray-500/10 text-gray-400 border-gray-500/25',
      }
    case 'draft':
      return {
        label: 'DRAFT',
        className: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
      }
    case 'archived':
      return {
        label: 'ARCHIVED',
        className: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
      }
    default:
      return {
        label: 'ACTIVE / PUBLISHED',
        className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-[0_0_8px_rgba(52,211,153,0.15)]',
      }
  }
}

export default function AnnouncementTable({
  items,
  loading,
  onEdit,
  onPreview,
  onRefresh,
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
}: AnnouncementTableProps) {
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const handleDuplicate = async (id: string) => {
    setActionLoadingId(id)
    try {
      await duplicateAnnouncement(id)
      toast.success('Pengumuman berhasil diduplikasi!')
      onRefresh()
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menduplikasi')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus pengumuman "${title}"?`)) {
      return
    }

    setActionLoadingId(id)
    try {
      await deleteAnnouncement(id)
      toast.success('Pengumuman berhasil dihapus!')
      onRefresh()
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menghapus')
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari judul atau isi pengumuman..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl text-xs"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto scroll-hidden">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 rounded-xl border border-white/10 bg-[#0f172a] px-3 text-xs text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="">Semua Tipe</option>
            <option value="info">Info</option>
            <option value="event">Event CTF</option>
            <option value="maintenance">Maintenance</option>
            <option value="update">Update</option>
            <option value="warning">Warning</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-white/10 bg-[#0f172a] px-3 text-xs text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="">Semua Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f19]/80 backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="border-b border-white/10 bg-white/[0.03] text-[11px] font-bold uppercase tracking-wider text-gray-400">
              <tr>
                <th className="py-3.5 px-4">Pengumuman</th>
                <th className="py-3.5 px-4">Tipe & Prioritas</th>
                <th className="py-3.5 px-4">Channels</th>
                <th className="py-3.5 px-4">Target Audience</th>
                <th className="py-3.5 px-4">Jadwal Tayang</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Views / Reads</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-6 w-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                      <span>Memuat data pengumuman...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <FolderOpen className="h-8 w-8 mx-auto text-gray-600 mb-2" />
                    <p className="font-semibold text-gray-400">Belum ada pengumuman</p>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      Buat pengumuman baru untuk disiarkan ke user TDCTF.
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const typeInfo = getTypeBadge(item.type)
                  const priorityInfo = getPriorityBadge(item.priority)
                  const statusInfo = getStatusBadge(item.computed_status)
                  const TypeIcon = typeInfo.icon
                  const ctr =
                    item.views_count > 0
                      ? Math.round((item.reads_count / item.views_count) * 100)
                      : 0

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Title & Preview */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {item.banner_image_url ? (
                            <img
                              src={item.banner_image_url}
                              alt=""
                              className="h-9 w-14 rounded-lg object-cover border border-white/10 shrink-0 bg-black/40"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                              <TypeIcon className="h-4 w-4" />
                            </div>
                          )}
                          <div className="min-w-0 max-w-[220px]">
                            <p
                              className="font-bold text-white truncate hover:text-blue-400 cursor-pointer"
                              onClick={() => onPreview(item)}
                              title={item.title}
                            >
                              {item.title}
                            </p>
                            {item.short_description && (
                              <p className="text-[11px] text-gray-400 truncate mt-0.5">
                                {item.short_description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type & Priority */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-bold border ${typeInfo.className}`}
                          >
                            <TypeIcon className="h-2.5 w-2.5" />
                            {typeInfo.label}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-md px-1.5 py-0.2 text-[8px] ${priorityInfo.className}`}
                          >
                            {priorityInfo.label}
                          </span>
                        </div>
                      </td>

                      {/* Channels */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-gray-400">
                          {item.channels?.includes('modal') && (
                            <span
                              title="Liquid Glass Modal"
                              className="p-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px]"
                            >
                              🪟
                            </span>
                          )}
                          {item.channels?.includes('top_banner') && (
                            <span
                              title="Top Sticky Banner"
                              className="p-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px]"
                            >
                              📌
                            </span>
                          )}
                          {item.channels?.includes('floating_card') && (
                            <span
                              title="Floating Card"
                              className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px]"
                            >
                              💬
                            </span>
                          )}
                          {item.channels?.includes('notification') && (
                            <span
                              title="Notification Center"
                              className="p-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px]"
                            >
                              🔔
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Target */}
                      <td className="py-3.5 px-4">
                        {item.target_type === 'all' && (
                          <span className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-gray-300">
                            🌐 Everyone
                          </span>
                        )}
                        {item.target_type === 'role' && (
                          <span className="rounded-md bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] text-blue-300">
                            🛡️ {item.target_roles?.join(', ')}
                          </span>
                        )}
                        {item.target_type === 'tags' && (
                          <span className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] text-amber-300">
                            🏷️ {item.target_tags?.join(', ') || 'Tags'}
                          </span>
                        )}
                        {item.target_type === 'event' && (
                          <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 truncate max-w-[120px] block">
                            🏆 {item.event_title || 'Event'}
                          </span>
                        )}
                        {item.target_type === 'specific_users' && (
                          <span className="rounded-md bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[10px] text-purple-300">
                            👤 Specific Users
                          </span>
                        )}
                      </td>

                      {/* Schedule */}
                      <td className="py-3.5 px-4 text-[11px]">
                        <div className="flex flex-col">
                          <span className="text-gray-300">
                            {item.starts_at ? formatDate(item.starts_at) : 'Langsung'}
                          </span>
                          {item.ends_at && (
                            <span className="text-[10px] text-gray-500">
                              sampai {formatDate(item.ends_at)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold border ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Views / Reads */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-white">
                            {item.views_count.toLocaleString()} / {item.reads_count.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-emerald-400 font-mono">
                            {ctr}% CTR
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onPreview(item)}
                            className="h-7 w-7 p-0 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                            title="Live Preview"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEdit(item)}
                            className="h-7 w-7 p-0 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                            title="Edit"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDuplicate(item.id)}
                            disabled={actionLoadingId === item.id}
                            className="h-7 w-7 p-0 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                            title="Duplicate"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(item.id, item.title)}
                            disabled={actionLoadingId === item.id}
                            className="h-7 w-7 p-0 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
