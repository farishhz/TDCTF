import { X, Megaphone, Server, Flag, Skull, Lightbulb } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import ImageWithFallback from '@/shared/components/ImageWithFallback'

function getToastIcon(level: string) {
  switch (level) {
    case 'info_challenges':
      return { Icon: Flag, bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20', text: 'text-emerald-400', progressColor: 'bg-emerald-500' }
    case 'info_platform':
      return { Icon: Server, bg: 'bg-indigo-500/10', ring: 'ring-indigo-500/20', text: 'text-indigo-400', progressColor: 'bg-indigo-500' }
    case 'info':
      return { Icon: Megaphone, bg: 'bg-orange-500/10', ring: 'ring-orange-500/20', text: 'text-orange-400', progressColor: 'bg-orange-500' }
    case 'hint':
      return { Icon: Lightbulb, bg: 'bg-amber-500/10', ring: 'ring-amber-500/20', text: 'text-amber-400', progressColor: 'bg-amber-500' }
    default:
      return { Icon: Flag, bg: 'bg-blue-500/10', ring: 'ring-blue-500/20', text: 'text-blue-400', progressColor: 'bg-blue-500' }
  }
}

type NotificationToastProps = {
  solveToasts: Array<{ id: string; username: string; challenge: string; isFirstBlood?: boolean; picture?: string | null; points?: number; teamName?: string | null }>
  notifToasts: Array<{ id: string; title: string; message: string; level: string }>
  onDismissSolve: (id: string) => void
  onDismissToast: (id: string) => void
}

export default function NotificationToast({
  solveToasts,
  notifToasts,
  onDismissSolve,
  onDismissToast,
}: NotificationToastProps) {
  // Limit total visible toasts to 3
  const MAX_VISIBLE_TOASTS = 3
  const totalToasts = solveToasts.length + notifToasts.length
  const hasOverflow = totalToasts > MAX_VISIBLE_TOASTS

  // Prioritize showing newest toasts: solve toasts first, then notif toasts
  let remaining = MAX_VISIBLE_TOASTS
  const visibleSolveToasts = solveToasts.slice(0, remaining)
  remaining -= visibleSolveToasts.length
  const visibleNotifToasts = notifToasts.slice(0, Math.max(0, remaining))

  return (
    <div className="fixed top-4 right-4 z-[5000] flex flex-col gap-3 pointer-events-none" style={{ width: '100%', maxWidth: 380 }}>
      {/* Solve notifications */}
      {visibleSolveToasts.map((toast) => (
        toast.isFirstBlood ? (
          <div
            key={toast.id}
            className="pointer-events-auto relative overflow-hidden flex flex-col gap-2 rounded-2xl border border-red-500/40 bg-gradient-to-b from-red-950/80 via-black/85 to-red-950/60 backdrop-blur-xl px-4 py-3.5 shadow-[0_8px_32px_rgba(239,68,68,0.25),inset_0_1px_1px_rgba(255,255,255,0.2)] animate-toast-in animate-blood-shake hover:border-red-500/60 transition-all duration-300"
          >
            <div className="flex gap-3.5 items-center relative z-10">
              {/* Profile Image with Skull Badge Overlay */}
              <div className="relative shrink-0">
                <div className="rounded-full p-[2px] bg-gradient-to-tr from-red-600/30 via-red-500/70 to-rose-500/30 shadow-md">
                  <ImageWithFallback
                    src={toast.picture}
                    alt={toast.username}
                    size={42}
                    rounded={true}
                    className="h-[42px] w-[42px] rounded-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-red-400 bg-red-600 text-white shadow-sm shadow-red-950/50">
                  <Skull size={10} />
                </div>
              </div>

              {/* Info Column */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 leading-none">
                    <span className="truncate text-[13px] font-black text-gray-100">{toast.username}</span>
                    <span className="shrink-0 bg-gradient-to-r from-red-600 to-rose-600 border border-white/20 text-white font-black px-2 py-0.5 rounded-full text-[8px] tracking-wider font-mono shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">FIRST BLOOD</span>
                  </div>
                  {toast.teamName && (
                    <span className="truncate text-[10px] font-semibold text-gray-400 leading-none">
                      Team: <span className="text-gray-200 font-bold">{toast.teamName}</span>
                    </span>
                  )}
                </div>
                <div className="mt-2 text-[12px] leading-tight text-gray-200 font-semibold">
                  secured first blood on <span className="font-extrabold text-red-400">{toast.challenge}</span> <span className="text-rose-400 font-extrabold">(+{toast.points || 0} pts)</span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => onDismissSolve(toast.id)}
                className="shrink-0 self-start -mt-1 -mr-1 rounded-full p-1 text-gray-400 transition-all hover:bg-white/10 hover:text-gray-200 active:scale-95"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>

            {/* Animated progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-red-950/40">
              <div className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600 animate-toast-progress-12s shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            </div>
          </div>
        ) : (
          <div
            key={toast.id}
            className="pointer-events-auto relative overflow-hidden flex flex-col gap-2 rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/80 via-black/85 to-emerald-950/60 backdrop-blur-xl px-4 py-3.5 shadow-[0_8px_32px_rgba(16,185,129,0.2),inset_0_1px_1px_rgba(255,255,255,0.2)] transition-all duration-300 hover:border-emerald-500/60 animate-toast-in"
          >
            <div className="flex gap-3.5 items-center relative z-10">
              {/* Profile Image with Flag Badge Overlay */}
              <div className="relative shrink-0">
                <div className="rounded-full p-[2px] bg-gradient-to-tr from-emerald-600/30 via-emerald-500/70 to-teal-500/30 shadow-md">
                  <ImageWithFallback
                    src={toast.picture}
                    alt={toast.username}
                    size={42}
                    rounded={true}
                    className="h-[42px] w-[42px] rounded-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-emerald-400 bg-emerald-600 text-white shadow-sm shadow-emerald-950/50">
                  <Flag size={10} />
                </div>
              </div>

              {/* Info Column */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="truncate text-[13px] font-black text-gray-100">{toast.username}</span>
                  {toast.teamName && (
                    <span className="truncate text-[10px] font-semibold text-gray-400 leading-none">
                      Team: <span className="text-gray-200 font-bold">{toast.teamName}</span>
                    </span>
                  )}
                </div>
                <div className="mt-2 text-[12px] leading-tight text-gray-200 font-semibold">
                  just solved <span className="font-extrabold text-blue-400">{toast.challenge}</span> <span className="text-emerald-400 font-extrabold">(+{toast.points || 0} pts)</span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => onDismissSolve(toast.id)}
                className="shrink-0 self-start -mt-1 -mr-1 rounded-full p-1 text-gray-400 transition-all hover:bg-white/10 hover:text-gray-200 active:scale-95"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>

            {/* Animated progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#0c2419]">
              <div className="h-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-toast-progress-12s" />
            </div>
          </div>
        )
      ))}

      {/* Stacked notification toasts */}
      {visibleNotifToasts.map((toast) => {
        const { Icon, bg, ring, text, progressColor } = getToastIcon(toast.level)
        return (
          <div
            key={toast.id}
            className="pointer-events-auto relative overflow-hidden flex flex-col gap-2 rounded-xl border border-gray-800/80 bg-[#0d1117]/90 backdrop-blur-md px-4 py-3.5 shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all hover:border-gray-700 animate-toast-in"
          >
            {/* Top Row: Icon, Title, Close */}
            <div className="flex items-center gap-2.5 relative z-10">
              <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1", bg, ring)}>
                <Icon size={14} className={text} />
              </div>
              <span className="truncate text-[13px] font-bold text-gray-100">{toast.title}</span>

              <button
                onClick={() => onDismissToast(toast.id)}
                className="ml-auto shrink-0 rounded p-1 text-gray-400 transition-all hover:bg-white/10 hover:text-gray-300"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>

            {/* Bottom Row: Description - max 3 lines */}
            {toast.message && (
              <div className="text-[11px] leading-normal text-gray-400 line-clamp-3 whitespace-pre-line break-words relative z-10">
                {toast.message}
              </div>
            )}

            {/* Animated progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-950">
              <div className={cn("h-full", progressColor, "animate-toast-progress-15s")} />
            </div>
          </div>
        )
      })}

      {/* Overflow indicator */}
      {hasOverflow && (
        <div className="pointer-events-none text-center text-[10px] text-gray-500 font-medium tracking-wide">
          +{totalToasts - MAX_VISIBLE_TOASTS} more
        </div>
      )}
    </div>
  )
}
