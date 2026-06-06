'use client'

import { useState, useEffect } from 'react'
import { StudentLayout } from '@/components/student/student-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { applicationService, workflowService, paymentService } from '@/lib/services/api.service'
import UploadPopup from '@/components/UploadPopup'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import {
  Loader2, Check, Lock, UploadCloud, Eye, X, Copy,
  ShieldCheck, Download, MoreHorizontal, Landmark, Clock, ArrowDownToLine
} from 'lucide-react'

export default function Payment1Page() {
  const { data: session } = useSession()
  const token = (session as any)?.backendToken || ''

  const [application, setApplication] = useState<any>(null)
  const [workflow, setWorkflow] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [activeInstallmentIndex, setActiveInstallmentIndex] = useState<number | null>(null)
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

  const handleOpenPaymentModal = (index: number) => {
    setActiveInstallmentIndex(index)
    setUtrNumber('')
    setScreenshotUrl('')
    setIsPaymentModalOpen(true)
  }

  const handleUploadComplete = (doc: any) => {
    setScreenshotUrl(doc.url)
    toast.success('Screenshot uploaded!')
  }

  const handlePaymentSubmit = async () => {
    if (!utrNumber || !screenshotUrl || activeInstallmentIndex === null) {
      toast.error('Please provide UTR number and receipt screenshot')
      return
    }
    try {
      setSubmittingPayment(true)
      const desc = activeInstallmentIndex === 0 ? '1st' : activeInstallmentIndex === 1 ? '2nd' : '3rd'
      const amountToSubmit = Number(currentStepConfig?.amount || 0)
      await paymentService.submit({
        amount: amountToSubmit,
        applicationId: application?.id,
        utrNumber,
        screenshotUrl,
        description: `${desc} Installment`
      })
      toast.success(`${desc} Installment submitted for verification!`)
      setIsPaymentModalOpen(false)
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

  const paymentStageUnlocked = application?.currentStepId === 'payment1'

  if (!paymentStageUnlocked) {
    return (
      <StudentLayout currentStep="payment1">
        <div className="max-w-3xl rounded-3xl border border-dashed border-purple-200 bg-purple-50/40 p-8">
          <h2 className="text-2xl font-bold">Payment Stage Locked</h2>
          <p className="mt-2 text-muted-foreground">
            The finance stage will unlock once your application reaches the payment review. Please complete the current workflow step first.
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

  const paymentsList = application?.payments || []

  const getInstallmentState = (index: number) => {
    const term = index === 0 ? '1st' : index === 1 ? '2nd' : '3rd'
    const payment = paymentsList.find((p: any) => p.description?.includes(term))
    if (payment) {
      return { status: payment.status === 'COMPLETED' ? 'VERIFIED' : 'PENDING', payment }
    }
    if (index === 0) return { status: 'UNPAID', payment: null }
    const prevTerm = index === 1 ? '1st' : '2nd'
    const prev = paymentsList.find((p: any) => p.description?.includes(prevTerm))
    if (prev?.status === 'COMPLETED') return { status: 'UNPAID', payment: null }
    return { status: 'LOCKED', payment: null }
  }

  const currentStepConfig = workflow?.steps?.find((s: any) => s.id === 'payment1')
  const paymentConfig = currentStepConfig?.paymentConfig || {
    bankName: 'Curator International Bank',
    accountName: 'Lumina Academy Global Education',
    accountNumber: '8829 0012 5562 1009',
    ifsc: 'LMNAGLXX',
    currency: 'INR',
    reference: '#LA-2024-8891',
    merchant: 'Lumina Academy Ltd.',
    qrCodeUrl: '',
  }

  const baseAmount = Number(currentStepConfig?.amount || 0)
  const discountPercentage = Number(currentStepConfig?.discountPercentage || 0)
  const gstPercentage = Number(currentStepConfig?.gstPercentage || 0)
  const discountAmount = baseAmount * (discountPercentage / 100)
  const gstAmount = (baseAmount - discountAmount) * (gstPercentage / 100)
  const totalPayable = baseAmount - discountAmount + gstAmount
  const currencySymbol = paymentConfig.currency?.toUpperCase().includes('USD') ? '$' : '₹'
  const qrCodeUrl = paymentConfig.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${paymentConfig.accountName || 'Grand Tour'}|${paymentConfig.accountNumber || ''}|${paymentConfig.ifsc || ''}|${totalPayable}`)}`

  const installments = [
    { label: '1ST INSTALLMENT', amount: `${currencySymbol}${Math.round(totalPayable / 3).toLocaleString()}`, dueDate: 'OCT 12, 2024', info: getInstallmentState(0) },
    { label: '2ND INSTALLMENT', amount: `${currencySymbol}${Math.round(totalPayable / 3).toLocaleString()}`, dueDate: 'NOV 15, 2024', info: getInstallmentState(1) },
    { label: '3RD INSTALLMENT', amount: `${currencySymbol}${Math.round(totalPayable / 3).toLocaleString()}`, dueDate: 'DEC 15, 2024', info: getInstallmentState(2) },
  ]

  const paymentHistory = [...paymentsList].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied`)
  }

  return (
    <StudentLayout
      currentStep="payment1"
      headerContent={
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          MANAGEMENT › <span className="text-[#84CC16] font-extrabold">FINANCIAL CENTER</span>
        </div>
      }
    >
      {/* ── Page Title ─────────────────────────────────────────── */}
      <div className="mb-8">
        <p className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase mb-2">MANAGEMENT</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1A1A] leading-none mb-3">
          Financial Center
        </h1>
        <p className="text-sm text-gray-500 font-medium max-w-lg">
          Manage your tuition installments, verify bank details, and secure your academic path with our encrypted payment portal.
        </p>
      </div>

      {/* ── Top Row: QR + Bank Info ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">

        {/* Instant Payment / QR Card */}
        <Card className="p-6 border-none shadow-[0_4px_24px_rgba(0,0,0,0.05)] rounded-[1.75rem] bg-white relative overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <span className="text-[10px] font-black tracking-[0.18em] text-gray-400 uppercase">INSTANT PAYMENT</span>
            <span className="bg-[#BEF264] text-[#3F6212] text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full">SECURE</span>
          </div>

          {/* QR Code Box */}
          <div className="bg-[#0F172A] rounded-2xl p-5 flex items-center justify-center mb-5 aspect-[4/3]">
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <div className="bg-white p-3 rounded-xl w-full max-w-[220px] h-full flex items-center justify-center">
                <img
                  src={qrCodeUrl}
                  alt="Payment QR Code"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <p className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase">Payment QR</p>
            </div>
          </div>

          <h3 className="text-xl font-extrabold text-gray-900 text-center mb-1">Scan to Pay</h3>
          <p className="text-xs text-gray-400 font-medium text-center mb-5 leading-relaxed">
            Scan this QR code using your mobile banking app to complete the current installment instantly.
          </p>

          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 font-semibold">Merchant</span>
              <span className="text-gray-900 font-bold">{paymentConfig.merchant}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 font-semibold">Reference</span>
              <span className="text-gray-900 font-bold font-mono">{paymentConfig.reference}</span>
            </div>
          </div>
        </Card>

        {/* Bank Information Card — dark */}
        <Card className="p-6 border-none rounded-[1.75rem] bg-[#0F172A] text-white relative overflow-hidden">
          {/* Subtle gradient orb */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#BEF264]/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <span className="text-[10px] font-black tracking-[0.18em] text-purple-400 uppercase">MANUAL TRANSFER</span>
              <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                <Landmark className="w-4 h-4 text-gray-300" />
              </div>
            </div>

            <h2 className="text-2xl font-extrabold text-white mb-6">Bank Information</h2>

            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              {/* Account Name */}
              <div>
                <p className="text-[9px] font-bold tracking-widest text-gray-500 uppercase mb-1">ACCOUNT NAME</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-white leading-tight">{paymentConfig.accountName}</p>
                  <button onClick={() => copyToClipboard(paymentConfig.accountName, 'Account name')} className="text-gray-500 hover:text-[#BEF264] transition-colors shrink-0">
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* SWIFT / BIC */}
              <div>
                <p className="text-[9px] font-bold tracking-widest text-gray-500 uppercase mb-1">SWIFT / BIC CODE</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-white font-mono">{paymentConfig.ifsc}</p>
                  <button onClick={() => copyToClipboard(paymentConfig.ifsc, 'SWIFT code')} className="text-gray-500 hover:text-[#BEF264] transition-colors shrink-0">
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Bank Name */}
              <div>
                <p className="text-[9px] font-bold tracking-widest text-gray-500 uppercase mb-1">BANK NAME</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-white">{paymentConfig.bankName}</p>
                  <button onClick={() => copyToClipboard(paymentConfig.bankName, 'Bank name')} className="text-gray-500 hover:text-[#BEF264] transition-colors shrink-0">
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Currency */}
              <div>
                <p className="text-[9px] font-bold tracking-widest text-gray-500 uppercase mb-1">CURRENCY</p>
                <p className="text-sm font-semibold text-white">{paymentConfig.currency}</p>
              </div>

              {/* Account Number — spans full width */}
              <div className="col-span-2">
                <p className="text-[9px] font-bold tracking-widest text-gray-500 uppercase mb-1">ACCOUNT NUMBER</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-white font-mono tracking-wider">{paymentConfig.accountNumber}</p>
                  <button onClick={() => copyToClipboard(paymentConfig.accountNumber.replace(/\s/g, ''), 'Account number')} className="text-gray-500 hover:text-[#BEF264] transition-colors shrink-0">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Note box */}
            <div className="mt-5 p-3 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                *Please include your Student ID (LA-8891) in the transaction description to ensure immediate notification.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Payment Installments ─────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#1A1A1A]">Payment Installments</h2>
          <div className="flex items-center gap-5 text-[10px] font-black tracking-widest text-gray-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#BEF264]" />
              <span>VERIFIED</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span>PENDING</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {installments.map((inst, index) => {
            const { status, payment } = inst.info
            return (
              <Card
                key={index}
                className={`p-5 border-none rounded-[1.75rem] bg-white relative overflow-hidden flex flex-col transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.07)] ${status === 'LOCKED' ? 'opacity-60' : ''}`}
              >
                {/* Status bar top */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  status === 'VERIFIED' ? 'bg-[#BEF264]' :
                  status === 'PENDING' ? 'bg-purple-500 animate-pulse' :
                  status === 'UNPAID' ? 'bg-purple-200' :
                  'bg-gray-100'
                }`} />

                {/* Header */}
                <div className="flex items-start justify-between mt-1 mb-4">
                  <div>
                    <p className="text-[9px] font-black tracking-widest text-gray-400 uppercase mb-1">{inst.label}</p>
                    <p className={`text-2xl font-extrabold tracking-tight ${status === 'LOCKED' ? 'text-gray-400' : 'text-gray-900'}`}>
                      {inst.amount}
                    </p>
                  </div>

                  {status === 'VERIFIED' && (
                    <div className="w-8 h-8 bg-[#BEF264]/25 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-[#3F6212]" />
                    </div>
                  )}
                  {status === 'PENDING' && (
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center animate-pulse">
                      <MoreHorizontal className="w-4 h-4 text-purple-600" />
                    </div>
                  )}
                  {status === 'UNPAID' && (
                    <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center">
                      <UploadCloud className="w-4 h-4 text-purple-500" />
                    </div>
                  )}
                  {status === 'LOCKED' && (
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Content area */}
                <div className="flex-1 mb-4">
                  {status === 'VERIFIED' && (
                    <div className="relative group rounded-xl overflow-hidden aspect-[16/9] border border-gray-100 cursor-pointer"
                      onClick={() => {
                        setViewingProofUrl(payment?.screenshotUrl || '/receipt_proof.png')
                        setViewingReceiptName(payment?.utrNumber ? `Receipt – UTR ${payment.utrNumber}` : 'RECEIPT-001.PDF')
                      }}
                    >
                      <img
                        src={payment?.screenshotUrl || '/receipt_proof.png'}
                        alt="Payment Proof"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="bg-black/70 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-1.5">
                          <Eye className="w-3 h-3" /> View Proof
                        </span>
                      </div>
                    </div>
                  )}

                  {status === 'PENDING' && (
                    <div className="relative rounded-xl overflow-hidden aspect-[16/9] border border-gray-100">
                      <img
                        src={payment?.screenshotUrl || '/receipt_proof.png'}
                        alt="Pending proof"
                        className="w-full h-full object-cover opacity-70 blur-[2px]"
                      />
                      <div className="absolute inset-0 bg-purple-900/45 flex flex-col items-center justify-center gap-1.5 text-white">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-[9px] font-black tracking-widest uppercase">Under Review</span>
                      </div>
                    </div>
                  )}

                  {status === 'UNPAID' && (
                    <button
                      onClick={() => handleOpenPaymentModal(index)}
                      className="w-full border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/20 hover:bg-purple-50/40 rounded-xl aspect-[16/9] flex flex-col items-center justify-center gap-2 transition-all duration-300 group"
                    >
                      <UploadCloud className="w-7 h-7 text-purple-300 group-hover:text-purple-500 transition-colors" />
                      <span className="text-xs font-bold text-gray-700">Upload Screenshot</span>
                      <span className="text-[9px] font-semibold text-gray-400">JPG, PNG or PDF (Max 5MB)</span>
                    </button>
                  )}

                  {status === 'LOCKED' && (
                    <div className="border border-dashed border-gray-200 bg-gray-50/70 rounded-xl aspect-[16/9] flex flex-col items-center justify-center gap-2">
                      <Lock className="w-6 h-6 text-gray-300" />
                      <span className="text-[10px] font-semibold text-gray-400">Installment Locked</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 pt-3 flex items-center justify-between text-[10px] font-bold tracking-wider">
                  {status === 'VERIFIED' && (
                    <>
                      <span className="text-gray-400 uppercase">
                        VERIFIED ON {payment?.updatedAt ? new Date(payment.updatedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase() : 'OCT 12'}
                      </span>
                      <span className="text-[#84CC16]">
                        RECEIPT-{payment?.id ? payment.id.slice(-3).toUpperCase() : '001'}.PDF
                      </span>
                    </>
                  )}
                  {status === 'PENDING' && (
                    <>
                      <span className="text-gray-400 uppercase">
                        SUBMITTED {payment?.createdAt ? new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase() : 'TODAY'}
                      </span>
                      <span className="text-purple-500 uppercase">
                        UTR-{payment?.utrNumber?.slice(-4) || 'XXXX'}
                      </span>
                    </>
                  )}
                  {status === 'UNPAID' && (
                    <>
                      <span className="text-gray-400 uppercase">DUE: {inst.dueDate}</span>
                      <button
                        onClick={() => toast.info('Transfer the amount to the academy account and upload your payment confirmation.', { duration: 6000 })}
                        className="text-purple-500 hover:text-purple-700 transition-colors"
                      >
                        Guidelines
                      </button>
                    </>
                  )}
                  {status === 'LOCKED' && (
                    <>
                      <span className="text-gray-400 uppercase">DUE: {inst.dueDate}</span>
                      <span className="text-gray-400 uppercase">LOCKED</span>
                    </>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* ── Bottom Row: Recent Activity + Security ───────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Recent Activity */}
        <Card className="p-6 border-none shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-[1.75rem] bg-white">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-4 h-4 text-gray-400" />
            <h3 className="text-base font-extrabold text-gray-900">Recent Activity</h3>
          </div>

          <div className="space-y-3">
            {paymentHistory.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 p-4 text-sm text-gray-500">
                No payment submissions yet. Once you upload a receipt, the payment review trail will appear here.
              </div>
            ) : (
              paymentHistory.slice(0, 4).map((payment: any) => (
                <div key={payment.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${payment.status === 'COMPLETED' ? 'bg-[#BEF264]/30' : 'bg-purple-100'}`}>
                    {payment.status === 'COMPLETED' ? (
                      <Check className="w-4 h-4 text-[#3F6212]" />
                    ) : (
                      <ArrowDownToLine className="w-4 h-4 text-purple-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 leading-none mb-0.5">{payment.description || 'Payment Submitted'}</p>
                    <p className="text-[10px] text-gray-400 font-semibold">{new Date(payment.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-gray-900">₹{Number(payment.amount || 0).toLocaleString()}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-purple-500">{payment.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => toast.info('Full statement download starting...')}
            className="w-full mt-5 pt-4 border-t border-gray-100 text-[10px] font-black tracking-widest text-gray-400 hover:text-gray-700 uppercase transition-colors text-center"
          >
            Download Full Statement
          </button>
        </Card>

        {/* Encrypted Security Card */}
        <Card className="p-7 border-none rounded-[1.75rem] relative overflow-hidden bg-[#5B21B6] text-white min-h-[180px]">
          {/* Background orbs */}
          <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-30px] left-[20px] w-40 h-40 bg-purple-800/60 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute top-4 right-4 w-24 h-24 border border-white/10 rounded-full pointer-events-none" />
          <div className="absolute top-8 right-8 w-14 h-14 border border-white/10 rounded-full pointer-events-none" />

          <div className="relative z-10">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>

            <h3 className="text-xl font-extrabold text-white mb-2">Encrypted Security</h3>
            <p className="text-sm text-purple-200 font-medium leading-relaxed max-w-xs">
              Your financial safety is our priority. All transactions are processed through 256-bit SSL encryption and verified by our auditing team within 24 business hours.
            </p>

            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#BEF264]" />
                <span className="text-[10px] font-black tracking-widest text-purple-200 uppercase">PCI DSS COMPLIANT</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#BEF264] animate-pulse" />
                <span className="text-[10px] font-black tracking-widest text-purple-200 uppercase">24/7 MONITORING</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Lightbox Modal ───────────────────────────────────────── */}
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

      {/* ── Submit Payment Modal ─────────────────────────────────── */}
      {isPaymentModalOpen && activeInstallmentIndex !== null && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="relative max-w-lg w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col p-8 space-y-6 my-8">

            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] font-black tracking-widest text-purple-600 uppercase block mb-1">TRANSACTION SECURE</span>
                <h3 className="text-2xl font-black text-gray-900">
                  Submit {activeInstallmentIndex === 0 ? '1st' : activeInstallmentIndex === 1 ? '2nd' : '3rd'} Installment
                </h3>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 rounded-2xl hover:bg-gray-100 text-gray-400 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Amount + bank details */}
            <div className="p-5 bg-[#0F172A] text-white rounded-2xl space-y-4">
              <div>
                <p className="text-[9px] font-bold text-gray-400 tracking-widest uppercase mb-1">TOTAL AMOUNT DUE</p>
                <p className="text-2xl font-extrabold text-[#BEF264]">{currencySymbol}{Math.round(totalPayable).toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10 text-xs">
                <div>
                  <p className="text-gray-500 font-bold uppercase text-[9px] tracking-wider mb-0.5">Bank Name</p>
                  <p className="font-semibold text-white">{paymentConfig.bankName}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-bold uppercase text-[9px] tracking-wider mb-0.5">Account Name</p>
                  <p className="font-semibold text-white">{paymentConfig.accountName}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-bold uppercase text-[9px] tracking-wider mb-0.5">Account Number</p>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-semibold text-white">{paymentConfig.accountNumber}</span>
                    <button onClick={() => copyToClipboard(paymentConfig.accountNumber.replace(/\s/g,''), 'Account number')} className="text-gray-500 hover:text-white">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 font-bold uppercase text-[9px] tracking-wider mb-0.5">SWIFT / BIC</p>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-semibold text-white">{paymentConfig.ifsc}</span>
                    <button onClick={() => copyToClipboard(paymentConfig.ifsc, 'SWIFT code')} className="text-gray-500 hover:text-white">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 tracking-wider uppercase ml-1 block mb-1.5">
                  UTR / Transaction Number
                </label>
                <input
                  type="text"
                  placeholder="Enter 12-digit UTR transaction number"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 text-gray-900 font-mono focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 tracking-wider uppercase ml-1 block mb-1.5">
                  Payment Receipt Screenshot
                </label>
                {screenshotUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <Check className="w-5 h-5 text-green-600 shrink-0" />
                    <span className="text-xs font-semibold text-green-700 flex-1 truncate">Screenshot uploaded successfully</span>
                    <button onClick={() => setIsUploadOpen(true)} className="text-xs font-bold text-green-600 hover:text-green-800 uppercase">Change</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="w-full h-12 rounded-xl border-dashed border-2 border-purple-200 hover:border-purple-400 bg-purple-50/10 hover:bg-purple-50/20 text-purple-600 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4" /> Upload Receipt
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <Button variant="ghost" onClick={() => setIsPaymentModalOpen(false)} className="h-11 px-6 rounded-xl font-bold text-gray-500">
                Cancel
              </Button>
              <Button
                onClick={handlePaymentSubmit}
                disabled={submittingPayment || !utrNumber || !screenshotUrl}
                className="h-11 px-8 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold uppercase text-xs tracking-wider disabled:opacity-50 gap-2"
              >
                {submittingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Submit Payment
              </Button>
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
        documentName={`Payment Receipt - ${activeInstallmentIndex === 0 ? '1st' : activeInstallmentIndex === 1 ? '2nd' : '3rd'} Installment`}
      />
    </StudentLayout>
  )
}
