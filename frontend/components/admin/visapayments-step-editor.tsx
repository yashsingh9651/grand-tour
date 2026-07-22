'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { ShieldCheck, Save, CircleDollarSign, Edit3, Loader2 } from 'lucide-react'
import { workflowService } from '@/lib/services/api.service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const defaultAmounts = {
  visaFee: 15000,
  visaFeeName: 'VFS Appointment Fees',
  sevisFee: 25000,
  sevisFeeName: 'Insurance Fees',
  miscFee: 5000,
  miscFeeName: 'Dummy Ticket Fees'
}

export function VisaPaymentsStepEditor() {
  const { data: session } = useSession()
  const [workflow, setWorkflow] = useState<any>(null)
  const [visaStep, setVisaStep] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form fields
  const [visaFeeName, setVisaFeeName] = useState('')
  const [visaFeeAmount, setVisaFeeAmount] = useState(0)

  const [sevisFeeName, setSevisFeeName] = useState('')
  const [sevisFeeAmount, setSevisFeeAmount] = useState(0)

  const [miscFeeName, setMiscFeeName] = useState('')
  const [miscFeeAmount, setMiscFeeAmount] = useState(0)

  useEffect(() => {
    const loadWorkflow = async () => {
      try {
        setLoading(true)
        const data = await workflowService.get()
        setWorkflow(data)

        const step = data?.steps?.find((s: any) => s.id === 'visapayments')
        setVisaStep(step || null)

        if (step) {
          const amounts = step.amounts || {}
          setVisaFeeName(amounts.visaFeeName || defaultAmounts.visaFeeName)
          setVisaFeeAmount(Number(amounts.visaFee ?? defaultAmounts.visaFee))

          setSevisFeeName(amounts.sevisFeeName || defaultAmounts.sevisFeeName)
          setSevisFeeAmount(Number(amounts.sevisFee ?? defaultAmounts.sevisFee))

          setMiscFeeName(amounts.miscFeeName || defaultAmounts.miscFeeName)
          setMiscFeeAmount(Number(amounts.miscFee ?? defaultAmounts.miscFee))
        } else {
          toast.warning('No Visa Payments step was found in the database. Ensure DB migrations have completed.')
        }
      } catch (error) {
        toast.error('Failed to load workflow configuration')
      } finally {
        setLoading(false)
      }
    }

    loadWorkflow()
  }, [])

  const handleSave = async () => {
    if (!workflow || !visaStep) {
      toast.error('No Visa Payments step available to save')
      return
    }

    try {
      setSaving(true)

      const normalizedStep = {
        ...visaStep,
        amounts: {
          visaFee: Number(visaFeeAmount),
          visaFeeName: visaFeeName.trim(),
          sevisFee: Number(sevisFeeAmount),
          sevisFeeName: sevisFeeName.trim(),
          miscFee: Number(miscFeeAmount),
          miscFeeName: miscFeeName.trim()
        }
      }

      const updatedWorkflow = {
        ...workflow,
        steps: workflow.steps.map((s: any) => s.id === normalizedStep.id ? normalizedStep : s),
      }

      await workflowService.update(updatedWorkflow)
      const refreshed = await workflowService.get()
      setWorkflow(refreshed)
      setVisaStep(refreshed.steps.find((s: any) => s.id === normalizedStep.id))
      toast.success('Visa payments configuration saved successfully!')
    } catch (error) {
      toast.error('Failed to save visa payments settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-6 border-dashed border-border/60 bg-white">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Loading visa payments config...
        </div>
      </Card>
    )
  }

  if (!visaStep) {
    return (
      <Card className="p-6 border-dashed border-amber-200 bg-amber-50/60">
        <p className="text-sm font-medium text-amber-900">No Visa Payments step is currently available in the active workflow.</p>
      </Card>
    )
  }

  const totalFee = visaFeeAmount + sevisFeeAmount + miscFeeAmount

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card className="p-6 border border-border/60 bg-white shadow-sm rounded-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#7C3AED]">
              <ShieldCheck className="w-4 h-4" />
              Visa Fees Editor
            </div>
            <h2 className="mt-3 text-2xl font-bold text-slate-900 font-sans">Visa Payments Step Customizer</h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl font-medium">
              Configure the amounts and title labels for the three distinct fees the students must pay during their visa processing stage.
            </p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold px-3 py-1 rounded-full text-xs">Live Sync</Badge>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Payment 1 Card */}
        <Card className="p-6 border border-slate-200 bg-white rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <CircleDollarSign className="w-5 h-5" />
            <h3 className="font-bold text-slate-800 text-base">Payment Slot 1</h3>
          </div>
          <hr className="border-slate-100" />
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">Payment Title</label>
              <Input
                value={visaFeeName}
                onChange={(e) => setVisaFeeName(e.target.value)}
                placeholder="e.g. Visa Fee"
                className="h-11 rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">Amount (₹)</label>
              <Input
                type="number"
                min="0"
                value={visaFeeAmount}
                onChange={(e) => setVisaFeeAmount(Number(e.target.value) || 0)}
                className="h-11 rounded-xl border-slate-200"
              />
            </div>
          </div>
        </Card>

        {/* Payment 2 Card */}
        <Card className="p-6 border border-slate-200 bg-white rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <CircleDollarSign className="w-5 h-5" />
            <h3 className="font-bold text-slate-800 text-base">Payment Slot 2</h3>
          </div>
          <hr className="border-slate-100" />
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">Payment Title</label>
              <Input
                value={sevisFeeName}
                onChange={(e) => setSevisFeeName(e.target.value)}
                placeholder="e.g. VFS Appointment Fees"
                className="h-11 rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">Amount (₹)</label>
              <Input
                type="number"
                min="0"
                value={sevisFeeAmount}
                onChange={(e) => setSevisFeeAmount(Number(e.target.value) || 0)}
                className="h-11 rounded-xl border-slate-200"
              />
            </div>
          </div>
        </Card>

        {/* Payment 3 Card */}
        <Card className="p-6 border border-slate-200 bg-white rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <CircleDollarSign className="w-5 h-5" />
            <h3 className="font-bold text-slate-800 text-base">Payment Slot 3</h3>
          </div>
          <hr className="border-slate-100" />
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">Payment Title</label>
              <Input
                value={miscFeeName}
                onChange={(e) => setMiscFeeName(e.target.value)}
                placeholder="e.g. Dummy Ticket Fees"
                className="h-11 rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600">Amount (₹)</label>
              <Input
                type="number"
                min="0"
                value={miscFeeAmount}
                onChange={(e) => setMiscFeeAmount(Number(e.target.value) || 0)}
                className="h-11 rounded-xl border-slate-200"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Summary info and Actions */}
      <Card className="p-6 border border-slate-200 bg-slate-900 text-white rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Total Configured Amount</p>
          <p className="mt-2 text-3xl font-black text-[#BEF264]">₹{totalFee.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Students will pay this total split into 3 distinct transactions.</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#CCFF00] hover:opacity-90 text-slate-950 font-bold h-12 px-8 rounded-2xl tracking-widest uppercase gap-2 shrink-0 self-end md:self-center"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin mr-1" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save Workflow Changes'}
        </Button>
      </Card>
    </div>
  )
}
