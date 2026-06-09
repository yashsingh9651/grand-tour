'use client'

import { useState, useEffect, use } from 'react'
import { DashboardLayout } from '@/components/dashboard/layout-wrapper'
import { Header } from '@/components/dashboard/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useSession } from 'next-auth/react'
import {
  applicationService,
  workflowService,
  documentService,
  paymentService,
  hotelService,
  workPermitService,
  visaService,
  travelService,
  uploadService,
  applicationPageContentService,
  interviewService
} from '@/lib/services/api.service'
import { toast } from 'sonner'
import {
  Loader2, Check, X, ArrowLeft, Mail, Phone, Calendar,
  Clock, MapPin, FileText, Download, Building, Landmark,
  CreditCard, Eye, AlertCircle, RefreshCw, Upload, Sparkles,
  Plane, HelpCircle, CheckCircle2, Star, ShieldCheck, ChevronRight,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import UploadPopup from '@/components/UploadPopup'

const fallbackPageContent = {
  title: 'Build Your Editorial Profile',
  subtitle: 'Phase 1: Defining your academic and professional coordinates.',
  blocks: [
    {
      id: 'section-personal-credentials',
      type: 'section',
      label: 'Personal Credentials',
      section: 'Personal Credentials',
      column: 'left',
      order: 1,
      enabled: true,
    },
    {
      id: 'full-name',
      type: 'text',
      label: 'Full Legal Name',
      fieldKey: 'fullName',
      placeholder: 'e.g. John Doe',
      section: 'Personal Credentials',
      column: 'left',
      order: 2,
    },
    {
      id: 'primary-email',
      type: 'user',
      label: 'Primary Email',
      fieldKey: 'email',
      valueSource: 'user.email',
      section: 'Personal Credentials',
      column: 'left',
      order: 3,
      disabled: true,
    },
    {
      id: 'passport-number',
      type: 'text',
      label: 'Passport Number',
      fieldKey: 'passportNumber',
      placeholder: 'E1234567',
      section: 'Personal Credentials',
      column: 'left',
      order: 4,
      required: false,
    },
    {
      id: 'passport-confirmation',
      type: 'checkbox',
      label: 'I confirm I have a valid passport',
      fieldKey: 'passportConfirmed',
      defaultValue: true,
      section: 'Personal Credentials',
      column: 'left',
      order: 5,
      required: true,
    },
    {
      id: 'section-academic-nexus',
      type: 'section',
      label: 'Academic Nexus',
      section: 'Academic Nexus',
      column: 'left',
      order: 6,
      enabled: true,
    },
    {
      id: 'educational-institution',
      type: 'text',
      label: 'Educational Institution',
      fieldKey: 'educationalInstitution',
      placeholder: 'Metropolitan Institute of Technology',
      section: 'Academic Nexus',
      column: 'left',
      order: 7,
      required: false,
    },
    {
      id: 'enrollment-status',
      type: 'select',
      label: 'B.Tech Enrollment Status',
      fieldKey: 'enrollmentStatus',
      options: ['Active Candidate', 'Alumni'],
      defaultValue: 'Active Candidate',
      section: 'Academic Nexus',
      column: 'left',
      order: 8,
    },
    {
      id: 'cgpa',
      type: 'number',
      label: 'CGPA',
      fieldKey: 'cgpa',
      placeholder: '8.5',
      section: 'Academic Nexus',
      column: 'left',
      order: 9,
      required: false,
    },
    {
      id: 'section-journey-intent',
      type: 'section',
      label: 'Journey Intent',
      section: 'Journey Intent',
      column: 'right',
      order: 10,
      enabled: true,
    },
    {
      id: 'preferred-department',
      type: 'select',
      label: 'Preferred Department',
      fieldKey: 'preferredDepartment',
      options: ['Journalism', 'Digital Media', 'Publishing', 'Content Strategy'],
      section: 'Journey Intent',
      column: 'right',
      order: 11,
    },
    {
      id: 'statement-of-purpose',
      type: 'textarea',
      label: 'Statement of Purpose (250 Words)',
      fieldKey: 'statementOfPurpose',
      placeholder: 'Describe your vision for this editorial internship...',
      description: 'Tell us why this program matters to your editorial journey.',
      section: 'Journey Intent',
      column: 'right',
      order: 12,
      maxWords: 250,
    },
    {
      id: 'preferred-start-date',
      type: 'date',
      label: 'Preferred Start Date',
      fieldKey: 'preferredStartDate',
      section: 'Journey Intent',
      column: 'right',
      order: 13,
      required: false,
    },
  ],
}

export default function AdminApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: applicationId } = use(params)
  const { data: session } = useSession()
  const token = (session as any)?.backendToken || (session as any)?.user?.token || ''

  const [application, setApplication] = useState<any>(null)
  const [workflow, setWorkflow] = useState<any>(null)
  const [hotels, setHotels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeStepId, setActiveStepId] = useState<string>('application')
  const [overridingStep, setOverridingStep] = useState(false)
  const [submittingAction, setSubmittingAction] = useState(false)
  const [pageContent, setPageContent] = useState<any>(null)

  const resolveFieldValue = (field: any) => {
    if (!application) return 'N/A'

    if (field.type === 'user') {
      const source = field.valueSource || ''
      const user = application.user
      if (source === 'user.fullName') {
        if (user?.firstName || user?.lastName) {
          return `${user.firstName || ''} ${user.lastName || ''}`.trim()
        }
        return user?.name || 'N/A'
      }
      if (source === 'user.email') {
        return user?.email || 'N/A'
      }
      if (source === 'user.firstName') {
        return user?.firstName || 'N/A'
      }
      if (source === 'user.lastName') {
        return user?.lastName || 'N/A'
      }
      return field.defaultValue || 'N/A'
    }

    if (field.fieldKey === 'fullName') {
      const user = application.user
      if (user?.firstName || user?.lastName) {
        return `${user.firstName || ''} ${user.lastName || ''}`.trim()
      }
      return user?.name || 'N/A'
    }

    const persistedData = application.data || {}
    if (persistedData[field.fieldKey] !== undefined && persistedData[field.fieldKey] !== null && persistedData[field.fieldKey] !== '') {
      const val = persistedData[field.fieldKey]
      if (typeof val === 'boolean') {
        return val ? 'Yes' : 'No'
      }
      return val
    }

    // Fallbacks
    if (field.fieldKey === 'passportNumber' && application.passportNumber) {
      return application.passportNumber
    }
    if (field.fieldKey === 'educationalInstitution' && application.educationalInstitution) {
      return application.educationalInstitution
    }
    if (field.fieldKey === 'enrollmentStatus' && application.enrollmentStatus) {
      return application.enrollmentStatus
    }
    if (field.fieldKey === 'preferredDepartment' && (application.preferredDepartment || application.department)) {
      return application.preferredDepartment || application.department
    }
    if (field.fieldKey === 'statementOfPurpose' && application.statementOfPurpose) {
      return application.statementOfPurpose
    }

    return 'N/A'
  }

  // Document review remarks state
  const [docReviewRemarks, setDocReviewRemarks] = useState<Record<string, string>>({})

  // Hotel assignment form state
  const [selectedHotelId, setSelectedHotelId] = useState('')
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')

  // Work Permit upload file state
  const [wpUploading, setWpUploading] = useState(false)
  const [wpNotes, setWpNotes] = useState('')

  // Travel Ticket upload file state
  const [travelDocName, setTravelDocName] = useState('')
  const [travelDocUrl, setTravelDocUrl] = useState('')
  const [travelUploading, setTravelUploading] = useState(false)

  // Contract upload state
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploadDocType, setUploadDocType] = useState('UNSIGNED_CONTRACT')
  const [uploadDocLabel, setUploadDocLabel] = useState('Unsigned Contract')

  // Lightbox Modal state
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [lightboxTitle, setLightboxTitle] = useState('')

  const fetchDetails = async () => {
    try {
      setLoading(true)
      const [appData, wfData, hotelData, contentData] = await Promise.all([
        applicationService.getById(applicationId),
        workflowService.get(),
        hotelService.getAll(),
        applicationPageContentService.get('application').catch(() => null)
      ])

      setApplication(appData)
      setWorkflow(wfData)
      setHotels(hotelData || [])
      setPageContent(contentData)

      if (appData) {
        // Set active step to current candidate step
        setActiveStepId(appData.currentStepId || 'application')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load candidate details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetails()
  }, [applicationId])

  // Refresh details silently on actions
  const silentRefresh = async () => {
    try {
      const appData = await applicationService.getById(applicationId)
      setApplication(appData)
    } catch {
      console.error('Failed to fetch silent updates')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading detailed candidate journey...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!application) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center max-w-xl mx-auto space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Candidate Not Found</h2>
          <p className="text-slate-500 text-sm">The application ID provided does not match any candidate records.</p>
          <Link href="/admin/applications-portal">
            <Button className="mt-4 gap-2">
              <ArrowLeft className="w-4 h-4" /> Return to Portal
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const studentName = `${application.user?.firstName || ''} ${application.user?.lastName || ''}`.trim()
  const journeySteps = workflow?.steps || []

  const getStepName = (stepId: string) => {
    const step = journeySteps.find((s: any) => s.id === stepId)
    return step ? step.name : stepId
  }

  // Stepper state checks
  const getStepStatus = (stepId: string) => {
    const activeIdx = journeySteps.findIndex((s: any) => s.id === application.currentStepId)
    const thisIdx = journeySteps.findIndex((s: any) => s.id === stepId)

    if (activeIdx === -1 || thisIdx === -1) return 'locked'
    if (stepId === application.currentStepId) return 'active'
    if (thisIdx < activeIdx) return 'completed'
    return 'locked'
  }

  // Force move step status
  const handleForceMoveStep = async (stepId: string) => {
    try {
      setOverridingStep(true)
      await applicationService.updateStep(applicationId, stepId)
      toast.success(`Workflow stage manually overridden to: ${stepId}`)
      await fetchDetails()
    } catch (error: any) {
      toast.error(error.message || 'Failed to override workflow stage')
    } finally {
      setOverridingStep(false)
    }
  }

  // General App Status Update
  const handleStatusChange = async (newStatus: string) => {
    try {
      setSubmittingAction(true)
      await applicationService.updateStatus(applicationId, newStatus)
      toast.success(`Application status updated to ${newStatus}`)
      await fetchDetails()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status')
    } finally {
      setSubmittingAction(false)
    }
  }

  // Inline Document Approval
  const handleDocReview = async (docId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      setSubmittingAction(true)
      const remarks = docReviewRemarks[docId] || ''
      if (status === 'REJECTED' && !remarks.trim()) {
        toast.error('Remarks are required to reject documents.')
        return
      }
      await documentService.updateStatus(docId, status, remarks)
      toast.success(`Document ${status.toLowerCase()} successfully`)
      await silentRefresh()
    } catch (error: any) {
      toast.error('Failed to update document status')
    } finally {
      setSubmittingAction(false)
    }
  }

  // Inline Payment Approval
  const handlePaymentReview = async (paymentId: string, status: 'COMPLETED' | 'FAILED') => {
    try {
      setSubmittingAction(true)
      await paymentService.updateStatus(paymentId, status)
      toast.success(`Payment verified as ${status.toLowerCase()}`)
      await fetchDetails() // Fetch details because step might auto-advance!
    } catch (error: any) {
      toast.error('Failed to update payment status')
    } finally {
      setSubmittingAction(false)
    }
  }

  // Inline Hotel Assignment
  const handleHotelAssign = async () => {
    if (!selectedHotelId || !checkInDate || !checkOutDate) {
      toast.error('Please select a hotel and specify check-in/check-out dates')
      return
    }

    const checkInDateObj = new Date(checkInDate)
    const checkOutDateObj = new Date(checkOutDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkInDateObj < today) {
      toast.error('Check-in date cannot be in the past')
      return
    }

    if (checkOutDateObj < checkInDateObj) {
      toast.error('Check-out date cannot be earlier than check-in date')
      return
    }

    try {
      setSubmittingAction(true)
      await hotelService.assign({
        hotelId: selectedHotelId,
        applicationId,
        checkIn: checkInDate,
        checkOut: checkOutDate
      })
      toast.success('Hotel assigned successfully! Student advanced to next step.')
      await fetchDetails()
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign hotel')
    } finally {
      setSubmittingAction(false)
    }
    const handleDeleteDoc = async (docId: string) => {
      if (!confirm('Are you sure you want to delete this document?')) return
      try {
        setSubmittingAction(true)
        await documentService.delete(docId)
        toast.success('Document deleted successfully')
        await fetchDetails()
      } catch {
        toast.error('Failed to delete document')
      } finally {
        setSubmittingAction(false)
      }
    }

    // Inline Work Permit File Upload
    const handleWpUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      try {
        setWpUploading(true)
        const result = await uploadService.upload(file)
        if (result?.url) {
          await workPermitService.uploadWorkPermit({
            applicationId,
            documentUrl: result.url,
            notes: wpNotes || undefined
          })
          toast.success('Work permit uploaded and issued successfully!')
          await fetchDetails()
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to upload work permit')
      } finally {
        setWpUploading(false)
      }
    }

    // Inline Travel ticket uploads
    const handleTravelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      try {
        setTravelUploading(true)
        const result = await uploadService.upload(file)
        if (result?.url) {
          setTravelDocUrl(result.url)
          if (!travelDocName) {
            setTravelDocName(file.name.replace(/\.[^/.]+$/, ''))
          }
          toast.success('Ticket/itinerary uploaded. Click "Add Document" to submit.')
        }
      } catch (error: any) {
        toast.error('Upload failed')
      } finally {
        setTravelUploading(false)
      }
    }

    const handleTravelAddDoc = async () => {
      if (!travelDocUrl || !travelDocName) {
        toast.error('Please specify a document name and upload a file first.')
        return
      }
      try {
        setSubmittingAction(true)
        await travelService.uploadDocument({
          applicationId,
          name: travelDocName,
          url: travelDocUrl
        })
        toast.success('Travel document added successfully!')
        setTravelDocName('')
        setTravelDocUrl('')
        await fetchDetails()
      } catch (error: any) {
        toast.error(error.message || 'Failed to add travel document')
      } finally {
        setSubmittingAction(false)
      }
    }

    const handleTravelDeleteDoc = async (docId: string) => {
      if (!confirm('Are you sure you want to delete this travel document?')) {
        return
      }
      try {
        setSubmittingAction(true)
        await travelService.deleteDocument(docId)
        toast.success('Travel document deleted successfully')
        await fetchDetails()
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete travel document')
      } finally {
        setSubmittingAction(false)
      }
    }

    const handleTravelPublishDocs = async () => {
      try {
        setSubmittingAction(true)
        await travelService.publishDocuments(applicationId)
        toast.success('All travel documents successfully published to student dashboard!')
        await fetchDetails()
      } catch (error: any) {
        toast.error(error.message || 'Failed to publish travel documents')
      } finally {
        setSubmittingAction(false)
      }
    }

    // Contract uploads
    const handleOpenUpload = (type: string, label: string) => {
      setUploadDocType(type)
      setUploadDocLabel(label)
      setIsUploadOpen(true)
    }

    const openLightbox = (url: string, title: string) => {
      setLightboxUrl(url)
      setLightboxTitle(title)
    }

    const getSubmissionsByStep = (stepId: string) => {
      const paymentsList = application.payments || []
      const documentsList = application.documents || []

      switch (stepId) {
        case 'application':
          return (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-slate-50 p-4 border rounded-2xl">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Progress Status</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">Status: <Badge className="capitalize ml-1">{application.status.toLowerCase()}</Badge></p>
                </div>
                <div className="flex gap-2">
                  {application.status !== 'ACCEPTED' && (
                    <Button
                      onClick={() => handleStatusChange('ACCEPTED')}
                      disabled={submittingAction}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold h-9"
                    >
                      Accept Application & Move
                    </Button>
                  )}
                  {application.status !== 'REJECTED' && (
                    <Button
                      onClick={() => handleStatusChange('REJECTED')}
                      disabled={submittingAction}
                      variant="outline"
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl font-bold h-9"
                    >
                      Reject Application
                    </Button>
                  )}
                </div>
              </div>

              <Card className="p-6 border border-slate-200 rounded-3xl space-y-4">
                <h4 className="font-bold text-slate-900 border-b pb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Application Form Details</h4>
                {(() => {
                  // Use actual page content from DB, or fall back to default schema
                  const activeBlocks = (pageContent?.blocks || fallbackPageContent.blocks)
                    .filter((b: any) => b.type !== 'section' && b.fieldKey)
                    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))

                  if (activeBlocks.length === 0) {
                    return <p className="text-sm text-slate-400 italic">No form fields configured.</p>
                  }

                  return (
                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                      {activeBlocks.map((field: any) => {
                        const value = resolveFieldValue(field)
                        // Skip fields with no value to avoid showing N/A for fields that don't exist in this form
                        if (value === 'N/A' || value === null || value === undefined || value === '') return null
                        const isLong = field.type === 'textarea' || (typeof value === 'string' && value.length > 80)
                        return (
                          <div key={field.id} className={`space-y-1 ${isLong ? 'md:col-span-2' : ''}`}>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">{field.label}</span>
                            {isLong ? (
                              <p className="text-slate-600 text-xs mt-0.5 leading-relaxed bg-slate-50 p-3 border rounded-xl">{String(value)}</p>
                            ) : (
                              <span className="font-semibold text-slate-800">{String(value)}</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </Card>
            </div>
          )

        case 'documents':
          // Filter out unsigned contracts
          const normalDocs = documentsList.filter((d: any) =>
            !['UNSIGNED_CONTRACT', 'SIGNED_CONTRACT', 'CONTRACT_EXTRA_1', 'CONTRACT_EXTRA_2', 'CONTRACT_EXTRA_3'].includes(d.type)
          )
          return (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 border-b pb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Submitted Onboarding Documents</h4>
              {normalDocs.length === 0 ? (
                <p className="text-sm text-slate-500 italic py-6 text-center">No onboarding documents uploaded yet.</p>
              ) : (
                <div className="space-y-3">
                  {normalDocs.map((doc: any) => (
                    <Card key={doc.id} className="p-4 border border-slate-200 bg-white rounded-2xl space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 text-xs shrink-0 uppercase">
                            {doc.type.split('_')[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-sm truncate">{doc.name}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{doc.type.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <a href={doc.url} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="View PDF">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </a>
                          <Badge
                            className={`rounded-full px-2 py-0.5 font-bold uppercase text-[9px] ${doc.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                doc.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                              }`}
                          >
                            {doc.status}
                          </Badge>
                        </div>
                      </div>

                      {doc.status === 'PENDING' && (
                        <div className="flex flex-col md:flex-row gap-3 pt-3 border-t">
                          <Input
                            placeholder="Rejection remarks (required only if rejecting)..."
                            value={docReviewRemarks[doc.id] || ''}
                            onChange={(e) => setDocReviewRemarks(p => ({ ...p, [doc.id]: e.target.value }))}
                            className="h-9 rounded-xl border-slate-200 text-xs"
                          />
                          <div className="flex gap-2 shrink-0">
                            <Button
                              onClick={() => handleDocReview(doc.id, 'REJECTED')}
                              disabled={submittingAction}
                              size="sm"
                              variant="outline"
                              className="text-rose-600 border-rose-200 hover:bg-rose-50 h-9 px-3 rounded-xl font-bold"
                            >
                              Reject
                            </Button>
                            <Button
                              onClick={() => handleDocReview(doc.id, 'APPROVED')}
                              disabled={submittingAction}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-4 rounded-xl font-bold"
                            >
                              Approve
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )

        case 'interview':
          const currentSlot = application.interviews?.[0]
          const handleInterviewDecision = async (decision: 'COMPLETED' | 'REJECTED') => {
            if (!currentSlot) return
            try {
              setSubmittingAction(true)
              await interviewService.updateStatus(currentSlot.id, decision)
              if (decision === 'COMPLETED') {
                toast.success('Interview approved! Candidate advanced to the next step.')
              } else {
                toast.success('Interview marked as rejected.')
              }
              await fetchDetails()
            } catch (error: any) {
              toast.error(error.message || 'Failed to update interview status')
            } finally {
              setSubmittingAction(false)
            }
          }
          return (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 border-b pb-2 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Interview Schedule</h4>
              {currentSlot ? (
                <Card className="p-5 border border-slate-200 bg-white rounded-3xl space-y-4">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-violet-600" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Scheduled Date</p>
                        <p className="font-bold text-slate-800">{new Date(currentSlot.scheduledAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-violet-600" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Scheduled Time</p>
                        <p className="font-bold text-slate-800">{new Date(currentSlot.scheduledAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Google Meet / Video Link</p>
                    {currentSlot.locationUrl ? (
                      <a href={currentSlot.locationUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                        {currentSlot.locationUrl} <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No link assigned yet.</p>
                    )}
                  </div>

                  <div className="bg-slate-50 p-4 border rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-700">Interview Status: <Badge className="ml-1 capitalize">{currentSlot.status.toLowerCase()}</Badge></p>
                    </div>

                    {currentSlot.status === 'PENDING' && (
                      <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t">
                        <p className="text-[10px] text-slate-400 font-medium self-center flex-1">Approve to advance the candidate to the next step, or reject to keep them in this stage.</p>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            onClick={() => handleInterviewDecision('REJECTED')}
                            disabled={submittingAction}
                            variant="outline"
                            size="sm"
                            className="text-rose-600 border-rose-200 hover:bg-rose-50 h-9 px-4 rounded-xl font-bold"
                          >
                            <X className="w-3.5 h-3.5 mr-1.5" /> Reject
                          </Button>
                          <Button
                            onClick={() => handleInterviewDecision('COMPLETED')}
                            disabled={submittingAction}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-4 rounded-xl font-bold"
                          >
                            <Check className="w-3.5 h-3.5 mr-1.5" /> Approve & Advance
                          </Button>
                        </div>
                      </div>
                    )}

                    {currentSlot.status === 'COMPLETED' && (
                      <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold pt-1 border-t">
                        <CheckCircle2 className="w-4 h-4" /> Interview approved. Candidate has been advanced.
                      </div>
                    )}

                    {currentSlot.status === 'REJECTED' && (
                      <div className="flex items-center gap-2 text-rose-600 text-xs font-bold pt-1 border-t">
                        <X className="w-4 h-4" /> Interview was rejected.
                      </div>
                    )}
                  </div>
                </Card>
              ) : (
                <p className="text-sm text-slate-500 italic py-6 text-center">No interview slot has been booked by the candidate.</p>
              )}
            </div>
          )

        case 'payment1':
        case 'payment2':
        case 'payment3':
          const paymentNum = stepId === 'payment1' ? '1st' : stepId === 'payment2' ? '2nd' : '3rd'
          const descMatch = stepId === 'payment1' ? 'payment1' : stepId === 'payment2' ? 'payment2' : 'payment3'

          // Find latest payment matching installment description
          const filteredPayments = paymentsList.filter((p: any) =>
            (p.description || '').toLowerCase().includes(descMatch) ||
            (p.description || '').toLowerCase().includes(`${paymentNum} installment`) ||
            (p.description || '').toLowerCase().includes(stepId)
          )
          const activePayment = [...filteredPayments].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
          const paymentDocs = documentsList.filter((d: any) => d.type === `${stepId.toUpperCase()}_DOCUMENT`)

          return (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 border-b pb-2 flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> Installment {paymentNum.replace('st', '').replace('nd', '').replace('rd', '')} Details</h4>
              {activePayment ? (
                <Card className="p-5 border border-slate-200 bg-white rounded-3xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">UTR Reference</span>
                      <code className="bg-slate-100 text-slate-800 text-xs px-2 py-0.5 rounded font-mono font-bold mt-1 inline-block">{activePayment.utrNumber}</code>
                    </div>
                    <Badge
                      className={`rounded-full px-3 py-1 font-black text-[10px] tracking-wider ${activePayment.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                          activePayment.status === 'FAILED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}
                    >
                      {activePayment.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block uppercase">Installment Amount</span>
                      <span className="text-base font-black text-slate-800">₹{activePayment.amount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase">Submitted Date</span>
                      <span className="font-bold text-slate-600">{new Date(activePayment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {activePayment.screenshotUrl && (
                    <div className="border rounded-2xl p-3 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-700">Receipt Screenshot</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openLightbox(activePayment.screenshotUrl, `Installment ${paymentNum} Receipt`)}
                        className="gap-1.5 text-xs font-bold rounded-xl"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Receipt
                      </Button>
                    </div>
                  )}

                  {activePayment.status === 'PENDING' && (
                    <div className="flex gap-3 pt-3 border-t">
                      <Button
                        onClick={() => handlePaymentReview(activePayment.id, 'FAILED')}
                        disabled={submittingAction}
                        variant="outline"
                        className="flex-1 text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl font-bold h-10"
                      >
                        Reject Transaction
                      </Button>
                      <Button
                        onClick={() => handlePaymentReview(activePayment.id, 'COMPLETED')}
                        disabled={submittingAction}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold h-10"
                      >
                        Approve & Verify
                      </Button>
                    </div>
                  )}
                </Card>
              ) : (
                <p className="text-sm text-slate-500 italic py-6 text-center">No payment submission found for this installment.</p>
              )}

              {/* Supplementary / Invoice Documents */}
              <Card className="p-5 border border-slate-200 bg-white rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-primary" />
                    Supplementary Documents
                  </h5>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenUpload(`${stepId.toUpperCase()}_DOCUMENT`, `Payment ${paymentNum.replace('st', '').replace('nd', '').replace('rd', '')} Document`)}
                    className="gap-1 text-xs font-bold rounded-xl"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Document
                  </Button>
                </div>

                {paymentDocs.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2 text-center">No supplementary documents uploaded for this candidate.</p>
                ) : (
                  <div className="grid gap-2">
                    {paymentDocs.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl hover:border-slate-300 transition-all">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <FileText className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-xs font-semibold text-slate-700 truncate">{doc.name}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-slate-500 hover:text-slate-700 rounded-lg"
                            onClick={() => window.open(doc.url, '_blank')}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-slate-400 hover:text-rose-600 rounded-lg"
                            disabled={submittingAction}
                            onClick={() => handleDeleteDoc(doc.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )

        case 'hotel':
          const assignment = application.hotelAssignment
          return (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 border-b pb-2 flex items-center gap-2"><Building className="w-4 h-4 text-primary" /> Accommodation Allocation</h4>
              {assignment ? (
                <Card className="p-5 border border-slate-200 bg-white rounded-3xl space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                      <Building className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-800 text-base">{assignment.hotel?.name || 'Assigned Hotel'}</h5>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> {assignment.hotel?.location || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t">
                    <div>
                      <span className="text-slate-400 font-bold block uppercase">Check-In Date</span>
                      <span className="font-bold text-slate-700">{new Date(assignment.checkIn).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase">Check-Out Date</span>
                      <span className="font-bold text-slate-700">{new Date(assignment.checkOut).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {assignment.hotel?.proposalPdf && (
                    <div className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-600">Hotel Document / Proposal</span>
                      <a href={assignment.hotel.proposalPdf} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="rounded-lg h-8 px-3">Open proposal</Button>
                      </a>
                    </div>
                  )}
                </Card>
              ) : (
                <Card className="p-5 border border-slate-200 bg-white rounded-3xl space-y-4">
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-xs text-amber-800 font-medium">
                    Candidate has not been assigned a hotel yet. Use the selector below to make an allocation.
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">Select Hotel</label>
                      <select
                        value={selectedHotelId}
                        onChange={(e) => setSelectedHotelId(e.target.value)}
                        className="w-full h-11 border rounded-xl bg-white text-sm px-3 outline-none"
                      >
                        <option value="">-- Choose Hotel --</option>
                        {hotels.map(h => (
                          <option key={h.id} value={h.id}>{h.name} ({h.location})</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600">Check-in Date</label>
                        <Input
                          type="date"
                          value={checkInDate}
                          onChange={(e) => setCheckInDate(e.target.value)}
                          className="rounded-xl h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600">Check-out Date</label>
                        <Input
                          type="date"
                          value={checkOutDate}
                          onChange={(e) => setCheckOutDate(e.target.value)}
                          className="rounded-xl h-11"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleHotelAssign}
                      disabled={submittingAction || !selectedHotelId || !checkInDate || !checkOutDate}
                      className="w-full h-11 bg-primary text-white rounded-xl font-bold tracking-wide mt-2"
                    >
                      Confirm Allocation
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )

        case 'contract':
          const unsignedContract = documentsList.find((d: any) => d.type === 'UNSIGNED_CONTRACT')
          const signedContract = documentsList.find((d: any) => d.type === 'SIGNED_CONTRACT')
          const extraDoc1 = documentsList.find((d: any) => d.type === 'CONTRACT_EXTRA_1')
          const extraDoc2 = documentsList.find((d: any) => d.type === 'CONTRACT_EXTRA_2')
          const extraDoc3 = documentsList.find((d: any) => d.type === 'CONTRACT_EXTRA_3')

          return (
            <div className="space-y-6">
              <h4 className="font-bold text-slate-900 border-b pb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Contract Management</h4>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Unsigned Contract */}
                <Card className="p-4 border border-slate-200 bg-white rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500 uppercase">Unsigned Template</span>
                    {unsignedContract ? (
                      <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">Template Ready</span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Waiting upload</span>
                    )}
                  </div>

                  {unsignedContract ? (
                    <div className="flex items-center justify-between gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border">
                      <span className="font-semibold text-slate-700 truncate">{unsignedContract.fileName || 'Contract.docx'}</span>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleOpenUpload('UNSIGNED_CONTRACT', 'Unsigned Contract')}>
                          <Upload className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-500 hover:text-rose-600" onClick={() => handleDocReview(unsignedContract.id, 'REJECTED')}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => handleOpenUpload('UNSIGNED_CONTRACT', 'Unsigned Contract')}
                      className="w-full text-xs font-bold border-dashed border-2 h-10 rounded-xl"
                    >
                      <Upload className="w-4 h-4 mr-1.5" /> Upload Contract Template
                    </Button>
                  )}
                </Card>

                {/* Signed Contract Review */}
                <Card className="p-4 border border-slate-200 bg-white rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500 uppercase">Student Submission</span>
                    {signedContract ? (
                      <Badge className="rounded-full px-2 py-0.5 font-bold uppercase text-[9px]">{signedContract.status}</Badge>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Awaiting student</span>
                    )}
                  </div>

                  {signedContract ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border">
                        <span className="font-semibold text-slate-700 truncate">{signedContract.fileName || 'Signed_Contract.pdf'}</span>
                        <Button size="sm" variant="outline" className="h-8 rounded-lg" onClick={() => openLightbox(signedContract.url, 'Signed Contract Review')}>View</Button>
                      </div>

                      {signedContract.status === 'PENDING' && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => handleDocReview(signedContract.id, 'REJECTED')}
                            disabled={submittingAction}
                            variant="outline"
                            size="sm"
                            className="flex-1 text-rose-600 border-rose-200 h-9 rounded-lg"
                          >
                            Reject
                          </Button>
                          <Button
                            onClick={() => handleDocReview(signedContract.id, 'APPROVED')}
                            disabled={submittingAction}
                            size="sm"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-9 rounded-lg"
                          >
                            Approve
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic text-center py-3">Awaiting student signature</p>
                  )}
                </Card>
              </div>

              {/* Extra Documents upload slots */}
              <Card className="p-5 border border-slate-200 bg-white rounded-3xl space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Extra Contract Attachments</span>
                <div className="grid md:grid-cols-3 gap-3">
                  {[
                    { key: 'CONTRACT_EXTRA_1', doc: extraDoc1, label: 'Document 1' },
                    { key: 'CONTRACT_EXTRA_2', doc: extraDoc2, label: 'Document 2' },
                    { key: 'CONTRACT_EXTRA_3', doc: extraDoc3, label: 'Document 3' },
                  ].map((item, idx) => (
                    <div key={item.key} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between h-24">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-500">{item.label}</p>
                        {item.doc ? (
                          <a href={item.doc.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary hover:underline truncate block mt-1">
                            {item.doc.fileName || `Contract File ${idx + 1}`}
                          </a>
                        ) : (
                          <p className="text-xs text-slate-400 italic mt-1">Not uploaded</p>
                        )}
                      </div>
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-slate-200" onClick={() => handleOpenUpload(item.key, `Additional Document ${idx + 1}`)}>
                          <Upload className="w-3.5 h-3.5 text-slate-600" />
                        </Button>
                        {item.doc && (
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-500 hover:bg-rose-50" onClick={() => handleDocReview(item.doc.id, 'REJECTED')}>
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )

        case 'workpermit':
          const wpRecord = application.workPermit
          return (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 border-b pb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Work Permit Document</h4>

              {wpRecord ? (
                <Card className="p-5 border border-slate-200 bg-white rounded-3xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Work Permit Status</span>
                      <span className="text-sm font-bold text-slate-800 mt-1 block">Status: <Badge className="bg-emerald-50 text-emerald-700 ml-1">{wpRecord.status || 'ISSUED'}</Badge></span>
                    </div>
                    <span className="text-xs text-slate-400">{new Date(wpRecord.updatedAt).toLocaleDateString()}</span>
                  </div>

                  <div className="p-3 bg-slate-50 border rounded-2xl flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5"><FileText className="w-4 h-4 text-slate-400" /> Issued Work Permit PDF</span>
                    <a href={wpRecord.documentUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="h-8 rounded-xl font-bold gap-1.5"><Eye className="w-3.5 h-3.5" /> View / Download</Button>
                    </a>
                  </div>

                  <div className="pt-2">
                    <label className="text-xs font-bold text-slate-600">Update / Re-upload Work Permit PDF</label>
                    <div className="mt-2 flex gap-3">
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={handleWpUpload}
                        disabled={wpUploading}
                        className="rounded-xl flex-1 text-sm h-11"
                      />
                      {wpUploading && <Loader2 className="w-5 h-5 animate-spin self-center text-primary" />}
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-5 border border-slate-200 bg-white rounded-3xl space-y-4">
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-xs text-amber-800 font-medium">
                    Awaiting work permit. Please upload the official work permit file to issue it to the candidate.
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">Work Permit Notes / Remarks</label>
                      <Input
                        placeholder="e.g. Approved work permit for USA internship"
                        value={wpNotes}
                        onChange={(e) => setWpNotes(e.target.value)}
                        className="rounded-xl h-11 border-slate-200 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">Upload Work Permit (PDF)</label>
                      <div className="flex gap-3">
                        <Input
                          type="file"
                          accept=".pdf"
                          onChange={handleWpUpload}
                          disabled={wpUploading}
                          className="rounded-xl h-11 text-sm"
                        />
                        {wpUploading && <Loader2 className="w-5 h-5 animate-spin self-center text-primary" />}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )

        case 'visapayments':
          // Search for payments matching names inside step config
          const visapaymentsStep = workflow?.steps?.find((s: any) => s.id === 'visapayments')
          const amounts = visapaymentsStep?.amounts || {}
          const vName = (amounts.visaFeeName || 'visa fee').toLowerCase()
          const sName = (amounts.sevisFeeName || 'sevis fee').toLowerCase()
          const mName = (amounts.miscFeeName || 'misc fee').toLowerCase()

          const getVisaPaymentDetail = (keyMatch: string) => {
            const matched = paymentsList.filter((p: any) => (p.description || '').toLowerCase().includes(keyMatch))
            return [...matched].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
          }

          const visaFeePay = getVisaPaymentDetail(vName)
          const sevisFeePay = getVisaPaymentDetail(sName)
          const miscFeePay = getVisaPaymentDetail(mName) || getVisaPaymentDetail('miscellaneous fee')

          const renderVisaPaymentRow = (title: string, paymentObj: any) => (
            <Card className="p-4 border border-slate-200 bg-white rounded-2xl flex flex-col justify-between h-full space-y-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{title}</p>
                  {paymentObj ? (
                    <code className="bg-slate-100 text-slate-800 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold mt-1 inline-block">UTR: {paymentObj.utrNumber}</code>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic block mt-1">Unpaid</span>
                  )}
                </div>
                {paymentObj ? (
                  <Badge className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${paymentObj.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      paymentObj.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>{paymentObj.status}</Badge>
                ) : (
                  <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">N/A</span>
                )}
              </div>

              {paymentObj?.screenshotUrl && (
                <div className="flex items-center justify-between text-xs p-2 bg-slate-50 border rounded-xl">
                  <span className="font-medium text-slate-500">Screenshot</span>
                  <Button size="sm" variant="ghost" className="h-7 w-7" onClick={() => openLightbox(paymentObj.screenshotUrl, `${title} Receipt`)}>
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                  </Button>
                </div>
              )}

              {paymentObj?.status === 'PENDING' && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    onClick={() => handlePaymentReview(paymentObj.id, 'FAILED')}
                    disabled={submittingAction}
                    size="sm"
                    variant="outline"
                    className="flex-1 text-rose-600 border-rose-200 h-8 rounded-lg"
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => handlePaymentReview(paymentObj.id, 'COMPLETED')}
                    disabled={submittingAction}
                    size="sm"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-8 rounded-lg"
                  >
                    Approve
                  </Button>
                </div>
              )}
            </Card>
          )

          return (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 border-b pb-2 flex items-center gap-2"><CreditCard className="w-4 h-4 text-primary" /> Visa Administration Payments</h4>
              <div className="grid md:grid-cols-3 gap-4">
                {renderVisaPaymentRow(amounts.visaFeeName || 'Visa Processing Fee', visaFeePay)}
                {renderVisaPaymentRow(amounts.sevisFeeName || 'SEVIS & Insurance Fee', sevisFeePay)}
                {renderVisaPaymentRow(amounts.miscFeeName || 'Miscellaneous Fee', miscFeePay)}
              </div>
            </div>
          )

        case 'visa':
          // Search slot bookings
          return (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 border-b pb-2 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Visa Slot Booking</h4>
              <p className="text-xs text-slate-500">Manage candidate appointments. Advancing to travel step indicates successful visa appointments.</p>
              <div className="bg-slate-50 border p-4 rounded-xl text-xs space-y-1">
                <p className="font-bold text-slate-700">Workflow current: <Badge className="capitalize">Visa Stage</Badge></p>
                <p className="text-slate-400 font-semibold mt-1">To approve this slot and advance, use the force step controls or use the main Visa slot calendar to manage scheduled slots.</p>
              </div>
            </div>
          )

        case 'travel':
          const travelDocs = application.travelDocuments || []
          const hasTravelDocs = travelDocs.length > 0
          const allTravelDocsPublished = hasTravelDocs && travelDocs.every((d: any) => d.isPublished)

          return (
            <div className="space-y-6">
              <h4 className="font-bold text-slate-900 border-b pb-2 flex items-center gap-2"><Plane className="w-4 h-4 text-primary" /> Travel Documents & Itinerary</h4>

              {/* List existing documents */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Uploaded Travel Documents</span>
                {travelDocs.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center bg-slate-50 border rounded-2xl">No travel documents uploaded yet.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {travelDocs.map((doc: any) => (
                      <Card key={doc.id} className="p-3.5 border border-slate-200 bg-white rounded-2xl flex flex-col justify-between space-y-3 shadow-sm">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 text-xs truncate" title={doc.name}>{doc.name}</p>
                            <span className={`text-[9px] font-bold px-1.5 py-0.25 rounded-full mt-1.5 inline-block ${doc.isPublished ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                              {doc.isPublished ? 'Published' : 'Draft / Unpublished'}
                            </span>
                          </div>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                            <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-slate-100">
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                            </Button>
                          </a>
                        </div>
                        <div className="flex justify-end pt-2 border-t border-slate-100">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleTravelDeleteDoc(doc.id)}
                            disabled={submittingAction}
                            className="h-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload form */}
              <Card className="p-5 border border-slate-200 bg-white rounded-3xl space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Upload New Travel Document</span>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">Document Name</label>
                    <Input
                      placeholder="e.g. Flight Ticket, Visa Copy, Itinerary"
                      value={travelDocName}
                      onChange={(e) => setTravelDocName(e.target.value)}
                      className="rounded-xl h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600">Select File (PDF / Image)</label>
                    <div className="flex gap-3">
                      <Input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={handleTravelUpload}
                        disabled={travelUploading}
                        className="rounded-xl h-10 text-xs"
                      />
                      {travelUploading && <Loader2 className="w-5 h-5 animate-spin self-center text-primary" />}
                    </div>
                    {travelDocUrl && (
                      <p className="text-[10px] text-green-700 bg-green-50 px-2.5 py-1 rounded-full inline-block font-bold">
                        ✓ File Uploaded successfully
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={handleTravelAddDoc}
                    disabled={submittingAction || !travelDocUrl || !travelDocName}
                    className="w-full h-10 bg-primary text-white rounded-xl font-bold text-xs mt-2"
                  >
                    Add Document
                  </Button>
                </div>
              </Card>

              {/* Publish Banner / Button */}
              {hasTravelDocs && !allTravelDocsPublished && (
                <Card className="p-4 border border-amber-200 bg-amber-50/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-amber-800 font-medium">
                    <p className="font-bold">Unpublished Changes</p>
                    <p className="mt-0.5">You have travel documents in Draft. Publish them so they are visible to the student.</p>
                  </div>
                  <Button
                    onClick={handleTravelPublishDocs}
                    disabled={submittingAction}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shrink-0 h-9 px-4"
                  >
                    Publish Documents
                  </Button>
                </Card>
              )}
            </div>
          )

        default:
          return <p className="text-sm text-slate-500 italic py-6 text-center">Unrecognized stage. Use override control panel.</p>
      }
    }

    return (
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          {/* Top bar breadcrumb */}
          <div className="flex items-center gap-3">
            <Link href="/admin/applications-portal">
              <Button variant="ghost" size="icon" className="h-9 w-9 border rounded-xl bg-white hover:bg-slate-50">
                <ArrowLeft className="w-4 h-4 text-slate-600" />
              </Button>
            </Link>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              PORTAL › <span className="text-primary font-extrabold">{studentName}</span>
            </div>
          </div>

          {/* Master layout grid */}
          <div className="grid lg:grid-cols-12 gap-6 items-start">

            {/* LEFT COLUMN: Candidate Profile and Stepper Checklist */}
            <div className="lg:col-span-4 space-y-6">

              {/* Profile Card */}
              <Card className="p-6 border border-slate-200 bg-white rounded-3xl shadow-sm space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-700 text-2xl mx-auto">
                  {application.user?.firstName?.[0]}{application.user?.lastName?.[0]}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">{studentName}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{application.user?.email}</p>
                </div>
                <hr className="border-slate-100" />
                <div className="text-left text-xs space-y-3 font-medium text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400 uppercase font-bold text-[9px]">WhatsApp / Phone</span>
                    <span className="font-bold">{application.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 uppercase font-bold text-[9px]">College / CGPA</span>
                    <span className="font-bold truncate max-w-[120px]">{application.data?.educationalInstitution || application.educationalInstitution || application.collegeName || 'N/A'} ({application.data?.cgpa || application.cgpa || '0'})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 uppercase font-bold text-[9px]">Enrolled Stage</span>
                    <span className="text-xs font-black text-[#7C3AED] bg-violet-50 px-2 py-0.5 rounded-full uppercase">{getStepName(application.currentStepId)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 uppercase font-bold text-[9px]">Overall Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${application.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                        application.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>{application.status}</span>
                  </div>
                </div>
              </Card>

              {/* vertical stepper list */}
              <Card className="p-5 border border-slate-200 bg-white rounded-3xl shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4 ml-1">Workflow Tracker Checklist</span>
                <nav className="space-y-1.5">
                  {journeySteps.map((step: any, index: number) => {
                    const status = getStepStatus(step.id)
                    const isActive = step.id === activeStepId

                    return (
                      <button
                        key={step.id}
                        onClick={() => setActiveStepId(step.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-[11px] font-semibold uppercase tracking-wider transition-all duration-150 ${isActive
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'hover:bg-slate-50 text-slate-600'
                          }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${isActive ? 'bg-[#CCFF00] text-black' : 'bg-slate-100 text-slate-600'
                            }`}>{index + 1}</span>
                          <span className="truncate">{step.name}</span>
                        </div>

                        {status === 'completed' && <Check className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#CCFF00]' : 'text-emerald-600'}`} />}
                        {status === 'active' && <div className={`w-2 h-2 rounded-full shrink-0 animate-ping ${isActive ? 'bg-[#CCFF00]' : 'bg-emerald-500'}`} />}
                        {status === 'locked' && <Clock className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                      </button>
                    )
                  })}
                </nav>
              </Card>
            </div>

            {/* RIGHT COLUMN: Active Step Workspace Card */}
            <div className="lg:col-span-8 space-y-6">

              <Card className="p-6 border border-slate-200 bg-white rounded-3xl shadow-sm space-y-6">
                {/* Step info header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 gap-3">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Workspace Step</span>
                    <h2 className="text-xl font-bold text-slate-900 mt-1">{getStepName(activeStepId)}</h2>
                  </div>

                  {/* Active step state badge */}
                  <div className="flex items-center gap-2">
                    {getStepStatus(activeStepId) === 'completed' && (
                      <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold px-3 py-1.5 rounded-full">Completed</Badge>
                    )}
                    {getStepStatus(activeStepId) === 'active' && (
                      <Badge className="bg-green-100 text-green-800 border border-green-200 font-extrabold px-3 py-1.5 rounded-full animate-pulse">Student Current Stage</Badge>
                    )}
                    {getStepStatus(activeStepId) === 'locked' && (
                      <Badge className="bg-slate-100 text-slate-500 border border-slate-200 font-extrabold px-3 py-1.5 rounded-full">Locked / Future Step</Badge>
                    )}
                  </div>
                </div>

                {/* Render dynamic workspace content */}
                <div className="min-h-[250px]">
                  {getSubmissionsByStep(activeStepId)}
                </div>
              </Card>

              {/* Manual Override Control Panel */}
              <Card className="p-6 border border-slate-200 bg-slate-900 text-white rounded-3xl space-y-4 shadow-md">
                <div>
                  <h4 className="font-extrabold text-base text-white flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[#CCFF00]" /> Manual Workflow Override</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Administrators can bypass current validations and force-override the candidate to any specific step immediately. Use this to skip steps or resolve enrollment conflicts.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-end gap-3 border-t border-slate-800 pt-4">
                  <div className="flex-1 w-full space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Step Stage</label>
                    <select
                      value={application.currentStepId}
                      onChange={(e) => handleForceMoveStep(e.target.value)}
                      disabled={overridingStep}
                      className="w-full h-11 px-3 border border-slate-800 bg-slate-950 text-white rounded-xl text-xs font-semibold outline-none"
                    >
                      {journeySteps.map((step: any) => (
                        <option key={step.id} value={step.id}>{step.name}</option>
                      ))}
                    </select>
                  </div>
                  {overridingStep && <Loader2 className="w-5 h-5 animate-spin text-[#CCFF00] shrink-0 mb-3" />}
                </div>
              </Card>

              {/* Candidate Audit Activity Logs */}
              <Card className="p-6 border border-slate-200 bg-white rounded-3xl shadow-sm space-y-4">
                <h4 className="font-bold text-slate-800 border-b pb-2">Candidate Activity log</h4>
                {(!application.activities || application.activities.length === 0) ? (
                  <p className="text-xs text-slate-400 italic py-3">No activity logs recorded for this application.</p>
                ) : (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {application.activities.map((act: any) => (
                      <div key={act.id} className="flex justify-between items-start gap-4 text-xs">
                        <div>
                          <p className="font-bold text-slate-700">{act.description}</p>
                          <span className="text-[9px] bg-slate-100 text-slate-400 font-bold px-1.5 py-0.25 rounded-md mt-0.5 inline-block uppercase tracking-wider">{act.type.replace(/_/g, ' ')}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 mt-0.5">{new Date(act.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

            </div>

          </div>

        </div>

        {/* Lightbox Receipt Modal */}
        {lightboxUrl && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative max-w-xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <span className="text-sm font-bold text-gray-900">{lightboxTitle}</span>
                <button onClick={() => setLightboxUrl(null)} className="p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="p-4">
                <img src={lightboxUrl} alt="Document preview" className="w-full max-h-[70vh] object-contain rounded-2xl mx-auto" />
              </div>
            </div>
          </div>
        )}

        {/* Custom Template Upload Popup */}
        <UploadPopup
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onUploadComplete={fetchDetails}
          token={token}
          applicationId={application.id}
          documentType={uploadDocType}
          documentName={`${studentName} - ${uploadDocLabel}`}
        />

      </DashboardLayout>
    )
  }
}