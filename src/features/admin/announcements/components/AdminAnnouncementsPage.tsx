'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Plus, RefreshCw, Megaphone, Sparkles } from 'lucide-react'
import { Button } from '@/shared/ui'
import { AdminContent, AdminPageShell } from '@/features/admin/ui'
import type { AnnouncementItem, AnnouncementStats } from '../types'
import {
  getAdminAnnouncements,
  getAdminAnnouncementStats,
} from '../services/announcement.service'
import AnnouncementStatsCards from './AnnouncementStatsCards'
import AnnouncementTable from './AnnouncementTable'
import AnnouncementFormDialog from './AnnouncementFormDialog'
import AnnouncementPreviewModal from './AnnouncementPreviewModal'

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<AnnouncementItem[]>([])
  const [stats, setStats] = useState<AnnouncementStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Dialog States
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null)
  const [previewItem, setPreviewItem] = useState<AnnouncementItem | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [announcementsData, statsData] = await Promise.all([
        getAdminAnnouncements(search, statusFilter, typeFilter, 100, 0),
        getAdminAnnouncementStats(),
      ])
      setItems(announcementsData)
      setStats(statsData)
    } catch (err) {
      console.error('Error fetching admin announcements:', err)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, typeFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchData()
    }, 200)
    return () => clearTimeout(timer)
  }, [fetchData])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (item: AnnouncementItem) => {
    setEditingItem(item)
    setFormOpen(true)
  }

  const handleOpenPreview = (item: AnnouncementItem) => {
    setPreviewItem(item)
    setPreviewOpen(true)
  }

  return (
    <AdminPageShell>
      <AdminContent className="space-y-6">
        {/* Page Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight sm:text-2xl flex items-center gap-2.5">
              <Megaphone className="h-6 w-6 text-blue-400" />
              <span>Announcement Studio</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Kelola siaran pengumuman, liquid glass popup, sticky banner, dan notification center
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchData()}
              disabled={loading}
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl h-9 px-3"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            </Button>

            <Button
              onClick={handleOpenCreate}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs h-9 px-4 rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>New Announcement</span>
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <AnnouncementStatsCards stats={stats} loading={loading} />

        {/* Announcements Data Table */}
        <AnnouncementTable
          items={items}
          loading={loading}
          onEdit={handleOpenEdit}
          onPreview={handleOpenPreview}
          onRefresh={() => void fetchData()}
          search={search}
          setSearch={setSearch}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </AdminContent>

      {/* Form Dialog */}
      <AnnouncementFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingItem}
        onSuccess={() => void fetchData()}
      />

      {/* Preview Modal */}
      <AnnouncementPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        data={previewItem}
      />
    </AdminPageShell>
  )
}
