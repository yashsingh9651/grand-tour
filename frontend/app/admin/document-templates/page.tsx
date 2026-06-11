'use client'

import { DashboardLayout } from '@/components/dashboard/layout-wrapper'
import { Header } from '@/components/dashboard/header'
import DocumentTemplatesManager from '@/components/document-templates/document-templates-manager'

export default function DocumentTemplatesPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Header title="Document Templates" description="Create and manage reusable document templates with dynamic variables" />
        <DocumentTemplatesManager />
      </div>
    </DashboardLayout>
  )
}
