'use client'

import { DashboardLayout } from '@/components/dashboard/layout-wrapper'
import { Header } from '@/components/dashboard/header'
import { ReportsDashboard } from '@/components/reports/reports-dashboard'

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Header title="Reports" description="CRM analytics and performance metrics" />
        <ReportsDashboard />
      </div>
    </DashboardLayout>
  )
}
