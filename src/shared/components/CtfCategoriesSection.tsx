"use client"

import { motion } from "framer-motion"
import {
  Globe,
  KeyRound,
  FileCode2,
  Search,
  Cpu,
  Coins,
  ShieldCheck,
  Zap,
} from "lucide-react"

interface CategoryItem {
  id: string
  title: string
  subtitle: string
  description: string
  icon: any
  badgeBg: string
  badgeColor: string
  tags: string[]
}

const CTF_CATEGORIES: CategoryItem[] = [
  {
    id: "web",
    title: "Web Exploitation",
    subtitle: "Modern Web Vulnerabilities",
    description: "Tantangan eksploitasi web modern meliputi XSS, SQLi, SSRF, SSTI, Prototype Pollution, Insecure Deserialization, dan JWT/OAuth logic flaws.",
    icon: Globe,
    badgeBg: "bg-blue-500/10 border-blue-500/30",
    badgeColor: "text-blue-500 dark:text-blue-400",
    tags: ["OWASP Top 10", "SSRF", "SSTI", "JWT Bypass"],
  },
  {
    id: "crypto",
    title: "Cryptography",
    subtitle: "Ciphers & Mathematical Attacks",
    description: "Analisis dan eksploitasi algoritma kriptografi: RSA factorization attacks, Elliptic Curves (ECC), Block Cipher modes, PRNG weakness, dan custom ciphers.",
    icon: KeyRound,
    badgeBg: "bg-emerald-500/10 border-emerald-500/30",
    badgeColor: "text-emerald-500 dark:text-emerald-400",
    tags: ["RSA", "ECC", "AES Modes", "PRNG"],
  },
  {
    id: "rev",
    title: "Reverse Engineering",
    subtitle: "Binary Disassembly & Decompilation",
    description: "Membongkar cara kerja file binary x86/x64, ARM, atau bytecode aplikasi menggunakan Ghidra, IDA Pro, GDB, dan deobfuscation techniques.",
    icon: FileCode2,
    badgeBg: "bg-purple-500/10 border-purple-500/30",
    badgeColor: "text-purple-500 dark:text-purple-400",
    tags: ["x86/x64", "Ghidra", "Anti-Debug", "Bytecode"],
  },
  {
    id: "forensics",
    title: "Digital Forensics & OSINT",
    subtitle: "Artifact & Packet Analysis",
    description: "Investigasi digital artefak: analisis memory dump menggunakan Volatility, Wireshark PCAP packet inspection, file carving, steganografi, dan Open-Source Intelligence.",
    icon: Search,
    badgeBg: "bg-amber-500/10 border-amber-500/30",
    badgeColor: "text-amber-500 dark:text-amber-400",
    tags: ["Volatility", "Wireshark", "Memory", "Stego"],
  },
  {
    id: "pwn",
    title: "Binary Exploitation (Pwn)",
    subtitle: "Memory Corruption & Shellcoding",
    description: "Eksploitasi memory corruption tingkat lanjut: Buffer Overflows, Return-Oriented Programming (ROP chains), Heap exploitation, dan shellcode injection.",
    icon: Cpu,
    badgeBg: "bg-rose-500/10 border-rose-500/30",
    badgeColor: "text-rose-500 dark:text-rose-400",
    tags: ["ROP", "Heap", "Shellcode", "Format String"],
  },
  {
    id: "blockchain",
    title: "Blockchain Security",
    subtitle: "Smart Contracts & EVM Internals",
    description: "Audit dan eksploitasi smart contract Solidity di runtime RPC Anvil/Foundry: Reentrancy, Integer underflow, Flash Loan attacks, dan delegatecall vulnerabilities.",
    icon: Coins,
    badgeBg: "bg-cyan-500/10 border-cyan-500/30",
    badgeColor: "text-cyan-500 dark:text-cyan-400",
    tags: ["Solidity", "EVM", "Reentrancy", "Foundry"],
  },
]

export default function CtfCategoriesSection({ className = "" }: { className?: string }) {
  return (
    <section className={`w-full max-w-6xl mx-auto my-12 px-4 sm:px-6 ${className}`}>
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-500">
              DISCIPLINES &amp; ARENAS
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              6 Core Categories
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Kategori Tantangan Capture The Flag
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md">
          Uji keahlian keamanan siber Anda dalam spektrum tantangan Jeopardy &amp; Attack-Defense bersertifikasi kompetisi global.
        </p>
      </div>

      {/* GRID CATEGORIES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CTF_CATEGORIES.map((cat, idx) => {
          const IconComp = cat.icon
          return (
            <motion.article
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="group relative flex flex-col justify-between p-5 bg-white/40 dark:bg-[#0c1017]/80 border border-gray-200/80 dark:border-gray-800/90 rounded-2xl backdrop-blur-md transition-all duration-300 hover:border-blue-500/40 hover:shadow-[0_8px_24px_rgba(59,130,246,0.12)] hover:-translate-y-0.5"
            >
              <div>
                {/* ICON & TITLE */}
                <div className="flex items-start gap-3.5 mb-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${cat.badgeBg} ${cat.badgeColor} group-hover:scale-105 transition-transform`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                      {cat.subtitle}
                    </p>
                  </div>
                </div>

                {/* DESCRIPTION */}
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
                  {cat.description}
                </p>
              </div>

              {/* TAGS */}
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-200/50 dark:border-gray-800/60">
                {cat.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}
