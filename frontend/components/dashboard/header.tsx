"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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
  const [unreadCount, setUnreadCount] = useState(0)
  const [darkMode, setDarkMode] = useState(false)
  const pathname = usePathname()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const prevUnreadRef = useRef<number>(0)

  const checkUnread = useCallback(async (playSound = false) => {
    try {
      const notes = await notificationService.getAll()
      const count = (notes as any[]).filter((n: any) => !n.isRead).length
      if (playSound && count > prevUnreadRef.current) {
        try {
          if (!audioRef.current) {
            audioRef.current = new Audio('/sounds/notification.wav')
            audioRef.current.volume = 0.55
          }
          audioRef.current.currentTime = 0
          audioRef.current.play().catch(() => {})
        } catch {}
      }
      prevUnreadRef.current = count
      setUnreadCount(count)
    } catch {
      // Silent fail
    }
  }, [])

  useEffect(() => {
    checkUnread(false)
    const interval = setInterval(() => checkUnread(true), 15000)
    return () => clearInterval(interval)
  }, [checkUnread])

  const user = session?.user as any
  const fullName = user ? `${user.firstName || user.name} ${user.lastName || ""}`.trim() : "Loading..."
  const userImage = user?.image || user?.profileImage

  const isReports = pathname.startsWith("/admin/reports")
  const isDirectives = !isReports

  return (
    <>
      {/* ── Topbar ─────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 py-3 border-b"
        style={{
          backgroundColor: "#F7F7F2",
          borderColor: "#E8E8E2",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Left: Brand label + Mobile nav */}
        <div className="flex items-center gap-2 sm:gap-3">
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
            <span className="truncate">Search...</span>
          </div>
        </div>

        {/* Right: Nav tabs + icons */}
        <div className="flex items-center gap-3 sm:gap-5">
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
            style={{ color: '#555' }}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full text-[8px] font-black text-white leading-none"
                style={{ backgroundColor: '#E1000F' }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

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
                {(() => {
                  if (!user) return "?";
                  const parts = [user.firstName, user.lastName].filter(Boolean);
                  if (parts.length > 0) {
                    return parts.map(p => p[0]).join("").toUpperCase();
                  }
                  if (user.name) {
                    return user.name.split(" ").filter(Boolean).map((n: string) => n[0]).join("").toUpperCase();
                  }
                  return (user.email?.[0] || "?").toUpperCase();
                })()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>

      {/* ── Page heading ───────────────────────────────────────── */}
      <div className="px-3 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 animate-slide-in-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1">
            <h1
              className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight mb-1"
              style={{ color: "#111", fontFamily: "Gilroy, sans-serif" }}
            >
              {title}
            </h1>
            <p className="text-xs sm:text-sm" style={{ color: "#888" }}>
              {description}
            </p>
          </div>
          {actions && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
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
          onUpdate={() => checkUnread(false)}
        />
      )}
    </>
  )
}
