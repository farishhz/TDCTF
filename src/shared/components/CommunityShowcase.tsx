"use client"

import { useEffect, useState } from "react"
import { Github, Sparkles, ExternalLink, Code2 } from "lucide-react"
import Image from "next/image"
import { TDCTF } from "@/_vars/const"
import { SURFACE_GLASS_CARD_COMPACT_CLASS } from "@/shared/styles"

export interface ContributorItem {
  username: string
  role?: string
  avatarUrl?: string
  isCreator?: boolean
}

const ONLY_CONTRIBUTORS: ContributorItem[] = [
  { username: "farishhz", role: "Creator & Lead Architect", isCreator: true },
  { username: "tenka-developer", role: "Organization & Maintainer", isCreator: false },
]

function fillContributors(list: ContributorItem[], minLength = 12): ContributorItem[] {
  if (list.length === 0) return []
  const result: ContributorItem[] = []
  let i = 0
  while (result.length < minLength) {
    result.push(list[i % list.length])
    i++
  }
  return result
}

export default function CommunityShowcase({ className = "" }: { className?: string }) {
  const [contributors, setContributors] = useState<ContributorItem[]>(ONLY_CONTRIBUTORS)

  useEffect(() => {
    // Optionally fetch avatars for farishhz & tenka-developer from GitHub API
    const fetchAvatars = async () => {
      try {
        const updated = await Promise.all(
          ONLY_CONTRIBUTORS.map(async (c) => {
            const res = await fetch(`https://api.github.com/users/${c.username}`)
            if (res.ok) {
              const data = await res.json()
              return {
                ...c,
                avatarUrl: data.avatar_url,
              }
            }
            return c
          })
        )
        setContributors(updated)
      } catch {
        // Fallback to default github avatar url format
      }
    }
    fetchAvatars()
  }, [])

  const filledList = fillContributors(contributors, 14)
  const row1 = filledList
  const row2 = [...filledList].reverse()

  return (
    <section className={`w-full max-w-5xl mx-auto my-8 ${className}`}>
      {/* MARQUEE ANIMATED CARDS (FARISHHZ & TENKA-DEVELOPER SHOWCASE) */}
      <div className="marquee-group relative w-full overflow-hidden space-y-3.5 py-3 [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]">
        {/* ROW 1: LEFT SLIDE */}
        <div className="marquee marquee-left">
          <div className="marquee-track flex gap-4 pr-4" style={{ willChange: "transform" }}>
            {[...row1, ...row1].map((item, idx) => (
              <ContributorCard key={`r1-${item.username}-${idx}`} item={item} />
            ))}
          </div>
        </div>

        {/* ROW 2: RIGHT SLIDE */}
        <div className="marquee marquee-right">
          <div className="marquee-track flex gap-4 pr-4" style={{ willChange: "transform" }}>
            {[...row2, ...row2].map((item, idx) => (
              <ContributorCard key={`r2-${item.username}-${idx}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ContributorCard({ item }: { item: ContributorItem }) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  const username = item.username.replace("@", "")
  const avatarUrl = item.avatarUrl || `https://github.com/${username}.png`
  const profileUrl = `https://github.com/${username}`
  const isCreator = item.isCreator || username.toLowerCase() === "farishhz"

  useEffect(() => {
    let cancelled = false
    setLoaded(false)
    setErrored(false)
    const img = new window.Image()
    img.src = avatarUrl
    img.onload = () => {
      if (!cancelled) setLoaded(true)
    }
    img.onerror = () => {
      if (!cancelled) setErrored(true)
    }
    return () => {
      cancelled = true
    }
  }, [avatarUrl])

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex shrink-0 items-center gap-3.5 px-4 py-2.5 ${SURFACE_GLASS_CARD_COMPACT_CLASS} rounded-2xl transition-all duration-300 hover:scale-105 hover:z-20 ${
        isCreator
          ? "border-amber-500/40 dark:border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 shadow-[0_4px_20px_rgba(245,158,11,0.15)]"
          : "border-blue-500/30 dark:border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 shadow-[0_4px_20px_rgba(59,130,246,0.15)]"
      }`}
    >
      {/* AVATAR WITH ANIMATED GLOW RING */}
      <div className="relative flex shrink-0">
        <div
          className={`relative w-10 h-10 rounded-full overflow-hidden p-0.5 transition-all duration-300 group-hover:scale-110 ${
            isCreator
              ? "bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-300 ring-2 ring-amber-400/50 shadow-md shadow-amber-500/20"
              : "bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 ring-2 ring-blue-400/50 shadow-md shadow-blue-500/20"
          }`}
        >
          {!loaded && !errored && (
            <div className="w-full h-full rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
          )}

          {errored ? (
            <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase">
              {username.substring(0, 2)}
            </div>
          ) : (
            <Image
              src={avatarUrl}
              alt={`${username} avatar`}
              width={40}
              height={40}
              className="w-full h-full rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
              style={{ opacity: loaded ? 1 : 0 }}
              unoptimized
            />
          )}
        </div>

        {/* BADGE ICON */}
        <span
          className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-white text-[9px] font-black shadow-md border border-white dark:border-gray-900 ${
            isCreator ? "bg-amber-500 animate-pulse" : "bg-blue-600"
          }`}
          title={isCreator ? "Creator & Lead Architect" : "Organization Core"}
        >
          {isCreator ? "★" : "⚡"}
        </span>
      </div>

      {/* USER INFORMATION */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-xs font-extrabold tracking-tight transition-colors ${
              isCreator
                ? "text-amber-600 dark:text-amber-400 group-hover:text-amber-500"
                : "text-blue-600 dark:text-blue-400 group-hover:text-blue-500"
            }`}
          >
            @{username}
          </span>

          <Github className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors" />
        </div>

        <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-none mt-1">
          {item.role}
        </span>
      </div>

      <ExternalLink className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
    </a>
  )
}
