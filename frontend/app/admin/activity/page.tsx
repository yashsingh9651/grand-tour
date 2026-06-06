'use client'

import { DashboardLayout } from '@/components/dashboard/layout-wrapper'
import { Header } from '@/components/dashboard/header'
import { ActivityLogsTable } from '@/components/activity/activity-logs-table'

export default function ActivityPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Header title="Activity Logs" description="Audit trail of all admin actions" />
        <ActivityLogsTable />
      </div>
    </DashboardLayout>
  )
}
