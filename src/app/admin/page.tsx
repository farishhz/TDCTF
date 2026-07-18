"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/features/auth'
import { useAuth } from '@/shared/contexts/AuthContext'
import { AdminContentLoading } from '@/features/admin/ui'

export default function Page() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    const routeAdminEntry = async () => {
      if (loading) return

      if (!user) {
        router.replace('/challenges')
        return
      }

      const scope = await AuthService.getAdminScope()
      if (scope.is_global_admin) {
        router.replace('/admin/overview')
        return
      }

      if (scope.event_ids.length > 0) {
        router.replace('/admin/challenges')
        return
      }

      router.replace('/challenges')
    }

    void routeAdminEntry()
  }, [loading, router, user])

  return <AdminContentLoading variant="overview" />
}
