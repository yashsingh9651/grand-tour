'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Sparkles,
  Calendar,
  ShieldCheck,
  Banknote,
  Settings,
  HelpCircle,
  Plus,
  LogOut,
  LayoutDashboard,
  FileText,
  Plane,
  Building2,
  Stamp,
  Briefcase,
  ClipboardCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const WORKFLOW_STEP_ORDER: Record<string, number> = {
  application: 0,
  documents: 1,
  interview: 2,
  payment1: 3,
  hotel: 4,
  payment2: 5,
  contract: 6,
  payment3: 7,
  workpermit: 8,
  visa: 9,
  travel: 10,
}

const NAV_ITEMS = [
  { icon: Sparkles, label: 'Application', href: '/dashboard/application', stepKey: 'application' },
  { icon: FileText, label: 'Documents', href: '/dashboard/documents', stepKey: 'documents' },
  { icon: Calendar, label: 'Interview Hub', href: '/dashboard/interview', stepKey: 'interview' },
  { icon: Banknote, label: 'Financial Center', href: '/dashboard/payment1', stepKey: 'payment1', badge: 'New' },
  { icon: Building2, label: 'Hotel', href: '/dashboard/hotel', stepKey: 'hotel' },
  { icon: Banknote, label: 'Payment 2', href: '/dashboard/payment2', stepKey: 'payment2' },
  { icon: ClipboardCheck, label: 'Contract', href: '/dashboard/contract', stepKey: 'contract' },
  { icon: Banknote, label: 'Payment 3', href: '/dashboard/payment3', stepKey: 'payment3' },
  { icon: Briefcase, label: 'Work Permit', href: '/dashboard/workpermit', stepKey: 'workpermit' },
  { icon: Stamp, label: 'Visa', href: '/dashboard/visa', stepKey: 'visa' },
  { icon: Plane, label: 'Travel', href: '/dashboard/travel', stepKey: 'travel' },
]

export function StudentSidebar({ currentStep }: { currentStep?: string }) {
  const pathname = usePathname()
  const currentStepOrder = WORKFLOW_STEP_ORDER[currentStep || 'application'] ?? 0

  return (
    <aside
      className="fixed top-0 left-0 w-56 h-screen flex flex-col lg:block"
      style={{ backgroundColor: '#F5F5F0', borderRight: '1px solid #222' }}
    >
      {/* Brand */}
      <div className="px-5 pt-6 pb-4">
        <Link href="/" className="block">
          <p
            className="text-xl font-bold tracking-tight leading-none"
            style={{ color: '#000', fontFamily: 'Gilroy, sans-serif' }}
          >
            Grand Tour
          </p>
          <p
            className="text-[10px] tracking-widest uppercase mt-0.5"
            style={{ color: '#555' }}
          >
            Command Center
          </p>
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <nav className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const itemStepOrder = WORKFLOW_STEP_ORDER[item.stepKey || 'application'] ?? 0
            const isLocked = itemStepOrder > currentStepOrder && !isActive

            return (
              <Link
                key={item.label}
                href={isLocked ? '#' : item.href}
                onClick={(e) => {
                  if (isLocked) {
                    e.preventDefault()
                  }
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-semibold tracking-widest uppercase transition-all duration-200',
                  isActive
                    ? 'text-black'
                    : isLocked
                      ? 'opacity-40 cursor-not-allowed'
                      : 'hover:bg-white/5'
                )}
                style={
                  isActive
                    ? { backgroundColor: '#D0FB3B', color: '#111' }
                    : isLocked
                      ? { color: '#999' }
                      : { color: '#777' }
                }
                aria-disabled={isLocked}
              >
                <item.icon className="w-3.5 h-3.5 shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {isLocked ? (
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-white/70 text-gray-600">
                    LOCKED
                  </span>
                ) : item.badge && !isActive ? (
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: '#D0FB3B', color: '#111' }}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </nav>
      </div>

      <hr />
      {/* Bottom section */}
      <div className="px-3 pb-6 py-5 space-y-10">
  
        {/* Settings & Support */}
        <div className="space-y-0.5">
          <Link
            href="/dashboard/profile"
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-semibold tracking-widest uppercase transition-all duration-200',
              pathname === '/dashboard/profile' ? 'text-black' : 'hover:bg-white/5'
            )}
            style={
              pathname === '/dashboard/profile'
                ? { backgroundColor: '#CCFF00', color: '#111' }
                : { color: '#555' }
            }
          >
            <Settings className="w-3.5 h-3.5 shrink-0" />
            <span>Settings</span>
          </Link>

          <Link
            href="/dashboard/faq"
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-semibold tracking-widest uppercase transition-all duration-200',
              pathname === '/dashboard/faq' ? 'text-black' : 'hover:bg-white/5'
            )}
            style={
              pathname === '/dashboard/faq'
                ? { backgroundColor: '#CCFF00', color: '#111' }
                : { color: '#555' }
            }
          >
            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Support</span>
          </Link>

          {/* Sign out */}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-semibold tracking-widest uppercase transition-all duration-200 hover:bg-white/5 text-left"
            style={{ color: '#555' }}
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
