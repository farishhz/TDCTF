import React from 'react'
import { ShieldCheck } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui'
import { ADMIN_ROW_CLASS, AdminDataSurface, AdminEmptyState, AdminTableSurface } from '@/features/admin/ui'
import type { UserLite } from '../types'

interface GlobalAdminsCardProps {
  admins: UserLite[]
}

const GlobalAdminsCard: React.FC<GlobalAdminsCardProps> = ({ admins }) => {
  return (
    <AdminDataSurface
      toolbar={(
        <div className="flex items-center gap-2 border-b border-gray-150 px-5 py-4 dark:border-gray-800/60">
        <ShieldCheck size={16} className="text-blue-500" />
        <h2 className="text-base font-bold text-gray-900 dark:text-white">Global Admins</h2>
      </div>
      )}
      empty={admins.length === 0 ? (
        <AdminEmptyState
          title="No global admins found"
          description="Global admins will appear here."
        />
      ) : null}
    >
        <AdminTableSurface>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200/80 hover:bg-transparent dark:border-gray-800">
                <TableHead className="pl-6 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Username</TableHead>
                <TableHead className="pr-6 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">User ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id} className={ADMIN_ROW_CLASS}>
                  <TableCell className="pl-6 font-medium">{admin.username}</TableCell>
                  <TableCell className="pr-6 font-mono text-xs text-muted-foreground">{admin.id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AdminTableSurface>
    </AdminDataSurface>
  )
}

export default GlobalAdminsCard
