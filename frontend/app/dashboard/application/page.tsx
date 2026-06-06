'use client'

import { useState, useEffect } from 'react'
import { StudentLayout } from '@/components/student/student-layout'
import { applicationPageContentService, applicationService, workflowService } from '@/lib/services/api.service'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ProfileBuilderStep } from '@/components/student/profile-builder-step'

export default function ApplicationPage() {
  const router = useRouter()
  const [application, setApplication] = useState<any>(null)
  const [workflow, setWorkflow] = useState<any>(null)
  const [pageContent, setPageContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [appData, wfData, contentData] = await Promise.all([
          applicationService.getMy(),
          workflowService.get(),
          applicationPageContentService.get('application')
        ])

        setApplication(appData)
        setWorkflow(wfData)
        setPageContent(contentData)
      } catch (error: any) {
        toast.error('Failed to load application data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (formData: any, overrideApp?: any) => {
    toast.info('Saving your progress...')
    try {
      setSubmitting(true)

      const appPayload = overrideApp || application || {}

      let nextStepId = 'application'
      if (workflow?.steps && workflow.steps.length > 0) {
        const currentStepIdx = workflow.steps.findIndex((s: any) =>
          s.id === 'application' || s.name?.toLowerCase().includes('application')
        )

        if (currentStepIdx !== -1 && currentStepIdx < workflow.steps.length - 1) {
          nextStepId = workflow.steps[currentStepIdx + 1].id
        } else if (currentStepIdx === -1) {
          nextStepId = workflow.steps.length > 1 ? workflow.steps[1].id : workflow.steps[0].id
        }
      }

      const newApp = await applicationService.create({
        ...appPayload,
        status: 'DRAFT',
        currentStepId: nextStepId,
      })

      setApplication(newApp)
      toast.success('Information saved!')

      if (nextStepId !== 'application') {
        router.push(`/dashboard/${nextStepId}`)
      }
    } catch (error: any) {
      console.error('Submit error:', error)
      toast.error(error.message || 'Failed to save progress')
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
    <StudentLayout currentStep="application">
      <ProfileBuilderStep
        application={application}
        onSubmit={handleSubmit}
        submitting={submitting}
        pageContent={pageContent}
      />
    </StudentLayout>
  )
}

