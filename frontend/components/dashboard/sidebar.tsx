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
  ChevronDown,
  FileStack,
  Tags,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
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

type MenuSection = {
  title: string
  items: MenuItem[]
}

const MENU_SECTIONS: MenuSection[] = [
  {
    title: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/admin", feature: "dashboard" },
      // { icon: Users, label: "Candidates", href: "/admin/candidates", feature: "candidates" },
      { icon: ClipboardList, label: "Students Portal", href: "/admin/applications-portal", feature: "applications" },
      // { icon: ShieldCheck, label: "Approvals", href: "/admin/applications", feature: "applications", badge: "New" },
      // { icon: Search, label: "Search", href: "/admin/search", feature: "search" },
    ]
  },
  {
    title: "Student Progress Configuration",
    items: [
      { icon: Calendar, label: "Interview Slots", href: "/admin/interviews", feature: "interviews" },
      // { icon: FileText, label: "Documents", href: "/admin/documents", feature: "documents" },
      // { icon: ClipboardList, label: "Contracts", href: "/admin/contracts", feature: "documents" },
      // { icon: CreditCard, label: "Payments", href: "/admin/payments", feature: "payments", badge: "New" },
      { icon: Building2, label: "Hotels List", href: "/admin/hotels", feature: "hotels" },
      // { icon: Briefcase, label: "Work Permits", href: "/admin/workpermit", feature: "workpermit" },
      { icon: Stamp, label: "Visa Slot Config", href: "/admin/visa", feature: "visa" },
      // { icon: Plane, label: "Travel", href: "/admin/travel", feature: "travel" },
    ]
  },
  {
    title: "Administration",
    items: [
      {
        icon: Workflow,
        label: "Workflows",
        feature: "workflows",
        children: [
          { label: "Overview", href: "/admin/workflows", feature: "workflows" },
          { label: "Applications Step Editor", href: "/admin/steps/applications", feature: "applications" },
          { label: "Documents Step Editor", href: "/admin/steps/documents", feature: "documents" },
          { label: "Payment Step Editor", href: "/admin/steps/payment", feature: "payments" },
          { label: "Visa Payments Step Editor", href: "/admin/steps/visapayments", feature: "payments" },
        ],
      },
      { icon: Users, label: "Users", href: "/admin/users", feature: "users" },
      { icon: ShieldCheck, label: "Role Access", href: "/admin/settings/roles", feature: "settings" },
      { icon: Mail, label: "Email Templates", href: "/admin/emails", feature: "emails" },
      { icon: FileStack, label: "Doc Templates", href: "/admin/document-templates", feature: "documents" },
      { icon: Tags, label: "Student Categories", href: "/admin/student-categories", feature: "settings" },
      { icon: FileText, label: "Manage Blogs", href: "/admin/blogs", feature: "settings" },
      { icon: BarChart3, label: "Reports", href: "/admin/reports", feature: "reports" },
      { icon: Activity, label: "Audit Logs", href: "/admin/activity", feature: "activity", badge: "3" },
      { icon: Bell, label: "Notifications", href: "/admin/notifications", feature: "notifications" },
    ]
  }
]

const ALL_MENU_ITEMS: MenuItem[] = MENU_SECTIONS.flatMap(section => section.items)

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

const filterMenuSections = (sections: MenuSection[], allowedFeatures: string[], userRole: string): MenuSection[] => {
  return sections.reduce<MenuSection[]>((acc, section) => {
    const filteredItems = filterMenuItems(section.items, allowedFeatures, userRole)
    if (filteredItems.length > 0) {
      acc.push({
        title: section.title,
        items: filteredItems,
      })
    }
    return acc
  }, [])
}

export function Sidebar() {
  const { data: session } = useSession()
  const [allowedFeatures, setAllowedFeatures] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({})
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

  // Automatically open submenus containing the active route
  useEffect(() => {
    const initialOpenStates: Record<string, boolean> = {}
    MENU_SECTIONS.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children) {
          const hasActiveChild = item.children.some((child) => {
            const childHref = child.href || ""
            return childHref ? pathname === childHref || pathname.startsWith(childHref) : false
          })
          if (hasActiveChild || (item.href && (pathname === item.href || pathname.startsWith(item.href)))) {
            initialOpenStates[item.label] = true
          }
        }
      })
    })
    setOpenSubMenus((prev) => ({ ...initialOpenStates, ...prev }))
  }, [pathname])

  const toggleSubMenu = (label: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

  const filteredSections = filterMenuSections(MENU_SECTIONS, allowedFeatures, userRole)
  const showSettings = userRole === "SUPER_ADMIN" || allowedFeatures.includes("settings")

  return (
    <aside
      className="fixed top-0 left-0 w-56 h-screen flex flex-col"
      style={{ backgroundColor: "#F5F5F0", borderRight: "1px solid #E8E8E2" }}
    >
      {/* Brand */}
      <Link href="/" className="py-2 px-3">
        <Image
          src="/logo.png"
          alt="Grand Tour"
          width={200}
          height={200}
          className="h-10 w-auto object-contain"
        />
      </Link>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#CCFF00" }} />
          </div>
        ) : (
          <nav className="space-y-6">
            {filteredSections.map((section) => (
              <div key={section.title} className="space-y-2">
                <p className="px-3 text-[9px] font-bold tracking-[0.25em] text-[#555] uppercase">
                  {section.title}
                </p>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const hasChildren = Boolean(item.children?.length)
                    const isActive = item.href
                      ? pathname === item.href || (item.href !== "/admin" && (pathname.startsWith(item.href + "/") || pathname === item.href))
                      : false
                    const hasActiveChild = item.children?.some((child) => {
                      const childHref = child.href || ""
                      return childHref ? pathname === childHref || pathname.startsWith(childHref + "/") || pathname === childHref : false
                    })
                    const activeState = isActive || hasActiveChild
                    const isOpen = !!openSubMenus[item.label]

                    return (
                      <div key={item.label} className="space-y-0.5">
                        {hasChildren ? (
                          <button
                            onClick={() => toggleSubMenu(item.label)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-semibold tracking-widest uppercase transition-all duration-200 text-left outline-none",
                              activeState
                                ? "text-black"
                                : "hover:bg-black/5"
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
                            <ChevronDown
                              className={cn(
                                "w-3 h-3 transition-transform duration-200 opacity-60",
                                isOpen ? "transform rotate-180" : ""
                              )}
                            />
                          </button>
                        ) : (
                          <Link
                            href={item.href || "#"}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-semibold tracking-widest uppercase transition-all duration-200",
                              activeState
                                ? "text-black"
                                : "hover:bg-black/5"
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
                          </Link>
                        )}

                        {hasChildren && isOpen && (
                          <div className="ml-4 space-y-0.5 border-l border-black/10 pl-3">
                            {item.children?.map((child) => {
                              const childHref = child.href || ""
                              const childActive = pathname === childHref || (childHref !== "/admin" && (pathname.startsWith(childHref + "/") || pathname === childHref))

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
                </div>
              </div>
            ))}
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
                pathname === "/admin/settings" ? "text-black" : "hover:bg-black/5"
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

          {/* Sign out */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-semibold tracking-widest uppercase transition-all duration-200 hover:bg-black/5 text-left"
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
