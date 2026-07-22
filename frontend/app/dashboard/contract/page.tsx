'use client'

import { useState, useEffect } from 'react'
import { StudentLayout } from '@/components/student/student-layout'
import { applicationService, workflowService } from '@/lib/services/api.service'
import { ContractStep } from '@/components/student/contract-step'
import { Loader2, Lock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function ContractPage() {
  const router = useRouter()
  const [application, setApplication] = useState<any>(null)
  const [workflow, setWorkflow] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [appData, wfData] = await Promise.all([
          applicationService.getMy(),
          workflowService.get(),
        ])
        setApplication(appData)
        setWorkflow(wfData)
      } catch (error: any) {
        toast.error('Failed to load contract data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const contractStepConfig = workflow?.steps?.find(
    (s: any) => s.id === 'contract' || s.isContractStep
  )

  const currentStepIndex = workflow?.steps?.findIndex(
    (s: any) => s.id === application?.currentStepId
  ) ?? -1
  const contractStepIndex = workflow?.steps?.findIndex(
    (s: any) => s.id === 'contract' || s.isContractStep
  ) ?? -1
  const isLocked = currentStepIndex >= 0 && contractStepIndex > currentStepIndex

  const handleSubmit = async (formData: any) => {
    try {
      setSubmitting(true)

      // Find the next step after contract
      let nextStepId = 'contract'
      if (workflow?.steps) {
        const idx = workflow.steps.findIndex((s: any) => s.id === 'contract' || s.isContractStep)
        if (idx !== -1 && idx < workflow.steps.length - 1) {
          nextStepId = workflow.steps[idx + 1].id
        }
      }

      // Merge form data under the contract step name
      const stageName = contractStepConfig?.name || 'Contract Signing'
      const updatedData = {
        ...(application?.data || {}),
        [stageName]: {
          ...(application?.data?.[stageName] || {}),
          ...formData,
        },
      }

      // Save form data first
      await applicationService.update(application.id, { data: updatedData })

      // Then advance to next step
      await applicationService.updateStep(application.id, nextStepId)

      toast.success('Contract submitted! Moving to the next stage.')
      router.push(`/dashboard/${nextStepId}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit contract')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <StudentLayout currentStep={application?.currentStepId}>
      <div className="max-w-4xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            {contractStepConfig?.contractConfig?.contractTitle || 'Convention'}
          </h1>
          <p className="text-muted-foreground">
            {contractStepConfig?.description || 'Download, sign, and upload your Convention de Stage'}

          </p>
        </div>

        {isLocked ? (
          <Card className="p-8 border border-border bg-card text-foreground rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">This Step is Locked</h2>
                <p className="text-muted-foreground mt-1">
                  Complete all previous stages to unlock contract signing.
                </p>
                <Button
                  className="mt-4 bg-primary text-[#1A1A1A] font-bold hover:bg-primary/90"
                  onClick={() => router.push(`/dashboard/${application?.currentStepId || 'application'}`)}
                >
                  Return to Current Step
                </Button>
              </div>
            </div>
          </Card>
        ) : contractStepConfig ? (
          <ContractStep
            application={application}
            currentStepConfig={contractStepConfig}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        ) : (
          <Card className="p-12 text-center border border-dashed border-border bg-card text-foreground space-y-4">
            <h3 className="text-lg font-semibold text-muted-foreground">Not Configured Yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              The admin has not configured the contract step yet. Please check back later.
            </p>
          </Card>
        )}
      </div>
    </StudentLayout>
  )
}
