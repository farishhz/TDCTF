'use client'

import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  getMyTeamEventStatus,
  getMyTeamWriteup,
  submitEventWriteup,
  type MyTeamEventStatus,
  type MyTeamWriteupStatus,
} from '@/features/events/services/event.service'
import { Button } from '@/shared/ui'
import {
  FileDown,
  UploadCloud,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  Calendar,
  Lock,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface WriteupSectionProps {
  eventId: string
  writeupDeadline: string | null
}

export default function WriteupSection({ eventId, writeupDeadline }: WriteupSectionProps) {
  const [loading, setLoading] = useState(true)
  const [teamStatus, setTeamStatus] = useState<MyTeamEventStatus | null>(null)
  const [writeup, setWriteup] = useState<MyTeamWriteupStatus | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [timeRemainingText, setTimeRemainingText] = useState('')

  const fetchStatus = async () => {
    try {
      const [tStatus, wStatus] = await Promise.all([
        getMyTeamEventStatus(eventId),
        getMyTeamWriteup(eventId),
      ])
      setTeamStatus(tStatus)
      setWriteup(wStatus)
    } catch (err) {
      console.error('Error fetching writeup info:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (eventId) {
      void fetchStatus()
    }
  }, [eventId])

  // Countdown timer calculation
  useEffect(() => {
    if (!writeupDeadline) return

    const deadline = new Date(writeupDeadline).getTime()

    const updateTimer = () => {
      const now = new Date().getTime()
      const diff = deadline - now

      if (diff <= 0) {
        setTimeRemainingText('Expired')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      let text = ''
      if (days > 0) text += `${days}d `
      if (hours > 0 || days > 0) text += `${hours}h `
      text += `${minutes}m`
      setTimeRemainingText(text)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000) // update every minute
    return () => clearInterval(interval)
  }, [writeupDeadline])

  if (!writeupDeadline) return null

  const isExpired = new Date(writeupDeadline).getTime() < new Date().getTime()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      void handleUploadFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      void handleUploadFile(e.target.files[0])
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleUploadFile = async (file: File) => {
    if (isExpired) {
      toast.error('Batas pengumpulan write-up telah habis!')
      return
    }

    if (!teamStatus?.is_captain) {
      toast.error('Hanya kapten tim yang dapat mengunggah write-up.')
      return
    }

    const extension = file.name.split('.').pop()?.toLowerCase()
    if (extension !== 'docx' && extension !== 'pdf') {
      toast.error('Format file harus .docx atau .pdf!')
      return
    }

    // Limit size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ukuran file maksimal adalah 10MB!')
      return
    }

    setUploading(true)
    try {
      const fileNameClean = file.name.replace(/[^a-zA-Z0-9.]/g, '_')
      const path = `${eventId}/${teamStatus.team_id}/${Date.now()}_${fileNameClean}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('writeups')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('writeups')
        .getPublicUrl(path)

      if (!urlData.publicUrl) {
        throw new Error('Gagal mendapatkan public URL file.')
      }

      // Save submission metadata to DB via RPC
      const res = await submitEventWriteup(eventId, urlData.publicUrl, file.name)
      if (res?.success) {
        toast.success(res.message || 'Write-up berhasil dikumpulkan!')
        await fetchStatus()
      } else {
        throw new Error(res?.message || 'Gagal menyimpan data pengumpulan.')
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'Gagal mengunggah file write-up.')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-24 items-center justify-center rounded-2xl border border-gray-800/40 bg-gray-950/20 backdrop-blur-md">
        <Loader2 className="h-6 w-6 text-blue-500 animate-spin mr-2" />
        <span className="text-sm font-semibold text-gray-400">Loading write-up section...</span>
      </div>
    )
  }

  // Formatting write-up deadline date
  const formattedDeadline = new Date(writeupDeadline).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-800/60 bg-gray-950/40 p-5 backdrop-blur-md shadow-xl transition-all hover:border-gray-800/80">
      {/* Decorative Glow */}
      <div className="absolute -right-8 -top-8 h-24 w-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <h3 className="text-base font-black tracking-tight text-white uppercase">Pengumpulan Write-Up</h3>
          </div>
          <p className="text-xs text-gray-400 font-medium max-w-xl">
            Silakan unduh template resmi di bawah ini, isi dengan write-up/penjelasan penyelesaian tantangan (challenges) yang berhasil diselesaikan tim Anda, kemudian unggah file PDF/DOCX hasil pengerjaan.
          </p>

          <div className="flex flex-wrap gap-2 pt-1.5">
            <a
              href="/Template-WU.docx"
              download
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/20 bg-blue-500/5 px-3 py-1.5 text-xs font-bold text-blue-400 hover:bg-blue-500/15 transition-all"
            >
              <FileDown className="h-3.5 w-3.5" />
              Download Template-WU.docx
            </a>

            <div className="inline-flex items-center gap-1.5 rounded-xl border border-gray-800 bg-gray-900/40 px-3 py-1.5 text-xs font-semibold text-gray-400">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              <span>Batas: {formattedDeadline}</span>
              {timeRemainingText && (
                <span className={`ml-1 font-bold ${isExpired ? 'text-red-400' : 'text-yellow-400'}`}>
                  ({isExpired ? 'Tutup' : `Sisa ${timeRemainingText}`})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Upload & Status Area */}
        <div className="w-full lg:w-80 shrink-0">
          {!teamStatus?.has_team ? (
            <div className="flex items-center gap-2 p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-xs font-semibold text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Anda harus bergabung dengan tim untuk mengumpulkan write-up.</span>
            </div>
          ) : writeup?.has_submitted ? (
            // SUBMITTED STATE
            <div className="space-y-3 p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Telah Dikumpulkan</span>
              </div>
              <div className="space-y-1">
                <a
                  href={writeup.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:underline break-all"
                >
                  <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
                  {writeup.filename}
                </a>
                <p className="text-[10px] font-semibold text-gray-500">
                  Diunggah pada {new Date(writeup.submitted_at!).toLocaleString()}
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400">Status:</span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                  writeup.status === 'reviewed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                }`}>
                  {writeup.status === 'reviewed' ? 'DITINJAU' : 'PENDING'}
                </span>
              </div>

              {/* Feedback & Score adjustment */}
              {writeup.status === 'reviewed' && (
                <div className="mt-2 space-y-1.5 rounded-lg border border-gray-800 bg-gray-900/50 p-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Score Adjustment</span>
                    <span className={`font-black ${writeup.score_adjustment! >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {writeup.score_adjustment! >= 0 ? `+${writeup.score_adjustment}` : writeup.score_adjustment} PTS
                    </span>
                  </div>
                  {writeup.admin_notes && (
                    <div className="text-[11px] leading-relaxed text-gray-300">
                      <p className="font-semibold text-[9px] text-gray-500 uppercase">Catatan Reviewer:</p>
                      <p className="mt-0.5 italic">{writeup.admin_notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Captain can re-submit if not reviewed yet and not expired */}
              {teamStatus.is_captain && writeup.status !== 'reviewed' && !isExpired && (
                <div className="pt-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={triggerFileSelect}
                    disabled={uploading}
                    className="w-full text-xs font-bold uppercase tracking-widest text-indigo-400 border border-indigo-500/10 hover:bg-indigo-500/5 h-8 rounded-lg"
                  >
                    {uploading ? 'Mengunggah...' : 'Unggah Ulang File'}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // NOT SUBMITTED STATE
            <>
              {isExpired ? (
                <div className="flex items-center gap-2 p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-xs font-semibold text-red-400">
                  <Lock className="h-4 w-4 shrink-0" />
                  <span>Batas waktu pengumpulan write-up telah habis.</span>
                </div>
              ) : !teamStatus.is_captain ? (
                <div className="flex items-center gap-2 p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5 text-xs font-semibold text-blue-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Hanya Kapten Tim yang dapat mengunggah file write-up.</span>
                </div>
              ) : (
                /* CAPTAIN DRAG AND DROP ZONE */
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerFileSelect}
                  className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all text-center
                    ${dragActive
                      ? 'border-blue-500 bg-blue-500/[0.03]'
                      : 'border-gray-800 hover:border-blue-500/40 hover:bg-gray-900/10'}
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx,.pdf"
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={uploading}
                  />

                  {uploading ? (
                    <div className="space-y-2">
                      <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto" />
                      <p className="text-xs font-bold text-gray-300">Mengunggah file...</p>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="h-8 w-8 text-gray-500 mb-2" />
                      <p className="text-xs font-bold text-gray-300">Unggah Write-up Tim</p>
                      <p className="text-[10px] text-gray-500 font-semibold mt-1">
                        Seret file ke sini atau klik untuk browse<br />(.pdf, .docx, max 10MB)
                      </p>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
