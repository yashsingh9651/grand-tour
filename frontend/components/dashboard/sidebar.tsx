"use client"

import {
  LayoutDashboard,
  Zap,
  Users,
  Calendar,
  FileText,
  BarChart3,
  Activity,
  Settings,
  Search,
  Bell,
  LogOut,
  ShieldCheck,
  Loader2,
  CreditCard,
  Building2,
  Mail,
  Plus,
  HelpCircle,
  Workflow,
  ClipboardList,
  Briefcase,
  Stamp,
  Plane,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { permissionService } from "@/lib/services/api.service"

type MenuItem = {
  icon?: any
  label: string
  href?: string
  feature?: string
  badge?: string
  children?: MenuItem[]
}

const ALL_MENU_ITEMS: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin", feature: "dashboard" },
  { icon: Users, label: "Candidates", href: "/admin/candidates", feature: "candidates" },
  { icon: Building2, label: "Hotels", href: "/admin/hotels", feature: "hotels" },
  { icon: Activity, label: "Audit Logs", href: "/admin/activity", feature: "activity", badge: "3" },
  { icon: ShieldCheck, label: "Approvals", href: "/admin/applications", feature: "applications", badge: "New" },
  {
    icon: Workflow,
    label: "Workflows",
    href: "/admin/workflows",
    feature: "workflows",
    children: [
      { label: "Applications Step Editor", href: "/admin/steps/applications", feature: "applications" },
      { label: "Documents Step Editor", href: "/admin/steps/documents", feature: "documents" },
      { label: "Payment Step Editor", href: "/admin/steps/payment", feature: "payments" },
      { label: "Visa Payments Step Editor", href: "/admin/steps/visapayments", feature: "payments" },
    ],
  },
  { icon: Calendar, label: "Interviews", href: "/admin/interviews", feature: "interviews" },
  { icon: FileText, label: "Documents", href: "/admin/documents", feature: "documents" },
  { icon: ClipboardList, label: "Contracts", href: "/admin/contracts", feature: "documents" },
  { icon: CreditCard, label: "Payments", href: "/admin/payments", feature: "payments", badge: "New" },
  { icon: Briefcase, label: "Work Permits", href: "/admin/workpermit", feature: "workpermit" },
  { icon: Stamp, label: "Visa", href: "/admin/visa", feature: "visa" },
  { icon: Plane, label: "Travel", href: "/admin/travel", feature: "travel" },
  { icon: Users, label: "Users", href: "/admin/users", feature: "users" },
  { icon: BarChart3, label: "Reports", href: "/admin/reports", feature: "reports" },
  { icon: Bell, label: "Notifications", href: "/admin/notifications", feature: "notifications" },
  { icon: Mail, label: "Email Templates", href: "/admin/emails", feature: "emails" },
  { icon: Search, label: "Search", href: "/admin/search", feature: "search" },
]

const filterMenuItems = (items: MenuItem[], allowedFeatures: string[], userRole: string): MenuItem[] => {
  return items.reduce<MenuItem[]>((acc, item) => {
    const hasAccess = !item.feature || userRole === "SUPER_ADMIN" || allowedFeatures.includes(item.feature)
    const filteredChildren = item.children ? filterMenuItems(item.children, allowedFeatures, userRole) : []
    const hasVisibleChildren = filteredChildren.length > 0

    if (hasAccess || hasVisibleChildren) {
      acc.push({
        ...item,
        children: hasVisibleChildren ? filteredChildren : undefined,
      })
    }

    return acc
  }, [])
}

export function Sidebar() {
  const { data: session } = useSession()
  const [allowedFeatures, setAllowedFeatures] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  const user = session?.user as any
  const userRole = user?.role || "ADMIN"

  useEffect(() => {
    async function fetchPermissions() {
      try {
        if (!userRole) return
        const allPermissions = await permissionService.getAll()
        const myPermission = allPermissions.find((p: any) => p.role === userRole)
        if (myPermission) {
          setAllowedFeatures(myPermission.features)
        } else if (userRole === "SUPER_ADMIN") {
          const fallbackFeatures = ALL_MENU_ITEMS.flatMap((item) => (item.feature ? [item.feature] : []))
          setAllowedFeatures([...fallbackFeatures, "settings"])
        }
      } catch (error) {
        console.error("Failed to fetch permissions", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPermissions()
  }, [userRole])

  const filteredMenuItems = filterMenuItems(ALL_MENU_ITEMS, allowedFeatures, userRole)

  const showSettings = userRole === "SUPER_ADMIN" || allowedFeatures.includes("settings")

  return (
    <aside
      className="fixed top-0 left-0 w-56 h-screen flex flex-col"
      style={{ backgroundColor: "#141414", borderRight: "1px solid #222" }}
    >
      {/* Brand */}
      <div className="px-5 pt-6 pb-4">
        <Link href="/" className="block">
          <p
            className="text-xl font-bold tracking-tight leading-none"
            style={{ color: "#CCFF00", fontFamily: "Gilroy, sans-serif" }}
          >
            Grand Tour
          </p>
          <p
            className="text-[10px] tracking-widest uppercase mt-0.5"
            style={{ color: "#555" }}
          >
            Command Center
          </p>
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#CCFF00" }} />
          </div>
        ) : (
          <nav className="space-y-1">
            {filteredMenuItems.map((item) => {
              const hasChildren = Boolean(item.children?.length)
              const isActive = item.href
                ? pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                : false
              const hasActiveChild = item.children?.some((child) => {
                const childHref = child.href || ''
                return childHref ? pathname === childHref || pathname.startsWith(childHref) : false
              })
              const activeState = isActive || hasActiveChild

              return (
                <div key={item.label} className="space-y-0.5">
                  <Link
                    href={item.href || "#"}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-semibold tracking-widest uppercase transition-all duration-200",
                      activeState
                        ? "text-black"
                        : "hover:bg-white/5"
                    )}
                    style={
                      activeState
                        ? { backgroundColor: "#CCFF00", color: "#111" }
                        : { color: "#777" }
                    }
                  >
                    {item.icon && <item.icon className="w-3.5 h-3.5 shrink-0" />}
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && !activeState && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: "#CCFF00", color: "#111" }}
                      >
                        {item.badge}
                      </span>
                    )}
                    {hasChildren && <span className="text-[10px] opacity-60">▾</span>}
                  </Link>

                  {hasChildren && (
                    <div className="ml-4 space-y-0.5 border-l border-white/10 pl-3">
                      {item.children?.map((child) => {
                        const childHref = child.href || ''
                        const childActive = pathname === childHref || (childHref !== "/admin" && pathname.startsWith(childHref))

                        return (
                          <Link
                            key={child.label}
                            href={child.href || "#"}
                            className={cn(
                              "block rounded-md px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition-all duration-200",
                              childActive ? "text-[#CCFF00]" : "hover:bg-white/5"
                            )}
                            style={childActive ? { color: "#CCFF00" } : { color: "#777" }}
                          >
                            {child.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        )}
      </div>

      {/* Bottom section */}
      <div className="px-3 pb-6 space-y-3">
        {/* New Entry CTA */}
        <Link
          href="/admin/candidates"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
          style={{ backgroundColor: "#CCFF00", color: "#111" }}
        >
          <Plus className="w-3.5 h-3.5" />
          New Entry
        </Link>

        {/* Settings & Support */}
        <div className="space-y-0.5">
          {showSettings && (
            <Link
              href="/admin/settings"
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-semibold tracking-widest uppercase transition-all duration-200",
                pathname === "/admin/settings" ? "text-black" : "hover:bg-white/5"
              )}
              style={
                pathname === "/admin/settings"
                  ? { backgroundColor: "#CCFF00", color: "#111" }
                  : { color: "#555" }
              }
            >
              <Settings className="w-3.5 h-3.5 shrink-0" />
              <span>Settings</span>
            </Link>
          )}

          <Link
            href="/admin/help"
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-semibold tracking-widest uppercase transition-all duration-200",
              pathname === "/admin/help" ? "text-black" : "hover:bg-white/5"
            )}
            style={
              pathname === "/admin/help"
                ? { backgroundColor: "#CCFF00", color: "#111" }
                : { color: "#555" }
            }
          >
            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Support</span>
          </Link>

          {/* Sign out */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-semibold tracking-widest uppercase transition-all duration-200 hover:bg-white/5 text-left"
            style={{ color: "#555" }}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
