'use client'

import { StudentSidebar } from './student-sidebar'
import { useState, useEffect } from 'react'
import { Bell, Moon, Sun, Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface StudentLayoutProps {
  children: React.ReactNode
  currentStep: string
  headerContent?: React.ReactNode
}

export function StudentLayout({ children, currentStep = 'application', headerContent }: StudentLayoutProps) {
  const { data: session, status } = useSession()
  const user = session?.user as any
  const pathname = usePathname()
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('student-dark-mode') === 'true'
    }
    return false
  })

  const toggleDark = () => {
    setDarkMode((prev) => {
      const next = !prev
      localStorage.setItem('student-dark-mode', String(next))
      return next
    })
  }

  const fullName = user ? `${user.firstName || user.name || ''} ${user.lastName || ''}`.trim() : 'Loading...'
  const userImage = user?.image || user?.profileImage

  const isJourney = pathname === '/dashboard' || pathname.includes('application')
  const isFinance = pathname.includes('payment')

  return (
    // student-panel wrapper: scopes all CSS vars. Adding .dark here switches the entire panel.
    <div
      className={`student-panel${darkMode ? ' dark' : ''} flex min-h-screen text-foreground transition-colors duration-300`}
      style={{ backgroundColor: 'var(--sp-bg)' }}
    >
      {/* Sidebar spacer */}
      <div className="hidden lg:block w-56 shrink-0" />
      <StudentSidebar currentStep={currentStep} darkMode={darkMode} />

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* ── Topbar ─────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between gap-4 px-6 py-3 border-b sticky top-0 z-40 transition-colors duration-300"
          style={{
            backgroundColor: 'var(--sp-topbar-bg)',
            borderColor: 'var(--sp-border)',
          }}
        >
          {/* Left: Brand label */}
          <div className="flex items-center gap-3">
            <span
              className="text-sm font-bold tracking-tight hidden sm:block transition-colors duration-300"
              style={{ color: 'var(--sp-text)', fontFamily: 'Gilroy, sans-serif' }}
            >
              Student Portal
            </span>
          </div>

          {/* Right: Nav tabs + icons */}
          <div className="flex items-center gap-5">
            {/* Nav Tabs */}
            <div className="hidden md:flex items-center gap-5">
              <Link
                href="/dashboard"
                className="text-xs font-bold tracking-widest uppercase transition-colors duration-200 pb-0.5"
                style={{
                  color: isJourney ? 'var(--sp-text)' : 'var(--sp-text-soft)',
                  borderBottom: isJourney ? '2px solid var(--sp-text)' : '2px solid transparent',
                }}
              >
                Journey
              </Link>
              <Link
                href="/dashboard/payment1"
                className="text-xs font-bold tracking-widest uppercase transition-colors duration-200 pb-0.5"
                style={{
                  color: isFinance ? 'var(--sp-accent)' : 'var(--sp-text-soft)',
                  borderBottom: isFinance ? '2px solid var(--sp-accent)' : '2px solid transparent',
                }}
              >
                Finance
              </Link>
            </div>

            {/* Divider */}
            <div className="h-5 w-px hidden md:block" style={{ backgroundColor: 'var(--sp-border)' }} />

            {/* Bell */}
            <button
              className="relative transition-all duration-200 hover:scale-110"
              style={{ color: 'var(--sp-text-muted)' }}
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              className="transition-all duration-200 hover:scale-110"
              style={{ color: 'var(--sp-text-muted)' }}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Avatar */}
            {status === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--sp-text-soft)' }} />
            ) : (
              <Avatar className="w-8 h-8 ring-2 ring-offset-1" style={{ '--tw-ring-color': 'var(--sp-border)' } as any}>
                <AvatarImage src={userImage} alt={fullName} />
                <AvatarFallback
                  className="text-xs font-bold"
                  style={{ backgroundColor: 'var(--sp-accent)', color: 'var(--sp-accent-text)' }}
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

        {/* ── Page Content ───────────────────────────────────────── */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
