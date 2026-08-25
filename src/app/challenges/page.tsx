import type { Metadata } from 'next'
import ChallengesPage from '@/features/challenges/components/ChallengesPage'
import APP from '@/config'
import { BASE_URL } from '@/_vars/const'

export const metadata: Metadata = {
  title: 'Challenges Arena | TDCTF Capture The Flag',
  description: 'Akses arena tantangan CTF interaktif: Web Exploitation, Cryptography, Reverse Engineering, Forensics, Binary Exploitation (Pwn), dan Blockchain Security.',
  alternates: {
    canonical: `${BASE_URL}/challenges`,
  },
  openGraph: {
    title: 'Challenges Arena | TDCTF Capture The Flag',
    description: 'Akses arena tantangan CTF interaktif dengan isolasi instance container Docker on-demand dan dynamic scoring.',
    url: `${BASE_URL}/challenges`,
  },
}

export default function Page() {
  return <ChallengesPage />
}
