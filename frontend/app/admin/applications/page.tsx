'use client'

import { DashboardLayout } from '@/components/dashboard/layout-wrapper'
import { Header } from '@/components/dashboard/header'
import { CandidatesTable } from '@/components/candidates/candidates-table'
import { ApplicationPageContentEditor } from '@/components/admin/application-page-content-editor'

export default function ApplicationsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Header 
          title="Applications" 
          description="Manage new internship applications and control the student-facing application page content" 
        />
        {/* <ApplicationPageContentEditor /> */}
        <CandidatesTable initialStatus="pending" />
      </div>
    </DashboardLayout>
  )
}
