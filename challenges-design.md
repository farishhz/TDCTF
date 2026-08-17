# 🛡️ Design System & UI Specification: Challenge Page (Navbar & Cards)
**Style:** Liquid Glass & Frosted Glassmorphism 2026  
**Target:** Desktop, Tablet & Mobile CTF Arena  
**Version:** 2.0-Liquid

---

## 1. Top Navigation Bar (Arena Navbar)

### 📐 Anatomy & Layout Wireframe

```
+-----------------------------------------------------------------------------------------------------------------------+
| [🛡️ TDCTF Logo] | [🔴 Live 04:22:15] |  Challenges  Scoreboard  Rules  Teams  | [🔍 Search ⌘K]  [Rank #12 | 1,450 pts] [Avatar ▼] |
+-----------------------------------------------------------------------------------------------------------------------+
```

### 💎 Karakteristik & Visual Effect
- **Surface Material:** `backdrop-blur-xl bg-gray-950/60 border-b border-white/10`
- **Sticky Behavior:** `sticky top-0 z-50` dengan dynamic shadow saat scroll (`shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]`).
- **Accent Glow:** Garis tipis gradien iridescent di sisi bawah navbar `h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent`.

### 🧩 Elemen Komponen Navbar

1. **Brand & Event Status Pill:**
   - Logo dengan subtle text gradient (`from-white via-blue-100 to-blue-400 font-black tracking-tight`).
   - Badge Status: `bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1.5` dengan pulsing green dot (`animate-pulse`).
2. **Navigation Tabs (Capsule Indicator):**
   - Active Tab: `bg-white/10 text-white font-medium border border-white/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] rounded-full px-4 py-1.5`.
   - Inactive Tab: `text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 rounded-full px-4 py-1.5`.
3. **Quick Command / Search Bar (`⌘K`):**
   - Translucent input capsule: `bg-white/5 border border-white/10 text-sm placeholder-gray-500 focus:border-blue-500/50 focus:bg-white/10 rounded-full px-3.5 py-1.5`.
4. **User Hub Pill:**
   - Points & Rank Chip: `bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-blue-300 font-mono text-xs px-3 py-1.5 rounded-xl`.
   - User Avatar with ring border & role badge (Admin / Team Captain).

---

## 2. Challenge Card Component (`ChallengeCard`)

### 📐 Anatomy & Card Layout

```
+------------------------------------------------------------------------+
| [🛡️ WEB EXPLOIT]                  [⚡ First Blood: @haxor]  [⭐ 450 pts] |
|                                                                        |
|  SQLi Liquid Portal 2.0                                                |
|  Multi-tenant bypass with blind time-based extraction...               |
|                                                                        |
|  [🐳 Instance] [🧩 3 Steps] [🔥 Hard]                                  |
|------------------------------------------------------------------------|
|  👥 42 solves   •   📉 Dynamic Decay               [ Solve Status: 🟢 ] |
+------------------------------------------------------------------------+
```

### 🎨 Category Theming (Dynamic Color Mapping)

| Kategori | Accent Glow / Border | Badge Surface | Background Icon Tint |
| :--- | :--- | :--- | :--- |
| **Web Exploitation** | `#0080FF` (Blue-500) | `bg-blue-500/15 text-blue-400 border-blue-500/30` | `text-blue-500/10` |
| **Binary / PWN** | `#EF4444` (Red-500) | `bg-red-500/15 text-red-400 border-red-500/30` | `text-red-500/10` |
| **Cryptography** | `#A855F7` (Purple-500) | `bg-purple-500/15 text-purple-400 border-purple-500/30` | `text-purple-500/10` |
| **Reverse Eng** | `#F59E0B` (Amber-500) | `bg-amber-500/15 text-amber-400 border-amber-500/30` | `text-amber-500/10` |
| **Forensics / OSINT** | `#10B981` (Emerald-500)| `bg-emerald-500/15 text-emerald-400 border-emerald-500/30` | `text-emerald-500/10` |
| **Miscellaneous** | `#06B6D4` (Cyan-500) | `bg-cyan-500/15 text-cyan-400 border-cyan-500/30` | `text-cyan-500/10` |

---

### 🔮 State Variations

1. **Default (Unsolved):**
   - Surface: `bg-gradient-to-b from-gray-900/80 to-gray-950/90 border border-white/10 backdrop-blur-xl`
   - Hover: `hover:scale-[1.02] hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_12px_36px_0_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)]`
   - Top Accent Line: Dynamic category colored shimmer on hover.

2. **Solved (Personal Solved):**
   - Surface: `bg-gradient-to-b from-emerald-950/40 to-gray-950/80 border border-emerald-500/30 opacity-80 hover:opacity-100`
   - Badge: Solved Checkmark Icon `[✓ SOLVED]` in emerald neon.

3. **Team Solved:**
   - Surface: `bg-gradient-to-b from-purple-950/40 to-gray-950/80 border border-purple-500/30 opacity-80 hover:opacity-100`
   - Badge: Team Icon `[👥 TEAM SOLVED by @teammate]`.

4. **Under Maintenance / Locked:**
   - Surface: `bg-amber-500/[0.03] border-amber-500/20 border-dashed cursor-not-allowed`
   - Badge: `[⚠️ UNDER MAINTENANCE]` with disabled modal trigger.

---

### 💻 Tailwind & CSS Code Recipe (Challenge Card)

```html
<div class="relative group cursor-pointer rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70">
  <!-- Dynamic Category Hover Glow -->
  <div class="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-500/20 to-indigo-500/0 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 pointer-events-none"></div>

  <!-- Main Card Surface -->
  <div class="relative h-full flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-b from-gray-900/70 to-gray-950/90 border border-white/10 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.12)] group-hover:border-white/25 overflow-hidden">
    
    <!-- Top Accent Iridescent Line -->
    <div class="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

    <!-- Background Category Icon Silhouette -->
    <div class="absolute right-[-10px] bottom-[-10px] text-blue-500/10 pointer-events-none group-hover:text-blue-500/20 group-hover:scale-110 transition-all duration-500">
      <svg class="w-28 h-28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    </div>

    <!-- Header Section -->
    <div class="relative z-10">
      <div class="flex items-center justify-between gap-2 mb-3">
        <!-- Category Badge -->
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30 backdrop-blur-md">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/></svg>
          Web Exploitation
        </span>

        <!-- Points Pill -->
        <span class="font-mono text-sm font-bold text-white px-2.5 py-0.5 rounded-md bg-white/10 border border-white/10">
          450 <span class="text-xs text-gray-400 font-normal">pts</span>
        </span>
      </div>

      <!-- Challenge Title -->
      <h3 class="text-lg font-bold text-white group-hover:text-blue-300 transition-colors mb-1.5">
        Liquid Portal 2.0
      </h3>
      <p class="text-xs text-gray-400 line-clamp-2 leading-relaxed">
        Bypass next-generation WAF inspection using HTTP/2 stream multiplexing quirks.
      </p>
    </div>

    <!-- Meta Chips & Tags -->
    <div class="relative z-10 my-4 flex flex-wrap gap-1.5">
      <span class="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300 flex items-center gap-1">
        ⚡ <span>First Blood: @zero_cool</span>
      </span>
      <span class="text-[11px] font-mono px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 flex items-center gap-1">
        🐳 <span>Instance</span>
      </span>
    </div>

    <!-- Footer Stats -->
    <div class="relative z-10 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400 font-mono">
      <span class="flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        38 solves
      </span>
      <span class="text-emerald-400 font-medium flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        Easy
      </span>
    </div>
  </div>
</div>
```
