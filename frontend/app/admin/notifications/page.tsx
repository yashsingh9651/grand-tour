'use client'

import { DashboardLayout } from '@/components/dashboard/layout-wrapper'
import { Header } from '@/components/dashboard/header'
import { NotificationsPanel } from '@/components/notifications/notifications-panel'

export default function NotificationsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Header
          title="Notifications"
          description="Manage and view all system notifications"
        />
        <NotificationsPanel />
      </div>
    </DashboardLayout>
  )
}
