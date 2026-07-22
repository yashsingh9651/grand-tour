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
  Landmark, Clock, IndianRupee, CheckCircle2, Info, FileDown
} from 'lucide-react'
import { usePaymentReceipt } from '@/components/PaymentReceiptPDF'
import PaymentPlaneAnimation from '@/components/PaymentPlaneAnimation'

const STEP_ID = 'payment3'
const STEP_LABEL = 'Payment 3'
const PREV_STEP_LABEL = 'Contract signing approval'

export default function Payment3Page() {
  const { data: session } = useSession()
  const token = (session as any)?.backendToken || ''

  const [application, setApplication] = useState<any>(null)
  const [workflow, setWorkflow] = useState<any>(null)
  const [loading, setLoading] = useState(true)


  const [screenshotUrl, setScreenshotUrl] = useState('')
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [submittingPayment, setSubmittingPayment] = useState(false)

  const [viewingProofUrl, setViewingProofUrl] = useState<string | null>(null)
  const [viewingReceiptName, setViewingReceiptName] = useState<string>('')

  // Receipt download
  const [receiptPayment, setReceiptPayment] = useState<any>(null)
  const receiptStudentName = application
    ? `${application.user?.firstName || ''} ${application.user?.lastName || ''}`.trim()
    : ''
  const receiptHook = usePaymentReceipt({
    studentName: receiptStudentName,
    amount: receiptPayment?.amount || 0,
    paymentDate: receiptPayment?.createdAt || new Date().toISOString(),
    paymentId: receiptPayment?.id || '',
    installmentNumber: 3,
    description: 'France Internship',
    utrNumber: receiptPayment?.utrNumber,
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [appData, wfData] = await Promise.all([
        applicationService.getMy(),
        workflowService.get()
      ])
      setApplication(appData)
      setWorkflow(wfData)

      // Store latest completed payment (payment3) for receipt
      const completed = (appData?.payments || []).find((p: any) =>
        ((p.description || '').toLowerCase().includes('payment3') ||
        (p.description || '').toLowerCase().includes('3rd'))
        && p.status === 'COMPLETED'
      )
      if (completed) setReceiptPayment(completed)
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
    if (!screenshotUrl) {
      toast.error('Please upload your receipt screenshot')
      return
    }
    try {
      setSubmittingPayment(true)
      const amountToSubmit = installmentAmount
      await paymentService.submit({
        amount: amountToSubmit,
        applicationId: application?.id,
        utrNumber: 'N/A',
        screenshotUrl,
        description: 'Payment3 - 3rd Installment'
      })
      toast.success('3rd Installment submitted for verification!')
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const currentStepIndex = workflow?.steps?.findIndex((s: any) => s.id === application?.currentStepId) ?? -1
  const targetStepIndex = workflow?.steps?.findIndex((s: any) => s.id === STEP_ID) ?? -1
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
    return desc.includes('payment3') || desc.includes('3rd')
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

  const baseAmount = Number(payment1StepConfig?.amount || 0)
  const discountPercentage = Number(payment1StepConfig?.discountPercentage || 0)
  const gstPercentage = Number(payment1StepConfig?.gstPercentage || 0)
  const discountAmount = baseAmount * (discountPercentage / 100)
  const gstAmount = (baseAmount - discountAmount) * (gstPercentage / 100)
  const totalPayable = baseAmount - discountAmount + gstAmount

  const categoryPricing = application?.studentCategoryObj?.pricing
  const hasCategoryPricing = Array.isArray(categoryPricing) && categoryPricing.some((inst: any) => Number(inst?.amount) > 0)
  const installmentsList = hasCategoryPricing ? categoryPricing : (payment1Config?.installments || [])
  const hasAdminInstallments = Array.isArray(installmentsList) && installmentsList.length > 0

  const installmentAmount = hasAdminInstallments && installmentsList[2]?.amount
    ? Number(installmentsList[2].amount)
    : Math.round(totalPayable / 3)

  const currencySymbol = paymentConfig.currency?.toUpperCase().includes('USD') ? '$' : '₹'
  const qrCodeUrl = paymentConfig.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${paymentConfig.accountName}|${paymentConfig.accountNumber}|${paymentConfig.ifsc}|${installmentAmount}`)}`

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied`)
  }

  const isWorkPermitIssued = application?.workPermit?.status === 'ISSUED'

  return (
    <StudentLayout
      currentStep={STEP_ID}
      headerContent={
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          MANAGEMENT › <span className="text-[#84CC16] font-extrabold">{STEP_LABEL}</span>
        </div>
      }
    >
      {/* Page Title */}
      <div className="mb-8">
        <p className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase mb-2">MANAGEMENT</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground leading-none mb-3">
          3rd Installment Payment
        </h1>
        <p className="text-sm text-muted-foreground font-medium max-w-lg">
          Please complete your final tuition payment installment before work permit processing begins.
        </p>
      </div>

      {!isWorkPermitIssued ? (
        <Card className="p-8 border border-dashed border-border bg-secondary/20 rounded-[2rem] text-center max-w-2xl mx-auto space-y-6 text-foreground mt-10">
          <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-purple-600 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground">Awaiting Work Permit</h2>
            <p className="text-sm text-muted-foreground font-medium max-w-md mx-auto">
              Please wait for the administration to issue and upload your work permit. Once the work permit is uploaded, the payment details and submission options will unlock here.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* France Work Permit Ready Card (Horizontal Row) */}
          <Card className="relative overflow-hidden border border-border bg-gradient-to-r from-blue-500/10 via-background to-red-500/10 rounded-[2.5rem] shadow-sm p-6">
            {/* Tricolore Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-[6px] flex">
              <div className="flex-1 bg-[#002395]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#ED2939]" />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-card border border-border flex flex-col items-center justify-center shadow-sm relative overflow-hidden shrink-0">
                {/* Micro France Flag Backdrop inside Icon */}
                <div className="absolute inset-0 flex opacity-10">
                  <div className="flex-1 bg-[#002395]" />
                  <div className="flex-1 bg-white" />
                  <div className="flex-1 bg-[#ED2939]" />
                </div>
                <div className="w-10 h-7 rounded-sm overflow-hidden flex border border-slate-200/60 shadow-sm relative z-10">
                  <div className="w-1/3 bg-[#002395]" />
                  <div className="w-1/3 bg-white" />
                  <div className="w-1/3 bg-[#ED2939]" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/5 via-transparent to-white/15 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1 text-center md:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5">
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600/10 text-blue-600 border border-blue-200/20">
                    Visa Ready Status
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-600/10 text-red-600 border border-red-200/20">
                    France
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-foreground tracking-tight mt-1">
                  Félicitations! Your Work Permit is Ready
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  Your official French work permit (Autorisation de travail) has been approved and issued by the French Ministry of Labour.
                </p>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-6 items-stretch mb-8">
            {/* Left Column: Payment details */}
            <Card className="p-6 border border-border bg-card rounded-[2.5rem] shadow-sm text-foreground flex flex-col justify-between h-full space-y-4">
              <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-black">Registration fees</h2>

                  <p className="text-2xl font-black text-primary">{currencySymbol}{baseAmount.toLocaleString()}</p>
                </div>
              </div>

            <div className="space-y-4">
              <div className="space-y-2 text-sm bg-muted p-4 rounded-xl border border-border">
                {discountPercentage > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>Discount ({discountPercentage}%)</span>
                    <span>-{currencySymbol}{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                {gstPercentage > 0 && (
                  <div className="flex justify-between items-center text-foreground font-medium">
                    <span>GST ({gstPercentage}%)</span>
                    <span>+{currencySymbol}{gstAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-border flex justify-between items-center font-semibold text-sm text-foreground">
                  <span>Total Course Fee</span>
                  <span>{currencySymbol}{totalPayable.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-border flex justify-between items-center font-black text-lg text-primary">
                  <span>Installment Due</span>
                  <span>{currencySymbol}{installmentAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 bg-muted border border-border rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Account Name</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold">{paymentConfig.accountName}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-foreground" onClick={() => copyToClipboard(paymentConfig.accountName, 'Account name')}>
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
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-foreground" onClick={() => copyToClipboard(paymentConfig.accountNumber.replace(/\s/g, ''), 'Account number')}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">SWIFT / IFSC</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">{paymentConfig.ifsc}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-foreground" onClick={() => copyToClipboard(paymentConfig.ifsc, 'SWIFT code')}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium leading-relaxed">
                  Please ensure you transfer the exact amount. Mention your Student ID reference in the transaction notes for faster verification.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Column: QR and Submission states */}
        {latestPayment?.status === 'COMPLETED' ? (
          <Card className="p-8 border border-border bg-card rounded-[2.5rem] shadow-sm text-center space-y-6 text-foreground">
            <PaymentPlaneAnimation status="COMPLETED" />
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-green-600 dark:text-green-400">Payment Verified</h2>
              <p className="text-sm text-muted-foreground font-medium max-w-sm mx-auto">
                Your 3rd installment payment has been successfully verified. You can now proceed to the work permit stage.
              </p>
            </div>
            <div className="p-4 bg-muted border border-border rounded-2xl text-left space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-bold text-green-600 dark:text-green-400">{currencySymbol}{latestPayment.amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-muted-foreground">Receipt Attachment:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setViewingProofUrl(latestPayment.screenshotUrl)
                    setViewingReceiptName(`Receipt`)
                  }}
                  className="gap-1.5 h-8 text-foreground border-border hover:bg-muted"
                >
                  <Eye className="w-3.5 h-3.5" /> View Receipt
                </Button>
              </div>
            </div>
            {/* Download PDF Receipt */}
            <Button
              onClick={() => receiptHook.handlePrint()}
              className="w-full h-11 rounded-2xl font-bold text-sm gap-2 bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-500/20"
            >
              <FileDown className="w-4 h-4" />
              Download Payment Receipt PDF
            </Button>
          </Card>
        ) : latestPayment?.status === 'PENDING' ? (
          <Card className="p-8 border border-border bg-card rounded-[2.5rem] shadow-sm text-center space-y-6 text-foreground">
            <PaymentPlaneAnimation status="PENDING" />
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-purple-700">Payment Under Review</h2>
              <p className="text-sm text-muted-foreground font-medium max-w-sm mx-auto">
                We are currently reviewing your payment submission. Your status will be updated within 24 business hours.
              </p>
            </div>
            <div className="p-4 bg-muted border border-border rounded-2xl text-left space-y-3 text-sm">
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
                    setViewingReceiptName(`Receipt`)
                  }}
                  className="gap-1.5 h-8 text-purple-700 hover:text-purple-800 hover:bg-purple-50"
                >
                  <Eye className="w-3.5 h-3.5" /> View Receipt
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-6 w-full">
            {latestPayment?.status === 'FAILED' && (
              <Card className="p-8 border border-rose-500/20 bg-card rounded-[2.5rem] shadow-sm text-center space-y-6 text-foreground animate-in fade-in slide-in-from-top duration-300">
                <PaymentPlaneAnimation status="FAILED" />
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-rose-600 dark:text-rose-400">Payment Rejected</h2>
                  <p className="text-sm text-muted-foreground font-medium max-w-sm mx-auto">
                    Your 3rd installment payment submission was rejected. Please review the note and resubmit.
                  </p>
                  {latestPayment.notes && (
                    <p className="text-xs text-rose-500 font-bold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 max-w-xs mx-auto">
                      Reason: {latestPayment.notes}
                    </p>
                  )}
                </div>
              </Card>
            )}

            <Card className="p-8 border border-border bg-card rounded-[2.5rem] shadow-sm text-foreground">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">Scan & Pay</h3>
                  <p className="text-sm text-muted-foreground">Scan this QR code using any UPI app</p>
                </div>

                <div className="p-4 bg-white-force rounded-3xl border border-slate-200">
                  <img
                    src={qrCodeUrl}
                    alt="Payment QR Code"
                    className="w-48 h-48"
                  />
                </div>

                <div className="w-full space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-bold text-foreground ml-1">Payment Screenshot</label>
                    {screenshotUrl ? (
                      <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 truncate flex-1">Receipt uploaded</span>
                        <Button variant="ghost" size="sm" className="h-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10" onClick={() => setIsUploadOpen(true)}>
                          Change
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setIsUploadOpen(true)}
                        className="w-full h-12 rounded-xl border-dashed border-2 border-border text-muted-foreground hover:border-primary hover:text-primary transition-all gap-2"
                      >
                        <UploadCloud className="w-4 h-4" />
                        Upload Receipt
                      </Button>
                    )}
                  </div>

                  <Button
                    onClick={handlePaymentSubmit}
                    disabled={submittingPayment || !screenshotUrl}
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-primary text-[#1A1A1A] font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                  >
                    {submittingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Payment'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
        </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {viewingProofUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-xl w-full bg-card border border-border rounded-3xl overflow-hidden shadow-2xl text-foreground">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="text-sm font-bold text-foreground">{viewingReceiptName}</span>
              <button onClick={() => setViewingProofUrl(null)} className="p-1.5 rounded-xl bg-muted hover:bg-muted/85 transition-colors text-foreground">
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
        documentType="payment_receipt"
        documentName={`Payment3 Receipt - 3rd Installment`}
      />
    </StudentLayout>
  )
}
