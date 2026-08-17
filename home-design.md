# 🌐 Design System & UI Specification: CTF Home / Landing Page
**Style:** 2026 Liquid Glass Cyber-Minimalism  
**Target:** High-Conversion Modern CTF Arena Homepage  
**Layout Model:** Asymmetric Bento Grid & Hero Split  
**Version:** 2.0-Liquid

---

## 1. Color System & Design Tokens

```css
:root {
  --bg-deep-space: #030712;
  --glass-base: rgba(15, 23, 42, 0.65);
  --glass-surface-highlight: rgba(255, 255, 255, 0.12);
  --glass-border: rgba(255, 255, 255, 0.15);
  --glass-blur: blur(20px);
  
  --accent-cyan: #06B6D4;
  --accent-blue: #3B82F6;
  --accent-indigo: #6366F1;
  --accent-purple: #8B5CF6;

  --shadow-liquid: 0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2);
  --shadow-liquid-hover: 0 16px 48px 0 rgba(37, 99, 235, 0.25), inset 0 1px 2px 0 rgba(255, 255, 255, 0.4);
}
```

---

## 2. Page Hierarchy & Section Architecture

```
+=============================================================================+
| 1. HERO SECTION                                                             |
|    - Animated Flag Format Pill (Live Pulser)                                |
|    - Glitch/Liquid Glass Heading: "ENTER THE ARENA"                         |
|    - Tagline & Platform Description                                         |
|    - Dual CTA: [🚀 Enter Arena] + [📖 Documentation] + [💬 Discord Pill]     |
+-----------------------------------------------------------------------------+
| 2. LIVE TELEMETRY TICKER (Glass Banner)                                     |
|    [ ⚡ 1,240 Hackers ] | [ 🚩 68 Challenges ] | [ 💥 4,890 Flags Submitted ]|
+-----------------------------------------------------------------------------+
| 3. ECOSYSTEM & CAPABILITIES (Bento Glass Grid)                              |
|    +-----------------------------+---------------------------------------+  |
|    | [🐳 On-Demand Cloud Box]    | [📈 Dynamic Scoring & Anti-Cheat]     |  |
|    | Isolated container per team | First blood decay curve algorithm     |  |
|    +-----------------------------+---------------------------------------+  |
|    | [⚔️ Multi-Step Attack Tree] | [📊 Real-time Websocket Telemetry]   |  |
|    | Complex enterprise chain    | Instant live scoreboard refresh       |  |
|    +-----------------------------+---------------------------------------+  |
+-----------------------------------------------------------------------------+
| 4. HALL OF FAME / TOP PODIUM PREVIEW (Frosted 3D Pedestals)                 |
|    [ 🥈 Rank 2 ]        [ 🥇 Rank 1 (Elevated) ]        [ 🥉 Rank 3 ]       |
+-----------------------------------------------------------------------------+
| 5. INTERACTIVE TERMINAL PREVIEW (`tdctl connect arena`)                     |
|    Interactive CLI mock in frosted dark console.                            |
+-----------------------------------------------------------------------------+
| 6. HIGH CONVERSION CTA BANNER + FOOTER                                      |
+=============================================================================+
```

---

## 3. Section-by-Section Implementation

### A. Hero Section (Liquid Glass Centerpiece)
- **Flag Format Pill:**
  - `bg-white/5 border border-white/15 backdrop-blur-md rounded-full px-4 py-1.5`
  - Green neon dot pulse (`animate-ping`) + Monospace text `TDCTF{...}`
- **Headline:**
  - Typography: `clamp(2.75rem, 6vw, 4.5rem)` font-bold with text shimmer effect:
  `bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent`
- **Primary CTA Button (Liquid Glass Button):**
  - Gradient: `from-blue-500/80 via-blue-600/80 to-indigo-600/80`
  - Inset Reflection: `shadow-[0_8px_32px_0_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.7)]`
  - Border: `border border-white/30 backdrop-blur-xl rounded-full`
  - Hover: `-translate-y-0.5 scale-105 shadow-[0_12px_40px_0_rgba(37,99,235,0.6)]`

---

### B. Live Telemetry Bar
- `grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto my-12`
- Setiap cell menggunakan `bg-white/[0.03] border border-white/10 backdrop-blur-lg rounded-2xl p-4 text-center`
- Nilai angka berformat font monospace futuristik (`font-mono text-2xl font-bold text-white`).

---

### C. Bento Ecosystem Showcase (Bento Glass Layout)

```html
<section class="max-w-6xl mx-auto py-20 px-6">
  <div class="text-center mb-16">
    <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">Enterprise Grade CTF Engine</h2>
    <p class="text-gray-400 max-w-xl mx-auto">Built from the ground up for stability, speed, and real-world attack scenarios.</p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Big Bento 1: Cloud Containers -->
    <div class="md:col-span-2 relative group p-8 rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/15 backdrop-blur-2xl overflow-hidden hover:border-blue-500/40 transition-all duration-500">
      <div class="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M8 19h8m-4-4v8"/></svg>
      </div>
      <h3 class="text-2xl font-bold text-white mb-2">Isolated On-Demand Instances</h3>
      <p class="text-gray-400 text-sm leading-relaxed max-w-md">Launch dedicated Docker containers per team with automatic lifecycle management and dedicated private ports.</p>
    </div>

    <!-- Small Bento 2: Dynamic Scoring -->
    <div class="relative group p-8 rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/15 backdrop-blur-2xl overflow-hidden hover:border-purple-500/40 transition-all duration-500">
      <div class="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
      </div>
      <h3 class="text-xl font-bold text-white mb-2">Dynamic Flag Decay</h3>
      <p class="text-gray-400 text-xs leading-relaxed">Score automatically scales dynamically based on solve volume to balance jeopardy competition tiers.</p>
    </div>
  </div>
</section>
```

---

### D. Interactive Console / CLI Box (Frosted Terminal)
- **Design:** Mini terminal box dengan 3 titik macOS di sudut kiri atas (`red`, `yellow`, `green`).
- **Surface:** `bg-black/70 border border-white/15 backdrop-blur-2xl rounded-2xl p-5 font-mono text-sm`
- **Isi Interaktif:** Kode command `tdctl login`, response JSON simulasi dengan syntax highlighting (`text-emerald-400`, `text-blue-400`, `text-yellow-300`).

---

## 4. Animation & Physics Specification

- **Scroll Reveal:** `opacity: 0, y: 20` -> `opacity: 1, y: 0` (480ms easeOut).
- **Glass Hover Spring:** `scale(1.025)`, `translateY(-4px)` dengan spring `stiffness: 120, damping: 20`.
- **Background Ambient Orbs:** 2-3 Radial gradients floating di background (`blur-[120px] opacity-30 animate-pulse` durasi 8-12 detik).
- **Reduced Motion:** Respect `prefers-reduced-motion: reduce` dengan mematikan blur animations dan scale transforms.
