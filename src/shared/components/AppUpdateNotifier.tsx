'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Sparkles, X } from 'lucide-react'

const POLL_INTERVAL_MS = 2 * 60 * 1000 // Check version every 2 minutes

export default function AppUpdateNotifier() {
  const [initialVersion, setInitialVersion] = useState<string | null>(null)
  const [hasUpdate, setHasUpdate] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const checkVersion = useCallback(async (isInitial = false) => {
    try {
      const res = await fetch('/api/version', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      const currentVersion = data.version

      if (isInitial) {
        setInitialVersion(currentVersion)
      } else if (initialVersion && currentVersion && currentVersion !== initialVersion) {
        setHasUpdate(true)
      }
    } catch {
      // Ignore network errors during background check
    }
  }, [initialVersion])

  // Initial fetch on mount
  useEffect(() => {
    void checkVersion(true)
  }, [checkVersion])

  // Periodic poll + visibilitychange listener
  useEffect(() => {
    if (!initialVersion) return

    const interval = setInterval(() => {
      void checkVersion(false)
    }, POLL_INTERVAL_MS)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void checkVersion(false)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [initialVersion, checkVersion])

  const handleReload = () => {
    window.location.reload()
  }

  if (!hasUpdate || dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="fixed bottom-5 left-5 z-[9999] pointer-events-auto max-w-sm"
      >
        <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 dark:border-white/20 bg-gradient-to-b from-blue-950/90 via-slate-900/95 to-blue-950/90 p-4 text-white shadow-[0_16px_40px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] backdrop-blur-2xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 border border-blue-400/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              </span>
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-blue-300">
                Update Terbaru
              </span>
            </div>

            <button
              onClick={() => setDismissed(true)}
              className="rounded-full p-1 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              title="Abaikan untuk sementara"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Content */}
          <div className="py-3">
            <h4 className="text-sm font-bold text-white tracking-tight">
              Versi Baru Telah Dideploy!
            </h4>
            <p className="mt-1 text-xs text-gray-300 leading-relaxed">
              Perubahan terbaru telah tersedia. Muat ulang halaman untuk mendapatkan versi terkini.
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-1">
            <button
              onClick={handleReload}
              className="group relative flex w-full items-center justify-center gap-2 rounded-full border border-white/30 bg-gradient-to-b from-blue-400/80 to-blue-600/80 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-xl shadow-[0_8px_24px_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.6)] transition-all duration-300 hover:from-blue-400/95 hover:to-blue-600/95 hover:shadow-[0_12px_32px_rgba(37,99,235,0.6),inset_0_1px_1px_rgba(255,255,255,0.8)] active:scale-[0.98]"
            >
              <RefreshCw className="h-3.5 w-3.5 transition-transform group-hover:rotate-180 duration-500" />
              <span>Perbarui Sekarang</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
