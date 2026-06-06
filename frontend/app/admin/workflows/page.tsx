'use client'

import { DashboardLayout } from '@/components/dashboard/layout-wrapper'
import { Header } from '@/components/dashboard/header'
import { WorkflowsList } from '@/components/workflows/workflows-list'

export default function WorkflowsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Header title="Workflows" description="Create and manage your custom workflows" />
        <WorkflowsList />
      </div>
    </DashboardLayout>
  )
}
