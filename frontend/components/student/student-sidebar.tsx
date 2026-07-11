'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { applicationService } from '@/lib/services/api.service'
import { toast } from 'sonner'
import {
  Sparkles,
  Calendar,
  ShieldCheck,
  Banknote,
  Settings,
  HelpCircle,
  LogOut,
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
  visapayments: 9,
  visa: 10,
  travel: 11,
}

const NAV_ITEMS = [
  { icon: Sparkles, label: 'Application', href: '/dashboard/application', stepKey: 'application' },
  { icon: FileText, label: 'Documents', href: '/dashboard/documents', stepKey: 'documents' },
  { icon: Calendar, label: 'Interview Hub', href: '/dashboard/interview', stepKey: 'interview' },
  { icon: Banknote, label: 'Payment 1', href: '/dashboard/payment1', stepKey: 'payment1' },
  { icon: Building2, label: 'Hotel', href: '/dashboard/hotel', stepKey: 'hotel' },
  { icon: Banknote, label: 'Payment 2', href: '/dashboard/payment2', stepKey: 'payment2' },
  { icon: ClipboardCheck, label: 'Contract', href: '/dashboard/contract', stepKey: 'contract' },
  { icon: Banknote, label: 'Final Payment', href: '/dashboard/payment3', stepKey: 'payment3' },
  { icon: Briefcase, label: 'Work Permit', href: '/dashboard/workpermit', stepKey: 'workpermit' },
  { icon: Banknote, label: 'Visa Payments', href: '/dashboard/visapayments', stepKey: 'visapayments' },
  { icon: Stamp, label: 'Visa', href: '/dashboard/visa', stepKey: 'visa' },
  { icon: Plane, label: 'Travel', href: '/dashboard/travel', stepKey: 'travel' },
]

export function StudentSidebar({ currentStep, darkMode }: { currentStep?: string; darkMode?: boolean }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [dbCurrentStepId, setDbCurrentStepId] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user?.email) return
    const fetchApp = async () => {
      try {
        const app = await applicationService.getMy()
        if (app && app.currentStepId) {
          setDbCurrentStepId(app.currentStepId)
        }
      } catch (err) {
        console.error('Failed to fetch application current step', err)
      }
    }
    fetchApp()
  }, [session?.user?.email, pathname])

  const activeStepId = dbCurrentStepId || currentStep || 'application'
  const currentStepOrder = WORKFLOW_STEP_ORDER[activeStepId] ?? 0

  return (
    <aside
      className="fixed top-0 left-0 w-56 h-screen flex flex-col lg:block transition-colors duration-300"
      style={{
        backgroundColor: 'var(--sp-sidebar-bg)',
        borderRight: '1px solid var(--sp-border)',
      }}
    >
      {/* Brand */}
      <div className="px-5 pt-6 pb-4">
        <Link href="/" className="block">
          <Image
            src="/logo.png"
            alt="Grand Tour"
            width={200}
            height={200}
            className="h-10 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 no-scrollbar">
        <nav className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && (pathname.startsWith(item.href + '/') || pathname === item.href))
            const itemStepOrder = WORKFLOW_STEP_ORDER[item.stepKey || 'application'] ?? 0
            const isLocked = itemStepOrder > currentStepOrder && !isActive

            return (
              <Link
                key={item.label}
                href={isLocked ? '#' : item.href}
                onClick={(e) => { if (isLocked) e.preventDefault() }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-semibold tracking-widest uppercase transition-all duration-200',
                  isLocked ? 'opacity-40 cursor-not-allowed' : ''
                )}
                style={
                  isActive
                    ? { backgroundColor: 'var(--sp-accent)', color: 'var(--sp-accent-text)' }
                    : isLocked
                      ? { color: 'var(--sp-text-soft)' }
                      : { color: 'var(--sp-text-muted)' }
                }
                aria-disabled={isLocked}
              >
                <item.icon className="w-3.5 h-3.5 shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {isLocked ? (
                  <span
                    className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--sp-surface-2)', color: 'var(--sp-text-soft)' }}
                  >
                    LOCKED
                  </span>
                ) : activeStepId === item.stepKey ? (
                  // <span
                  //   className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1 shrink-0"
                  //   style={{ backgroundColor: 'rgba(11, 153, 64, 0.15)', color: '#0b9940', border: '1px solid rgba(11, 153, 64, 0.25)' }}
                  // >
                  //   Active
                  // </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0b9940] animate-ping" />
                ) : null}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px" style={{ backgroundColor: 'var(--sp-divider)' }} />

      {/* Bottom section */}
      <div className="px-3 pb-6 py-4 space-y-0.5">
        <Link
          href="/dashboard/profile"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-semibold tracking-widest uppercase transition-all duration-200"
          style={
            pathname === '/dashboard/profile'
              ? { backgroundColor: 'var(--sp-accent)', color: 'var(--sp-accent-text)' }
              : { color: 'var(--sp-text-muted)' }
          }
        >
          <Settings className="w-3.5 h-3.5 shrink-0" />
          <span>Settings</span>
        </Link>

        <Link
          href="/dashboard/faq"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-semibold tracking-widest uppercase transition-all duration-200"
          style={
            pathname === '/dashboard/faq'
              ? { backgroundColor: 'var(--sp-accent)', color: 'var(--sp-accent-text)' }
              : { color: 'var(--sp-text-muted)' }
          }
        >
          <HelpCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Support</span>
        </Link>

        {/* FAQ Link - Unlocked when 1st Payment (payment1) is completed */}
        {(() => {
          const isPayment1Completed = currentStepOrder >= (WORKFLOW_STEP_ORDER['hotel'] ?? 4)
          const isFaqActive = pathname === '/dashboard/faq-page'
          return (
            <Link
              href={isPayment1Completed ? '/dashboard/faq-page' : '#'}
              onClick={(e) => {
                if (!isPayment1Completed) {
                  e.preventDefault()
                  toast.error('This section will unlock after you complete your 1st Payment.')
                }
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-semibold tracking-widest uppercase transition-all duration-200",
                !isPayment1Completed ? "opacity-40 cursor-not-allowed" : ""
              )}
              style={
                isFaqActive
                  ? { backgroundColor: 'var(--sp-accent)', color: 'var(--sp-accent-text)' }
                  : !isPayment1Completed
                    ? { color: 'var(--sp-text-soft)' }
                    : { color: 'var(--sp-text-muted)' }
              }
              aria-disabled={!isPayment1Completed}
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                <span>FAQ</span>
              </div>
              {!isPayment1Completed && (
                <span
                  className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--sp-surface-2)', color: 'var(--sp-text-soft)' }}
                >
                  LOCKED
                </span>
              )}
            </Link>
          )
        })()}

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-semibold tracking-widest uppercase transition-all duration-200 text-left"
          style={{ color: 'var(--sp-text-muted)' }}
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  )
}
