import type { Metadata } from 'next'
import { BASE_URL } from '@/_vars/const'

// Person JSON-LD for Alfarisi Azmir is declared once canonically in the root layout.tsx.
// It does NOT need to be re-injected here. The canonical entity at:
//   @id: BASE_URL/#person-alfarisi-azmir
// is already present sitewide. The /info page reinforces the entity relationship
// through its visible content (Creator & Lead Architect section), which is the
// correct way to strengthen entity signals — not by duplicating JSON-LD blocks.

export const metadata: Metadata = {
  // Accurately reflects page content: platform architecture + ecosystem + founder context
  title: 'About TDCTF — Platform, Ecosystem & Founder',
  description: 'Informasi arsitektur platform, open-source repository, dan ekosistem infrastruktur TDCTF (tdctf, tdctl, tdbot, tdbcl) — dikembangkan oleh Alfarisi Azmir (farishhz), founder & lead developer TDCTF.',
  alternates: {
    canonical: `${BASE_URL}/info`,
  },
  openGraph: {
    title: 'About TDCTF — Platform, Ecosystem & Founder | Capture The Flag',
    description: 'Informasi arsitektur, open-source repository, dan ekosistem infrastruktur TDCTF yang dikembangkan oleh Alfarisi Azmir.',
    url: `${BASE_URL}/info`,
  },
}

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return children
}
