import type { Metadata } from 'next'
import ScoreboardPage from '@/features/scoreboard/components/ScoreboardPage'
import { BASE_URL } from '@/_vars/const'

export const metadata: Metadata = {
  title: 'Live Scoreboard & Leaderboard | TDCTF Capture The Flag',
  description: 'Papan peringkat langsung (Live Scoreboard) kompetisi TDCTF Capture The Flag. Pantau skor real-time, grafik solve progresi, dan First Blood tim/peserta.',
  alternates: {
    canonical: `${BASE_URL}/scoreboard`,
  },
  openGraph: {
    title: 'Live Scoreboard & Leaderboard | TDCTF Capture The Flag',
    description: 'Papan peringkat kompetisi TDCTF secara real-time dengan grafik solve visual dan analitik performa peserta.',
    url: `${BASE_URL}/scoreboard`,
  },
}

export default function Page() {
  return <ScoreboardPage />
}
