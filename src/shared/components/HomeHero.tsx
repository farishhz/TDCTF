"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import APP from "@/config"
import BrandLogo from "@/shared/components/BrandLogo"
import { useAuth } from "@/shared/contexts/AuthContext"
import { useSystemSettings } from "@/shared/contexts/SystemSettingsContext"

export default function HomeHero() {
  const { user } = useAuth()
  const { settings } = useSystemSettings()

  return (
    <section className="w-full max-w-5xl mx-auto flex flex-col items-center text-center pt-2 pb-6">
      {/* FLAG FORMAT BADGE */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/60 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800/80 backdrop-blur-md mb-6 shadow-sm"
      >
        <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-[11px] uppercase tracking-wider font-bold text-gray-600 dark:text-gray-400">
          Flag format: <span className="font-mono text-blue-600 dark:text-blue-400">{settings.flag_format || "TDCTF{...}"}</span>
        </span>
      </motion.div>

      {/* MAIN TITLE (H1) */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl sm:text-6xl font-black tracking-tight mb-4 text-gray-900 dark:text-white"
      >
        <BrandLogo name={APP.fullName} />
      </motion.h1>

      {/* SEO-FOCUSED & CRISP SUBHEADING */}
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-base sm:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mb-4 leading-relaxed font-medium"
      >
        Next-Generation <strong className="text-blue-600 dark:text-blue-400 font-bold">Capture The Flag (CTF)</strong> Platform &amp; Cybersecurity Arena.
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl mb-8 leading-relaxed font-normal"
      >
        Featuring on-demand <span className="font-mono font-semibold text-gray-900 dark:text-white">tdctl</span> container instances, dynamic jeopardy scoring, multi-step challenge pipelines, and realtime scoreboard analytics.
      </motion.p>

      {/* ACTION BUTTONS */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex flex-wrap items-center justify-center gap-3"
      >
        <Link
          href={user ? "/challenges" : "/login"}
          className="group relative inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold text-white transition-all duration-300 bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 border border-white/20 backdrop-blur-xl rounded-full shadow-[0_8px_32px_0_rgba(37,99,235,0.35),inset_0_1px_1px_rgba(255,255,255,0.6)] hover:shadow-[0_12px_40px_0_rgba(37,99,235,0.5),inset_0_1px_1px_rgba(255,255,255,0.8)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
        >
          {user ? "Enter Arena" : "Start Hacking"}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/info"
          className="relative inline-flex items-center justify-center px-6 py-3.5 text-sm font-bold transition-all duration-300 rounded-full bg-white/40 dark:bg-white/5 border border-gray-300/40 dark:border-white/10 backdrop-blur-xl text-gray-800 dark:text-gray-200 shadow-sm hover:bg-white/60 dark:hover:bg-white/10 hover:text-blue-600 dark:hover:text-blue-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
        >
          About Platform
        </Link>
        {settings.discord_link && (
          <a
            href={settings.discord_link}
            target="_blank"
            rel="noopener noreferrer"
            className="relative inline-flex items-center justify-center p-3.5 rounded-full bg-white/40 dark:bg-white/5 border border-gray-300/40 dark:border-white/10 backdrop-blur-xl text-gray-600 dark:text-gray-300 shadow-sm hover:bg-white/60 dark:hover:bg-white/10 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.95]"
            title="Join Event Discord"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 127.14 96.36" aria-label="Discord">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,52.88,6.83,77.19,77.19,0,0,0,49.58,0,105.15,105.15,0,0,0,19.18,8.07C3,32.22-1.38,55.77.34,79A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.87-.64,1.72-1.32,2.53-2a75.7,75.7,0,0,0,72.76,0c.81.7,1.66,1.38,2.53,2a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.69-17.3c1.92-27.11-2.84-50.48-16-70.93ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.84,46,53.84,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.08,46,96.08,53,91,65.69,84.69,65.69Z" />
            </svg>
          </a>
        )}
      </motion.div>
    </section>
  )
}
