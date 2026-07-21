'use client'

import { useState, useEffect, use, useMemo } from 'react'
import { StudentLayout } from '@/components/student/student-layout'
import { applicationService, workflowService } from '@/lib/services/api.service'
import { DynamicForm } from '@/components/student/dynamic-form'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { SlotPicker } from '@/components/interviews/slot-picker'
import { QrCode, IndianRupee, Copy, Upload, CheckCircle2, Info, Star } from 'lucide-react'
import UploadPopup from '@/components/UploadPopup'
import { useSession } from 'next-auth/react'
import { paymentService } from '@/lib/services/api.service'
import { Input } from '@/components/ui/input'
import { ProfileBuilderStep } from '@/components/student/profile-builder-step'
import { ContractStep } from '@/components/student/contract-step'

export default function DynamicStepPage({ params }: { params: Promise<{ stepId: string }> }) {
  const router = useRouter()
  const { stepId } = use(params)
  const { data: session } = useSession()
  const [application, setApplication] = useState<any>(null)
  const [workflow, setWorkflow] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [utrNumber, setUtrNumber] = useState('')
  const [screenshotUrl, setScreenshotUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isVideoUploadOpen, setIsVideoUploadOpen] = useState(false)
  
  const currentStepConfig = workflow?.steps?.find((s: any) => s.id === stepId)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [appData, wfData] = await Promise.all([
          applicationService.getMy(),
          workflowService.get()
        ])
        setApplication(appData)
        setWorkflow(wfData)
        
        // Reset screenshot and video URL by default on step change
        setScreenshotUrl('')
        setVideoUrl('')
        
        // Pre-populate if google review documents exist
        if (appData?.documents) {
          const googleDoc = appData.documents.find((d: any) => d.type === 'google_review_screenshot')
          if (googleDoc) {
            setScreenshotUrl(googleDoc.url)
          }
          const videoDoc = appData.documents.find((d: any) => d.type === 'google_review_video')
          if (videoDoc) {
            setVideoUrl(videoDoc.url)
          }
        }
      } catch (error: any) {
        toast.error('Failed to load step data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [stepId])

  const currentStepIndex = workflow?.steps?.findIndex((s: any) => s.id === application?.currentStepId) ?? -1
  const targetStepIndex = workflow?.steps?.findIndex((s: any) => s.id === stepId) ?? -1
  const isStepLocked = currentStepIndex >= 0 && targetStepIndex > currentStepIndex
  const activeStep = workflow?.steps?.find((s: any) => s.id === application?.currentStepId)


  const handleSubmit = async (formData: any, overrideApp?: any) => {
    console.log('--- DynamicStepPage handleSubmit ---')
    console.log('Step ID:', stepId)
    console.log('Form Data:', formData)

    const currentApp = overrideApp || application

    try {
      setSubmitting(true)
      const isFinalStep = currentStepConfig?.isInterviewStep
      console.log('Is Final Step:', isFinalStep)

      // Determine next step
      let nextStepId = stepId
      const currentIdx = workflow.steps.findIndex((s: any) => s.id === stepId)
      if (currentIdx !== -1 && currentIdx < workflow.steps.length - 1) {
        nextStepId = workflow.steps[currentIdx + 1].id
      }
      console.log('Calculated Next Step ID:', nextStepId)

      // Only update currentStepId if it's further than the current one
      const allWorkflowSteps = [
        ...(workflow?.steps || [])
      ]

      const currentDBStepIdx = allWorkflowSteps.findIndex(s => s.id === currentApp?.currentStepId)
      const targetStepIdx = allWorkflowSteps.findIndex(s => s.id === nextStepId)
      console.log('Index Tracking:', { currentDBStepIdx, targetStepIdx })

      // Nest data by Stage and Section
      const stageName = currentStepConfig?.name || stepId
      const nestedData: any = { [stageName]: {} }

      let currentSectionName = 'General'
      currentStepConfig?.fields.forEach((f: any) => {
        if (f.type === 'section') {
          currentSectionName = f.name
        } else {
          if (!nestedData[stageName][currentSectionName]) {
            nestedData[stageName][currentSectionName] = {}
          }
          if (formData[f.id] !== undefined) {
            nestedData[stageName][currentSectionName][f.name] = formData[f.id]
          }
        }
      })
      console.log('Nested Data Structure:', nestedData)

      const updatedPayload = {
        ...currentApp,
        data: { ...(currentApp?.data || {}), ...nestedData },
        status: isFinalStep ? 'PENDING' : (currentApp?.status || 'DRAFT'),
        // Only advance currentStepId if it's NOT the interview step
        currentStepId: (targetStepIdx > currentDBStepIdx && !isFinalStep) ? nextStepId : currentApp?.currentStepId
      }
      console.log('Sending Payload to API:', updatedPayload)

      const updatedApp = await applicationService.create(updatedPayload)
      console.log('API Response:', updatedApp)

      setApplication(updatedApp)

      if (isFinalStep) {
        toast.success('Interview scheduled! Please wait for approval.')
      } else {
        toast.success('Progress saved!')
        if (nextStepId !== stepId && !isFinalStep) {
          console.log('Navigating to:', `/dashboard/${nextStepId}`)
          router.push(`/dashboard/${nextStepId}`)
        }
      }
    } catch (error: any) {
      console.error('Submission Error:', error)
      toast.error('Failed to update information')
    } finally {
      setSubmitting(false)
      console.log('--- Submission End ---')
    }
  }

  const initialFormData = useMemo(() => {
    if (!application?.data || !currentStepConfig?.fields) return {}
    
    const flatData: any = {}
    const stageName = currentStepConfig.name || stepId
    const stageData = application.data[stageName]
    
    currentStepConfig.fields.forEach((f: any) => {
      if (f.type === 'section') return
      
      // 1. Try to find in nested stage/section structure
      if (stageData) {
        for (const sectionName in stageData) {
          if (stageData[sectionName][f.name] !== undefined) {
            flatData[f.id] = stageData[sectionName][f.name]
            break
          }
        }
      }
      
      // 2. Fallback to old flat format if not found in nested structure
      if (flatData[f.id] === undefined && application.data[f.id] !== undefined) {
        flatData[f.id] = application.data[f.id]
      }
    })
    
    return flatData
  }, [application, currentStepConfig, stepId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!currentStepConfig) {
    return (
      <StudentLayout currentStep={application?.currentStepId}>
        <div className="max-w-4xl p-12 text-center border-dashed border-2 rounded-2xl mx-auto mt-10">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Step Not Found</h2>
          <p className="text-muted-foreground">The workflow step you are looking for does not exist or has been removed.</p>
          <Button 
            className="mt-6" 
            onClick={() => router.push(`/dashboard/${application?.currentStepId || 'application'}`)}
          >
            Back to Active Step
          </Button>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout currentStep={application?.currentStepId}>
      <div className="max-w-4xl space-y-6">
        {isStepLocked ? (
          <Card className="p-8 border-2 border-dashed border-primary/30 bg-primary/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Stage Locked</h2>
                <p className="text-muted-foreground">
                  This stage is locked until your current workflow step is completed. You are currently on <span className="font-semibold text-foreground">{activeStep?.name || 'the active stage'}</span>.
                </p>
                <Button onClick={() => router.push(`/dashboard/${application?.currentStepId || 'application'}`)} className="mt-2">
                  Return to Current Step
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{currentStepConfig.name}</h1>
              <p className="text-muted-foreground">{currentStepConfig.description || 'Complete the required actions for this stage'}</p>
            </div>

            {/* Step Status Card */}
        <Card className="p-6 border-l-4 border-l-primary bg-primary/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Current Progress</h3>
              <p className="text-sm text-muted-foreground">
                Follow the instructions below to complete the {currentStepConfig.name} stage.
              </p>
            </div>
          </div>
        </Card>

        {/* Dynamic Content */}
        {application?.status === 'ACCEPTED' && currentStepConfig.isInterviewStep ? (
          <div className="space-y-6">
            <Card className="p-12 text-center space-y-6 border-2 border-green-500/20 bg-gradient-to-br from-background to-green-50/30 rounded-[2.5rem] shadow-2xl shadow-green-500/10">
              <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-black tracking-tight text-green-700">Application Approved!</h2>
                <p className="text-muted-foreground max-w-md mx-auto font-medium">
                  Congratulations! Your technical interview and application have been approved. You are now ready to proceed to the next stage.
                </p>
                <div className="pt-2">
                  <span className="px-4 py-2 bg-green-500/10 text-green-600 rounded-full text-xs font-black uppercase tracking-widest border border-green-500/20">
                    Status: Approved
                  </span>
                </div>
              </div>
              <div className="pt-8 border-t border-green-500/10">
                <p className="text-sm text-muted-foreground mb-6">
                  Please proceed to the next step to complete your program payment.
                </p>
                <Button 
                  onClick={() => {
                    const currentIdx = workflow.steps.findIndex((s: any) => s.id === stepId)
                    if (currentIdx !== -1 && currentIdx < workflow.steps.length - 1) {
                      router.push(`/dashboard/${workflow.steps[currentIdx + 1].id}`)
                    }
                  }}
                  className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2"
                >
                  Go to Payment Stage
                  <CheckCircle className="w-5 h-5" />
                </Button>
              </div>
            </Card>
          </div>
        ) : application?.status === 'PENDING' && currentStepConfig.isInterviewStep ? (
          <div className="space-y-6">
            <Card className="p-12 text-center space-y-6 border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5 rounded-[2.5rem] shadow-2xl shadow-primary/10">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Clock className="w-12 h-12 text-primary" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-black tracking-tight">Waiting for Approval</h2>
                <p className="text-muted-foreground max-w-md mx-auto font-medium">
                  Your interview has been scheduled successfully! Our team is now reviewing your application.
                </p>
                <div className="pt-2">
                  <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest border border-primary/20">
                    Status: Under Review
                  </span>
                </div>
              </div>
              <div className="pt-8 border-t border-primary/5">
                <p className="text-sm text-muted-foreground mb-4">
                  Please wait until your application gets approved to proceed to the payment step.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="h-12 px-8 rounded-xl font-bold hover:bg-primary hover:text-white transition-all"
                >
                  Refresh Status
                </Button>
              </div>
            </Card>
          </div>
        ) : currentStepConfig.isPaymentStep ? (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Payment Details */}
              <Card className="p-8 border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5 rounded-[2.5rem] shadow-xl">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <IndianRupee className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black">Base Amount</h2>
                      <p className="text-3xl font-black text-primary">₹{(currentStepConfig.amount || 0).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2 text-sm bg-primary/5 p-4 rounded-xl border border-primary/10">
                      {currentStepConfig.discountPercentage > 0 && (
                        <div className="flex justify-between items-center text-emerald-600 font-medium">
                          <span>Discount ({currentStepConfig.discountPercentage}%)</span>
                          <span>-₹{((currentStepConfig.amount || 0) * currentStepConfig.discountPercentage / 100).toLocaleString()}</span>
                        </div>
                      )}
                      {currentStepConfig.gstPercentage > 0 && (
                        <div className="flex justify-between items-center text-slate-600 font-medium">
                          <span>GST ({currentStepConfig.gstPercentage}%)</span>
                          <span>+₹{(((currentStepConfig.amount || 0) * (1 - (currentStepConfig.discountPercentage || 0) / 100)) * currentStepConfig.gstPercentage / 100).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-primary/20 flex justify-between items-center font-black text-lg text-primary">
                        <span>Total Payable</span>
                        <span>₹{
                          ((currentStepConfig.amount || 0) 
                          * (1 - (currentStepConfig.discountPercentage || 0) / 100) 
                          * (1 + (currentStepConfig.gstPercentage || 0) / 100)).toLocaleString()
                        }</span>
                      </div>
                    </div>

                    <div className="p-4 bg-white/50 backdrop-blur-sm border border-primary/10 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground font-medium">Account Name</span>
                        <span className="font-bold">{currentStepConfig.paymentConfig?.accountName || 'Not configured'}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground font-medium">Bank Name</span>
                        <span className="font-bold">{currentStepConfig.paymentConfig?.bankName || 'Not configured'}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground font-medium">Account Number</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-primary">{currentStepConfig.paymentConfig?.accountNumber || 'N/A'}</span>
                          {currentStepConfig.paymentConfig?.accountNumber && (
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                              navigator.clipboard.writeText(currentStepConfig.paymentConfig?.accountNumber || '')
                              toast.success('Account number copied')
                            }}>
                              <Copy className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground font-medium">IFSC Code</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-primary">{currentStepConfig.paymentConfig?.ifsc || 'N/A'}</span>
                          {currentStepConfig.paymentConfig?.ifsc && (
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                              navigator.clipboard.writeText(currentStepConfig.paymentConfig?.ifsc || '')
                              toast.success('IFSC code copied')
                            }}>
                              <Copy className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-3">
                      <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <p className="text-xs text-amber-800 font-medium leading-relaxed">
                        Please ensure you transfer the exact amount. Mention your Application ID in the transaction notes for faster verification.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* QR & Submission */}
              <Card className="p-8 border-2 border-slate-200 bg-white rounded-[2.5rem] shadow-xl">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold">Scan & Pay</h3>
                    <p className="text-sm text-muted-foreground">Scan this QR code using any UPI app</p>
                  </div>
                  
                  <div className="p-4 bg-white-force rounded-3xl border border-slate-200">
                    <img 
                      src={currentStepConfig.paymentConfig?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${currentStepConfig.paymentConfig?.accountNumber}@${currentStepConfig.paymentConfig?.ifsc}&pn=${encodeURIComponent(currentStepConfig.paymentConfig?.accountName || 'Company')}&am=${((currentStepConfig.amount || 0) * (1 - (currentStepConfig.discountPercentage || 0) / 100) * (1 + (currentStepConfig.gstPercentage || 0) / 100))}&cu=INR`} 
                      alt="Payment QR Code"
                      className="w-48 h-48"
                    />
                  </div>

                    <div className="w-full space-y-4">
                      <div className="space-y-2 text-left">
                        <label className="text-sm font-bold text-slate-700 ml-1">Payment Screenshot</label>
                        {screenshotUrl ? (
                          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-medium text-green-700 truncate flex-1">Receipt uploaded</span>
                            <Button variant="ghost" size="sm" className="h-8 text-green-600 hover:text-green-700 hover:bg-green-100" onClick={() => setIsUploadOpen(true)}>
                              Change
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            onClick={() => setIsUploadOpen(true)}
                            className="w-full h-12 rounded-xl border-dashed border-2 border-slate-300 text-slate-500 hover:border-primary hover:text-primary transition-all gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            Upload Receipt
                          </Button>
                        )}
                      </div>

                      <Button 
                        onClick={async () => {
                          if (!screenshotUrl) {
                            toast.error('Please upload your receipt screenshot')
                            return
                          }
                          try {
                            setSubmitting(true)
                            const payment = await paymentService.submit({
                              amount: currentStepConfig.amount,
                              applicationId: application?.id,
                              utrNumber: 'N/A',
                              screenshotUrl,
                              description: `Payment for ${currentStepConfig.name}`
                            })
                            const updatedApp = { ...application, payment1: payment }
                            setApplication(updatedApp)
                            await applicationService.update(updatedApp.id, updatedApp)
                            toast.success('Payment submitted for verification!')
                            // Advance step or show pending state
                            await handleSubmit({ paymentSubmitted: true }, updatedApp)
                          } catch (error) {
                            toast.error('Failed to submit payment')
                          } finally {
                            setSubmitting(false)
                          }
                        }}
                        disabled={submitting || !screenshotUrl}
                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                      >
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Payment'}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <UploadPopup 
              isOpen={isUploadOpen}
              onClose={() => setIsUploadOpen(false)}
              onUploadComplete={(doc) => {
                setScreenshotUrl(doc.url)
                toast.success('Screenshot uploaded!')
              }}
              token={(session as any)?.backendToken || ''}
              applicationId={application?.id}
              documentType="payment_receipt"
              documentName={`Payment Receipt - ${currentStepConfig.name}`}
            />
          </div>
        ) : currentStepConfig.isInterviewStep ? (
          <div className="space-y-6">
            <Card className="p-8 border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
              <div className="space-y-4 text-center mb-8">
                <h2 className="text-2xl font-bold tracking-tight">Schedule Your Interview</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Finalize your application by selecting a convenient time for your internship interview.
                </p>
              </div>

              <div className="w-full">
                <SlotPicker 
                  applicationId={application.id} 
                  onComplete={() => handleSubmit({ manualBooking: true })}
                />
              </div>

            </Card>
          </div>
        ) : currentStepConfig.isContractStep ? (
          <ContractStep
            application={application}
            currentStepConfig={currentStepConfig}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        ) : (stepId === 'googlerate' || currentStepConfig.isGoogleRateStep) ? (
          <div className="space-y-6">
            <Card className="p-8 lg:p-12 border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5 rounded-[2.5rem] shadow-2xl shadow-primary/5 max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
                  <Star className="w-10 h-10 text-amber-500 fill-amber-500 animate-pulse" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl font-black tracking-tight text-foreground">Rate Us on Google & Share a Video Review</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
                    Thank you for choosing Grand Tour! Your feedback is invaluable to us. Please take a moment to rate your experience on Google, record a quick video review sharing your journey, and upload both below to unlock your final travel step.
                  </p>
                </div>

                <div className="w-full pt-2 max-w-md">
                  <a 
                    href="https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83dQkw" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex w-full h-14 items-center justify-center rounded-2xl font-black uppercase tracking-widest bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2"
                  >
                    Rate on Google
                    <Star className="w-5 h-5 fill-white" />
                  </a>
                </div>

                <div className="w-full border-t border-slate-200/60 my-2 pt-6 text-left grid md:grid-cols-2 gap-6">
                  {/* Left Column: Google Review Screenshot */}
                  <div className="space-y-3">
                    <label className="text-sm font-black text-slate-700 ml-1">Upload Review Screenshot</label>
                    {screenshotUrl ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-green-700 truncate">Screenshot Uploaded</p>
                            <p className="text-[10px] text-green-600/80 truncate font-semibold">Proof saved successfully.</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-green-600 hover:text-green-700 hover:bg-green-100 shrink-0 text-[10px] px-2 font-bold" 
                            onClick={() => setIsUploadOpen(true)}
                          >
                            Change
                          </Button>
                        </div>
                        <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shadow-inner">
                          <img src={screenshotUrl} alt="Review Screenshot Preview" className="h-full w-full object-contain" />
                        </div>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        onClick={() => setIsUploadOpen(true)}
                        className="w-full h-64 rounded-3xl border-dashed border-2 border-slate-300 text-slate-500 hover:border-primary hover:text-primary transition-all flex flex-col items-center justify-center gap-2 bg-slate-50/50"
                      >
                        <Upload className="w-8 h-8 text-slate-400" />
                        <span className="font-bold text-sm">Click to upload screenshot</span>
                        <span className="text-[10px] text-muted-foreground">PNG, JPG or PDF (Max. 50MB)</span>
                      </Button>
                    )}
                  </div>

                  {/* Right Column: Video Review Feedback */}
                  <div className="space-y-3">
                    <label className="text-sm font-black text-slate-700 ml-1">Upload Video Review</label>
                    {videoUrl ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-green-700 truncate">Video Uploaded</p>
                            <p className="text-[10px] text-green-600/80 truncate font-semibold">Video review saved successfully.</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-green-600 hover:text-green-700 hover:bg-green-100 shrink-0 text-[10px] px-2 font-bold" 
                            onClick={() => setIsVideoUploadOpen(true)}
                          >
                            Change
                          </Button>
                        </div>
                        <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shadow-inner">
                          <video src={videoUrl} controls className="h-full w-full object-contain" />
                        </div>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        onClick={() => setIsVideoUploadOpen(true)}
                        className="w-full h-64 rounded-3xl border-dashed border-2 border-slate-300 text-slate-500 hover:border-primary hover:text-primary transition-all flex flex-col items-center justify-center gap-2 bg-slate-50/50"
                      >
                        <Upload className="w-8 h-8 text-slate-400" />
                        <span className="font-bold text-sm">Click to upload video</span>
                        <span className="text-[10px] text-muted-foreground">MP4, MOV or AVI (Max. 50MB)</span>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="w-full pt-4">
                  <Button 
                    onClick={async () => {
                      if (!screenshotUrl || !videoUrl) {
                        toast.error('Please upload both your screenshot and video review')
                        return
                      }
                      try {
                        setSubmitting(true)
                        await handleSubmit({ googleRated: true })
                      } catch (error) {
                        toast.error('Failed to submit step')
                      } finally {
                        setSubmitting(false)
                      }
                    }}
                    disabled={submitting || !screenshotUrl || !videoUrl}
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Proceed to Final Step'}
                  </Button>
                  {(!screenshotUrl || !videoUrl) && (
                    <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wider mt-2 text-center">
                      * Please upload both a screenshot and a video review to proceed.
                    </p>
                  )}
                </div>
              </div>
            </Card>

            <UploadPopup 
              isOpen={isUploadOpen}
              onClose={() => setIsUploadOpen(false)}
              onUploadComplete={(doc) => {
                setScreenshotUrl(doc.url)
                toast.success('Screenshot uploaded!')
              }}
              token={(session as any)?.backendToken || ''}
              applicationId={application?.id}
              documentType="google_review_screenshot"
              documentName={`Google Review Screenshot - ${currentStepConfig.name}`}
            />

            <UploadPopup 
              isOpen={isVideoUploadOpen}
              onClose={() => setIsVideoUploadOpen(false)}
              onUploadComplete={(doc) => {
                setVideoUrl(doc.url)
                toast.success('Video review uploaded!')
              }}
              token={(session as any)?.backendToken || ''}
              applicationId={application?.id}
              documentType="google_review_video"
              documentName={`Google Review Video - ${currentStepConfig.name}`}
            />
          </div>
        ) : (stepId === 'application' || currentStepConfig.name.toLowerCase().includes('profile')) ? (
          <ProfileBuilderStep 
            application={application}
            currentStepConfig={currentStepConfig}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        ) : currentStepConfig.fields && currentStepConfig.fields.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Stage Requirements</h2>
            <DynamicForm
              key={stepId}
              fields={currentStepConfig.fields}
              onSubmit={handleSubmit}
              initialData={initialFormData}
              submitting={submitting}
              buttonText="Save & Continue"
              applicationId={application?.id}
            />
          </div>
        ) : (
          <Card className="p-12 text-center space-y-4 border-dashed">
            <h3 className="text-lg font-semibold text-muted-foreground">Awaiting Updates</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              There are no specific fields to fill in for this stage yet. Our team will update you when actions are required.
            </p>
          </Card>
        )}
          </>
        )}
      </div>
    </StudentLayout>
  )
}
