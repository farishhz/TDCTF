import type { Metadata } from 'next'
import { BASE_URL } from '@/_vars/const'

export const metadata: Metadata = {
  title: 'About Platform & Ecosystem | TDCTF Capture The Flag',
  description: 'Informasi arsitektur, open-source repository, dan ekosistem infrastruktur TDCTF (tdctf, tdctl, tdbot, tdbcl) yang dikembangkan oleh Tenka Developer.',
  alternates: {
    canonical: `${BASE_URL}/info`,
  },
  openGraph: {
    title: 'About Platform & Ecosystem | TDCTF Capture The Flag',
    description: 'Informasi arsitektur, open-source repository, dan ekosistem infrastruktur TDCTF.',
    url: `${BASE_URL}/info`,
  },
}

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return children
}
