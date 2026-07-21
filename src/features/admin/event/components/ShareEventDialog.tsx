'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Button, Input } from '@/shared/ui'
import { DIALOG_CONTENT_CLASS_XL } from '@/shared/styles'
import {
  Copy,
  Check,
  Share2,
  KeyRound,
  MessageCircle, // WhatsApp
  Send, // Telegram
  FileText,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { Event } from '../types'
import { formatEventDateTime, normalizeEventImageUrl } from '@/features/challenges/lib/event-display'

interface ShareEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: Event | null
}

export default function ShareEventDialog({
  open,
  onOpenChange,
  event,
}: ShareEventDialogProps) {
  const [embedKey, setEmbedKey] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false)
  const [copiedDiscord, setCopiedDiscord] = useState(false)
  const [copiedTelegram, setCopiedTelegram] = useState(false)

  // Reset states when event changes
  useEffect(() => {
    setEmbedKey(false)
    setCopiedLink(false)
    setCopiedWhatsApp(false)
    setCopiedDiscord(false)
    setCopiedTelegram(false)
  }, [event])

  if (!event) return null

  // Generate join URL
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const baseUrl = `${origin}/join/${event.id}`
  const joinUrl = event.join_mode === 'key' && embedKey && event.join_key
    ? `${baseUrl}?key=${encodeURIComponent(event.join_key)}`
    : baseUrl

  const startStr = formatEventDateTime(event.start_time) || 'Permanent / Selalu Buka'
  const endStr = formatEventDateTime(event.end_time) || 'Permanent / Selalu Buka'
  const desc = event.description || 'Mari berpartisipasi dan pecahkan tantangan CTF menarik di event ini!'

  // WhatsApp Message Format (uses * for bolding)
  const getWhatsAppMessage = () => {
    const keySection = event.join_mode === 'key'
      ? `🔑 *Join Key:* \`${event.join_key || '-'}\`\n`
      : ''
    return `🚀 *Ayo Join Event CTF:* *${event.name}* 🚀\n\n` +
      `📅 *Mulai:* ${startStr}\n` +
      `🏁 *Selesai:* ${endStr}\n` +
      `📝 *Deskripsi:* ${desc}\n\n` +
      keySection +
      `👉 *Klik link berikut untuk mendaftar:* \n${joinUrl}`
  }

  // Discord Message Format (uses ** for bolding)
  const getDiscordMessage = () => {
    const keySection = event.join_mode === 'key'
      ? `🔑 **Join Key:** \`${event.join_key || '-'}\`\n`
      : ''
    return `🚀 **Ayo Join Event CTF: ${event.name}** 🚀\n\n` +
      `📅 **Mulai:** ${startStr}\n` +
      `🏁 **Selesai:** ${endStr}\n` +
      `📝 **Deskripsi:** ${desc}\n\n` +
      keySection +
      `👉 **Klik link berikut untuk mendaftar:** \n${joinUrl}`
  }

  // Telegram Message Format
  const getTelegramMessage = () => {
    const keySection = event.join_mode === 'key'
      ? `🔑 <b>Join Key:</b> <code>${event.join_key || '-'}</code>\n`
      : ''
    return `🚀 <b>Ayo Join Event CTF: ${event.name}</b> 🚀\n\n` +
      `📅 <b>Mulai:</b> ${startStr}\n` +
      `🏁 <b>Selesai:</b> ${endStr}\n` +
      `📝 <b>Deskripsi:</b> ${desc}\n\n` +
      keySection +
      `👉 <b>Klik link berikut untuk mendaftar:</b> \n${joinUrl}`
  }

  const handleCopy = async (text: string, setCopiedState: React.Dispatch<React.SetStateAction<boolean>>, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedState(true)
      toast.success(`${label} disalin ke clipboard!`)
      setTimeout(() => setCopiedState(false), 2000)
    } catch (err) {
      toast.error('Gagal menyalin teks.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${DIALOG_CONTENT_CLASS_XL} max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Share2 className="h-5 w-5 text-blue-500" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">
              Bagikan Event: {event.name}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Embed Key Option for Private Events */}
          {event.join_mode === 'key' && (
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-yellow-500/20 bg-yellow-500/[0.02]">
              <div className="flex items-start gap-3">
                <KeyRound className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Embed Join Key</h4>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5 leading-relaxed">
                    Sertakan join key (<code className="text-yellow-400 font-semibold">{event.join_key}</code>) langsung dalam link share agar peserta bisa join secara instan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEmbedKey(!embedKey)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${embedKey ? 'bg-yellow-500' : 'bg-gray-800'}`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${embedKey ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          )}

          {/* Copy Direct URL */}
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Tautan Langsung (Join Link)</label>
            <div className="flex gap-2">
              <Input
                type="text"
                readOnly
                value={joinUrl}
                className="flex-1 bg-gray-900/50 border-gray-800/80 text-xs font-mono h-11"
              />
              <Button
                variant="outline"
                type="button"
                onClick={() => handleCopy(joinUrl, setCopiedLink, 'Tautan')}
                className="shrink-0 h-11 px-4 border-gray-800/80 hover:bg-gray-900 rounded-xl"
              >
                {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Templates Section */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Template Pesan Sosial</h4>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* WhatsApp Card */}
              <div className="flex flex-col justify-between p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.01] hover:bg-emerald-500/[0.02] transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                    <MessageCircle className="h-4 w-4 text-emerald-400" />
                  </div>
                  <span className="text-xs font-bold text-gray-200">WhatsApp</span>
                </div>
                <Button
                  size="sm"
                  type="button"
                  onClick={() => handleCopy(getWhatsAppMessage(), setCopiedWhatsApp, 'Template WhatsApp')}
                  className="w-full bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-lg text-xs"
                >
                  {copiedWhatsApp ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                  <span>Salin Pesan</span>
                </Button>
              </div>

              {/* Discord Card */}
              <div className="flex flex-col justify-between p-4 rounded-xl border border-indigo-500/10 bg-indigo-500/[0.01] hover:bg-indigo-500/[0.02] transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                    <FileText className="h-4 w-4 text-indigo-400" />
                  </div>
                  <span className="text-xs font-bold text-gray-200">Discord</span>
                </div>
                <Button
                  size="sm"
                  type="button"
                  onClick={() => handleCopy(getDiscordMessage(), setCopiedDiscord, 'Template Discord')}
                  className="w-full bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-lg text-xs"
                >
                  {copiedDiscord ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                  <span>Salin Pesan</span>
                </Button>
              </div>

              {/* Telegram Card */}
              <div className="flex flex-col justify-between p-4 rounded-xl border border-blue-500/10 bg-blue-500/[0.01] hover:bg-blue-500/[0.02] transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg">
                    <Send className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-xs font-bold text-gray-200">Telegram</span>
                </div>
                <Button
                  size="sm"
                  type="button"
                  onClick={() => handleCopy(getTelegramMessage(), setCopiedTelegram, 'Template Telegram')}
                  className="w-full bg-blue-600/90 hover:bg-blue-600 text-white rounded-lg text-xs"
                >
                  {copiedTelegram ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                  <span>Salin Pesan</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Live Preview of formatted text */}
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">Live Preview Format Pesan</label>
            <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-900 text-xs font-mono text-gray-300 whitespace-pre-wrap leading-relaxed max-h-44 overflow-y-auto scroll-hidden">
              {getWhatsAppMessage()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
