export function AuthDivider({ label = 'or' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-white/8" />
      <span className="text-xs font-medium uppercase tracking-wider text-gray-600">
        {label}
      </span>
      <div className="h-px flex-1 bg-white/8" />
    </div>
  )
}
