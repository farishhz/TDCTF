'use client'

import Loader from '@/shared/components/Loader'

type AdminContentLoadingProps = {
  variant?: 'overview' | 'challenges' | 'event' | 'solvers' | 'users' | 'admins' | 'services' | 'audit-logs'
}

export default function AdminContentLoading(_props: AdminContentLoadingProps) {
  return (
    <div className="flex w-full items-center justify-center" style={{ minHeight: 'calc(100dvh - 100px)' }}>
      <Loader size={40} />
    </div>
  )
}
