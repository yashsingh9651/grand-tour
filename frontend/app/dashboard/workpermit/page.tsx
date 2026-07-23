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
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => { fetchData() }, [])

  const handleProceedToVisa = async () => {
    try {
      setTransitioning(true)
      await applicationService.updateStep(application.id, 'visapayments')
      toast.success('Proceeding to visa payments stage!')
      window.location.href = '/dashboard/visapayments'
    } catch {
      toast.error('Failed to update stage')
      setTransitioning(false)
    }
  }

  const fetchData = async () => {
    try {
      const appData = await applicationService.getMy()
      setApplication(appData)

      if (appData?.currentStepId === 'workpermit' || appData?.currentStepId === 'visapayments' || appData?.currentStepId === 'visa' || appData?.currentStepId === 'travel') {
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

  const isUnlocked = ['workpermit', 'payment3', 'visapayments', 'visa', 'googlerate', 'travel'].includes(application?.currentStepId) || !!application?.workPermit?.documentUrl

  if (!isUnlocked) {
    return (
      <StudentLayout currentStep="workpermit">
        <div className="max-w-3xl rounded-3xl border-2 border-dashed border-border bg-secondary/20 p-12 flex flex-col items-center text-center text-foreground mx-auto mt-10">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">Work Permit / DREET — Locked</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            Your Work Permit / DREET step will be unlocked once your previous steps are completed.
          </p>
          <Button className="mt-8" onClick={() => window.location.href = `/dashboard/${application?.currentStepId || 'application'}`}>
            Return to Current Step <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </StudentLayout>
    )
  }

  const isIssued = workPermit?.status === 'ISSUED' || !!workPermit?.documentUrl
  const payment3Record = (application?.payments || []).find((p: any) =>
    ((p.description || '').toLowerCase().includes('payment3') || (p.description || '').toLowerCase().includes('3rd'))
  )
  const isPayment3Approved = application?.payment3?.status === 'COMPLETED' || payment3Record?.status === 'COMPLETED'
  const isPayment3Pending = payment3Record?.status === 'PENDING'

  return (
    <StudentLayout currentStep="workpermit">
      <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-foreground">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Work Permit / DREET</h1>
              <p className="text-muted-foreground text-sm">Your work authorization and DREET documents</p>
            </div>
          </div>
        </div>

        {/* Status Card */}
        {isIssued ? (
          <div className="space-y-6">
            <Card className="p-0 overflow-hidden border border-border shadow-md bg-card">
              {/* Green header */}
              <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500" />
              <div className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-9 h-9 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold">Work Permit Uploaded by Admin!</h2>
                      <span className="px-3 py-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider">UNLOCKED</span>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      The administration has uploaded your official Work Permit (Autorisation de travail). Your <strong>3rd Installment Payment</strong> is now unlocked!
                    </p>
                    {!isPayment3Approved && (
                      <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-xl mb-6 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                            {isPayment3Pending ? 'Payment Under Admin Review' : 'Admin Payment Approval Required'}
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                            {isPayment3Pending
                              ? 'Your 3rd installment payment receipt has been submitted and is under admin verification. Work permit download will unlock automatically once approved.'
                              : 'Please pay and submit your 3rd installment payment receipt. Once approved by the admin, your Work Permit file download and next step will unlock.'}
                          </p>
                        </div>
                      </div>
                    )}
                    {workPermit.notes && (
                      <div className="p-4 bg-blue-500/10 border border-blue-500/25 rounded-xl mb-6 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-700 dark:text-blue-300">{workPermit.notes}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      {!isPayment3Approved && (
                        <Button 
                          size="lg" 
                          onClick={() => window.location.href = '/dashboard/payment3'}
                          className="gap-2 bg-primary text-[#1A1A1A] font-extrabold hover:bg-primary/90"
                        >
                          Go to 3rd Payment Page <ChevronRight className="w-4 h-4" />
                        </Button>
                      )}
                      {isPayment3Approved && (
                        <Button 
                          variant="outline" 
                          size="lg" 
                          onClick={handleProceedToVisa} 
                          disabled={transitioning}
                          className="gap-2 border-border hover:bg-muted text-foreground"
                        >
                          {transitioning ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>Next: Visa Payments <ChevronRight className="w-4 h-4" /></>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Document Download Cards Grid */}
            {isPayment3Approved ? (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Document 1 Card */}
                {workPermit.documentUrl && (
                  <Card className="p-6 border border-border bg-card shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-bold text-foreground">Work Permit / DREET Document 1</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Primary work permit authorization approved by the Ministry of Labour.
                      </p>
                    </div>
                    <a 
                      href={workPermit.documentUrl?.includes('cloudinary.com') ? workPermit.documentUrl.replace('/upload/', '/upload/fl_attachment/') : workPermit.documentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full pt-2"
                    >
                      <Button className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 text-xs font-bold">
                        <FileDown className="w-4 h-4" /> Download Document 1
                      </Button>
                    </a>
                  </Card>
                )}

                {/* Document 2 Card */}
                {workPermit.documentUrl2 && (
                  <Card className="p-6 border border-border bg-card shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-bold text-foreground">Work Permit Document 2</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Secondary work permit or supporting administrative document.
                      </p>
                    </div>
                    <a 
                      href={workPermit.documentUrl2?.includes('cloudinary.com') ? workPermit.documentUrl2.replace('/upload/', '/upload/fl_attachment/') : workPermit.documentUrl2} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full pt-2"
                    >
                      <Button className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl h-10 text-xs font-bold">
                        <FileDown className="w-4 h-4" /> Download Document 2
                      </Button>
                    </a>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="p-6 border border-dashed border-amber-500/30 bg-amber-500/5 rounded-2xl text-center space-y-3">
                <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400 mx-auto" />
                <h3 className="font-bold text-foreground text-sm">Work Permit File Download Locked</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  {isPayment3Pending
                    ? 'Your 3rd installment payment is currently being verified by the admin. Work permit download will unlock upon admin approval.'
                    : 'Submit and get your 3rd installment payment approved by the admin to unlock your work permit file download.'}
                </p>
                <Button 
                  size="sm"
                  onClick={() => window.location.href = '/dashboard/payment3'}
                  className="bg-primary text-[#1A1A1A] font-bold text-xs hover:bg-primary/90 mt-2"
                >
                  Go to 3rd Payment Page →
                </Button>
              </Card>
            )}
          </div>
        ) : (
          <Card className="p-0 overflow-hidden border border-border shadow-md bg-card">
            <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-400" />
            <div className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center flex-shrink-0 relative">
                  <Clock className="w-9 h-9 text-amber-500 animate-pulse" />
                  <div className="absolute inset-0 rounded-2xl border-4 border-amber-500/20 border-t-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">Awaiting Work Permit Upload</h2>
                    <span className="px-3 py-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-full uppercase tracking-wider animate-pulse">PROCESSING</span>
                  </div>
                  <p className="text-muted-foreground">
                    From the administration panel, our team is processing and uploading your official Work Permit (Autorisation de travail). 
                    As soon as the admin uploads your work permit, your <strong>3rd Installment Payment</strong> will unlock.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Progress Steps */}
        <Card className="p-6 border border-border bg-card shadow-sm">
          <h3 className="font-bold mb-5 text-lg">Process Overview</h3>
          <div className="space-y-4">
            {[
              { label: 'Application Submitted', description: 'Your application details have been forwarded.', done: true },
              { label: 'Payment 3 Verified', description: 'Final payment confirmed by our team.', done: true },
              { label: 'Document Processing', description: 'Government authorities reviewing your application.', done: isIssued },
              { label: 'Work Permit Issued', description: 'Document ready for download.', done: isIssued },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${step.done ? 'bg-emerald-500/15' : 'bg-muted'}`}>
                  {step.done ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <div className="w-2 h-2 rounded-full bg-muted-foreground" />}
                </div>
                <div>
                  <p className={`font-semibold ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </StudentLayout>
  )
}
