"use client"
import { useState, useEffect } from "react"
import { analyticsService, activityService, workflowService } from "@/lib/services/api.service"
import { toast } from "sonner"
import { Loader2, TrendingUp, Users, Clock, ArrowUpRight, AlertTriangle, CheckCircle2 } from "lucide-react"

export function CRMDashboard() {
  const [data, setData] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsData, actData] = await Promise.all([
        analyticsService.getDashboard(),
        activityService.getRecent(),
      ])
      setData(statsData)
      setActivities(actData)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#CCFF00" }} />
        <p className="text-sm animate-pulse" style={{ color: "#999" }}>
          Loading dashboard metrics...
        </p>
      </div>
    )
  }

  const { stats } = data

  // Funnel data derived from real stats
  const totalCandidates = stats.totalCandidates || 0
  const pendingApplications = stats.pendingApplications || 0
  const acceptedApplications = stats.acceptedApplications || 0
  const totalRevenue = stats.totalRevenue || 0

  const funnelMax = totalCandidates || 1
  const funnelSteps = [
    { label: "Application", value: totalCandidates, color: "#CCFF00" },
    { label: "Interview", value: Math.round(totalCandidates * 0.51), color: "#CCFF00" },
    { label: "Offer", value: acceptedApplications + Math.round(acceptedApplications * 0.5), color: "#C084FC" },
    { label: "Financial Cleared", value: acceptedApplications, color: "#8B5CF6", isSpecial: true },
  ]

  // Weekly fiscal sparkline points (fake relative data)
  const sparkPoints = [
    { x: 0, y: 70 },
    { x: 25, y: 55 },
    { x: 50, y: 60 },
    { x: 75, y: 35 },
    { x: 100, y: 20 },
  ]

  const toPath = (pts: {x: number; y: number}[]) =>
    pts
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ")

  return (
    <div className="px-6 pb-8 space-y-5">

      {/* ── System Health ───────────────────────────────── */}
      <div className="flex items-center justify-end gap-1.5">
        <span className="text-[10px] tracking-widest uppercase" style={{ color: "#999" }}>
          System Health
        </span>
        <span className="text-[10px] font-bold" style={{ color: "#CCFF00" }}>
          99.8% Nominal
        </span>
      </div>

      {/* ── Stat Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Candidates */}
        <div
          className="p-5 rounded-2xl transition-all duration-300 hover:shadow-md"
          style={{ backgroundColor: "#fff", border: "1px solid #EEEEEA" }}
        >
          <div className="flex items-start justify-between mb-4">
            <Users className="w-5 h-5" style={{ color: "#333" }} />
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#E8FFB0", color: "#3A7200" }}
            >
              +12% vs LY
            </span>
          </div>
          <p className="text-[11px] tracking-widest uppercase mb-1" style={{ color: "#999" }}>
            Total Candidates
          </p>
          <p className="text-4xl font-bold tracking-tight" style={{ color: "#111", fontFamily: "Gilroy, sans-serif" }}>
            {totalCandidates.toLocaleString()}
          </p>
          <div
            className="mt-3 h-1 rounded-full"
            style={{ backgroundColor: "#CCFF00", width: "60%" }}
          />
        </div>

        {/* Pending Approvals */}
        <div
          className="p-5 rounded-2xl transition-all duration-300 hover:shadow-md"
          style={{ backgroundColor: "#fff", border: "1px solid #EEEEEA" }}
        >
          <div className="flex items-start justify-between mb-4">
            <Clock className="w-5 h-5" style={{ color: "#333" }} />
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#FFE4E4", color: "#CC2200" }}
            >
              Urgent
            </span>
          </div>
          <p className="text-[11px] tracking-widest uppercase mb-1" style={{ color: "#999" }}>
            Pending Approvals
          </p>
          <p className="text-4xl font-bold tracking-tight" style={{ color: "#111", fontFamily: "Gilroy, sans-serif" }}>
            {pendingApplications}
          </p>
          <div className="mt-3 flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full"
                style={{
                  backgroundColor:
                    i < Math.min(5, Math.ceil((pendingApplications / 200) * 5))
                      ? "#8B5CF6"
                      : "#EEE",
                }}
              />
            ))}
          </div>
        </div>

        {/* Total Revenue — dark card */}
        <div
          className="p-5 rounded-2xl transition-all duration-300 hover:shadow-lg"
          style={{ backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A" }}
        >
          <div className="flex items-start justify-between mb-4">
            <TrendingUp className="w-5 h-5" style={{ color: "#CCFF00" }} />
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse"
              style={{ backgroundColor: "#CCFF0020", color: "#CCFF00", border: "1px solid #CCFF0040" }}
            >
              Live Revenue
            </span>
          </div>
          <p className="text-[11px] tracking-widest uppercase mb-1" style={{ color: "#555" }}>
            Total Revenue
          </p>
          <p className="text-4xl font-bold tracking-tight" style={{ color: "#FFF", fontFamily: "Gilroy, sans-serif" }}>
            ${(totalRevenue / 1000000).toFixed(1)}M
          </p>
          <div className="flex items-center gap-1.5 mt-3">
            <ArrowUpRight className="w-3 h-3" style={{ color: "#CCFF00" }} />
            <span className="text-[10px]" style={{ color: "#CCFF00" }}>
              +1.6% from last quarter
            </span>
          </div>
        </div>
      </div>

      {/* ── Middle Row: Funnel + Fiscal ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Enrollment Funnel */}
        <div
          className="lg:col-span-3 p-5 rounded-2xl"
          style={{ backgroundColor: "#fff", border: "1px solid #EEEEEA" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3
                className="text-base font-bold"
                style={{ color: "#111", fontFamily: "Gilroy, sans-serif" }}
              >
                Enrollment Funnel
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "#999" }}>
                Candidate distribution across key stages
              </p>
            </div>
            <button
              className="text-[10px] font-bold px-3 py-1.5 rounded-full tracking-widest uppercase"
              style={{ backgroundColor: "#F0F0EB", color: "#555", border: "1px solid #DDD" }}
            >
              All Programs ↓
            </button>
          </div>

          <div className="space-y-4">
            {funnelSteps.map((step) => {
              const pct = Math.max(4, Math.round((step.value / funnelMax) * 100))
              return (
                <div key={step.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="text-[11px] font-bold tracking-widest uppercase"
                      style={{ color: step.isSpecial ? "#8B5CF6" : "#555" }}
                    >
                      {step.label}
                    </span>
                    <span
                      className="text-[11px] font-bold"
                      style={{ color: step.isSpecial ? "#8B5CF6" : "#333" }}
                    >
                      {step.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "#F0F0EB" }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: step.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Fiscal Momentum */}
        <div
          className="lg:col-span-2 p-5 rounded-2xl"
          style={{ backgroundColor: "#fff", border: "1px solid #EEEEEA" }}
        >
          <h3
            className="text-base font-bold mb-0.5"
            style={{ color: "#111", fontFamily: "Gilroy, sans-serif" }}
          >
            Fiscal Momentum
          </h3>
          <p className="text-xs mb-5" style={{ color: "#999" }}>
            Weekly payment trends analysis
          </p>

          {/* SVG sparkline */}
          <svg viewBox="0 0 100 80" className="w-full h-28" style={{ overflow: "visible" }}>
            <defs>
              <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Area fill */}
            <path
              d={`${toPath(sparkPoints)} L 100 80 L 0 80 Z`}
              fill="url(#sparkGrad)"
            />
            {/* Line */}
            <path
              d={toPath(sparkPoints)}
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* End dot */}
            <circle cx={sparkPoints[sparkPoints.length - 1].x} cy={sparkPoints[sparkPoints.length - 1].y} r="3" fill="#8B5CF6" />
            {/* Week labels */}
            {["W1", "W2", "W3", "W4"].map((w, i) => (
              <text key={w} x={i * 33} y="76" fontSize="5" fill="#BBB" textAnchor="middle">
                {w}
              </text>
            ))}
          </svg>

          <div
            className="flex items-center gap-2 mt-2 p-2.5 rounded-xl"
            style={{ backgroundColor: "#F5F5F0" }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#8B5CF620" }}
            >
              <ArrowUpRight className="w-3 h-3" style={{ color: "#8B5CF6" }} />
            </div>
            <div>
              <p className="text-[9px] tracking-widest uppercase" style={{ color: "#999" }}>
                Projection
              </p>
              <p className="text-sm font-bold" style={{ color: "#111" }}>
                +$240k Expected
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Alerts + Recent Movements ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* System Alerts */}
        <div className="lg:col-span-2 space-y-3">
          <p className="text-[10px] tracking-widest uppercase font-bold" style={{ color: "#999" }}>
            System Alerts
          </p>

          <div
            className="p-4 rounded-xl border-l-4"
            style={{ backgroundColor: "#FFF8F6", borderLeftColor: "#FF6B6B" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#FF6B6B" }} />
              <p className="text-[11px] font-bold" style={{ color: "#CC2200" }}>
                Financial Discrepancy
              </p>
            </div>
            <p className="text-[10px] pl-5" style={{ color: "#AA5555" }}>
              Batch #402 requires manual reconciliation.
            </p>
          </div>

          <div
            className="p-4 rounded-xl border-l-4"
            style={{ backgroundColor: "#FFFBF0", borderLeftColor: "#F59E0B" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#F59E0B" }} />
              <p className="text-[11px] font-bold" style={{ color: "#92400E" }}>
                High Volume Warning
              </p>
            </div>
            <p className="text-[10px] pl-5" style={{ color: "#AA8855" }}>
              Interview queue exceeded threshold.
            </p>
          </div>
        </div>

        {/* Recent Candidate Movements */}
        <div
          className="lg:col-span-3 p-5 rounded-2xl"
          style={{ backgroundColor: "#fff", border: "1px solid #EEEEEA" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-base font-bold"
              style={{ color: "#111", fontFamily: "Gilroy, sans-serif" }}
            >
              Recent Candidate Movements
            </h3>
            <button
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color: "#CCFF00", fontFamily: "Gilroy, sans-serif" }}
            >
              View All
            </button>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-4 mb-2">
            {["Candidate", "Program", "Stage", "Last Action"].map((h) => (
              <p key={h} className="text-[9px] tracking-widest uppercase font-bold" style={{ color: "#BBB" }}>
                {h}
              </p>
            ))}
          </div>

          {/* Table rows */}
          <div className="space-y-1">
            {data.recentApplications?.slice(0, 4).map((app: any, idx: number) => {
              const name = `${app.user.firstName} ${app.user.lastName}`
              const initials = `${app.user.firstName[0]}${app.user.lastName[0]}`
              const avatarColors = ["#CCFF00", "#C084FC", "#60A5FA", "#F59E0B"]
              const stageColors: Record<string, string> = {
                ACCEPTED: "#CCFF00",
                PENDING: "#C084FC",
                REJECTED: "#FF6B6B",
              }
              const stageTextColors: Record<string, string> = {
                ACCEPTED: "#3A7200",
                PENDING: "#5B21B6",
                REJECTED: "#CC2200",
              }
              return (
                <div
                  key={app.id}
                  className="grid grid-cols-4 items-center py-2.5 transition-colors duration-150 rounded-xl px-2 -mx-2"
                  style={{ borderBottom: idx < 3 ? "1px solid #F0F0EB" : "none" }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: avatarColors[idx % 4], color: "#111" }}
                    >
                      {initials}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold leading-tight" style={{ color: "#111" }}>
                        {name}
                      </p>
                      <p className="text-[9px]" style={{ color: "#AAA" }}>
                        ID: #{app.id?.slice(-5) || "00000"}
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px]" style={{ color: "#555" }}>
                    {app.program || "Internship"}
                  </p>
                  <div>
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full tracking-widest uppercase"
                      style={{
                        backgroundColor: `${stageColors[app.status] || "#EEE"}30`,
                        color: stageTextColors[app.status] || "#666",
                        border: `1px solid ${stageColors[app.status] || "#EEE"}60`,
                      }}
                    >
                      {app.status}
                    </span>
                  </div>
                  <p className="text-[10px]" style={{ color: "#AAA" }}>
                    {new Date(app.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )
            })}
            {(!data.recentApplications || data.recentApplications.length === 0) && (
              <p className="text-xs text-center py-8 italic" style={{ color: "#CCC" }}>
                No recent candidate movements
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
