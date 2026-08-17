import { Metadata } from 'next'
import { AdminAnnouncementsPage } from '@/features/admin/announcements'
import APP from '@/config'

export const metadata: Metadata = {
  title: `Announcement Studio - Admin ${APP.shortName}`,
  description: 'Kelola siaran pengumuman, liquid glass popup, sticky banner, dan notification center',
}

export default function Page() {
  return <AdminAnnouncementsPage />
}
