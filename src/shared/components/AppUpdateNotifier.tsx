'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, X } from 'lucide-react'
import BrandLogo from '@/shared/components/BrandLogo'
import ImageWithFallback from '@/shared/components/ImageWithFallback'

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
        <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#0b0f17]/80 p-4 text-gray-200 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ImageWithFallback
                src="/logo.svg"
                alt="TDCTF"
                size={20}
                className="h-5 w-5 rounded-full object-contain shrink-0"
              />
              <BrandLogo name="TDCTF" className="text-xs font-black tracking-tight" />
              <span className="text-gray-600 dark:text-gray-500 text-xs select-none">•</span>
              <span className="text-[10px] font-mono font-medium tracking-wide uppercase text-blue-400">
                System Update
              </span>
            </div>

            <button
              onClick={() => setDismissed(true)}
              className="rounded-lg p-1 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              title="Abaikan untuk sementara"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Content */}
          <div className="py-3">
            <h4 className="text-sm font-semibold text-white tracking-tight">
              Versi Baru Telah Dideploy!
            </h4>
            <p className="mt-1 text-xs text-gray-400 leading-normal">
              Perubahan terbaru telah tersedia. Muat ulang halaman untuk mendapatkan versi terkini.
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-1">
            <button
              onClick={handleReload}
              className="group relative flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-blue-600/80 hover:bg-blue-600 text-xs font-semibold text-white shadow-lg backdrop-blur-md transition-all duration-200 active:scale-[0.98] py-2.5"
            >
              <RefreshCw className="h-3.5 w-3.5 transition-transform group-hover:rotate-180 duration-500 text-blue-200" />
              <span>Perbarui Sekarang</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
