import { AdminStatusBadge, type AdminStatusBadgeTone } from '@/features/admin/ui'
import type { AdminServiceStatus } from '../types'

const STATUS_LABEL: Record<AdminServiceStatus, string> = {
  running: 'Running',
  stopped: 'Stopped',
  container_only: 'Container only',
  expired: 'Expired',
  error: 'Error',
  unknown: 'Unknown',
}

const STATUS_TONE: Record<AdminServiceStatus, AdminStatusBadgeTone> = {
  running: 'success',
  stopped: 'neutral',
  container_only: 'success',
  expired: 'warning',
  error: 'danger',
  unknown: 'muted',
}

type AdminServiceStatusBadgeProps = {
  status: AdminServiceStatus
}

export default function AdminServiceStatusBadge({ status }: AdminServiceStatusBadgeProps) {
  return (
    <AdminStatusBadge tone={STATUS_TONE[status]}>
      {STATUS_LABEL[status]}
    </AdminStatusBadge>
  )
}
