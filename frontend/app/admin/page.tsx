import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { CRMDashboard } from "@/components/dashboard/crm-dashboard"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#F7F7F2" }}>
      {/* Sidebar */}
      <div className="hidden lg:block w-56 shrink-0" />
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <Header
          title="Institutional Pulse"
          description="Comprehensive analysis of current enrollment trajectories and fiscal performance for Q3 Academic Cycle."
          actions={
            <>
              <Link href="/admin/candidates">
                <Button
                  className="h-9 text-sm font-bold rounded-full px-5 transition-all duration-200 hover:opacity-90 hover:scale-105"
                  style={{ backgroundColor: "#CCFF00", color: "#111", border: "none" }}
                >
                  + New Candidate
                </Button>
              </Link>
              <Button
                variant="outline"
                className="h-9 text-sm rounded-full px-5 transition-all duration-200 hover:scale-105"
                style={{ borderColor: "#DDD", color: "#555", backgroundColor: "transparent" }}
              >
                Export Report
              </Button>
            </>
          }
        />

        <CRMDashboard />
      </main>
    </div>
  )
}
