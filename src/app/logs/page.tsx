import type { Metadata } from "next"
import LogsPageContent from "@/features/logs/components/LogsPageContent"
import { BASE_URL } from "@/_vars/const"

export const metadata: Metadata = {
  title: "Solve Activity & First Blood Logs | TDCTF Capture The Flag",
  description: "Log aktivitas solve, submission flag real-time, dan pencapaian First Blood peserta di platform TDCTF Capture The Flag.",
  alternates: {
    canonical: `${BASE_URL}/logs`,
  },
  openGraph: {
    title: "Solve Activity & First Blood Logs | TDCTF Capture The Flag",
    description: "Pantau solve submission dan riwayat penaklukan tantangan CTF secara live.",
    url: `${BASE_URL}/logs`,
  },
}

export default function LogsPage() {
  return <LogsPageContent />
}
