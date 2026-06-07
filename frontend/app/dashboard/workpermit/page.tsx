'use client'

import { useState, useEffect } from 'react'
import { StudentLayout } from '@/components/student/student-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { applicationService, workPermitService } from '@/lib/services/api.service'
import { toast } from 'sonner'
import {
  Loader2, Lock, Briefcase, FileDown, CheckCircle2,
  Clock, ChevronRight, AlertCircle
} from 'lucide-react'
import Link from 'next/link'

export default function WorkPermitPage() {
  const [application, setApplication] = useState<any>(null)
  const [workPermit, setWorkPermit] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const appData = await applicationService.getMy()
      setApplication(appData)

      if (appData?.currentStepId === 'workpermit' || appData?.currentStepId === 'visa' || appData?.currentStepId === 'travel') {
        try {
          const wpData = await workPermitService.getMyWorkPermit()
          setWorkPermit(wpData)
        } catch {}
      }
    } catch {
      toast.error('Failed to load work permit data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <StudentLayout currentStep="workpermit">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </StudentLayout>
    )
  }

  const isUnlocked = ['workpermit', 'visa', 'travel'].includes(application?.currentStepId)

  if (!isUnlocked) {
    return (
      <StudentLayout currentStep="workpermit">
        <div className="max-w-3xl rounded-3xl border-2 border-dashed border-gray-200 p-12 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold">Work Permit — Locked</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            Your work permit will be processed after your <strong>Payment 3</strong> is approved.
          </p>
          <Button className="mt-8" onClick={() => window.location.href = `/dashboard/${application?.currentStepId || 'application'}`}>
            Return to Current Step <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </StudentLayout>
    )
  }

  const isIssued = workPermit?.status === 'ISSUED'

  return (
    <StudentLayout currentStep="workpermit">
      <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Work Permit</h1>
              <p className="text-muted-foreground text-sm">Your work authorization document</p>
            </div>
          </div>
        </div>

        {/* Status Card */}
        {isIssued ? (
          <Card className="p-0 overflow-hidden border-none shadow-xl">
            {/* Green header */}
            <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500" />
            <div className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-9 h-9 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">Work Permit Issued!</h2>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">ACTIVE</span>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Your work permit has been issued and is ready for download. 
                    Please keep this document safe as it will be required during your internship.
                  </p>
                  {workPermit.notes && (
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-700">{workPermit.notes}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                    <a href={workPermit.documentUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="lg" className="gap-3 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20">
                        <FileDown className="w-5 h-5" />
                        Download Work Permit
                      </Button>
                    </a>
                    <Link href="/dashboard/visa">
                      <Button variant="outline" size="lg" className="gap-2">
                        Next: Visa Appointment <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-0 overflow-hidden border-none shadow-xl">
            <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-400" />
            <div className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0 relative">
                  <Clock className="w-9 h-9 text-amber-500" />
                  <div className="absolute inset-0 rounded-2xl border-4 border-amber-200 border-t-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">Work Permit Processing</h2>
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider animate-pulse">PROCESSING</span>
                  </div>
                  <p className="text-muted-foreground">
                    Our team is processing your work permit application. 
                    This typically takes <strong>5–7 business days</strong>. 
                    You will be notified as soon as it is ready.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Progress Steps */}
        <Card className="p-6 border-none bg-white shadow-sm">
          <h3 className="font-bold mb-5 text-lg">Process Overview</h3>
          <div className="space-y-4">
            {[
              { label: 'Application Submitted', description: 'Your application details have been forwarded.', done: true },
              { label: 'Payment 3 Verified', description: 'Final payment confirmed by our team.', done: true },
              { label: 'Document Processing', description: 'Government authorities reviewing your application.', done: isIssued },
              { label: 'Work Permit Issued', description: 'Document ready for download.', done: isIssued },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${step.done ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {step.done ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <div className="w-2 h-2 rounded-full bg-gray-400" />}
                </div>
                <div>
                  <p className={`font-semibold ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Info box */}
        <Card className="p-6 bg-secondary/10 border-none rounded-2xl">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" /> Important Notes
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              'Keep your work permit document safely stored throughout your internship.',
              'Do not tamper with or modify this official government document.',
              'You must carry this document at your workplace at all times.',
              'For any queries, contact your internship coordinator.',
            ].map((note, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                {note}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </StudentLayout>
  )
}
