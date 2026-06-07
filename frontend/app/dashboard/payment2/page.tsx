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
  Landmark, Clock, IndianRupee, CheckCircle2, Info
} from 'lucide-react'

const STEP_ID = 'payment2'
const STEP_LABEL = 'Payment 2'
const PREV_STEP_LABEL = 'Hotel Allocation'

export default function Payment2Page() {
  const { data: session } = useSession()
  const token = (session as any)?.backendToken || ''

  const [application, setApplication] = useState<any>(null)
  const [workflow, setWorkflow] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [utrNumber, setUtrNumber] = useState('')
  const [screenshotUrl, setScreenshotUrl] = useState('')
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [submittingPayment, setSubmittingPayment] = useState(false)

  const [viewingProofUrl, setViewingProofUrl] = useState<string | null>(null)
  const [viewingReceiptName, setViewingReceiptName] = useState<string>('')

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
      toast.error('Failed to load financial details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleUploadComplete = (doc: any) => {
    setScreenshotUrl(doc.url)
    toast.success('Screenshot uploaded!')
  }

  const handlePaymentSubmit = async () => {
    if (!utrNumber || !screenshotUrl) {
      toast.error('Please provide UTR number and receipt screenshot')
      return
    }
    try {
      setSubmittingPayment(true)
      const amountToSubmit = installmentAmount
      await paymentService.submit({
        amount: amountToSubmit,
        applicationId: application?.id,
        utrNumber,
        screenshotUrl,
        description: 'Payment2 - 2nd Installment'
      })
      toast.success('2nd Installment submitted for verification!')
      fetchData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit payment')
    } finally {
      setSubmittingPayment(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  const currentStepIndex = workflow?.steps?.findIndex((s: any) => s.id === application?.currentStepId) ?? -1
  const targetStepIndex = workflow?.steps?.findIndex((s: any) => s.id === STEP_ID) ?? -1
  const isUnlocked = currentStepIndex >= 0 && targetStepIndex <= currentStepIndex

  if (!isUnlocked) {
    return (
      <StudentLayout currentStep={STEP_ID}>
        <div className="max-w-3xl rounded-3xl border border-dashed border-purple-200 bg-purple-50/40 p-8">
          <h2 className="text-2xl font-bold">{STEP_LABEL} — Locked</h2>
          <p className="mt-2 text-muted-foreground">
            {STEP_LABEL} will unlock after you accept your {PREV_STEP_LABEL}.
          </p>
          <Button
            className="mt-5"
            onClick={() => window.location.href = `/dashboard/${application?.currentStepId || 'application'}`}
          >
            Return to Current Step
          </Button>
        </div>
      </StudentLayout>
    )
  }

  const paymentsList = (application?.payments || []).filter((p: any) => {
    const desc = (p.description || '').toLowerCase()
    return desc.includes('payment2') || desc.includes('2nd')
  })

  const paymentHistory = [...paymentsList].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const latestPayment = paymentHistory[0]

  const payment1StepConfig = workflow?.steps?.find((s: any) => s.id === 'payment1')
  const payment1Config = payment1StepConfig?.paymentConfig || {}

  const currentStepConfig = workflow?.steps?.find((s: any) => s.id === STEP_ID)
  const paymentConfig = {
    bankName: 'Curator International Bank',
    accountName: 'Lumina Academy Global Education',
    accountNumber: '8829 0012 5562 1009',
    ifsc: 'LMNAGLXX',
    currency: 'INR',
    reference: '#LA-2024-8891',
    merchant: 'Lumina Academy Ltd.',
    qrCodeUrl: '',
    ...currentStepConfig?.paymentConfig,
    ...payment1Config,
  }

  const baseAmount = Number(currentStepConfig?.amount || 0)
  const discountPercentage = Number(currentStepConfig?.discountPercentage || 0)
  const gstPercentage = Number(currentStepConfig?.gstPercentage || 0)
  const discountAmount = baseAmount * (discountPercentage / 100)
  const gstAmount = (baseAmount - discountAmount) * (gstPercentage / 100)
  const totalPayable = baseAmount - discountAmount + gstAmount

  const installmentsList = payment1Config?.installments || []
  const hasAdminInstallments = Array.isArray(installmentsList) && installmentsList.length > 0

  const installmentAmount = hasAdminInstallments && installmentsList[1]?.amount
    ? Number(installmentsList[1].amount)
    : Math.round(totalPayable / 3)

  const currencySymbol = paymentConfig.currency?.toUpperCase().includes('USD') ? '$' : '₹'
  const qrCodeUrl = paymentConfig.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${paymentConfig.accountName}|${paymentConfig.accountNumber}|${paymentConfig.ifsc}|${installmentAmount}`)}`

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied`)
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
      {/* Page Title */}
      <div className="mb-8">
        <p className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-2">MANAGEMENT</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1A1A] leading-none mb-3">
          2nd Installment Payment
        </h1>
        <p className="text-sm text-gray-500 font-medium max-w-lg">
          Please complete your second tuition payment installment to proceed to contract signing.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start mb-8">
        
        {/* Left Column: Payment details */}
        <Card className="lg:col-span-2 p-8 border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5 rounded-[2.5rem] shadow-xl">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black">Base Amount</h2>
                <p className="text-3xl font-black text-primary">{currencySymbol}{baseAmount.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2 text-sm bg-primary/5 p-4 rounded-xl border border-primary/10">
                {discountPercentage > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 font-medium">
                    <span>Discount ({discountPercentage}%)</span>
                    <span>-{currencySymbol}{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                {gstPercentage > 0 && (
                  <div className="flex justify-between items-center text-slate-600 font-medium">
                    <span>GST ({gstPercentage}%)</span>
                    <span>+{currencySymbol}{gstAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-primary/20 flex justify-between items-center font-semibold text-sm text-slate-600">
                  <span>Total Course Fee</span>
                  <span>{currencySymbol}{totalPayable.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-primary/20 flex justify-between items-center font-black text-lg text-primary">
                  <span>Installment Due</span>
                  <span>{currencySymbol}{installmentAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 bg-white/50 backdrop-blur-sm border border-primary/10 rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Account Name</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold">{paymentConfig.accountName}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(paymentConfig.accountName, 'Account name')}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Bank Name</span>
                  <span className="font-bold">{paymentConfig.bankName}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Account Number</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">{paymentConfig.accountNumber}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(paymentConfig.accountNumber.replace(/\s/g, ''), 'Account number')}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">SWIFT / IFSC</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">{paymentConfig.ifsc}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(paymentConfig.ifsc, 'SWIFT code')}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-800 font-medium leading-relaxed">
                  Please ensure you transfer the exact amount. Mention your Student ID reference in the transaction notes for faster verification.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Column: QR and Submission states */}
        {latestPayment?.status === 'COMPLETED' ? (
          <Card className="p-8 border-2 border-green-500/20 bg-gradient-to-br from-background to-green-50/30 rounded-[2.5rem] shadow-xl text-center space-y-6">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-green-700">Payment Verified</h2>
              <p className="text-sm text-muted-foreground font-medium max-w-sm mx-auto">
                Your 2nd installment payment has been successfully verified. You can now proceed to contract signing.
              </p>
            </div>
            <div className="p-4 bg-white border border-green-200 rounded-2xl text-left space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">UTR Number:</span>
                <span className="font-mono font-bold text-green-800">{latestPayment.utrNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-bold text-green-800">{currencySymbol}{latestPayment.amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-green-100">
                <span className="text-muted-foreground">Receipt Attachment:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setViewingProofUrl(latestPayment.screenshotUrl)
                    setViewingReceiptName(`Receipt - UTR ${latestPayment.utrNumber}`)
                  }}
                  className="gap-1.5 h-8 text-green-700 hover:text-green-800 hover:bg-green-50"
                >
                  <Eye className="w-3.5 h-3.5" /> View Receipt
                </Button>
              </div>
            </div>
          </Card>
        ) : latestPayment?.status === 'PENDING' ? (
          <Card className="p-8 border-2 border-purple-500/20 bg-gradient-to-br from-background to-purple-50/30 rounded-[2.5rem] shadow-xl text-center space-y-6">
            <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Clock className="w-10 h-10 text-purple-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-purple-700">Payment Under Review</h2>
              <p className="text-sm text-muted-foreground font-medium max-w-sm mx-auto">
                We are currently reviewing your payment submission. Your status will be updated within 24 business hours.
              </p>
            </div>
            <div className="p-4 bg-white border border-purple-200 rounded-2xl text-left space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">UTR Number:</span>
                <span className="font-mono font-bold text-purple-800">{latestPayment.utrNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Submitted:</span>
                <span className="font-bold text-purple-800">{currencySymbol}{latestPayment.amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-purple-100">
                <span className="text-muted-foreground">Receipt Attachment:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setViewingProofUrl(latestPayment.screenshotUrl)
                    setViewingReceiptName(`Receipt - UTR ${latestPayment.utrNumber}`)
                  }}
                  className="gap-1.5 h-8 text-purple-700 hover:text-purple-800 hover:bg-purple-50"
                >
                  <Eye className="w-3.5 h-3.5" /> View Receipt
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-8 border-2 border-slate-200 bg-white rounded-[2.5rem] shadow-xl">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold">Scan & Pay</h3>
                <p className="text-sm text-muted-foreground">Scan this QR code using any UPI app</p>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-3xl border-2 border-slate-100">
                <img 
                  src={qrCodeUrl} 
                  alt="Payment QR Code"
                  className="w-48 h-48 mix-blend-multiply"
                />
              </div>

              <div className="w-full space-y-4">
                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-slate-700 ml-1">UTR / Transaction Number</label>
                  <Input 
                    placeholder="Enter 12-digit UTR number" 
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 focus:ring-primary font-mono text-sm"
                  />
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-slate-700 ml-1">Payment Screenshot</label>
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
                      <UploadCloud className="w-4 h-4" />
                      Upload Receipt
                    </Button>
                  )}
                </div>

                <Button 
                  onClick={handlePaymentSubmit}
                  disabled={submittingPayment || !utrNumber || !screenshotUrl}
                  className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                >
                  {submittingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Payment'}
                </Button>
              </div>
            </div>
          </Card>
        )}
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
        documentType="payment_receipt"
        documentName={`Payment2 Receipt - 2nd Installment`}
      />
    </StudentLayout>
  )
}
