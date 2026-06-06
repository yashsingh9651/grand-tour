'use client'

import { DashboardLayout } from '@/components/dashboard/layout-wrapper'
import { Header } from '@/components/dashboard/header'
import { UsersTable } from '@/components/users/users-table'

export default function UsersPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Header title="Users" description="Manage team members and permissions" />
        <UsersTable />
      </div>
    </DashboardLayout>
  )
}
