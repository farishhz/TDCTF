"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ExternalLink, BellOff, Check } from "lucide-react"

const DISCORD_INVITE_URL = "https://discord.gg/DUU439SAg"
const STORAGE_KEY = "tdctf_discord_popup_state_v1"
const AUTO_SHOW_DELAY_MS = 12000 // 12 seconds non-intrusive delay

export type PopupState = {
  status: "active" | "snoozed" | "joined" | "dismissed_permanently"
  snoozedUntil?: number
}

function DiscordLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 127.14 96.36"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.68 1.75 1.36 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.91-72.14zM42.45 65.69c-6.28 0-11.45-5.77-11.45-12.84 0-7.07 5.07-12.84 11.45-12.84 6.43 0 11.55 5.82 11.45 12.84 0 7.07-5.02 12.84-11.45 12.84zm42.24 0c-6.28 0-11.45-5.77-11.45-12.84 0-7.07 5.07-12.84 11.45-12.84 6.43 0 11.55 5.82 11.45 12.84 0 7.07-5.02 12.84-11.45 12.84z" />
    </svg>
  )
}

export default function DiscordInvitePopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [userState, setUserState] = useState<PopupState | null>(null)
  const [hasDismissedSession, setHasDismissedSession] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: PopupState = JSON.parse(stored)
        setUserState(parsed)

        if (parsed.status === "snoozed" && parsed.snoozedUntil) {
          if (Date.now() > parsed.snoozedUntil) {
            const newState: PopupState = { status: "active" }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
            setUserState(newState)
          }
        }
      } else {
        const initialState: PopupState = { status: "active" }
        setUserState(initialState)
      }
    } catch {
      setUserState({ status: "active" })
    }
  }, [])

  useEffect(() => {
    if (!userState) return

    if (
      userState.status === "joined" ||
      userState.status === "dismissed_permanently"
    ) {
      return
    }

    if (userState.status === "snoozed" && userState.snoozedUntil) {
      if (Date.now() < userState.snoozedUntil) return
    }

    const timer = setTimeout(() => {
      if (!hasDismissedSession) {
        setIsOpen(true)
      }
    }, AUTO_SHOW_DELAY_MS)

    return () => clearTimeout(timer)
  }, [userState, hasDismissedSession])

  const handleJoinDiscord = () => {
    window.open(DISCORD_INVITE_URL, "_blank", "noopener,noreferrer")
    const newState: PopupState = { status: "joined" }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
    } catch {}
    setUserState(newState)
    setIsOpen(false)
  }

  const handleSnooze = (days = 7) => {
    const snoozedUntil = Date.now() + days * 24 * 60 * 60 * 1000
    const newState: PopupState = { status: "snoozed", snoozedUntil }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
    } catch {}
    setUserState(newState)
    setHasDismissedSession(true)
    setFeedbackMsg("Disimpan. Popup di-snooze 7 hari.")
    setTimeout(() => {
      setIsOpen(false)
      setFeedbackMsg(null)
    }, 1200)
  }

  const handleDismissPermanently = () => {
    const newState: PopupState = { status: "dismissed_permanently" }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
    } catch {}
    setUserState(newState)
    setHasDismissedSession(true)
    setIsOpen(false)
  }

  const handleClose = () => {
    setHasDismissedSession(true)
    setIsOpen(false)
  }

  const handleResetForTesting = (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    setUserState({ status: "active" })
    setHasDismissedSession(false)
    setIsOpen(true)
  }

  const isPermanentlyHidden = userState?.status === "dismissed_permanently"

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-none select-none">
      {/* MINIMAL FLOATING PILL (Shown when card is closed & not permanently hidden) */}
      {!isOpen && !isPermanentlyHidden && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="pointer-events-auto"
        >
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 rounded-full border border-neutral-800 bg-[#0d0f14]/90 px-3.5 py-2 text-xs font-medium text-neutral-300 shadow-xl backdrop-blur-md transition-all hover:border-neutral-700 hover:bg-[#131720] hover:text-white active:scale-95"
          >
            <DiscordLogo className="h-3.5 w-3.5 text-[#5865F2]" />
            <span>Discord</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </button>
        </motion.div>
      )}

      {/* SLEEK RAYCAST/LINEAR-STYLE FLOATING CARD */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="pointer-events-auto w-[340px] overflow-hidden rounded-xl border border-neutral-800/80 bg-[#0c0e12]/95 p-4 text-neutral-200 shadow-2xl backdrop-blur-xl"
          >
            {/* Header bar */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800/60">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center h-6 w-6 rounded-md bg-[#5865F2]/10 border border-[#5865F2]/20 text-[#5865F2]">
                  <DiscordLogo className="h-3.5 w-3.5" />
                </span>
                <span className="text-[11px] font-mono font-medium tracking-wide uppercase text-neutral-400">
                  TDCTF Community
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetForTesting}
                  className="text-[10px] font-mono text-neutral-600 hover:text-neutral-400 px-1 transition-colors"
                  title="Reset popup state for testing"
                >
                  [dev]
                </button>
                <button
                  onClick={handleClose}
                  className="rounded-md p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Content body */}
            <div className="py-3.5">
              <h4 className="text-sm font-semibold text-white tracking-tight">
                Diskusi & hint CTF di Discord
              </h4>
              <p className="mt-1 text-xs text-neutral-400 leading-normal">
                Cari teman mabar, tanya hint tantangan, atau sharing writeup bareng anggota komunitas lainnya.
              </p>

              {/* Server stats badge */}
              <div className="mt-3 inline-flex items-center gap-2 text-[11px] text-neutral-400 bg-neutral-900/80 border border-neutral-800/80 rounded-md px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>1,200+ Member</span>
                <span className="text-neutral-600">•</span>
                <span className="text-neutral-400">Aktif setiap hari</span>
              </div>
            </div>

            {/* Feedback alert (if snoozed) */}
            {feedbackMsg ? (
              <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs">
                <Check className="h-3.5 w-3.5" />
                <span>{feedbackMsg}</span>
              </div>
            ) : (
              /* Actions */
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleJoinDiscord}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#5865F2] px-3.5 py-2 text-xs font-semibold text-white transition-all hover:bg-[#4752C4] active:scale-[0.98]"
                >
                  <DiscordLogo className="h-3.5 w-3.5" />
                  <span>Join Server Discord</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </button>

                <div className="flex items-center justify-between text-[11px] pt-1 text-neutral-500">
                  <button
                    onClick={() => handleSnooze(7)}
                    className="flex items-center gap-1 hover:text-neutral-300 transition-colors"
                  >
                    <BellOff className="h-3 w-3" />
                    <span>Nanti aja (7 hari)</span>
                  </button>

                  <button
                    onClick={handleDismissPermanently}
                    className="hover:text-neutral-400 transition-colors"
                  >
                    Tutup selamanya
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
