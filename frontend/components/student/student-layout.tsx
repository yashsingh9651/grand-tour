'use client'

import { StudentSidebar } from './student-sidebar'
import { useState, useEffect } from 'react'
import { Bell, Moon, Sun, Search, Loader2 } from 'lucide-react'
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
  const [darkMode, setDarkMode] = useState(false)

  const fullName = user ? `${user.firstName || user.name || ''} ${user.lastName || ''}`.trim() : 'Loading...'
  const userImage = user?.image || user?.profileImage

  const isJourney = pathname === '/dashboard' || pathname.includes('application')
  const isFinance = pathname.includes('payment')

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F5F5F0' }}>
      {/* Sidebar spacer */}
      <div className="hidden lg:block w-56 shrink-0" />
      <StudentSidebar currentStep={currentStep} />

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* ── Topbar ─────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between gap-4 px-6 py-3 border-b"
          style={{
            backgroundColor: '#F5F5F0',
            borderColor: '#E8E8E2',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          {/* Left: Brand label */}
          <div className="flex items-center gap-3">
            <span
              className="text-sm font-bold tracking-tight hidden sm:block"
              style={{ color: '#111', fontFamily: 'Gilroy, sans-serif' }}
            >
              Student Portal
            </span>
          </div>

          {/* Center: Global Search */}
          <div className="flex-1 max-w-xs relative">
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-full text-xs transition-all duration-200 hover:shadow-sm cursor-pointer"
              style={{
                backgroundColor: '#EDEDEA',
                color: '#888',
                border: '1px solid #E0E0DA',
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
                href="/dashboard"
                className="text-xs font-bold tracking-widest uppercase transition-colors duration-200 pb-0.5"
                style={{
                  color: isJourney ? '#111' : '#999',
                  borderBottom: isJourney ? '2px solid #111' : '2px solid transparent',
                }}
              >
                Journey
              </Link>
              <Link
                href="/dashboard/payment"
                className="text-xs font-bold tracking-widest uppercase transition-colors duration-200 pb-0.5"
                style={{
                  color: isFinance ? '#CCFF00' : '#999',
                  borderBottom: isFinance ? '2px solid #CCFF00' : '2px solid transparent',
                }}
              >
                Finance
              </Link>
            </div>

            {/* Divider */}
            <div className="h-5 w-px hidden md:block" style={{ backgroundColor: '#DDD' }} />

            {/* Bell */}
            <button
              className="relative transition-all duration-200 hover:scale-110"
              style={{ color: '#555' }}
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="transition-all duration-200 hover:scale-110"
              style={{ color: '#555' }}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Avatar */}
            {status === 'loading' ? (
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#888' }} />
            ) : (
              <Avatar className="w-8 h-8 ring-2 ring-offset-1 ring-[#E0E0DA]">
                <AvatarImage src={userImage} alt={fullName} />
                <AvatarFallback
                  className="text-xs font-bold"
                  style={{ backgroundColor: '#CCFF00', color: '#111' }}
                >
                  {fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
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
