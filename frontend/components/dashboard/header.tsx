"use client"

import { useState, useEffect } from "react"
import { Search, Bell, Moon, Sun, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MobileNav } from "./mobile-nav"
import { SearchModal } from "@/components/search/search-modal"
import { NotificationsModal } from "@/components/notifications/notifications-modal"
import { useSession } from "next-auth/react"
import { notificationService } from "@/lib/services/api.service"
import { usePathname } from "next/navigation"
import Link from "next/link"
import type { ReactNode } from "react"

interface HeaderProps {
  title: string
  description: string
  actions?: ReactNode
}

export function Header({ title, description, actions }: HeaderProps) {
  const { data: session, status } = useSession()
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showNotificationsModal, setShowNotificationsModal] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const checkUnread = async () => {
      try {
        const notes = await notificationService.getAll()
        setHasUnread(notes.some((n: any) => !n.isRead))
      } catch {
        // Silent
      }
    }
    checkUnread()
    const interval = setInterval(checkUnread, 60000)
    return () => clearInterval(interval)
  }, [])

  const user = session?.user as any
  const fullName = user ? `${user.firstName || user.name} ${user.lastName || ""}`.trim() : "Loading..."
  const userImage = user?.image || user?.profileImage

  const isReports = pathname.startsWith("/admin/reports")
  const isDirectives = !isReports

  return (
    <>
      {/* ── Topbar ─────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between gap-4 px-6 py-3 border-b"
        style={{
          backgroundColor: "#F7F7F2",
          borderColor: "#E8E8E2",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Left: Brand label + Mobile nav */}
        <div className="flex items-center gap-3">
          <MobileNav />
          <span
            className="text-sm font-bold tracking-tight hidden sm:block"
            style={{ color: "#111", fontFamily: "Gilroy, sans-serif" }}
          >
            Admin Portal
          </span>
        </div>

        {/* Center: Global Search */}
        <div
          className="flex-1 max-w-xs cursor-pointer relative"
          onClick={() => setShowSearchModal(true)}
        >
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-full text-xs transition-all duration-200 hover:shadow-sm"
            style={{
              backgroundColor: "#EDEDEA",
              color: "#888",
              border: "1px solid #E0E0DA",
            }}
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span>Global Search...</span>
          </div>
        </div>

        {/* Right: Nav tabs + icons */}
        <div className="flex items-center gap-5">
          {/* Nav Tabs */}
          <div className="hidden md:flex items-center gap-5">
            <Link
              href="/admin"
              className="text-xs font-bold tracking-widest uppercase transition-colors duration-200 pb-0.5"
              style={{
                color: isDirectives ? "#111" : "#999",
                borderBottom: isDirectives ? "2px solid #111" : "2px solid transparent",
              }}
            >
              Directives
            </Link>
            <Link
              href="/admin/reports"
              className="text-xs font-bold tracking-widest uppercase transition-colors duration-200 pb-0.5"
              style={{
                color: isReports ? "#CCFF00" : "#999",
                borderBottom: isReports ? "2px solid #CCFF00" : "2px solid transparent",
              }}
            >
              Reports
            </Link>
          </div>

          {/* Divider */}
          <div className="h-5 w-px hidden md:block" style={{ backgroundColor: "#DDD" }} />

          {/* Bell */}
          <button
            id="admin-notifications-btn"
            onClick={() => setShowNotificationsModal(true)}
            className="relative transition-all duration-200 hover:scale-110"
            style={{ color: "#555" }}
          >
            <Bell className="w-4 h-4" />
            {hasUnread && (
              <span
                className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: "#FF4444" }}
              />
            )}
          </button>

          {/* Dark mode toggle */}
          {/* <button
            id="admin-darkmode-btn"
            onClick={() => setDarkMode(!darkMode)}
            className="transition-all duration-200 hover:scale-110"
            style={{ color: "#555" }}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button> */}

          {/* Avatar */}
          {status === "loading" ? (
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#888" }} />
          ) : (
            <Avatar className="w-8 h-8 ring-2 ring-offset-1">
              <AvatarImage src={userImage} alt={fullName} />
              <AvatarFallback
                className="text-xs font-bold"
                style={{ backgroundColor: "#CCFF00", color: "#111" }}
              >
                {fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>

      {/* ── Page heading ───────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-4 animate-slide-in-up">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1
              className="text-3xl font-bold tracking-tight mb-1"
              style={{ color: "#111", fontFamily: "Gilroy, sans-serif" }}
            >
              {title}
            </h1>
            <p className="text-sm" style={{ color: "#888" }}>
              {description}
            </p>
          </div>
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showSearchModal && (
        <SearchModal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} />
      )}
      {showNotificationsModal && (
        <NotificationsModal
          isOpen={showNotificationsModal}
          onClose={() => setShowNotificationsModal(false)}
        />
      )}
    </>
  )
}
