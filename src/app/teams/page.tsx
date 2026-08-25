import type { Metadata } from 'next'
import TeamsPage from '@/features/teams/components/TeamsPage'
import { BASE_URL } from '@/_vars/const'

export const metadata: Metadata = {
  title: 'Teams Management & Leaderboard | TDCTF Capture The Flag',
  description: 'Manajemen tim kompetisi TDCTF Capture The Flag. Buat tim, undang anggota tim, dan berkolaborasi dalam menyelesaikan tantangan keamanan siber.',
  alternates: {
    canonical: `${BASE_URL}/teams`,
  },
  openGraph: {
    title: 'Teams Management & Leaderboard | TDCTF Capture The Flag',
    description: 'Bentuk tim CTF, kolaborasi pemecahan bendera, dan raih posisi teratas di arena TDCTF.',
    url: `${BASE_URL}/teams`,
  },
}

export default function Page() {
  return <TeamsPage />
}
