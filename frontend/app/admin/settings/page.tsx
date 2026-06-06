'use client'

import { DashboardLayout } from "@/components/dashboard/layout-wrapper"
import { Header } from "@/components/dashboard/header"
import { SettingsContent } from "@/components/settings/settings-content"

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Header title="Settings" description="Manage your account preferences and application settings." />
        <SettingsContent />
      </div>
    </DashboardLayout>
  )
}
