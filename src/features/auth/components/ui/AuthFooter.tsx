import Link from 'next/link'

interface AuthFooterProps {
  text: string
  href: string
  linkText: string
}

export function AuthFooter({ text, href, linkText }: AuthFooterProps) {
  return (
    <p className="mt-5 text-center text-sm text-gray-600">
      {text}{' '}
      <Link
        href={href}
        className="font-semibold text-blue-400 transition-colors hover:text-blue-300"
      >
        {linkText}
      </Link>
    </p>
  )
}
