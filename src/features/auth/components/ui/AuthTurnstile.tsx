import { Turnstile } from '@marsidev/react-turnstile'

type AuthTurnstileProps = {
  turnstileKey: number
  siteKey: string
  onSuccess: (token: string) => void
  onExpire: () => void
}

export function AuthTurnstile({
  turnstileKey,
  siteKey,
  onSuccess,
  onExpire,
}: AuthTurnstileProps) {
  return (
    <Turnstile
      key={turnstileKey}
      siteKey={siteKey}
      className="w-full"
      onSuccess={onSuccess}
      onExpire={onExpire}
      options={{
        theme: 'light',
        size: 'flexible',
      }}
    />
  )
}
