'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import APP from '@/config'
import LoginFormContent from './LoginFormContent'
import RegisterFormContent from './RegisterFormContent'

export type AuthTab = 'login' | 'register'

interface AuthFormTabsProps {
  defaultTab?: AuthTab
}

const TABS: { id: AuthTab; label: string }[] = [
  { id: 'login', label: 'Sign In' },
  { id: 'register', label: 'Sign Up' },
]

const TAB_META: Record<AuthTab, { title: string; subtitle: string }> = {
  login: {
    title: `Welcome back`,
    subtitle: 'Sign in to continue your CTF journey',
  },
  register: {
    title: `Join ${APP.shortName}`,
    subtitle: 'Create an account and start hacking',
  },
}

const TAB_ORDER: AuthTab[] = ['login', 'register']

const formVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 28 : -28,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: 'spring' as const, stiffness: 360, damping: 34 },
      opacity: { duration: 0.18 },
    },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -28 : 28,
    opacity: 0,
    transition: {
      x: { type: 'spring' as const, stiffness: 360, damping: 34 },
      opacity: { duration: 0.13 },
    },
  }),
}

const titleVariants: Variants = {
  enter: { opacity: 0, y: 6 },
  center: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15, ease: 'easeIn' as const } },
}

export default function AuthFormTabs({ defaultTab = 'login' }: AuthFormTabsProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>(defaultTab)
  const prevTabIndexRef = useRef(TAB_ORDER.indexOf(defaultTab))

  const handleTabChange = (tab: AuthTab) => {
    if (tab === activeTab) return
    prevTabIndexRef.current = TAB_ORDER.indexOf(activeTab)
    setActiveTab(tab)
    window.history.replaceState(null, '', tab === 'login' ? '/login' : '/register')
  }

  const currentIndex = TAB_ORDER.indexOf(activeTab)
  const direction = currentIndex - prevTabIndexRef.current
  const meta = TAB_META[activeTab]

  return (
    <div className="w-full">

      {/* ─── Header: animates title/subtitle when tab switches ─── */}
      <div className="mb-5 overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={activeTab + '-header'}
            variants={titleVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <h2 className="text-2xl font-black tracking-tight text-white">
              {meta.title}
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">{meta.subtitle}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── Tab Switcher with animated pill ─── */}
      <div className="relative mb-6 flex items-center rounded-xl bg-white/[0.06] p-1 gap-1">
        {/* Animated sliding pill */}
        <motion.div
          className="absolute rounded-[10px] bg-blue-600 shadow-lg shadow-blue-700/30"
          layoutId="auth-tab-pill"
          transition={{ type: 'spring', stiffness: 400, damping: 36 }}
          style={{
            inset: '4px',
            left: currentIndex === 0 ? '4px' : '50%',
            right: currentIndex === 0 ? '50%' : '4px',
          }}
          aria-hidden
        />

        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={[
                'relative z-10 flex-1 rounded-[10px] py-2 text-sm font-semibold',
                'transition-colors duration-200 focus-visible:outline-none',
                isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300',
              ].join(' ')}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ─── Form Content with directional slide animation ─── */}
      <div className="overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={activeTab}
            custom={direction}
            variants={formVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {activeTab === 'login'
              ? <LoginFormContent />
              : <RegisterFormContent />
            }
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
