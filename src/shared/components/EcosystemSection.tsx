"use client"

import { motion } from "framer-motion"
import {
  Terminal, Shield, Globe, Database,
  ExternalLink, Layers, Bot, Cpu, Box, Code2, MessageSquare, GitBranch
} from "lucide-react"
import { TDCTF } from "@/_vars/const"

interface PlatformCardItem {
  name: string
  title: string
  description: string
  icon: any
  iconBg: string
  iconColor: string
  stack: any[]
  stackColors: string[]
}

const CORE_PLATFORM: PlatformCardItem[] = [
  {
    name: "tdctf",
    title: "TDCTF",
    description: "Open-source CTF platform for managing events, challenges, teams, scoreboards, and admin operations.",
    icon: Layers,
    iconBg: "bg-cyan-500/10 border-cyan-500/30",
    iconColor: "text-cyan-400",
    stack: [Globe, Database, Shield],
    stackColors: [
      "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      "text-blue-400 bg-blue-500/10 border-blue-500/20",
    ],
  },
  {
    name: "tdctl",
    title: "TDCTL",
    description: "CLI orchestrator for containerized CTF challenges with Docker lifecycle, TTL controls, dynamic ports, and tunnel exports.",
    icon: Terminal,
    iconBg: "bg-blue-500/10 border-blue-500/30",
    iconColor: "text-blue-400",
    stack: [Code2, Box, GitBranch],
    stackColors: [
      "text-blue-400 bg-blue-500/10 border-blue-500/20",
      "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      "text-purple-400 bg-purple-500/10 border-purple-500/20",
    ],
  },
  {
    name: "tdbot",
    title: "TDBOT",
    description: "Multi-server Discord bot featuring a Next.js dashboard, realtime first bloods, live scoreboards, and a participant ticketing system.",
    icon: Bot,
    iconBg: "bg-amber-500/10 border-amber-500/30",
    iconColor: "text-amber-400",
    stack: [MessageSquare, Globe, Database],
    stackColors: [
      "text-amber-400 bg-amber-500/10 border-amber-500/20",
      "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    ],
  },
  {
    name: "tdbcl",
    title: "TDBCL",
    description: "Blockchain challenge launcher with Anvil RPC runtime, PoW sessions, and a Vue-based launcher UI.",
    icon: Cpu,
    iconBg: "bg-purple-500/10 border-purple-500/30",
    iconColor: "text-purple-400",
    stack: [Code2, Globe, Database],
    stackColors: [
      "text-purple-400 bg-purple-500/10 border-purple-500/20",
      "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    ],
  },
]

export default function EcosystemSection({ className = "" }: { className?: string }) {
  const orgGithubUrl = TDCTF.tdctf_github_org || "https://github.com/tenka-developer"

  return (
    <section className={`w-full max-w-6xl mx-auto my-16 px-4 sm:px-6 ${className}`}>
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-500">
          CORE PLATFORM
        </span>

        <a
          href={orgGithubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-mono text-gray-400 hover:text-cyan-400 transition-colors group"
        >
          <span>View Toolkit</span>
          <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </div>

      {/* CORE PLATFORM GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CORE_PLATFORM.map((card, idx) => {
          const IconComp = card.icon
          return (
            <motion.div
              key={card.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="group relative flex flex-col justify-between p-5 bg-white/40 dark:bg-[#0c1017]/80 border border-gray-200/80 dark:border-gray-800/90 rounded-2xl backdrop-blur-md transition-all duration-300 hover:border-cyan-500/40 hover:shadow-[0_8px_24px_rgba(6,182,212,0.1)]"
            >
              <div>
                {/* ICON & TITLE */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center ${card.iconBg} ${card.iconColor} group-hover:scale-105 transition-transform`}
                  >
                    <IconComp className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight group-hover:text-cyan-400 transition-colors">
                    {card.title}
                  </h3>
                </div>

                {/* DESCRIPTION */}
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  {card.description}
                </p>
              </div>

              {/* BOTTOM ROW: STACK LABEL & TECH BADGES */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200/50 dark:border-gray-800/60">
                <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 font-semibold">
                  STACK
                </span>

                <div className="flex items-center gap-1.5">
                  {card.stack.map((StackIcon, sIdx) => {
                    const styleClass = card.stackColors[sIdx] || "text-gray-400 bg-gray-800 border-gray-700"
                    return (
                      <div
                        key={sIdx}
                        className={`p-1.5 rounded-lg border flex items-center justify-center ${styleClass}`}
                      >
                        <StackIcon className="w-3.5 h-3.5" />
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
