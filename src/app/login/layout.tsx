import type { Metadata } from 'next'
import { BASE_URL } from '@/_vars/const'

export const metadata: Metadata = {
  title: 'Sign In | TDCTF Capture The Flag',
  description: 'Masuk ke akun TDCTF Anda untuk mengakses arena tantangan Capture The Flag, instansiasi server container, dan live scoreboard.',
  alternates: {
    canonical: `${BASE_URL}/login`,
  },
  openGraph: {
    title: 'Sign In | TDCTF Capture The Flag',
    description: 'Masuk ke platform TDCTF Capture The Flag.',
    url: `${BASE_URL}/login`,
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
