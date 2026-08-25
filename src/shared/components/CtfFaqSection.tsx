"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, HelpCircle } from "lucide-react"
import { CTF_FAQ_ITEMS } from "@/shared/lib/seo-structured-data"

export default function CtfFaqSection({ className = "" }: { className?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section className={`w-full max-w-4xl mx-auto my-14 px-4 sm:px-6 ${className}`}>
      {/* SECTION HEADER */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-mono font-bold uppercase mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Seputar TDCTF &amp; Capture The Flag
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xl mx-auto">
          Pertanyaan umum mengenai platform TDCTF, mekanisme kompetisi keamanan siber, dan cara berpartisipasi.
        </p>
      </div>

      {/* ACCORDION LIST */}
      <div className="space-y-3">
        {CTF_FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx
          return (
            <div
              key={idx}
              className="overflow-hidden rounded-2xl border border-gray-200/80 dark:border-gray-800/90 bg-white/40 dark:bg-[#0c1017]/80 backdrop-blur-md transition-colors"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none"
                aria-expanded={isOpen}
              >
                <span className="pr-4">{item.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-blue-500" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-200/40 dark:border-gray-800/40 pt-3">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}
