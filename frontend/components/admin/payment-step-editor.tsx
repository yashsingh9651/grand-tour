'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { ShieldCheck, UploadCloud, Building2, Landmark, WalletCards, Plus, Trash2, Save, CircleDollarSign, CalendarDays, ReceiptText } from 'lucide-react'
import { workflowService } from '@/lib/services/api.service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import UploadPopup from '@/components/UploadPopup'

const defaultPaymentConfig = {
  accountName: '',
  accountNumber: '',
  ifsc: '',
  bankName: '',
  currency: 'INR',
  merchant: '',
  reference: '',
  qrCodeUrl: '',
  installments: [] as Array<{ label: string; amount: number; dueDate: string }>,
}

export function PaymentStepEditor() {
  const { data: session } = useSession()
  const [workflow, setWorkflow] = useState<any>(null)
  const [paymentStep, setPaymentStep] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isQrUploadOpen, setIsQrUploadOpen] = useState(false)

  useEffect(() => {
    const loadWorkflow = async () => {
      try {
        setLoading(true)
        const data = await workflowService.get()
        setWorkflow(data)

        const currentPaymentStep = data?.steps?.find((step: any) => step.id === 'payment1') || data?.steps?.find((step: any) => step.isPaymentStep || step.name?.toLowerCase().includes('payment'))
        const resolvedStep = currentPaymentStep || null
        setPaymentStep(resolvedStep)

        if (!resolvedStep) {
          toast.warning('No payment step found in the workflow. Configure the existing payment step or contact your workflow admin.')
        }
      } catch (error) {
        toast.error('Failed to load workflow configuration')
      } finally {
        setLoading(false)
      }
    }

    loadWorkflow()
  }, [])

  const paymentConfig = paymentStep?.paymentConfig || defaultPaymentConfig
  const installmentRows: Array<{ label: string; amount: number | string; dueDate: string }> = Array.isArray(paymentConfig.installments)
    ? paymentConfig.installments as Array<{ label: string; amount: number | string; dueDate: string }>
    : []

  const totalPayable = (() => {
    const baseAmount = Number(paymentStep?.amount || 0)
    const discountAmount = baseAmount * (Number(paymentStep?.discountPercentage || 0) / 100)
    const gstAmount = (baseAmount - discountAmount) * (Number(paymentStep?.gstPercentage || 0) / 100)
    const calculatedTotal = baseAmount - discountAmount + gstAmount

    if (installmentRows.length > 0) {
      return installmentRows.reduce((sum: number, item) => sum + Number(item.amount || 0), 0)
    }

    return calculatedTotal
  })()

  const currencySymbol = paymentConfig.currency?.toUpperCase().includes('USD') ? '$' : '₹'

  const updatePaymentStep = (updater: (current: any) => any) => {
    setPaymentStep((current: any) => {
      const next = updater(current)
      return next
    })
  }

  const syncPaymentConfig = (configUpdater: (current: any) => any) => {
    updatePaymentStep((current: any) => {
      const currentConfig = current?.paymentConfig || defaultPaymentConfig
      return {
        ...current,
        paymentConfig: configUpdater(currentConfig),
      }
    })
  }

  const handleUploadComplete = (doc: any) => {
    const uploadedUrl = doc.url || doc.data?.url || ''
    if (!uploadedUrl) return
    syncPaymentConfig((current) => ({ ...current, qrCodeUrl: uploadedUrl }))
    toast.success('QR image uploaded successfully')
  }

  const handleAddInstallment = () => {
    syncPaymentConfig((current) => ({
      ...current,
      installments: [
        ...(current.installments || []),
        { label: `INSTALLMENT ${((current.installments?.length || 0) + 1)}`, amount: 0, dueDate: '' },
      ],
    }))
  }

  const handleRemoveInstallment = (index: number) => {
    syncPaymentConfig((current) => ({
      ...current,
      installments: (current.installments || []).filter((_: any, currentIndex: number) => currentIndex !== index),
    }))
  }

  const handleSave = async () => {
    if (!workflow || !paymentStep) {
      toast.error('No payment step available to save')
      return
    }

    try {
      setSaving(true)

      const normalizedStep = {
        ...paymentStep,
        amount: Number(paymentStep.amount || 0),
        discountPercentage: Number(paymentStep.discountPercentage || 0),
        gstPercentage: Number(paymentStep.gstPercentage || 0),
        isPaymentStep: true,
        paymentConfig: {
          ...(paymentStep.paymentConfig || defaultPaymentConfig),
          installments: (paymentStep.paymentConfig?.installments || []).map((item: any) => ({
            label: item.label || '',
            amount: Number(item.amount || 0),
            dueDate: item.dueDate || '',
          })),
        },
      }

      const updatedWorkflow = {
        ...workflow,
        steps: workflow.steps.map((step: any) => step.id === normalizedStep.id ? normalizedStep : step),
      }

      await workflowService.update(updatedWorkflow)
      const refreshed = await workflowService.get()
      setWorkflow(refreshed)
      setPaymentStep(refreshed.steps.find((step: any) => step.id === normalizedStep.id))
      toast.success('Payment step saved successfully')
    } catch (error) {
      toast.error('Failed to save payment step')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-6 border-dashed border-border/60">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading payment configuration...
        </div>
      </Card>
    )
  }

  if (!paymentStep) {
    return (
      <Card className="p-6 border-dashed border-amber-200 bg-amber-50/60">
        <p className="text-sm font-medium text-amber-900">No payment step is currently available in this workflow.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 border border-border/60 bg-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#7C3AED]">
              <ShieldCheck className="w-4 h-4" />
              Dedicated Finance Editor
            </div>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">Payment Step Configuration</h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Manage the student-facing bank details, QR upload, and installment structure for the finance stage without changing the generic workflow builder.
            </p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200">Live Workflow Sync</Badge>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6 border border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Financial Details</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Pricing & banking</h3>
            </div>
            <div className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
              Step: {paymentStep.id}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Base Amount</span>
              <Input
                type="number"
                min="0"
                value={paymentStep.amount || 0}
                onChange={(e) => updatePaymentStep((current: any) => ({ ...current, amount: Number(e.target.value) || 0 }))}
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Discount Percentage</span>
              <Input
                type="number"
                min="0"
                value={paymentStep.discountPercentage || 0}
                onChange={(e) => updatePaymentStep((current: any) => ({ ...current, discountPercentage: Number(e.target.value) || 0 }))}
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>GST Percentage</span>
              <Input
                type="number"
                min="0"
                value={paymentStep.gstPercentage || 0}
                onChange={(e) => updatePaymentStep((current: any) => ({ ...current, gstPercentage: Number(e.target.value) || 0 }))}
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Currency</span>
              <Input
                value={paymentConfig.currency || 'INR'}
                onChange={(e) => syncPaymentConfig((current) => ({ ...current, currency: e.target.value }))}
              />
            </label>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Bank Name</span>
              <Input
                value={paymentConfig.bankName || ''}
                onChange={(e) => syncPaymentConfig((current) => ({ ...current, bankName: e.target.value }))}
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Account Name</span>
              <Input
                value={paymentConfig.accountName || ''}
                onChange={(e) => syncPaymentConfig((current) => ({ ...current, accountName: e.target.value }))}
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Account Number</span>
              <Input
                value={paymentConfig.accountNumber || ''}
                onChange={(e) => syncPaymentConfig((current) => ({ ...current, accountNumber: e.target.value }))}
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>IFSC / Swift Code</span>
              <Input
                value={paymentConfig.ifsc || ''}
                onChange={(e) => syncPaymentConfig((current) => ({ ...current, ifsc: e.target.value }))}
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Merchant / Recipient</span>
              <Input
                value={paymentConfig.merchant || ''}
                onChange={(e) => syncPaymentConfig((current) => ({ ...current, merchant: e.target.value }))}
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              <span>Reference / Notes</span>
              <Input
                value={paymentConfig.reference || ''}
                onChange={(e) => syncPaymentConfig((current) => ({ ...current, reference: e.target.value }))}
              />
            </label>
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Payment QR Image</p>
                <p className="text-xs text-slate-600">Upload a custom QR image or keep the generated fallback for the student payment screen.</p>
              </div>
              <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setIsQrUploadOpen(true)}>
                <UploadCloud className="w-4 h-4" />
                Upload QR
              </Button>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Input
                value={paymentConfig.qrCodeUrl || ''}
                onChange={(e) => syncPaymentConfig((current) => ({ ...current, qrCodeUrl: e.target.value }))}
                placeholder="Paste image URL or upload a file"
              />
            </div>
            {paymentConfig.qrCodeUrl && (
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-white px-3 py-3 border border-slate-200">
                <img src={paymentConfig.qrCodeUrl} alt="Payment QR preview" className="h-16 w-16 rounded-lg border border-slate-200 object-contain bg-white" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">QR preview ready</p>
                  <p className="text-xs text-slate-600">This image will appear on the student finance page.</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6 border border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Installment Plan</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Manage due dates & amounts</h3>
            </div>
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleAddInstallment}>
              <Plus className="w-4 h-4" />
              Add Installment
            </Button>
          </div>

          <div className="mt-6 space-y-3">
            {installmentRows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                No custom installments defined yet. Add one to control payment split amounts and due dates.
              </div>
            ) : (
              installmentRows.map((installment: any, index: number) => (
                <div key={`${installment.label}-${index}`} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <ReceiptText className="w-4 h-4 text-violet-600" />
                      <span className="text-sm font-semibold text-slate-900">Installment {index + 1}</span>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => handleRemoveInstallment(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <label className="space-y-2 text-sm font-medium text-slate-700">
                      <span>Label</span>
                      <Input
                        value={installment.label || ''}
                        onChange={(e) => syncPaymentConfig((current) => ({
                          ...current,
                          installments: current.installments.map((item: any, currentIndex: number) => currentIndex === index ? { ...item, label: e.target.value } : item),
                        }))}
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-slate-700">
                      <span>Amount</span>
                      <Input
                        type="number"
                        min="0"
                        value={installment.amount || 0}
                        onChange={(e) => syncPaymentConfig((current) => ({
                          ...current,
                          installments: current.installments.map((item: any, currentIndex: number) => currentIndex === index ? { ...item, amount: Number(e.target.value) || 0 } : item),
                        }))}
                      />
                    </label>
                    <label className="space-y-2 text-sm font-medium text-slate-700">
                      <span>Due Date</span>
                      <Input
                        type="date"
                        value={installment.dueDate || ''}
                        onChange={(e) => syncPaymentConfig((current) => ({
                          ...current,
                          installments: current.installments.map((item: any, currentIndex: number) => currentIndex === index ? { ...item, dueDate: e.target.value } : item),
                        }))}
                      />
                    </label>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 rounded-xl bg-slate-900 p-4 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Configured total</p>
                <p className="mt-2 text-3xl font-bold text-[#BEF264]">{currencySymbol}{Math.round(totalPayable).toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                {installmentRows.length || 0} installments
              </div>
            </div>

            <div className="mt-4 grid gap-2 text-sm text-slate-200">
              <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                <span className="flex items-center gap-2"><CircleDollarSign className="w-4 h-4" /> Base Amount</span>
                <span className="font-semibold">{currencySymbol}{Math.round(Number(paymentStep.amount || 0)).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                <span className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Bank Account</span>
                <span className="font-semibold">{paymentConfig.accountNumber || 'Not set'}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                <span className="flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Due Dates</span>
                <span className="font-semibold">{installmentRows.filter((row: any) => row.dueDate).length} scheduled</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5 border border-border/60 bg-slate-50/70">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Ready to publish payment settings</p>
            <p className="text-xs text-slate-600">The student page will read bank details, QR assets, and installment splits directly from this saved step.</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Payment Step'}
          </Button>
        </div>
      </Card>

      <UploadPopup
        isOpen={isQrUploadOpen}
        onClose={() => setIsQrUploadOpen(false)}
        onUploadComplete={handleUploadComplete}
        token={(session as any)?.backendToken || ''}
        documentType="payment_qr"
        documentName="Payment QR Image"
      />
    </div>
  )
}
