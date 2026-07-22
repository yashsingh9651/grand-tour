'use client'

import { useState, useEffect } from 'react'
import { StudentLayout } from '@/components/student/student-layout'
import { Button } from '@/components/ui/button'
import { applicationPageContentService, applicationService, workflowService } from '@/lib/services/api.service'
import UploadPopup from '@/components/UploadPopup'
import { DocumentsStepPreview } from '@/components/student/documents-step-preview'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, ArrowLeft } from 'lucide-react'

export default function DocumentsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const token = (session as any)?.backendToken || ''
  const [application, setApplication] = useState<any>(null)
  const [workflow, setWorkflow] = useState<any>(null)
  const [pageContent, setPageContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Upload popup states
  const [uploadOpen, setUploadOpen] = useState(false)
  const [activeDocType, setActiveDocType] = useState<string>('')
  const [activeDocName, setActiveDocName] = useState<string>('')

  // Track uploaded docs
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, any>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [appData, wfData, contentData] = await Promise.all([
          applicationService.getMy(),
          workflowService.get(),
          applicationPageContentService.get('documents')
        ])
        setApplication(appData)
        setWorkflow(wfData)
        setPageContent(contentData)

        // Pre-populate uploaded docs from application.documents
        if (appData?.documents) {
          const docs: Record<string, any> = {}
          appData.documents.forEach((d: any) => {
            docs[d.type] = d
          })
          setUploadedDocs(docs)
        }
      } catch (error: any) {
        toast.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const openUpload = (docType: string, docName: string) => {
    setActiveDocType(docType)
    setActiveDocName(docName)
    setUploadOpen(true)
  }

  const handleUploadComplete = (data: any) => {
    setUploadedDocs(prev => ({ ...prev, [activeDocType]: data }))
    toast.success(`${activeDocName} uploaded successfully!`)
  }

  const uploadedDocStatuses = Object.values(uploadedDocs)
  const hasRejectedDocuments = uploadedDocStatuses.some((doc: any) => doc.status === 'REJECTED')
  const allUploadedDocsApproved = uploadedDocStatuses.length > 0 && uploadedDocStatuses.every((doc: any) => doc.status === 'APPROVED')

  const requiredDocKeys = (pageContent?.blocks || [])
    .filter((b: any) => b.type === 'upload' && b.enabled !== false)
    .map((b: any) => b.fieldKey)

  const fallbackKeys = ['RESUME', 'PASSPORT', 'PHOTO']
  const keysToCheck = requiredDocKeys.length > 0 ? requiredDocKeys : fallbackKeys

  const allRequiredDocsUploaded = keysToCheck.every((key: string) =>
    uploadedDocs[key] && uploadedDocs[key].status !== 'REJECTED'
  )
  const allRequiredDocsVerified = keysToCheck.every((key: string) =>
    uploadedDocs[key] && uploadedDocs[key].status === 'APPROVED'
  )
  const canContinue = allRequiredDocsVerified

  const handleSaveDraft = async () => {
    try {
      if (application?.id) {
        await applicationService.update(application.id, {
          status: 'DRAFT',
        });
      }
      toast.success('Document uploads saved as draft!');
    } catch (err) {
      toast.error('Failed to save draft');
    }
  };

  const handleContinue = async () => {

    if (!canContinue) {
      toast.error('All required documents must be verified and approved by the admin before continuing.')
      return
    }

    try {
      setSubmitting(true)

      // Determine next step
      let nextStepId = 'documents'
      if (workflow?.steps) {
        const currentIdx = workflow.steps.findIndex((s: any) => s.id === 'documents')
        if (currentIdx !== -1 && currentIdx < workflow.steps.length - 1) {
          nextStepId = workflow.steps[currentIdx + 1].id
        }
      }

      await applicationService.updateStep(application.id, nextStepId)

      toast.success('Moving to the next stage.')
      router.push(`/dashboard/${nextStepId}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to save')
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

  const DEFAULT_JOURNEY_STEPS = [
    'application',
    'documents',
    'interview',
    'payment1',
    'hotel',
    'payment2',
    'contract',
    'payment3',
    'workpermit',
    'visa',
    'travel'
  ]
  const journeySteps = workflow?.steps?.map((s: any) => s.id) || DEFAULT_JOURNEY_STEPS
  const currentStepId = application?.currentStepId || 'documents'
  const currentStepIndex = journeySteps.indexOf(currentStepId) !== -1 
    ? journeySteps.indexOf(currentStepId) 
    : journeySteps.indexOf('documents')
  const nextStepIndex = currentStepIndex + 1 < journeySteps.length ? currentStepIndex + 1 : currentStepIndex

  return (
    <StudentLayout currentStep="documents">
      <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <DocumentsStepPreview
          pageContent={pageContent}
          uploadedDocs={uploadedDocs}
          onUpload={openUpload}
          application={application}
          workflow={workflow}
        />

        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-sm text-emerald-600 dark:text-emerald-400">
          {hasRejectedDocuments ? (
            <p className="font-semibold">One or more documents were rejected. Please resubmit the rejected files before continuing.</p>
          ) : !allRequiredDocsUploaded ? (
            <p className="font-semibold">Upload all required documents to unlock the next stage.</p>
          ) : !allRequiredDocsVerified ? (
            <p className="font-semibold">Your documents are uploaded and under review. Please wait for the admin to verify and approve them before continuing.</p>
          ) : (
            <p className="font-semibold">All required documents are approved. You can now continue to the next stage.</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-8 border-t border-border">
          <Button
            variant="ghost"
            className="text-muted-foreground font-medium hover:bg-muted rounded-xl gap-2"
            onClick={() => router.push('/dashboard/application')}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous: Personal Details
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleSaveDraft}
              className="text-muted-foreground font-medium hover:bg-muted rounded-xl"
            >
              Save Draft
            </Button>

            <Button
              onClick={handleContinue}
              disabled={submitting || !canContinue}
              className="bg-[#C6F16D] hover:bg-[#b5e359] text-[#1A1A1A] font-bold h-12 px-8 rounded-full tracking-wide gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              Continue to Step {nextStepIndex + 1}
            </Button>
          </div>
        </div>
      </div>

      {/* Upload Popup */}
      <UploadPopup
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadComplete={handleUploadComplete}
        token={token}
        applicationId={application?.id}
        documentType={activeDocType}
        documentName={activeDocName}
      />
    </StudentLayout>
  )
}
