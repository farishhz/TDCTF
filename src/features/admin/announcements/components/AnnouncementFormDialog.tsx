'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui/dialog'
import { Button, Input, Label, Switch } from '@/shared/ui'
import {
  Eye,
  FileText,
  Sliders,
  Users,
  Calendar,
  Layers,
  MousePointerClick,
  Sparkles,
  Check,
  AlertTriangle,
  Flame,
  Wrench,
  Info,
  Link2,
  Bold,
  Italic,
  Heading,
  List,
  Code,
  Image as ImageIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type {
  AnnouncementFormData,
  AnnouncementItem,
  AnnouncementType,
  AnnouncementPriority,
  AnnouncementChannel,
  AnnouncementTargetType,
  AnnouncementDisplayRule,
  AnnouncementStatus,
} from '../types'
import {
  createAnnouncement,
  updateAnnouncement,
  getEventsForTargeting,
  getActiveUserTags,
} from '../services/announcement.service'
import AnnouncementPreviewModal from './AnnouncementPreviewModal'

interface AnnouncementFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: AnnouncementItem | null
  onSuccess: () => void
}

function toDatetimeLocal(dateStr?: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

function nowLocal(): string {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

export default function AnnouncementFormDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: AnnouncementFormDialogProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'display' | 'target' | 'schedule' | 'behavior' | 'cta'>('content')
  const [loading, setLoading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  // Events & Tags for Targeting dropdowns
  const [eventsList, setEventsList] = useState<Array<{ id: string; title: string }>>([])
  const [tagsList, setTagsList] = useState<string[]>(['Pelajar', 'Mahasiswa', 'Umum', 'VIP'])

  // Form State
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    short_description: '',
    content: '',
    banner_image_url: '',
    type: 'info',
    priority: 'normal',
    channels: ['modal', 'notification'],
    popup_style: 'modal',
    status: 'published',
    target_type: 'all',
    target_roles: ['user'],
    target_tags: [],
    target_event_id: null,
    target_team_ids: [],
    target_user_ids: [],
    starts_at: nowLocal(),
    ends_at: '',
    display_rule: 'until_read',
    cooldown_hours: 24,
    is_dismissible: true,
    cta_text: '',
    cta_link: '',
    cta_target: '_self',
  })

  // Load events & tags
  useEffect(() => {
    if (open) {
      void getEventsForTargeting().then(setEventsList)
      void getActiveUserTags().then((tags) => {
        if (tags && tags.length > 0) {
          const unique = Array.from(new Set([...tags, 'Pelajar', 'Mahasiswa', 'Umum', 'VIP']))
          setTagsList(unique)
        }
      })
    }
  }, [open])

  // Populate initial data on edit
  useEffect(() => {
    if (initialData && open) {
      setFormData({
        title: initialData.title || '',
        short_description: initialData.short_description || '',
        content: initialData.content || '',
        banner_image_url: initialData.banner_image_url || '',
        type: initialData.type || 'info',
        priority: initialData.priority || 'normal',
        channels: initialData.channels || ['modal', 'notification'],
        popup_style: initialData.popup_style || 'modal',
        status: initialData.status || 'published',
        target_type: initialData.target_type || 'all',
        target_roles: initialData.target_roles || ['user'],
        target_tags: initialData.target_tags || [],
        target_event_id: initialData.target_event_id || null,
        target_team_ids: initialData.target_team_ids || [],
        target_user_ids: initialData.target_user_ids || [],
        starts_at: toDatetimeLocal(initialData.starts_at) || nowLocal(),
        ends_at: toDatetimeLocal(initialData.ends_at) || '',
        display_rule: initialData.display_rule || 'until_read',
        cooldown_hours: initialData.cooldown_hours ?? 24,
        is_dismissible: initialData.is_dismissible ?? true,
        cta_text: initialData.cta_text || '',
        cta_link: initialData.cta_link || '',
        cta_target: (initialData.cta_target as '_self' | '_blank') || '_self',
      })
    } else if (open) {
      // Reset form
      setFormData({
        title: '',
        short_description: '',
        content: '',
        banner_image_url: '',
        type: 'info',
        priority: 'normal',
        channels: ['modal', 'notification'],
        popup_style: 'modal',
        status: 'published',
        target_type: 'all',
        target_roles: ['user'],
        target_tags: [],
        target_event_id: null,
        target_team_ids: [],
        target_user_ids: [],
        starts_at: nowLocal(),
        ends_at: '',
        display_rule: 'until_read',
        cooldown_hours: 24,
        is_dismissible: true,
        cta_text: '',
        cta_link: '',
        cta_target: '_self',
      })
      setActiveTab('content')
    }
  }, [initialData, open])

  // Helper to append formatting in markdown content
  const insertMarkdown = (prefix: string, suffix = '') => {
    setFormData((prev) => ({
      ...prev,
      content: `${prev.content}${prefix}teks${suffix}`,
    }))
  }

  // Toggle channel
  const toggleChannel = (channel: AnnouncementChannel) => {
    setFormData((prev) => {
      const exists = prev.channels.includes(channel)
      if (exists) {
        if (prev.channels.length === 1) {
          toast.error('Minimal harus memilih 1 channel distribusi!')
          return prev
        }
        return { ...prev, channels: prev.channels.filter((c) => c !== channel) }
      }
      return { ...prev, channels: [...prev.channels, channel] }
    })
  }

  // Toggle tag
  const toggleTag = (tag: string) => {
    setFormData((prev) => {
      const exists = prev.target_tags.includes(tag)
      if (exists) {
        return { ...prev, target_tags: prev.target_tags.filter((t) => t !== tag) }
      }
      return { ...prev, target_tags: [...prev.target_tags, tag] }
    })
  }

  // Toggle role
  const toggleRole = (role: string) => {
    setFormData((prev) => {
      const exists = prev.target_roles.includes(role)
      if (exists) {
        return { ...prev, target_roles: prev.target_roles.filter((r) => r !== role) }
      }
      return { ...prev, target_roles: [...prev.target_roles, role] }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Judul pengumuman wajib diisi!')
      setActiveTab('content')
      return
    }

    if (!formData.content.trim()) {
      toast.error('Isi pengumuman wajib diisi!')
      setActiveTab('content')
      return
    }

    setLoading(true)
    try {
      if (initialData) {
        await updateAnnouncement(initialData.id, formData)
        toast.success('Pengumuman berhasil diperbarui!')
      } else {
        await createAnnouncement(formData)
        toast.success('Pengumuman baru berhasil dibuat!')
      }
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menyimpan pengumuman')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'content', label: '1. Content', icon: FileText },
    { id: 'display', label: '2. Display & Channels', icon: Layers },
    { id: 'target', label: '3. Target Audience', icon: Users },
    { id: 'schedule', label: '4. Scheduling', icon: Calendar },
    { id: 'behavior', label: '5. Behavior & Rules', icon: Sliders },
    { id: 'cta', label: '6. Call to Action', icon: MousePointerClick },
  ] as const

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-4xl max-h-[92vh] flex flex-col p-0 border border-white/20 dark:border-gray-800 bg-[#0c121e]/95 backdrop-blur-2xl shadow-2xl text-gray-100"
          aria-describedby={undefined}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/5 shrink-0">
            <div>
              <DialogTitle className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400" />
                {initialData ? 'Edit Announcement Studio' : 'Create New Announcement'}
              </DialogTitle>
              <p className="text-xs text-gray-400 mt-0.5">
                Konfigurasi pengumuman, multi-channel display, scheduling, dan targeting bertingkat.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
              className="border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded-xl h-8 px-3 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Live Preview</span>
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="flex overflow-x-auto border-b border-white/10 px-6 bg-black/20 shrink-0 scroll-hidden gap-1 py-2">
            {tabs.map((t) => {
              const Icon = t.icon
              const active = activeTab === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    active
                      ? 'bg-blue-600/90 text-white shadow-md shadow-blue-600/20'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{t.label}</span>
                </button>
              )
            })}
          </div>

          {/* Form Content Area */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* TAB 1: CONTENT */}
            {activeTab === 'content' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                    Judul Pengumuman <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    placeholder="Contoh: Server Maintenance TDCTF Season 2"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-white/5 border-white/15 text-white placeholder:text-gray-500 h-10"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                    Deskripsi Singkat (Short Summary)
                  </Label>
                  <Input
                    placeholder="Penjelasan ringkas 1 kalimat untuk banner & card preview..."
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    className="bg-white/5 border-white/15 text-white placeholder:text-gray-500 h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                    Banner / Image URL (Opsional)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/banner.png atau /images/event-hero.png"
                      value={formData.banner_image_url}
                      onChange={(e) => setFormData({ ...formData, banner_image_url: e.target.value })}
                      className="bg-white/5 border-white/15 text-white placeholder:text-gray-500 h-9 text-xs font-mono"
                    />
                  </div>
                  {formData.banner_image_url && (
                    <div className="mt-2 h-24 w-48 rounded-lg overflow-hidden border border-white/15 bg-black/40 relative">
                      <img
                        src={formData.banner_image_url}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                      Konten Lengkap (Markdown Supported) <span className="text-red-400">*</span>
                    </Label>
                    {/* Markdown toolbar buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => insertMarkdown('**', '**')}
                        className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white text-xs"
                        title="Bold"
                      >
                        <Bold className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('*', '*')}
                        className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white text-xs"
                        title="Italic"
                      >
                        <Italic className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('### ')}
                        className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white text-xs"
                        title="Heading"
                      >
                        <Heading className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('- ')}
                        className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white text-xs"
                        title="List"
                      >
                        <List className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('`', '`')}
                        className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white text-xs"
                        title="Code"
                      >
                        <Code className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('[', '](https://...)')}
                        className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white text-xs"
                        title="Link"
                      >
                        <Link2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={8}
                    placeholder="Tulis detail pengumuman di sini. Mendukung tabel, link, blockquote, dan bullet points..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-white/5 p-3.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-mono leading-relaxed"
                    required
                  />
                </div>
              </div>
            )}

            {/* TAB 2: DISPLAY & CHANNELS */}
            {activeTab === 'display' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Distribution Channels */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                    Distribution Channels (Pilih satu atau beberapa)
                  </Label>
                  <p className="text-[11px] text-gray-400">
                    Satu pengumuman dapat disalurkan ke modal popup, top banner, floating card, atau notification center secara bersamaan.
                  </p>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1">
                    {/* Modal Popup */}
                    <div
                      onClick={() => toggleChannel('modal')}
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all flex items-start gap-3 select-none ${
                        formData.channels.includes('modal')
                          ? 'border-blue-500/60 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div
                        className={`rounded-lg p-2 ${
                          formData.channels.includes('modal')
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/10 text-gray-400'
                        }`}
                      >
                        <Layers className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white">🪟 Liquid Glass Modal</p>
                          {formData.channels.includes('modal') && (
                            <Check className="h-3.5 w-3.5 text-blue-400" />
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Popup di tengah layar dengan backdrop blur saat user membuka web.
                        </p>
                      </div>
                    </div>

                    {/* Top Banner */}
                    <div
                      onClick={() => toggleChannel('top_banner')}
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all flex items-start gap-3 select-none ${
                        formData.channels.includes('top_banner')
                          ? 'border-blue-500/60 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div
                        className={`rounded-lg p-2 ${
                          formData.channels.includes('top_banner')
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/10 text-gray-400'
                        }`}
                      >
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white">📌 Top Sticky Banner</p>
                          {formData.channels.includes('top_banner') && (
                            <Check className="h-3.5 w-3.5 text-blue-400" />
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Banner ramping tepat di bawah navbar, cocok untuk hitung mundur / maintenance.
                        </p>
                      </div>
                    </div>

                    {/* Floating Card */}
                    <div
                      onClick={() => toggleChannel('floating_card')}
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all flex items-start gap-3 select-none ${
                        formData.channels.includes('floating_card')
                          ? 'border-blue-500/60 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div
                        className={`rounded-lg p-2 ${
                          formData.channels.includes('floating_card')
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/10 text-gray-400'
                        }`}
                      >
                        <MousePointerClick className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white">💬 Floating Card</p>
                          {formData.channels.includes('floating_card') && (
                            <Check className="h-3.5 w-3.5 text-blue-400" />
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Widget melayang di pojok kanan-bawah (gaya Linear/Raycast).
                        </p>
                      </div>
                    </div>

                    {/* Notification Center */}
                    <div
                      onClick={() => toggleChannel('notification')}
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all flex items-start gap-3 select-none ${
                        formData.channels.includes('notification')
                          ? 'border-blue-500/60 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div
                        className={`rounded-lg p-2 ${
                          formData.channels.includes('notification')
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/10 text-gray-400'
                        }`}
                      >
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white">🔔 Notification Center</p>
                          {formData.channels.includes('notification') && (
                            <Check className="h-3.5 w-3.5 text-blue-400" />
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Masuk ke lonceng notifikasi navbar sehingga bisa dibaca kembali kapan saja.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Type & Priority */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-white/10">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                      Announcement Type
                    </Label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as AnnouncementType })}
                      className="w-full h-10 rounded-xl border border-white/15 bg-[#0f172a] px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    >
                      <option value="info">ℹ️ Information (General)</option>
                      <option value="event">🔥 Event CTF (Competitions)</option>
                      <option value="maintenance">🛠️ Maintenance (Server / Down)</option>
                      <option value="update">✨ Update (New Features / Challenges)</option>
                      <option value="warning">⚠️ Warning (Critical Notices)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                      Priority Level
                    </Label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as AnnouncementPriority })}
                      className="w-full h-10 rounded-xl border border-white/15 bg-[#0f172a] px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    >
                      <option value="low">Low (Minor info)</option>
                      <option value="normal">Normal (Standard broadcast)</option>
                      <option value="high">High (Penting / High attention)</option>
                      <option value="critical">Critical (Darurat / Force modal)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TARGET AUDIENCE */}
            {activeTab === 'target' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                    Target Type (Siapa yang dapat melihat pengumuman ini?)
                  </Label>
                  <select
                    value={formData.target_type}
                    onChange={(e) =>
                      setFormData({ ...formData, target_type: e.target.value as AnnouncementTargetType })
                    }
                    className="w-full h-10 rounded-xl border border-white/15 bg-[#0f172a] px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    <option value="all">🌐 Everyone (Semua pengunjung & user)</option>
                    <option value="role">🛡️ By Role (Admin / Regular User)</option>
                    <option value="tags">🏷️ By User Tags (Pelajar, Mahasiswa, Umum, etc.)</option>
                    <option value="event">🏆 By Specific CTF Event (Peserta event tertentu)</option>
                    <option value="specific_users">👤 By Specific Users (User IDs)</option>
                  </select>
                </div>

                {/* Target = Role */}
                {formData.target_type === 'role' && (
                  <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
                    <Label className="text-xs font-bold text-gray-300">Pilih Role Target:</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.target_roles.includes('user')}
                          onChange={() => toggleRole('user')}
                          className="rounded border-white/20 bg-white/10 text-blue-600 focus:ring-0"
                        />
                        <span>Regular User</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.target_roles.includes('admin')}
                          onChange={() => toggleRole('admin')}
                          className="rounded border-white/20 bg-white/10 text-blue-600 focus:ring-0"
                        />
                        <span>Admin Only</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Target = Tags */}
                {formData.target_type === 'tags' && (
                  <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
                    <Label className="text-xs font-bold text-gray-300">
                      Pilih Tag Kategori Pengguna (TDCTF Tags):
                    </Label>
                    <p className="text-[11px] text-gray-400">
                      User dengan setidaknya satu tag yang dipilih akan menerima pengumuman ini.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {tagsList.map((tag) => {
                        const active = formData.target_tags.includes(tag)
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTag(tag)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border ${
                              active
                                ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                            }`}
                          >
                            🏷️ {tag} {active && '✓'}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Target = Event */}
                {formData.target_type === 'event' && (
                  <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
                    <Label className="text-xs font-bold text-gray-300">Pilih Event CTF:</Label>
                    <select
                      value={formData.target_event_id || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, target_event_id: e.target.value || null })
                      }
                      className="w-full h-10 rounded-xl border border-white/15 bg-[#0f172a] px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    >
                      <option value="">-- Pilih Event CTF --</option>
                      {eventsList.map((ev) => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SCHEDULING */}
            {activeTab === 'schedule' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                    Status Publikasi
                  </Label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as AnnouncementStatus })
                    }
                    className="w-full h-10 rounded-xl border border-white/15 bg-[#0f172a] px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    <option value="published">🚀 Published (Aktif sesuai jadwal)</option>
                    <option value="draft">📝 Draft (Hanya disimpan di admin)</option>
                    <option value="archived">📦 Archived (Diarsipkan / Nonaktif)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                      Waktu Mulai Tayang (Start Schedule)
                    </Label>
                    <Input
                      type="datetime-local"
                      value={formData.starts_at}
                      onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                      className="bg-white/5 border-white/15 text-white h-10 text-xs"
                    />
                    <p className="text-[10px] text-gray-400">
                      Jika diisi waktu masa depan, pengumuman berstatus <em>Scheduled</em>.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                      Waktu Berakhir (End Expiration - Opsional)
                    </Label>
                    <Input
                      type="datetime-local"
                      value={formData.ends_at}
                      onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                      className="bg-white/5 border-white/15 text-white h-10 text-xs"
                    />
                    <p className="text-[10px] text-gray-400">
                      Biarkan kosong jika tidak ada batas kedaluwarsa.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: BEHAVIOR & RULES */}
            {activeTab === 'behavior' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                    Display Rule (Frekuensi Kemunculan)
                  </Label>
                  <select
                    value={formData.display_rule}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        display_rule: e.target.value as AnnouncementDisplayRule,
                      })
                    }
                    className="w-full h-10 rounded-xl border border-white/15 bg-[#0f172a] px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    <option value="until_read">
                      ✅ Show Until Read (Muncul sampai user klik &quot;Saya Mengerti&quot;)
                    </option>
                    <option value="once_per_session">
                      ⏱️ Show Once Per Session (Muncul 1x setiap user membuka browser)
                    </option>
                    <option value="first_visit">
                      👀 Show On First Visit (Hanya saat kunjungan pertama)
                    </option>
                    <option value="always">
                      🔁 Show Always Until Expired (Selalu tampil setiap kunjungan)
                    </option>
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-white/10">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                      Cooldown Period (Jam)
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={720}
                      value={formData.cooldown_hours}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cooldown_hours: parseInt(e.target.value) || 0,
                        })
                      }
                      className="bg-white/5 border-white/15 text-white h-10 text-xs"
                    />
                    <p className="text-[10px] text-gray-400">
                      Jarak waktu (jam) sebelum popup boleh ditampilkan lagi setelah user menutupnya.
                    </p>
                  </div>

                  <div className="space-y-1.5 flex flex-col justify-center">
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                      <div>
                        <p className="text-xs font-bold text-white">Dismissible (Bisa ditutup)</p>
                        <p className="text-[10px] text-gray-400">
                          Jika dimatikan, user wajib klik tombol konfirmasi.
                        </p>
                      </div>
                      <Switch
                        checked={formData.is_dismissible}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, is_dismissible: checked })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: CALL TO ACTION */}
            {activeTab === 'cta' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                    CTA Button Label (Opsional)
                  </Label>
                  <Input
                    placeholder="Contoh: Buka Halaman Challenges, Join Discord Server"
                    value={formData.cta_text}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    className="bg-white/5 border-white/15 text-white h-10 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                      CTA Link URL
                    </Label>
                    <Input
                      placeholder="/challenges atau https://discord.gg/..."
                      value={formData.cta_link}
                      onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                      className="bg-white/5 border-white/15 text-white h-10 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                      Link Target Window
                    </Label>
                    <select
                      value={formData.cta_target}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cta_target: e.target.value as '_self' | '_blank',
                        })
                      }
                      className="w-full h-10 rounded-xl border border-white/15 bg-[#0f172a] px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    >
                      <option value="_self">_self (Buka di halaman ini)</option>
                      <option value="_blank">_blank (Buka di tab baru)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <DialogFooter className="flex items-center justify-between border-t border-white/10 pt-4 mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="text-gray-400 hover:text-white"
              >
                Batal
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPreviewOpen(true)}
                  className="border-white/20 hover:bg-white/10 text-white text-xs h-9 px-3.5 rounded-xl font-medium"
                >
                  <Eye className="h-3.5 w-3.5 mr-1 text-blue-400" />
                  Preview
                </Button>

                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs h-9 px-5 rounded-xl shadow-lg shadow-blue-500/20"
                >
                  {loading
                    ? 'Menyimpan...'
                    : initialData
                    ? 'Perbarui Pengumuman'
                    : 'Publikasikan Pengumuman'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Live Preview Modal */}
      <AnnouncementPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        data={formData}
      />
    </>
  )
}
