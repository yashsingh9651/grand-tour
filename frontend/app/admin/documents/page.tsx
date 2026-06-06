'use client'

import { DashboardLayout } from '@/components/dashboard/layout-wrapper'
import { Header } from '@/components/dashboard/header'
import { DocumentsTable } from '@/components/documents/documents-table'

export default function DocumentsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Header title="Documents" description="Review and approve candidate documents" />
        <DocumentsTable />
      </div>
    </DashboardLayout>
  )
}
