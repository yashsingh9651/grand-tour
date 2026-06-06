'use client'

import { DashboardLayout } from '@/components/dashboard/layout-wrapper'
import { Header } from '@/components/dashboard/header'
import { CandidatesTable } from '@/components/candidates/candidates-table'

export default function CandidatesPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Header title="Candidates" description="Manage all candidates in your pipeline" />
        <CandidatesTable initialStatus="approved" />
      </div>
    </DashboardLayout>
  )
}
