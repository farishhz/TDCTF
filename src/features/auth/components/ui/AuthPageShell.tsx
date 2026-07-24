'use client'

import React from 'react'
import { motion } from 'framer-motion'
import APP from '@/config'
import { TDCTF } from '@/_vars/const'
import { cn } from '@/shared/lib/utils'
import { Shield, Lock, Zap, Trophy, Flag } from 'lucide-react'

interface AuthPageShellProps {
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

const FEATURE_ITEMS = [
  { icon: Flag, text: 'Solve real-world CTF challenges' },
  { icon: Trophy, text: 'Climb the global scoreboard' },
  { icon: Shield, text: 'Learn offensive & defensive security' },
  { icon: Zap, text: 'Compete in live competitions' },
]

export function AuthPageShell({ children, className, contentClassName }: AuthPageShellProps) {
  const logoUrl = TDCTF.tdctf_logo || APP.image_logo

  return (
    <div
      className={cn(
        'relative flex min-h-screen w-full overflow-hidden bg-[#080c14]',
        className
      )}
    >
      {/* ─── Left Panel: Branding (hidden on mobile) ─── */}
      <div className="relative hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1526] via-[#0a1020] to-[#060b18]" />

        {/* Animated grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59,130,246,0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,0.8) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Glowing orb top */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
        {/* Glowing orb bottom */}
        <div className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-indigo-600/15 blur-[100px] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-1 flex-col justify-between p-10 xl:p-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {logoUrl && (
              <img
                src={logoUrl}
                alt={APP.shortName}
                className="h-9 w-auto object-contain select-none"
              />
            )}
            <span className="text-lg font-bold tracking-tight text-white/90">
              {APP.shortName}
            </span>
          </div>

          {/* Hero text */}
          <div className="space-y-6">
            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-400">
                  <Lock className="h-3 w-3" />
                  CTF Platform
                </div>
                <h1 className="text-4xl font-black leading-tight tracking-tight text-white xl:text-5xl">
                  Hack. Learn.{' '}
                  <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    Dominate.
                  </span>
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">
                  {APP.description}
                </p>
              </motion.div>
            </div>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
              className="space-y-3"
            >
              {FEATURE_ITEMS.map(({ icon: Icon, text }, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
                    <Icon className="h-3.5 w-3.5 text-blue-400" />
                  </span>
                  {text}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Bottom tagline */}
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} {APP.fullName}. All rights reserved.
          </p>
        </div>

        {/* Right edge fade */}
        <div className="absolute right-0 inset-y-0 w-px bg-gradient-to-b from-transparent via-blue-500/20 to-transparent" />
      </div>

      {/* ─── Right Panel: Form ─── */}
      <div
        className={cn(
          'relative flex flex-1 flex-col items-center justify-center overflow-y-auto bg-[#080c14]',
          'px-5 py-8 sm:px-8',
          contentClassName
        )}
      >
        {/* Subtle bg for mobile */}
        <div className="absolute inset-0 lg:hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />
        </div>

        {/* Mobile logo */}
        <div className="relative z-10 mb-6 flex items-center gap-2 lg:hidden">
          {logoUrl && (
            <img
              src={logoUrl}
              alt={APP.shortName}
              className="h-8 w-auto object-contain select-none"
            />
          )}
          <span className="text-base font-bold text-white/90">{APP.shortName}</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-[400px]"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
