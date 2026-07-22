'use client'

import { useState, useEffect } from 'react'
import { StudentLayout } from '@/components/student/student-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { applicationService, notificationService, workflowService } from '@/lib/services/api.service'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, CheckCircle, Clock, Zap, ArrowRight, FileText, Calendar, HelpCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function StudentDashboard() {
  const router = useRouter()
  const [application, setApplication] = useState<any>(null)
  const [workflow, setWorkflow] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [appData, notifData, wfData] = await Promise.all([
          applicationService.getMy(),
          notificationService.getAll(),
          workflowService.get()
        ])
        setApplication(appData)
        setNotifications(notifData || [])
        setWorkflow(wfData)
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!loading && !application) {
      router.push('/dashboard/application')
    }
  }, [loading, application, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  const allSteps = [
    ...(workflow?.steps?.map((s: any) => ({
      id: s.id,
      title: s.name,
      description: s.description
    })) || [])
  ]

  const currentIndex = allSteps.findIndex(s => s.id === (application.currentStepId))
  const completedSteps = allSteps.slice(0, currentIndex)
  const currentStep = allSteps[currentIndex] || allSteps[allSteps.length - 1]
  const progressPercent = currentIndex === allSteps.length - 1
    ? 100
    : Math.round((currentIndex / allSteps.length) * 100)

  const completedStepsCount = currentIndex === allSteps.length - 1
    ? allSteps.length
    : completedSteps.length

  // Map backend activities to timeline
  const timeline = application.activities?.map((activity: any) => {
    const d = new Date(activity.createdAt)
    const datePart = d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
    const timePart = d.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    })
    return {
      date: `${datePart} • ${timePart}`,
      event: activity.description,
      status: 'completed'
    }
  }) || []

  // Add next steps to timeline
  if (currentStep) {
    timeline.push({
      date: 'Pending Action',
      event: currentStep.title,
      status: 'pending'
    })
  }

  return (
    <StudentLayout currentStep={application.currentStepId}>
      <div className="space-y-6 max-w-6xl">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border border-border p-4 sm:p-6 md:p-8">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-foreground">Welcome back, {application.user?.firstName}!</h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">You&apos;re {progressPercent}% through your internship onboarding journey. Keep up the great work!</p>
            </div>
            <Zap className="w-8 h-8 text-primary flex-shrink-0 hidden md:block animate-pulse" />
          </div>
        </Card>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <Card className="p-4 sm:p-6 border border-border bg-card hover:shadow-md transition-shadow text-foreground">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-semibold text-muted-foreground">Overall Progress</span>
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">{progressPercent}%</div>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-accent h-full transition-all" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{completedStepsCount} of {allSteps.length} steps completed</p>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 border border-border bg-card hover:shadow-md transition-shadow text-foreground">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-semibold text-muted-foreground">Current Step</span>
                <ArrowRight className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold text-foreground truncate">{currentStep?.title}</div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{currentStep?.description}</p>
              </div>
              <Link href={`/dashboard/${currentStep?.id}`} className="block">
                <Button size="sm" className="w-full bg-primary text-[#1A1A1A] font-bold hover:bg-primary/90">Continue Step</Button>
              </Link>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 border border-border bg-card hover:shadow-md transition-shadow text-foreground sm:col-span-2 md:col-span-1">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-semibold text-muted-foreground">Status</span>
                <AlertCircle className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 uppercase">{application.status}</div>
              <p className="text-xs text-muted-foreground">Application ID: {application.id.split('-')[0]}</p>
            </div>
          </Card>
        </div>


        <div className="grid lg:grid-cols-3 gap-6">
          {/* Notifications */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold">Notifications</h2>
            {notifications.length > 0 ? (
              notifications.slice(0, 3).map((notif) => (
                <Card key={notif.id} className="p-4 border border-border border-l-4 border-l-primary bg-card text-foreground">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0 animate-pulse" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{notif.title}</p>
                      <p className="text-xs text-muted-foreground">{notif.message}</p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-4 border border-border bg-card text-center text-foreground">
                <p className="text-sm text-muted-foreground">No new notifications</p>
              </Card>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <Card className="p-4 border border-border bg-card space-y-2">
              <Link href="/dashboard/application" className="block">
                <Button variant="outline" className="w-full justify-start gap-2 border-border text-foreground hover:bg-muted" size="sm">
                  <FileText className="w-4 h-4" />
                  View Application
                </Button>
              </Link>
              <Link href="/dashboard/documents" className="block">
                <Button variant="outline" className="w-full justify-start gap-2 border-border text-foreground hover:bg-muted" size="sm">
                  <FileText className="w-4 h-4" />
                  Upload Documents
                </Button>
              </Link>
              <Link href="/dashboard/interview" className="block">
                <Button variant="outline" className="w-full justify-start gap-2 border-border text-foreground hover:bg-muted" size="sm">
                  <Calendar className="w-4 h-4" />
                  Book Interview
                </Button>
              </Link>
              <Link href="/dashboard/faq" className="block">
                <Button variant="outline" className="w-full justify-start gap-2 border-border text-foreground hover:bg-muted" size="sm">
                  <HelpCircle className="w-4 h-4" />
                  View FAQ
                </Button>
              </Link>
            </Card>
          </div>
        </div>

        {/* Timeline */}
        <Card className="p-6 md:p-8 border border-border bg-card text-foreground">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <span>Your Journey</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">{completedSteps.length} Steps Done</span>
          </h2>
          <div className="space-y-4">
            {timeline.map((item: any, index: number) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${item.status === 'completed'
                      ? 'bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-500/30'
                      : item.status === 'pending'
                        ? 'bg-primary border-primary'
                        : 'bg-muted border-border'
                    }`} />
                  {index < timeline.length - 1 && (
                    <div className={`w-0.5 h-14 my-2 ${item.status === 'completed' ? 'bg-emerald-500/20' : 'bg-border'
                      }`} />
                  )}
                </div>
                <div className="pb-4 pt-0.5">
                  <p className={`text-sm font-semibold ${item.status === 'completed' ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                    {item.event}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </StudentLayout>
  )
}
