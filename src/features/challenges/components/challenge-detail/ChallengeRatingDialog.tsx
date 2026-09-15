'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/shared/ui'
import Rating02, { RATINGS } from '@/components/ui/rating-emoji'
import { getUserChallengeRating, upsertChallengeRating } from '../../services/challenge-ratings.service'
import type { ChallengeRating, User } from '@/shared/types'
import { Send, CheckCircle2, MessageSquareText, Edit3, X, Flag } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

interface ChallengeRatingDialogProps {
  open: boolean
  onClose: () => void
  challengeId: string
  challengeTitle: string
  category?: string
  user: User | null | undefined
}

export const ChallengeRatingDialog: React.FC<ChallengeRatingDialogProps> = ({
  open,
  onClose,
  challengeId,
  challengeTitle,
  category = 'CTF',
  user,
}) => {
  const [ratingValue, setRatingValue] = useState<number>(0)
  const [feedback, setFeedback] = useState<string>('')
  const [existingRating, setExistingRating] = useState<ChallengeRating | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)

  const fetchRating = useCallback(async () => {
    if (!user?.id || !challengeId || !open) {
      setLoading(false)
      return
    }

    setLoading(true)
    const data = await getUserChallengeRating(challengeId, user.id)
    if (data) {
      setExistingRating(data)
      setRatingValue(data.rating)
      setFeedback(data.feedback || '')
      setIsEditing(false)
    } else {
      setExistingRating(null)
      setRatingValue(0)
      setFeedback('')
      setIsEditing(true)
    }
    setLoading(false)
  }, [challengeId, user?.id, open])

  useEffect(() => {
    if (open) {
      fetchRating()
    }
  }, [open, fetchRating])

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault()

    if (ratingValue < 1 || ratingValue > 5) {
      toast.error('Silakan pilih salah satu emoji rating (1 - 5)!')
      return
    }

    if (!user?.id) return

    setIsSubmitting(true)
    const res = await upsertChallengeRating({
      challengeId,
      userId: user.id,
      rating: ratingValue,
      feedback,
    })

    setIsSubmitting(false)

    if (res.success && res.data) {
      toast.success(existingRating ? 'Rating berhasil diperbarui!' : 'Terima kasih atas penilaian kamu!')
      setExistingRating(res.data)
      setIsEditing(false)
      setTimeout(() => {
        onClose()
      }, 600)
    } else {
      toast.error(res.message || 'Gagal menyimpan rating.')
    }
  }

  const selectedEmojiObj = ratingValue > 0 ? RATINGS[ratingValue - 1] : null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-[92vw] max-w-md overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-950/95 p-6 shadow-2xl backdrop-blur-2xl sm:max-w-lg">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-400 border border-cyan-500/20 mb-1.5">
              {category}
            </span>
            <DialogTitle className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <Flag className="h-4 w-4 text-cyan-400" />
              {challengeTitle}
            </DialogTitle>
            <p className="mt-1 text-xs text-gray-400">
              Bagikan penilaian & masukan kamu untuk soal ini.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex h-40 items-center justify-center text-xs text-gray-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent mr-2" />
            Memuat rating...
          </div>
        ) : existingRating && !isEditing ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 flex flex-col gap-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-300">Rating Kamu Telah Tersimpan</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <Edit3 className="h-3 w-3" /> Edit
              </button>
            </div>

            <div className="flex items-center justify-center py-2">
              <Rating02 value={existingRating.rating} readOnly size="md" />
            </div>

            {existingRating.feedback && (
              <div className="flex items-start gap-2 rounded-lg bg-slate-900/80 p-3 text-xs text-gray-300 border border-white/5">
                <MessageSquareText className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
                <p className="italic text-gray-200 break-words">{`"${existingRating.feedback}"`}</p>
              </div>
            )}
          </motion.div>
        ) : (
          <form onSubmit={handleSubmitRating} className="mt-4 flex flex-col gap-5">
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-slate-900/50 py-5 px-3">
              <label className="mb-4 text-xs font-semibold text-gray-300 text-center">
                Seberapa bagus & menantang soal ini menurut kamu?
              </label>

              <Rating02
                value={ratingValue}
                onValueChange={(val) => setRatingValue(val)}
                size="md"
              />

              {selectedEmojiObj && (
                <p className="mt-3 text-xs font-bold text-cyan-400 tracking-wide">
                  {selectedEmojiObj.label} ({ratingValue} / 5)
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="modal-feedback" className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                <span>Alasan / Masukan (Opsional)</span>
                <span className="text-[10px] text-gray-500">{feedback.length} / 500</span>
              </label>
              <textarea
                id="modal-feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value.slice(0, 500))}
                placeholder="Mengapa kamu memilih rating ini? (contoh: hint jelas, soal unik, ada glitch, dll)..."
                rows={3}
                className="w-full rounded-xl border border-gray-700/60 bg-slate-900/80 p-3 text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-all resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              {isEditing && existingRating && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl border border-gray-700 px-4 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting || ratingValue === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    {existingRating ? 'Perbarui Rating' : 'Kirim Rating'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ChallengeRatingDialog
