'use client'

import { DashboardLayout } from '@/components/dashboard/layout-wrapper'
import { Header } from '@/components/dashboard/header'
import { InterviewCalendar } from '@/components/interviews/interview-calendar'

export default function InterviewsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Header title="Interviews" description="Schedule and manage interviews" />
        <InterviewCalendar />
      </div>
    </DashboardLayout>
  )
}
