'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Sparkles, Send, CheckCircle2, MessageSquareText, Edit3 } from 'lucide-react'
import toast from 'react-hot-toast'
import Rating02, { RATINGS } from '@/components/ui/rating-emoji'
import { getUserChallengeRating, upsertChallengeRating } from '../../services/challenge-ratings.service'
import type { ChallengeRating, User } from '@/shared/types'
import { motion, AnimatePresence } from 'framer-motion'

interface ChallengeRatingSectionProps {
  challengeId: string
  user: User | null | undefined
  isSolved: boolean
}

export const ChallengeRatingSection: React.FC<ChallengeRatingSectionProps> = ({
  challengeId,
  user,
  isSolved,
}) => {
  const [ratingValue, setRatingValue] = useState<number>(0)
  const [feedback, setFeedback] = useState<string>('')
  const [existingRating, setExistingRating] = useState<ChallengeRating | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)

  const fetchRating = useCallback(async () => {
    if (!user?.id || !challengeId || !isSolved) {
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
  }, [challengeId, user?.id, isSolved])

  useEffect(() => {
    fetchRating()
  }, [fetchRating])

  if (!isSolved || !user) return null

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault()

    if (ratingValue < 1 || ratingValue > 5) {
      toast.error('Silakan pilih salah satu emoji rating (1 - 5)!')
      return
    }

    setIsSubmitting(true)
    const res = await upsertChallengeRating({
      challengeId,
      userId: user.id,
      rating: ratingValue,
      feedback,
    })

    setIsSubmitting(false)

    if (res.success && res.data) {
      toast.success(existingRating ? 'Rating & ulasan berhasil diperbarui!' : 'Terima kasih atas rating & masukan kamu!')
      setExistingRating(res.data)
      setIsEditing(false)
    } else {
      toast.error(res.message || 'Gagal menyimpan rating.')
    }
  }

  const selectedEmojiObj = ratingValue > 0 ? RATINGS[ratingValue - 1] : null

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 via-cyan-950/20 to-slate-900/90 p-4 md:p-5 backdrop-blur-xl shadow-xl shadow-cyan-950/20 transition-all">
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <MessageSquareText className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-100 flex items-center gap-1.5">
              Evaluasi & Rating Soal
            </h4>
            <p className="text-xs text-gray-400">
              Bagikan penilaianmu untuk membantu author meningkatkan kualitas soal CTF ini.
            </p>
          </div>
        </div>

        {existingRating && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-200 transition-colors"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Rating
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex h-24 items-center justify-center text-xs text-gray-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent mr-2" />
          Memuat status rating...
        </div>
      ) : existingRating && !isEditing ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3 rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-300">Rating Kamu Telah Tersimpan</span>
            </div>
            <span className="text-[10px] text-gray-400">
              {new Date(existingRating.updated_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Rating02 value={existingRating.rating} readOnly size="sm" />
          </div>

          {existingRating.feedback && (
            <div className="mt-1 flex items-start gap-2 rounded-lg bg-slate-950/40 p-2.5 text-xs text-gray-300 border border-white/5">
              <MessageSquareText className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
              <p className="italic text-gray-300 break-words">{`"${existingRating.feedback}"`}</p>
            </div>
          )}
        </motion.div>
      ) : (
        <form onSubmit={handleSubmitRating} className="flex flex-col gap-4">
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-slate-950/40 py-4 px-2">
            <label className="mb-3 text-xs font-medium text-cyan-300/90 text-center">
              Seberapa bagus/menantang soal ini menurut kamu?
            </label>
            <Rating02
              value={ratingValue}
              onValueChange={(val) => setRatingValue(val)}
              size="md"
            />
            {selectedEmojiObj && (
              <p className="mt-2 text-xs font-semibold text-cyan-400 tracking-wide">
                {selectedEmojiObj.label} ({ratingValue} / 5)
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="feedback-reason" className="text-xs font-medium text-gray-300 flex items-center justify-between">
              <span>Alasan & Masukan (Opsional)</span>
              <span className="text-[10px] text-gray-400">{feedback.length} / 500 karakter</span>
            </label>
            <textarea
              id="feedback-reason"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value.slice(0, 500))}
              placeholder="Tuliskan alasan kenapa kamu memilih rating di atas (misal: soal sangat kreatif, hint jelas, ada bug/glitch, atau alur soal terlalu ribet)..."
              rows={3}
              className="w-full rounded-xl border border-gray-700/60 bg-slate-950/60 p-3 text-xs text-gray-200 placeholder-gray-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            {isEditing && existingRating && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-xl border border-gray-700 px-4 py-2 text-xs font-medium text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting || ratingValue === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
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
    </div>
  )
}

export default ChallengeRatingSection
