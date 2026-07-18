import React from 'react'
import { Inbox } from 'lucide-react'
import EmptyState from '@/shared/components/EmptyState'

interface AdminEmptyStateProps {
  title?: string
  description?: React.ReactNode
  action?: React.ReactNode
}

export default function AdminEmptyState({
  title = "No data found",
  description = "Try adjusting your filters or search terms.",
  action,
}: AdminEmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-10">
      <EmptyState
        icon={<Inbox className="w-8 h-8 text-gray-400 dark:text-gray-500" />}
        title={title}
        description={description}
        containerHeight="py-2"
        action={action}
      />
    </div>
  )
}
