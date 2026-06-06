'use client'

import { DashboardLayout } from '@/components/dashboard/layout-wrapper'
import { Header } from '@/components/dashboard/header'
import { SearchResults } from '@/components/search/search-results'

export default function SearchPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Header
          title="Search"
          description="Find candidates, workflows, documents, and more"
        />
        <SearchResults />
      </div>
    </DashboardLayout>
  )
}
