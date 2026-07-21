'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/shared/contexts/AuthContext'
import { getMyEventMembership, joinEvent } from '@/features/events/services/event.service'
import { setSelectedEventSetting } from '@/shared/lib/settings'
import { Button, Input } from '@/shared/ui'
import {
  getEventStatus,
  getTimeRemaining,
  formatEventDateTime,
  normalizeEventImageUrl,
} from '@/features/challenges/lib/event-display'
import {
  SURFACE_GLASS_CARD_CLASS,
  SURFACE_GLASS_INPUT_CLASS,
  SURFACE_GLASS_TEXTAREA_CLASS,
} from '@/shared/styles'
import {
  Calendar,
  Clock,
  KeyRound,
  Lock,
  Unlock,
  Loader2,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { Event, EventMembershipStatus } from '@/shared/types'

interface JoinEventPageClientProps {
  event: Event
}

export default function JoinEventPageClient({ event }: JoinEventPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()

  const [membership, setMembership] = useState<EventMembershipStatus | null>(null)
  const [membershipLoaded, setMembershipLoaded] = useState(false)
  const [loadingMembership, setLoadingMembership] = useState(false)
  const [joining, setJoining] = useState(false)
  const [joinKey, setJoinKey] = useState('')
  const [joinNote, setJoinNote] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const imageUrl = normalizeEventImageUrl(event.image_url) || 'https://raw.githubusercontent.com/tdctf/assets/refs/heads/main/event/active_tdctf.png'
  const status = getEventStatus(event)
  const timeRemaining = getTimeRemaining(event)
  const startFormatted = formatEventDateTime(event.start_time)
  const endFormatted = formatEventDateTime(event.end_time)

  // Fetch membership status if user is authenticated
  const fetchMembership = async () => {
    if (!user) return
    setLoadingMembership(true)
    try {
      const data = await getMyEventMembership(event.id)
      setMembership(data)
    } catch (err) {
      console.error('Failed to load event membership:', err)
    } finally {
      setMembershipLoaded(true)
      setLoadingMembership(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchMembership()
    } else if (!authLoading) {
      setMembershipLoaded(true)
    }
  }, [user, authLoading])

  // Automatic join logic for logged-in users
  useEffect(() => {
    if (!user || !membershipLoaded || joining) return

    // 1. If already a member, save to local storage and redirect to challenges page
    if (membership?.is_member) {
      setSelectedEventSetting(event.id)
      toast.success(`Selamat datang kembali di ${event.name}!`)
      router.push('/challenges?tab=challenges')
      return
    }

    // 2. If Open Mode: Join automatically
    if (event.join_mode === 'open') {
      void handleJoinEvent(null, null)
      return
    }

    // 3. If Key Mode: check if key is in query params
    if (event.join_mode === 'key') {
      const queryKey = searchParams.get('key')
      if (queryKey && queryKey.trim()) {
        void handleJoinEvent(queryKey.trim(), null)
      }
    }
  }, [user, membershipLoaded, membership])

  const handleJoinEvent = async (key: string | null, note: string | null) => {
    setJoining(true)
    setErrorMsg('')
    try {
      const result = await joinEvent(event.id, key, note)
      if (result?.success) {
        if (result.status === 'approved' || event.join_mode === 'open' || event.join_mode === 'key') {
          toast.success(result.message || 'Berhasil bergabung dengan event!')
          setSelectedEventSetting(event.id)
          router.push('/challenges?tab=challenges')
        } else {
          toast.success(result.message || 'Permintaan gabung berhasil dikirim.')
          await fetchMembership()
        }
      } else {
        setErrorMsg(result?.message || 'Gagal bergabung dengan event.')
        if (key) {
          toast.error(result?.message || 'Key salah atau tidak valid.')
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Terjadi kesalahan sistem saat mencoba bergabung.')
      toast.error(err?.message || 'Gagal bergabung dengan event.')
    } finally {
      setJoining(false)
    }
  };

  const handleManualKeySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinKey.trim()) {
      toast.error('Masukkan join key terlebih dahulu!')
      return
    }
    void handleJoinEvent(joinKey.trim(), null)
  }

  const handleManualRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void handleJoinEvent(null, joinNote.trim() || null)
  }

  const handleLoginRedirect = () => {
    const nextUrl = encodeURIComponent(window.location.pathname + window.location.search)
    router.push(`/login?redirectTo=${nextUrl}`)
  }

  // Render loading state while checking auth/membership
  if (authLoading || (user && loadingMembership && !joining)) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <p className="text-gray-400 font-medium animate-pulse text-sm">Menyiapkan halaman event...</p>
      </div>
    )
  }

  // If auto-joining or redirecting
  if (joining || (membership?.is_member && user)) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-md px-4">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
        <h3 className="text-lg font-bold text-white">Menghubungkan ke Event</h3>
        <p className="text-gray-400 text-sm">Mohon tunggu sebentar, kami sedang mendaftarkan akun Anda ke dalam {event.name}...</p>
      </div>
    )
  }

  return (
    <div className={`w-full max-w-xl p-6 sm:p-8 ${SURFACE_GLASS_CARD_CLASS} border-gray-800/40 bg-gray-950/60 shadow-2xl relative overflow-hidden`}>
      {/* Glow decorative */}
      <div className="absolute -top-10 -left-10 h-32 w-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Banner */}
      <div className="relative h-44 w-full overflow-hidden rounded-xl border border-gray-800/80 bg-gray-900/50">
        <img
          src={imageUrl}
          alt={event.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
        
        {/* Status badges */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {status && (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest shadow-sm ${status.color}`}>
              {status.label}
            </span>
          )}
          <span className="inline-flex items-center rounded-full bg-gray-900/90 border border-gray-800/80 px-2.5 py-0.5 text-[10px] font-bold text-gray-300">
            {event.join_mode === 'open' && <Unlock className="h-3 w-3 mr-1 text-emerald-400" />}
            {event.join_mode === 'key' && <KeyRound className="h-3 w-3 mr-1 text-yellow-400" />}
            {event.join_mode === 'request' && <Lock className="h-3 w-3 mr-1 text-blue-400" />}
            {(event.join_mode || 'open').toUpperCase()}
          </span>
        </div>

        {/* Time Remaining overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs text-gray-300 font-semibold bg-gray-950/80 px-3 py-1 rounded-lg border border-gray-800/60 shadow-sm">
          <Clock className="h-3.5 w-3.5 text-blue-400" />
          <span>{timeRemaining}</span>
        </div>
      </div>

      {/* Event Details */}
      <div className="mt-5 space-y-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">{event.name}</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-400 font-medium">
            {event.description || 'Tidak ada deskripsi untuk event ini.'}
          </p>
        </div>

        {/* Date Timeline */}
        <div className="grid gap-3 rounded-xl border border-gray-900 bg-gray-900/30 p-3.5 text-xs font-semibold text-gray-400 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-400 shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Mulai</p>
              <p className="text-gray-300 font-medium mt-0.5">{startFormatted || 'Permanent'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-400 shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Selesai</p>
              <p className="text-gray-300 font-medium mt-0.5">{endFormatted || 'Permanent'}</p>
            </div>
          </div>
        </div>

        {/* Content Action depending on auth & join_mode */}
        <div className="pt-2 border-t border-gray-900/60">
          {!user ? (
            // GUEST STATE
            <div className="text-center space-y-3 pt-2">
              <p className="text-xs font-medium text-gray-400">
                Anda harus masuk/mendaftar akun terlebih dahulu untuk mengikuti event ini.
              </p>
              <Button
                type="button"
                onClick={handleLoginRedirect}
                className="w-full flex items-center justify-center gap-2 py-5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.01]"
              >
                <span>Login / Register Akun</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            // AUTHENTICATED STATE
            <>
              {event.join_mode === 'key' && (
                // KEY FORM
                <form onSubmit={handleManualKeySubmit} className="space-y-4 pt-1">
                  <div className="space-y-2">
                    <label htmlFor="joinKey" className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Masukkan Join Key (Passkey)
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500" />
                      <Input
                        id="joinKey"
                        type="text"
                        placeholder="Masukkan kode akses event di sini..."
                        value={joinKey}
                        onChange={(e) => setJoinKey(e.target.value)}
                        className={`${SURFACE_GLASS_INPUT_CLASS} pl-10 border-gray-800 bg-gray-900/20`}
                        disabled={joining}
                      />
                    </div>
                  </div>
                  {errorMsg && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs font-medium text-red-400">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-5 rounded-xl font-bold bg-yellow-600 hover:bg-yellow-500 text-black shadow-lg shadow-yellow-900/10 transition-all hover:scale-[1.01]"
                    disabled={joining}
                  >
                    <span>Buka Akses Event</span>
                    <ArrowRight className="h-4 w-4 text-black" />
                  </Button>
                </form>
              )}

              {event.join_mode === 'request' && (
                // REQUEST FORM / STATUS CHECK
                <div className="space-y-4 pt-1">
                  {membership?.request_status === 'pending' ? (
                    <div className="flex flex-col items-center justify-center text-center p-6 rounded-xl border border-blue-500/20 bg-blue-500/[0.02]">
                      <Loader2 className="h-10 w-10 text-blue-400 animate-spin mb-3" />
                      <h4 className="text-sm font-bold text-white">Menunggu Persetujuan</h4>
                      <p className="text-xs text-gray-400 mt-1 max-w-sm font-medium">
                        Permintaan Anda untuk bergabung sedang dalam peninjauan oleh Admin. Anda akan mendapat akses begitu disetujui.
                      </p>
                    </div>
                  ) : membership?.request_status === 'rejected' ? (
                    <div className="flex flex-col items-center justify-center text-center p-6 rounded-xl border border-red-500/20 bg-red-500/[0.02]">
                      <ShieldAlert className="h-10 w-10 text-red-400 mb-3" />
                      <h4 className="text-sm font-bold text-white">Permintaan Ditolak</h4>
                      <p className="text-xs text-gray-400 mt-1 max-w-sm font-medium">
                        Maaf, admin menolak permintaan Anda untuk bergabung dengan event ini.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleManualRequestSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="joinNote" className="text-xs font-bold uppercase tracking-wider text-gray-400">
                          Catatan Tambahan (Opsional)
                        </label>
                        <textarea
                          id="joinNote"
                          rows={3}
                          placeholder="Tulis pesan pengantar untuk admin..."
                          value={joinNote}
                          onChange={(e) => setJoinNote(e.target.value)}
                          className={`${SURFACE_GLASS_TEXTAREA_CLASS} border-gray-800 bg-gray-900/20`}
                          disabled={joining}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 py-5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.01]"
                        disabled={joining}
                      >
                        <span>Ajukan Permintaan Gabung</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </form>
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
