import type { Metadata } from 'next'
import { BASE_URL } from '@/_vars/const'

export const metadata: Metadata = {
  title: 'Register Competitor Account | TDCTF Capture The Flag',
  description: 'Daftar akun peserta atau bentuk tim baru di platform TDCTF Capture The Flag. Ikuti kompetisi keamanan siber, pecahkan tantangan, dan raih peringkat puncak.',
  alternates: {
    canonical: `${BASE_URL}/register`,
  },
  openGraph: {
    title: 'Register Competitor Account | TDCTF Capture The Flag',
    description: 'Daftar akun peserta di platform TDCTF Capture The Flag.',
    url: `${BASE_URL}/register`,
  },
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
