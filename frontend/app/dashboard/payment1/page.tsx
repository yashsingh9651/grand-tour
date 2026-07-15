'use client'

import { useState, useEffect } from 'react'
import { StudentLayout } from '@/components/student/student-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { applicationService, workflowService, paymentService, documentTemplateService } from '@/lib/services/api.service'
import UploadPopup from '@/components/UploadPopup'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import {
  Loader2, Check, Lock, UploadCloud, Eye, X, Copy,
  ShieldCheck, Landmark, Clock, IndianRupee, CheckCircle2, Info, FileText, PartyPopper, FileDown
} from 'lucide-react'
import { usePaymentReceipt } from '@/components/PaymentReceiptPDF'
import PaymentPlaneAnimation from '@/components/PaymentPlaneAnimation'

export default function Payment1Page() {
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
  const [paymentTemplate, setPaymentTemplate] = useState<any>(null)
  const [generatingDoc, setGeneratingDoc] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const accepted = localStorage.getItem('payment1_terms_accepted') === 'true'
      setAcceptedTerms(accepted)
    }
  }, [])

  const handleAcceptTerms = () => {
    localStorage.setItem('payment1_terms_accepted', 'true')
    setAcceptedTerms(true)
    toast.success('Terms and conditions accepted successfully!')
  }

  // Receipt download — only used when payment is COMPLETED
  const [receiptPayment, setReceiptPayment] = useState<any>(null)
  const receiptStudentName = application
    ? `${application.user?.firstName || ''} ${application.user?.lastName || ''}`.trim()
    : ''
  const receiptHook = usePaymentReceipt({
    studentName: receiptStudentName,
    amount: receiptPayment?.amount || 0,
    paymentDate: receiptPayment?.createdAt || new Date().toISOString(),
    paymentId: receiptPayment?.id || '',
    installmentNumber: 1,
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

      // Store latest completed payment for receipt
      const completed = (appData?.payments || []).find((p: any) => p.status === 'COMPLETED')
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
        description: '1st Installment'
      })
      toast.success('1st Installment submitted for verification!')
      fetchData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit payment')
    } finally {
      setSubmittingPayment(false)
    }
  }

  const handleDownloadFilledDocument = async () => {
    if (!paymentTemplate) return
    try {
      setGeneratingDoc(true)
      const response = await fetch(paymentTemplate.fileUrl)
      if (!response.ok) throw new Error('Failed to fetch document template')
      const arrayBuffer = await response.arrayBuffer()

      const PizZip = (await import('pizzip')).default
      const Docxtemplater = (await import('docxtemplater')).default

      const zip = new PizZip(arrayBuffer)
       const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: { start: '{{', end: '}}' },
        parser: function (tag: string) {
          return {
            get: function (scope: any) {
              const trimmed = tag.trim();
              if (scope[trimmed] !== undefined) return scope[trimmed];
              const withoutSpaces = trimmed.replace(/\s+/g, '');
              if (scope[withoutSpaces] !== undefined) return scope[withoutSpaces];
              if (scope[tag] !== undefined) return scope[tag];
              return '';
            }
          };
        }
      })

      const appData = application?.data || {}
      const eduInfo = appData['Application Form']?.['Educational Information'] || {}
      const personalInfo = appData['Application Form']?.['Personal Information'] || {}

      const dateStr = new Date().toLocaleDateString('en-GB') // DD/MM/YYYY
      const lastName = application.user?.lastName || personalInfo['Last Name'] || ''
      const firstName = application.user?.firstName || personalInfo['First Name'] || ''
      const instName = application.collegeName || eduInfo['College Name'] || application.educationalInstitution || ''
      const instAddress = eduInfo['College Address'] || application.data?.educationalInstitutionAddress || application.data?.collegeAddress || 'Pune, India'
      const principal = application.tpoName || eduInfo['TPO Name'] || application.data?.principalName || 'Dr. Principal'
      const university = application.universityName || eduInfo['University'] || ''
      
      // Month and Year string formatting (e.g. "September 2026")
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const currentDate = new Date();
      const monthYear = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
      const signatory = principal

      const mapping = {
        // CamelCase / Standard keys
        LastName: lastName,
        FirstName: firstName,
        InstituteName: instName,
        Date: dateStr,
        InstituteAddress: instAddress,
        Principal: principal,
        University: university,
        Institute: instName,
        MonthYear: monthYear,
        NameOfSignatory: signatory,

        // Spaced keys (matching user Word document tags exactly)
        'Last Name': lastName,
        'First Name': firstName,
        'Institute Name': instName,
        'Institute Address': instAddress,
        'Name of Principal': principal,
        'Principal Name': principal,
        'Month Year': monthYear,
        'Name of Signatory': signatory,
      }

      doc.setData(mapping)

      try {
        doc.render()
      } catch (renderError: any) {
        console.error('Docxtemplater Render Error:', renderError)
        // Extract raw docxtemplater error context
        const errors = renderError?.properties?.errors || []
        if (errors.length > 0) {
          const detail = errors.map((e: any) => `${e.message} near "${e.properties?.xtag || ''}"`).join(', ')
          throw new Error(`Template formatting error: ${detail}. Please open your Word document and re-type these tags manually.`)
        }
        throw new Error(renderError.message || 'Error compiling the Word template')
      }

      const outBlob = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })

      const url = window.URL.createObjectURL(outBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${paymentTemplate.name.replace(/\s+/g, '_')}_filled.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success('Document filled and downloaded successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate document', {
        duration: 10000 // Give user enough time to read the detailed fix instructions
      })
    } finally {
      setGeneratingDoc(false)
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
  const targetStepIndex = workflow?.steps?.findIndex((s: any) => s.id === 'payment1') ?? -1
  const paymentStageUnlocked = currentStepIndex >= 0 && targetStepIndex <= currentStepIndex

  if (!paymentStageUnlocked) {
    return (
      <StudentLayout currentStep="payment1">
        <div className="max-w-3xl rounded-3xl border border-dashed border-border bg-secondary/20 p-8 text-foreground mx-auto mt-10">
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

  const paymentsList = (application?.payments || []).filter((p: any) => {
    const desc = (p.description || '').toLowerCase()
    return !desc.includes('payment2') && !desc.includes('payment3')
  })

  const paymentHistory = [...paymentsList].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const latestPayment = paymentHistory[0]

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

  const categoryPricing = application?.studentCategoryObj?.pricing
  const hasCategoryPricing = Array.isArray(categoryPricing) && categoryPricing.some((inst: any) => Number(inst?.amount) > 0)
  const installmentsList = hasCategoryPricing ? categoryPricing : (paymentConfig?.installments || [])
  const hasAdminInstallments = Array.isArray(installmentsList) && installmentsList.length > 0

  const installmentAmount = hasAdminInstallments && installmentsList[0]?.amount
    ? Number(installmentsList[0].amount)
    : Math.round(totalPayable / 3)

  const currencySymbol = paymentConfig.currency?.toUpperCase().includes('USD') ? '$' : '₹'
  const qrCodeUrl = paymentConfig.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${paymentConfig.accountName || 'Grand Tour'}|${paymentConfig.accountNumber || ''}|${paymentConfig.ifsc || ''}|${installmentAmount}`)}`

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied`)
  }

  return (
    <StudentLayout
      currentStep="payment1"
      headerContent={
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          MANAGEMENT › <span className="text-[#84CC16] font-extrabold">FINANCIAL CENTER</span>
        </div>
      }
    >
      {/* Page Title */}
      <div className="mb-8">
        <p className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase mb-2">MANAGEMENT</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground leading-none mb-3">
          1st Installment Payment
        </h1>
        <p className="text-sm text-muted-foreground font-medium max-w-lg">
          Please complete your first tuition payment installment to proceed to the hotel host step.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start mb-8">

        {/* Left Column: Payment details */}
        <Card className="p-8 border border-border bg-card rounded-[2.5rem] shadow-sm text-foreground">
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
          <>
            <style>{`
              @keyframes ping-once { 0% { transform: scale(1); opacity: 0.7; } 100% { transform: scale(2.2); opacity: 0; } }
              @keyframes success-pop { 0% { transform: scale(0.7); opacity: 0; } 60% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }
              @keyframes bounce-check { 0%, 100% { transform: translateY(0); } 30% { transform: translateY(-10px); } 60% { transform: translateY(-4px); } }
              .success-card-anim { animation: success-pop 0.55s cubic-bezier(0.22,1,0.36,1) both; }
              .check-bounce { animation: bounce-check 0.9s ease 0.4s both; }
              .ring-ping-1 { animation: ping-once 1.1s ease-out 0.1s both; }
              .ring-ping-2 { animation: ping-once 1.1s ease-out 0.4s both; }
            `}</style>
            <Card className="success-card-anim p-8 border border-border bg-card rounded-[2.5rem] shadow-sm text-center space-y-6 text-foreground">
              <PaymentPlaneAnimation status="COMPLETED" />
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-2xl font-black text-green-600 dark:text-green-400">Payment Verified</h2>
                  <PartyPopper className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground font-medium max-w-sm mx-auto">
                  Your 1st installment payment has been successfully verified. You are now cleared for hotel host.
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
          </>
        ) : latestPayment?.status === 'PENDING' ? (
          <Card className="p-8 border border-border bg-card rounded-[2.5rem] shadow-sm text-center space-y-6 text-foreground">
            <PaymentPlaneAnimation status="PENDING" />
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-purple-600 dark:text-purple-400">Payment Under Review</h2>
              <p className="text-sm text-muted-foreground font-medium max-w-sm mx-auto">
                We are currently reviewing your payment submission. Your status will be updated within 24 business hours.
              </p>
            </div>
            <div className="p-4 bg-muted border border-border rounded-2xl text-left space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Submitted:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">{currencySymbol}{latestPayment.amount?.toLocaleString()}</span>
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
          </Card>
        ) : (
          <div className="space-y-6 w-full">
            {latestPayment?.status === 'FAILED' && (
              <Card className="p-8 border border-rose-500/20 bg-card rounded-[2.5rem] shadow-sm text-center space-y-6 text-foreground animate-in fade-in slide-in-from-top duration-300">
                <PaymentPlaneAnimation status="FAILED" />
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-rose-600 dark:text-rose-400">Payment Rejected</h2>
                  <p className="text-sm text-muted-foreground font-medium max-w-sm mx-auto">
                    Your 1st installment payment submission was rejected. Please review the note and upload a new receipt.
                  </p>
                  {latestPayment.notes && (
                    <p className="text-xs text-rose-500 font-bold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 max-w-xs mx-auto">
                      Reason: {latestPayment.notes}
                    </p>
                  )}
                </div>
              </Card>
            )}

            <Card className="p-8 border border-border bg-card rounded-[2.5rem] shadow-sm text-foreground relative overflow-hidden">
              {!acceptedTerms && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-card/65 backdrop-blur-[4px] transition-all duration-300">
                <div className="bg-background/95 border border-border/80 p-6 rounded-[2rem] text-center space-y-4 max-w-xs shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                    <Lock className="w-5 h-5 text-primary animate-pulse" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-sm uppercase tracking-widest text-foreground">Financial Disclosure & Terms</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Please execute formal acknowledgment of the tuition payment policies, refund schedules, and internship program timeline conditions to authorize access and proceed with payment processing.
                    </p>
                  </div>
                  <Button
                    onClick={handleAcceptTerms}
                    className="w-full bg-[#E1000F] hover:bg-[#E1000F]/90 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-red-500/10 active:scale-95 transition-all"
                  >
                    Acknowledge & Unlock
                  </Button>
                </div>
              </div>
            )}

            <div className={`flex flex-col items-center text-center space-y-6 transition-all duration-300 ${!acceptedTerms ? 'filter blur-md pointer-events-none select-none' : ''}`}>
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
      {/* Third Column: Instructions & Attachments */}
      <Card className="p-8 border border-border bg-card rounded-[2.5rem] shadow-sm text-foreground">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-black">Guidelines</h2>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Resources & Info</p>
              </div>
            </div>

            {/* Instructions Text */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-foreground">Instructions</h3>
              {paymentConfig.instructions ? (
                <div className="p-4 bg-muted border border-border rounded-2xl text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">
                  {paymentConfig.instructions}
                </div>
              ) : (
                <div className="p-4 bg-muted border border-border rounded-2xl text-xs text-muted-foreground italic font-medium">
                  No custom instructions provided by the admin.
                </div>
              )}
            </div>


            {/* Documents List */}
            {(() => {
              const studentDocs = (application?.documents || []).filter((d: any) => d.type === 'PAYMENT1_DOCUMENT')
              const combinedDocs = [
                ...(paymentConfig.documents || []),
                ...studentDocs.map((d: any) => ({ name: d.name, url: d.url }))
              ]

              return (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground">Downloadable Reference Files</h3>
                  {combinedDocs.length > 0 ? (
                    <div className="space-y-2">
                      {combinedDocs.map((doc: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted border border-border rounded-2xl hover:bg-muted/80 transition-all group">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <FileText className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-xs font-bold text-foreground truncate">{doc.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 bg-primary text-[#1A1A1A] font-bold text-xs gap-1 hover:bg-primary/95 rounded-xl shrink-0"
                            asChild
                          >
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" download>
                              Download
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-muted border border-border rounded-2xl text-xs text-muted-foreground italic font-medium">
                      No reference files available.
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        </Card>
      </div>

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
        documentName={`Payment Receipt - 1st Installment`}
      />
    </StudentLayout>
  )
}
