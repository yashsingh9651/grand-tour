'use client'

import { useState, useEffect } from 'react'
import { StudentLayout } from '@/components/student/student-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { applicationService, workflowService, paymentService } from '@/lib/services/api.service'
import UploadPopup from '@/components/UploadPopup'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import {
  Loader2, Check, Lock, UploadCloud, Eye, X, Copy,
  Landmark, Clock, IndianRupee, CheckCircle2, Info, ChevronRight, AlertCircle
} from 'lucide-react'

const STEP_ID = 'visapayments'
const STEP_LABEL = 'Visa Payments'
const PREV_STEP_LABEL = 'Work Permit approval'

export default function VisaPaymentsPage() {
  const { data: session } = useSession()
  const token = (session as any)?.backendToken || ''

  const [application, setApplication] = useState<any>(null)
  const [workflow, setWorkflow] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [transitioning, setTransitioning] = useState(false)

  // Upload popup metadata state
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploadDocType, setUploadDocType] = useState('')
  const [uploadDocName, setUploadDocName] = useState('')
  const [activePaymentType, setActivePaymentType] = useState<'visaFee' | 'sevisFee' | 'miscFee' | null>(null)

  // Payment inputs state
  const [utrVisa, setUtrVisa] = useState('')
  const [screenshotVisa, setScreenshotVisa] = useState('')
  const [submittingVisa, setSubmittingVisa] = useState(false)

  const [utrSevis, setUtrSevis] = useState('')
  const [screenshotSevis, setScreenshotSevis] = useState('')
  const [submittingSevis, setSubmittingSevis] = useState(false)

  const [utrMisc, setUtrMisc] = useState('')
  const [screenshotMisc, setScreenshotMisc] = useState('')
  const [submittingMisc, setSubmittingMisc] = useState(false)

  const [viewingProofUrl, setViewingProofUrl] = useState<string | null>(null)
  const [viewingReceiptName, setViewingReceiptName] = useState<string>('')

  // Load config from workflow step
  const visapaymentsStepConfig = workflow?.steps?.find((s: any) => s.id === 'visapayments')
  const amountsConfig = visapaymentsStepConfig?.amounts || {
    visaFee: 15000,
    visaFeeName: 'Visa Processing Fee',
    sevisFee: 25000,
    sevisFeeName: 'SEVIS & Insurance Fee',
    miscFee: 5000,
    miscFeeName: 'Courier / Miscellaneous Fee'
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const [appData, wfData] = await Promise.all([
        applicationService.getMy(),
        workflowService.get()
      ])
      setApplication(appData)
      setWorkflow(wfData)
    } catch {
      toast.error('Failed to load payment details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleUploadComplete = (doc: any) => {
    if (activePaymentType === 'visaFee') {
      setScreenshotVisa(doc.url)
    } else if (activePaymentType === 'sevisFee') {
      setScreenshotSevis(doc.url)
    } else if (activePaymentType === 'miscFee') {
      setScreenshotMisc(doc.url)
    }
    toast.success('Screenshot uploaded successfully!')
    setIsUploadOpen(false)
  }

  const handleOpenUpload = (type: 'visaFee' | 'sevisFee' | 'miscFee', label: string) => {
    setActivePaymentType(type)
    setUploadDocType(`${type}_receipt`)
    setUploadDocName(`${label} Receipt`)
    setIsUploadOpen(true)
  }

  const handlePaymentSubmit = async (type: 'visaFee' | 'sevisFee' | 'miscFee') => {
    let utr = ''
    let screenshot = ''
    let amount = 0
    let description = ''
    let setSubmitting: any = null

    if (type === 'visaFee') {
      utr = utrVisa
      screenshot = screenshotVisa
      amount = Number(amountsConfig.visaFee || 15000)
      description = amountsConfig.visaFeeName || 'Visa Processing Fee'
      setSubmitting = setSubmittingVisa
    } else if (type === 'sevisFee') {
      utr = utrSevis
      screenshot = screenshotSevis
      amount = Number(amountsConfig.sevisFee || 25000)
      description = amountsConfig.sevisFeeName || 'SEVIS & Insurance Fee'
      setSubmitting = setSubmittingSevis
    } else if (type === 'miscFee') {
      utr = utrMisc
      screenshot = screenshotMisc
      amount = Number(amountsConfig.miscFee || 5000)
      description = amountsConfig.miscFeeName || 'Miscellaneous Fee'
      setSubmitting = setSubmittingMisc
    }

    if (!utr || !screenshot) {
      toast.error('Please provide UTR number and receipt screenshot')
      return
    }

    try {
      setSubmitting(true)
      await paymentService.submit({
        amount,
        applicationId: application?.id,
        utrNumber: utr,
        screenshotUrl: screenshot,
        description
      })
      toast.success(`${description} submitted for verification!`)
      fetchData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit payment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleProceedToVisa = async () => {
    try {
      setTransitioning(true)
      await applicationService.updateStep(application.id, 'visa')
      toast.success('Workflow updated! Proceeding to visa stage.')
      window.location.href = '/dashboard/visa'
    } catch {
      toast.error('Failed to transition to visa stage')
      setTransitioning(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const journeySteps = [
    'application',
    'documents',
    'interview',
    'payment1',
    'hotel',
    'payment2',
    'contract',
    'payment3',
    'workpermit',
    'visapayments',
    'visa',
    'travel'
  ]
  const currentStepId = application?.currentStepId || 'application'
  const currentStepIndex = journeySteps.indexOf(currentStepId) ?? -1
  const targetStepIndex = journeySteps.indexOf(STEP_ID) ?? -1
  const isUnlocked = currentStepIndex >= 0 && targetStepIndex <= currentStepIndex

  if (!isUnlocked) {
    return (
      <StudentLayout currentStep={STEP_ID}>
        <div className="max-w-3xl rounded-3xl border border-dashed border-border bg-secondary/20 p-8 text-foreground mx-auto mt-10">
          <h2 className="text-2xl font-bold">{STEP_LABEL} — Locked</h2>
          <p className="mt-2 text-muted-foreground">
            {STEP_LABEL} will unlock after {PREV_STEP_LABEL}.
          </p>
          <Button
            className="mt-5 bg-primary text-[#1A1A1A] font-bold hover:bg-primary/90"
            onClick={() => window.location.href = `/dashboard/${application?.currentStepId || 'application'}`}
          >
            Return to Current Step
          </Button>
        </div>
      </StudentLayout>
    )
  }

  // Parse candidate payments to find status for each slot
  const candidatePayments = application?.payments || []
  
  const getPaymentStatus = (descMatch: string) => {
    const matches = candidatePayments.filter((p: any) => 
      (p.description || '').toLowerCase().includes(descMatch.toLowerCase())
    )
    const sorted = [...matches].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return sorted[0] // Return the latest submission
  }

  const visaPayment = getPaymentStatus(amountsConfig.visaFeeName || 'visa fee')
  const sevisPayment = getPaymentStatus(amountsConfig.sevisFeeName || 'sevis fee')
  const miscPayment = getPaymentStatus(amountsConfig.miscFeeName || 'misc fee') || getPaymentStatus('miscellaneous fee')

  const allPaymentsApproved = 
    visaPayment?.status === 'COMPLETED' && 
    sevisPayment?.status === 'COMPLETED' && 
    miscPayment?.status === 'COMPLETED'

  // Bank Info from workflow/paymentConfig or fallback
  const payment1StepConfig = workflow?.steps?.find((s: any) => s.id === 'payment1')
  const paymentConfig = {
    bankName: 'Curator International Bank',
    accountName: 'Lumina Academy Global Education',
    accountNumber: '8829 0012 5562 1009',
    ifsc: 'LMNAGLXX',
    currency: 'INR',
    ...payment1StepConfig?.paymentConfig,
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied`)
  }

  const renderPaymentCard = (
    title: string,
    amount: number,
    paymentObj: any,
    utrVal: string,
    setUtrVal: (val: string) => void,
    screenshotVal: string,
    setScreenshotVal: (val: string) => void,
    submittingVal: boolean,
    typeKey: 'visaFee' | 'sevisFee' | 'miscFee'
  ) => {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${paymentConfig.accountName}|${paymentConfig.accountNumber}|${paymentConfig.ifsc}|${amount}`)}`

    if (paymentObj?.status === 'COMPLETED') {
      return (
        <Card className="p-6 border border-border bg-card rounded-[2rem] shadow-sm flex flex-col justify-between h-full text-foreground">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-wider">Verified</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{amount.toLocaleString()}</span>
            </div>
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">Your transaction has been verified by our finance team.</p>
            <div className="bg-muted p-3 rounded-xl border border-border text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">UTR:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{paymentObj.utrNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Date:</span>
                <span className="font-bold text-muted-foreground">{new Date(paymentObj.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setViewingProofUrl(paymentObj.screenshotUrl)
              setViewingReceiptName(`${title} Receipt`)
            }}
            className="w-full mt-4 gap-1.5 text-foreground border-border hover:bg-muted rounded-xl"
          >
            <Eye className="w-3.5 h-3.5" /> View Receipt
          </Button>
        </Card>
      )
    }

    if (paymentObj?.status === 'PENDING') {
      return (
        <Card className="p-6 border border-border bg-card rounded-[2rem] shadow-sm flex flex-col justify-between h-full text-foreground">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">Under Review</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">₹{amount.toLocaleString()}</span>
            </div>
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">We are currently verifying this payment. Please check back within 24 hours.</p>
            <div className="bg-muted p-3 rounded-xl border border-border text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">UTR:</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{paymentObj.utrNumber}</span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setViewingProofUrl(paymentObj.screenshotUrl)
              setViewingReceiptName(`${title} Receipt`)
            }}
            className="w-full mt-4 gap-1.5 text-foreground border-border hover:bg-muted rounded-xl"
          >
            <Eye className="w-3.5 h-3.5" /> View Submitted Proof
          </Button>
        </Card>
      )
    }

    return (
      <Card className="p-6 border border-border bg-card rounded-[2rem] shadow-sm flex flex-col justify-between h-full space-y-5 text-foreground">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <span className="text-xl font-black text-primary">₹{amount.toLocaleString()}</span>
          </div>

          {paymentObj?.status === 'FAILED' && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Previous Submission Rejected</p>
                <p>Please re-verify the UTR and upload a clear screenshot of the transfer receipt.</p>
              </div>
            </div>
          )}

          <div className="flex justify-center p-3 bg-white-force border border-border rounded-2xl">
            <img src={qrCodeUrl} alt="QR Scanner" className="w-36 h-36" />
          </div>

          <div className="space-y-3 text-left">
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">UTR Number</label>
              <Input
                placeholder="Enter 12-digit UTR"
                value={utrVal}
                onChange={(e) => setUtrVal(e.target.value)}
                className="h-10 rounded-xl border-border bg-muted text-foreground text-sm font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Transfer Receipt</label>
              {screenshotVal ? (
                <div className="flex items-center justify-between p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold truncate">Uploaded</span>
                  <Button variant="ghost" size="sm" className="h-7 text-emerald-500 hover:bg-emerald-500/10" onClick={() => handleOpenUpload(typeKey, title)}>Change</Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => handleOpenUpload(typeKey, title)}
                  className="w-full h-10 rounded-xl border-dashed border-2 border-border text-muted-foreground hover:border-primary hover:text-primary gap-1.5 text-xs font-semibold hover:bg-muted"
                >
                  <UploadCloud className="w-4 h-4" /> Upload Receipt Screenshot
                </Button>
              )}
            </div>
          </div>
        </div>

        <Button
          onClick={() => handlePaymentSubmit(typeKey)}
          disabled={submittingVal || !utrVal || !screenshotVal}
          className="w-full h-11 bg-primary text-[#1A1A1A] font-bold hover:opacity-90 rounded-xl text-xs font-bold uppercase tracking-wider mt-4"
        >
          {submittingVal ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Payment'}
        </Button>
      </Card>
    )
  }

  return (
    <StudentLayout
      currentStep={STEP_ID}
      headerContent={
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          MANAGEMENT › <span className="text-[#84CC16] font-extrabold">{STEP_LABEL}</span>
        </div>
      }
    >
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase mb-2">MANAGEMENT</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground leading-none mb-3">
            Visa & Processing Payments
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-lg">
            Please complete the remaining visa administration fees. Once verified, you will proceed to book your visa slot.
          </p>
        </div>

        {allPaymentsApproved && (
          <Button
            onClick={handleProceedToVisa}
            disabled={transitioning}
            className="bg-lime-500 hover:bg-lime-600 text-slate-900 font-bold h-14 px-8 rounded-2xl tracking-widest uppercase shadow-lg shadow-lime-500/20 gap-2 shrink-0 animate-bounce"
          >
            {transitioning ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Proceed to Visa Stage <ChevronRight className="w-5 h-5" />
              </>
            )}
          </Button>
        )}
      </div>

      {/* Main layout */}
      <div className="grid lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: 3 Payment cards */}
        <div className="lg:col-span-3 grid md:grid-cols-3 gap-6">
          {renderPaymentCard(
            amountsConfig.visaFeeName || 'Visa Processing Fee',
            Number(amountsConfig.visaFee || 15000),
            visaPayment,
            utrVisa,
            setUtrVisa,
            screenshotVisa,
            setScreenshotVisa,
            submittingVisa,
            'visaFee'
          )}
          {renderPaymentCard(
            amountsConfig.sevisFeeName || 'SEVIS & Insurance Fee',
            Number(amountsConfig.sevisFee || 25000),
            sevisPayment,
            utrSevis,
            setUtrSevis,
            screenshotSevis,
            setScreenshotSevis,
            submittingSevis,
            'sevisFee'
          )}
          {renderPaymentCard(
            amountsConfig.miscFeeName || 'Miscellaneous Fee',
            Number(amountsConfig.miscFee || 5000),
            miscPayment,
            utrMisc,
            setUtrMisc,
            screenshotMisc,
            setScreenshotMisc,
            submittingMisc,
            'miscFee'
          )}
        </div>

        {/* Right Side: Banking details */}
        <Card className="p-6 border border-border bg-card rounded-[2rem] shadow-sm space-y-6 text-foreground">
          <div className="space-y-2">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Landmark className="w-5 h-5 text-primary" /> Bank Details
            </h3>
            <p className="text-xs text-muted-foreground">Transfer the amount to the official corporate account below.</p>
          </div>

          <div className="space-y-4 text-sm bg-muted p-4 border border-border rounded-2xl">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Account Name</span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground text-xs truncate max-w-[150px]">{paymentConfig.accountName}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-foreground animate-none hover:bg-background" onClick={() => copyToClipboard(paymentConfig.accountName, 'Account name')}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Bank Name</span>
              <p className="font-bold text-foreground text-xs">{paymentConfig.bankName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Account Number</span>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-primary text-xs">{paymentConfig.accountNumber}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-foreground animate-none hover:bg-background" onClick={() => copyToClipboard(paymentConfig.accountNumber.replace(/\s/g, ''), 'Account number')}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">IFSC / SWIFT</span>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-primary text-xs">{paymentConfig.ifsc}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-foreground animate-none hover:bg-background" onClick={() => copyToClipboard(paymentConfig.ifsc, 'IFSC')}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3 text-xs text-amber-600 dark:text-amber-400 font-semibold">
            <Info className="w-4 h-4 shrink-0" />
            <p>Ensure you mention your name and Student ID reference in the transaction notes when performing the transfer.</p>
          </div>
        </Card>
      </div>

      {/* Lightbox Modal */}
      {viewingProofUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-xl w-full bg-card border border-border rounded-3xl overflow-hidden shadow-2xl text-foreground">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="text-sm font-bold text-foreground">{viewingReceiptName}</span>
              <button onClick={() => setViewingProofUrl(null)} className="p-1.5 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-foreground">
                <X className="w-4 h-4 text-foreground" />
              </button>
            </div>
            <div className="p-4 bg-muted">
              <img src={viewingProofUrl} alt="Receipt proof" className="w-full max-h-[70vh] object-contain rounded-2xl border border-border" />
            </div>
          </div>
        </div>
      )}

      {/* Upload Popup */}
      <UploadPopup
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadComplete={handleUploadComplete}
        token={token}
        applicationId={application?.id}
        documentType={uploadDocType}
        documentName={uploadDocName}
      />
    </StudentLayout>
  )
}
