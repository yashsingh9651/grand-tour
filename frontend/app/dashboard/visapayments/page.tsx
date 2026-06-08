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
        <Loader2 className="w-8 h-8 animate-spin text-lime-600" />
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
        <div className="max-w-3xl rounded-3xl border border-dashed border-lime-200 bg-lime-50/40 p-8">
          <h2 className="text-2xl font-bold">{STEP_LABEL} — Locked</h2>
          <p className="mt-2 text-muted-foreground">
            {STEP_LABEL} will unlock after {PREV_STEP_LABEL}.
          </p>
          <Button
            className="mt-5 bg-lime-600 hover:bg-lime-700 text-white"
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
        <Card className="p-6 border-2 border-green-500/20 bg-gradient-to-br from-background to-green-50/20 rounded-[2rem] shadow-md flex flex-col justify-between h-full">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-green-700 bg-green-100/60 px-3 py-1 rounded-full uppercase tracking-wider">Verified</span>
              <span className="text-2xl font-black text-green-800">₹{amount.toLocaleString()}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-muted-foreground">Your transaction has been verified by our finance team.</p>
            <div className="bg-white/80 p-3 rounded-xl border border-green-100 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">UTR:</span>
                <span className="font-mono font-bold text-green-700">{paymentObj.utrNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Date:</span>
                <span className="font-bold text-slate-600">{new Date(paymentObj.createdAt).toLocaleDateString()}</span>
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
            className="w-full mt-4 gap-1.5 text-green-700 border-green-200 hover:bg-green-50 rounded-xl"
          >
            <Eye className="w-3.5 h-3.5" /> View Receipt
          </Button>
        </Card>
      )
    }

    if (paymentObj?.status === 'PENDING') {
      return (
        <Card className="p-6 border-2 border-amber-500/20 bg-gradient-to-br from-background to-amber-50/20 rounded-[2rem] shadow-md flex flex-col justify-between h-full">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-amber-700 bg-amber-100/60 px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">Under Review</span>
              <span className="text-2xl font-black text-amber-800">₹{amount.toLocaleString()}</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-muted-foreground">We are currently verifying this payment. Please check back within 24 hours.</p>
            <div className="bg-white/80 p-3 rounded-xl border border-amber-100 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">UTR:</span>
                <span className="font-mono font-bold text-amber-700">{paymentObj.utrNumber}</span>
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
            className="w-full mt-4 gap-1.5 text-amber-700 border-amber-200 hover:bg-amber-50 rounded-xl"
          >
            <Eye className="w-3.5 h-3.5" /> View Submitted Proof
          </Button>
        </Card>
      )
    }

    return (
      <Card className="p-6 border border-slate-200 bg-white rounded-[2rem] shadow-md flex flex-col justify-between h-full space-y-5">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <span className="text-xl font-black text-primary">₹{amount.toLocaleString()}</span>
          </div>

          {paymentObj?.status === 'FAILED' && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Previous Submission Rejected</p>
                <p>Please re-verify the UTR and upload a clear screenshot of the transfer receipt.</p>
              </div>
            </div>
          )}

          <div className="flex justify-center p-3 bg-slate-50 border border-slate-100 rounded-2xl">
            <img src={qrCodeUrl} alt="QR Scanner" className="w-36 h-36 mix-blend-multiply" />
          </div>

          <div className="space-y-3 text-left">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">UTR Number</label>
              <Input
                placeholder="Enter 12-digit UTR"
                value={utrVal}
                onChange={(e) => setUtrVal(e.target.value)}
                className="h-10 rounded-xl border-slate-200 text-sm font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Transfer Receipt</label>
              {screenshotVal ? (
                <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-xl text-xs">
                  <span className="text-green-700 font-bold truncate">Uploaded</span>
                  <Button variant="ghost" size="sm" className="h-7 text-green-600 hover:bg-green-100" onClick={() => handleOpenUpload(typeKey, title)}>Change</Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => handleOpenUpload(typeKey, title)}
                  className="w-full h-10 rounded-xl border-dashed border-2 text-slate-500 hover:border-primary hover:text-primary gap-1.5 text-xs font-semibold"
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
          className="w-full h-11 bg-primary text-white hover:opacity-90 rounded-xl text-xs font-bold uppercase tracking-wider mt-4"
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
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          MANAGEMENT › <span className="text-[#84CC16] font-extrabold">{STEP_LABEL}</span>
        </div>
      }
    >
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-2">MANAGEMENT</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1A1A] leading-none mb-3">
            Visa & Processing Payments
          </h1>
          <p className="text-sm text-gray-500 font-medium max-w-lg">
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
        <Card className="p-6 border border-slate-200 bg-white rounded-[2rem] shadow-sm space-y-6">
          <div className="space-y-2">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-primary" /> Bank Details
            </h3>
            <p className="text-xs text-muted-foreground">Transfer the amount to the official corporate account below.</p>
          </div>

          <div className="space-y-4 text-sm bg-slate-50 p-4 border border-slate-100 rounded-2xl">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Account Name</span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs truncate max-w-[150px]">{paymentConfig.accountName}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(paymentConfig.accountName, 'Account name')}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Bank Name</span>
              <p className="font-bold text-slate-800 text-xs">{paymentConfig.bankName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Account Number</span>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-primary text-xs">{paymentConfig.accountNumber}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(paymentConfig.accountNumber.replace(/\s/g, ''), 'Account number')}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">IFSC / SWIFT</span>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-primary text-xs">{paymentConfig.ifsc}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(paymentConfig.ifsc, 'IFSC')}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 text-xs text-amber-800 font-medium">
            <Info className="w-4 h-4 shrink-0" />
            <p>Ensure you mention your name and Student ID reference in the transaction notes when performing the transfer.</p>
          </div>
        </Card>
      </div>

      {/* Lightbox Modal */}
      {viewingProofUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="text-sm font-bold text-gray-900">{viewingReceiptName}</span>
              <button onClick={() => setViewingProofUrl(null)} className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="p-4">
              <img src={viewingProofUrl} alt="Receipt proof" className="w-full max-h-[70vh] object-contain rounded-2xl" />
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
