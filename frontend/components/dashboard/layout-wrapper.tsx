'use client'

import { Sidebar } from './sidebar'
import { MobileNav } from './mobile-nav'
import { ReactNode, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    )
  }

  if (status === 'unauthenticated') return null

  return (
    <div className="flex flex-col lg:flex-row min-h-screen" style={{ backgroundColor: "#F7F7F2" }}>
      {/* Mobile Sticky Header */}
      <div
        className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b"
        style={{ backgroundColor: "#F5F5F0", borderColor: "#E8E8E2" }}
      >
        <div className="flex items-center gap-3">
          <MobileNav />
          <Image
            src="/logo.png"
            alt="Grand Tour Admin"
            width={120}
            height={32}
            className="h-7 w-auto object-contain"
          />
        </div>
        <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Admin Panel</span>
      </div>

      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="flex-1 p-3 sm:p-4 lg:p-6 lg:ml-56 max-w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}

