import type { Metadata } from 'next'
import { BASE_URL } from '@/_vars/const'

export const metadata: Metadata = {
  title: 'Rules & Code of Conduct | TDCTF Capture The Flag',
  description: 'Aturan resmi, pedoman etika kompetisi, dan ketentuan partisipasi di platform Capture The Flag TDCTF. Play fair, hack hard.',
  alternates: {
    canonical: `${BASE_URL}/rules`,
  },
  openGraph: {
    title: 'Rules & Code of Conduct | TDCTF Capture The Flag',
    description: 'Aturan resmi dan pedoman etika kompetisi Capture The Flag TDCTF.',
    url: `${BASE_URL}/rules`,
  },
}

export default function RulesLayout({ children }: { children: React.ReactNode }) {
  return children
}
