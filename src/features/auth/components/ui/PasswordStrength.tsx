import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const RULES = [
  { label: 'At least 6 characters', test: (value: string) => value.length >= 6 },
  { label: 'Includes a number', test: (value: string) => /\d/.test(value) },
  { label: 'Includes mixed case', test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value) },
]

function getStrength(password: string) {
  if (!password) return 0
  return RULES.reduce((score, rule) => score + Number(rule.test(password)), 0)
}

export function PasswordStrength({ password }: { password: string }) {
  const strength = getStrength(password)
  const label = strength >= 3 ? 'Strong' : strength >= 2 ? 'Good' : 'Weak'
  const barClass = strength >= 3 ? 'bg-emerald-500' : strength >= 2 ? 'bg-orange-500' : 'bg-red-500'

  return (
    <div className="space-y-2.5 rounded-xl border border-white/8 bg-white/3 p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-gray-400">Password strength</span>
        <span className={cn(
          'font-semibold',
          strength >= 3 ? 'text-emerald-400' : strength >= 2 ? 'text-orange-400' : 'text-red-400'
        )}>{label}</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={cn(
              'h-1 rounded-full bg-white/10 transition-colors duration-300',
              strength > index && barClass
            )}
          />
        ))}
      </div>
      <div className="grid gap-1.5 text-xs text-gray-600">
        {RULES.map((rule) => {
          const passed = rule.test(password)
          const Icon = passed ? CheckCircle2 : Circle

          return (
            <div
              key={rule.label}
              className={cn(
                'flex items-center gap-1.5 transition-colors',
                passed && 'text-emerald-400'
              )}
            >
              <Icon className="h-3 w-3" />
              <span>{rule.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function PasswordMatchIndicator({
  password,
  confirmPassword,
}: {
  password: string
  confirmPassword: string
}) {
  if (!confirmPassword) return null

  const matches = password === confirmPassword

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-xs font-medium',
        matches ? 'text-emerald-400' : 'text-red-400'
      )}
    >
      {matches ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
      <span>{matches ? 'Passwords match' : 'Passwords do not match'}</span>
    </div>
  )
}
