export const SURFACE_GLASS_BASE_CLASS =
  "bg-gradient-to-b from-white/60 to-white/30 dark:from-[#111622]/80 dark:to-[#0d111a]/90 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.4)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.1)]"

export const SURFACE_GLASS_CARD_CLASS =
  `${SURFACE_GLASS_BASE_CLASS} rounded-2xl shadow-sm`

export const SURFACE_GLASS_CARD_COMPACT_CLASS =
  `${SURFACE_GLASS_BASE_CLASS} rounded-xl shadow-sm`

export const SURFACE_GLASS_CARD_INTERACTIVE_CLASS =
  `${SURFACE_GLASS_CARD_CLASS} transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:shadow-[0_12px_36px_rgba(59,130,246,0.15),inset_0_1px_1px_rgba(255,255,255,0.5)] dark:hover:shadow-[0_12px_36px_rgba(59,130,246,0.12),inset_0_1px_1px_rgba(255,255,255,0.2)]`

export const SURFACE_GLASS_CARD_INTERACTIVE_BLUE_CLASS =
  `${SURFACE_GLASS_CARD_INTERACTIVE_CLASS}`

export const SURFACE_INTERACTIVE_HOVER_CLASS =
  "transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:shadow-[0_12px_36px_rgba(59,130,246,0.15),inset_0_1px_1px_rgba(255,255,255,0.5)] dark:hover:shadow-[0_12px_36px_rgba(59,130,246,0.12),inset_0_1px_1px_rgba(255,255,255,0.2)]"

export const SURFACE_INTERACTIVE_FLAT_CLASS =
  "transition-all duration-200 hover:border-blue-500/40 hover:bg-white/85 dark:hover:bg-[#151b2a]"

export const SURFACE_NAVBAR_CLASS =
  "fixed top-0 left-0 z-50 w-full border-b border-white/20 bg-white/70 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-[#0b0f19]/80"

export const SURFACE_NAV_LINK_BASE_CLASS =
  "inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[15px] font-semibold caret-transparent transition-all duration-300 focus-visible:outline-none"

export const SURFACE_NAV_LINK_IDLE_CLASS =
  "text-gray-700 hover:bg-white/30 hover:text-blue-600 hover:backdrop-blur-md dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-blue-400"

export const SURFACE_NAV_LINK_ACTIVE_CLASS =
  "bg-gradient-to-b from-blue-400/20 to-blue-600/20 text-blue-600 border border-blue-500/30 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] dark:from-blue-500/20 dark:to-blue-700/20 dark:text-blue-300 dark:border-blue-500/30"

export const SURFACE_NAV_DROPDOWN_CLASS =
  "absolute left-0 top-full z-50 mt-3 min-w-[200px] overflow-hidden rounded-2xl border border-white/30 bg-white/70 text-gray-900 shadow-[0_16px_40px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.5)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#111622]/85 dark:text-gray-100 dark:shadow-[0_16px_40px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.1)]"

export const SURFACE_NAV_DROPDOWN_ITEM_CLASS =
  "block px-3.5 py-2.5 text-sm transition-all duration-200 hover:bg-blue-500/15 hover:text-blue-600 dark:hover:bg-blue-500/20 dark:hover:text-blue-300 hover:backdrop-blur-md"

export const SURFACE_GLASS_FIELD_CLASS =
  "w-full bg-white/70 dark:bg-[#111622]/80 backdrop-blur-md border border-gray-200/80 dark:border-gray-700/80 rounded-xl text-sm px-4 py-2 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 shadow-sm transition-all hover:border-blue-500/40 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"

export const SURFACE_GLASS_FIELD_COMPACT_CLASS =
  "w-full bg-white/70 dark:bg-[#111622]/80 backdrop-blur-md border border-gray-200/80 dark:border-gray-700/80 rounded-xl text-sm px-3 py-2 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 shadow-sm transition-all hover:border-blue-500/40 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"

export const SURFACE_GLASS_CONTROL_COMPACT_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200/80 bg-white/70 px-3 py-2 text-sm text-gray-700 caret-transparent shadow-sm backdrop-blur-md transition-all hover:border-blue-500/40 hover:bg-white focus-visible:outline-none focus-visible:border-blue-500/70 focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-0 dark:border-gray-700/80 dark:bg-[#111622]/80 dark:text-gray-200 dark:hover:bg-[#151b2a]"

export const SURFACE_FILTER_ITEM_CLASS =
  "bg-gradient-to-b from-white/40 to-white/10 dark:from-white/10 dark:to-white/5 backdrop-blur-xl border border-gray-300/40 dark:border-white/10 text-gray-800 dark:text-gray-200 caret-transparent shadow-[0_4px_16px_0_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.6)] dark:shadow-[0_4px_16px_0_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.1)] hover:from-white/60 hover:to-white/20 hover:text-blue-600 dark:hover:from-white/20 dark:hover:to-white/10 dark:hover:text-blue-300 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 transition-all duration-300 active:scale-[0.98]"

export const SURFACE_FILTER_ITEM_ACTIVE_CLASS =
  "bg-gradient-to-b from-blue-400/80 to-blue-600/80 dark:from-blue-500/50 dark:to-blue-700/50 border border-white/20 dark:border-white/20 text-white backdrop-blur-xl shadow-[0_8px_32px_0_rgba(37,99,235,0.3),inset_0_1px_1px_rgba(255,255,255,0.5)] dark:shadow-[0_8px_32px_0_rgba(37,99,235,0.25),inset_0_1px_1px_rgba(255,255,255,0.3)] rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 transition-all duration-300 active:scale-[0.98]"

export const SURFACE_GLASS_INPUT_CLASS =
  "h-12 w-full rounded-xl border border-gray-200/80 bg-white/70 px-4 text-sm text-gray-900 caret-blue-500 shadow-sm backdrop-blur-md outline-none transition-all placeholder:text-gray-500 hover:border-blue-500/40 focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700/80 dark:bg-[#111622]/80 dark:text-gray-100"

export const SURFACE_GLASS_TEXTAREA_CLASS =
  "w-full rounded-xl border border-gray-200/80 bg-white/70 px-4 py-2.5 text-sm text-gray-900 caret-blue-500 shadow-sm backdrop-blur-md outline-none transition-all placeholder:text-gray-500 hover:border-blue-500/40 focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700/80 dark:bg-[#111622]/80 dark:text-gray-100"

export const SURFACE_GLASS_SOFT_BASE_CLASS =
  "bg-white/60 dark:bg-[#111622]/70"
