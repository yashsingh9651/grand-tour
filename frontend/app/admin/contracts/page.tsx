'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/layout-wrapper'
import { Header } from '@/components/dashboard/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import {
  Loader2, Search, ClipboardList, CheckCircle2, AlertCircle, FileText,
  Upload, Eye, Trash2, ArrowRight, UserCheck, Check, X
} from 'lucide-react'
import { applicationService, documentService, workflowService } from '@/lib/services/api.service'
import DocumentUploadDialog from '@/components/documents/document-upload-dialog'

export default function AdminContractsPage() {
  const { data: session } = useSession()
  const token = (session as any)?.backendToken || (session as any)?.user?.token || ''

  const [applications, setApplications] = useState<any[]>([])
  const [workflow, setWorkflow] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Upload Popup State
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploadTargetAppId, setUploadTargetAppId] = useState<string | null>(null)
  const [uploadTargetStudentName, setUploadTargetStudentName] = useState<string>('')
  const [uploadDocType, setUploadDocType] = useState<string>('UNSIGNED_CONTRACT')
  const [uploadDocLabel, setUploadDocLabel] = useState<string>('Unsigned Contract')

  // Extra document name labels keyed by appId + slotNumber
  const [extraDocNames, setExtraDocNames] = useState<Record<string, string>>({})

  // Review Modal State
  const [selectedDocToReview, setSelectedDocToReview] = useState<any | null>(null)
  const [reviewRemarks, setReviewRemarks] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [appData, wfData] = await Promise.all([
        applicationService.getAll(),
        workflowService.get()
      ])
      setWorkflow(wfData)
      // Filter only applications currently in the 'contract' step
      const contractApps = (appData || []).filter(
        (app: any) => app.currentStepId === 'contract'
      )
      setApplications(contractApps)
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch contract applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleOpenUpload = (appId: string, studentName: string, docType: string = 'UNSIGNED_CONTRACT', docLabel: string = 'Unsigned Contract') => {
    setUploadTargetAppId(appId)
    setUploadTargetStudentName(studentName)
    setUploadDocType(docType)
    setUploadDocLabel(docLabel)
    setIsUploadOpen(true)
  }

  const handleUploadComplete = () => {
    toast.success('File uploaded successfully!')
    fetchData()
  }

  const handleDeleteUnsigned = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }
    try {
      await documentService.delete(docId)
      toast.success('Unsigned contract deleted')
      fetchData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete contract')
    }
  }

  const handleReviewAction = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedDocToReview) return
    try {
      setSubmittingReview(true)
      await documentService.updateStatus(selectedDocToReview.id, status, reviewRemarks)
      
      // If approved, move student to the next step automatically
      if (status === 'APPROVED') {
        let nextStepId = 'payment3' // default fallback
        if (workflow?.steps) {
          const idx = workflow.steps.findIndex((s: any) => s.id === 'contract' || s.isContractStep)
          if (idx !== -1 && idx < workflow.steps.length - 1) {
            nextStepId = workflow.steps[idx + 1].id
          }
        }
        await applicationService.updateStep(selectedDocToReview.applicationId, nextStepId)
        toast.success(`Signed contract approved! Student advanced to next step: ${nextStepId}`)
      } else {
        toast.success('Signed contract rejected')
      }

      setSelectedDocToReview(null)
      setReviewRemarks('')
      fetchData()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update contract status')
    } finally {
      setSubmittingReview(false)
    }
  }

  const filteredApps = applications.filter((app) => {
    const fullName = `${app.user?.firstName || ''} ${app.user?.lastName || ''}`.toLowerCase()
    const email = (app.user?.email || '').toLowerCase()
    return fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase())
  })

  // Calculate Metrics
  const totalContracts = applications.length
  const adminUploadedCount = applications.filter(app => 
    app.documents?.some((d: any) => d.type === 'UNSIGNED_CONTRACT')
  ).length
  const pendingSubmissionCount = applications.filter(app => 
    !app.documents?.some((d: any) => d.type === 'SIGNED_CONTRACT')
  ).length
  const signedSubmittedCount = applications.filter(app => 
    app.documents?.some((d: any) => d.type === 'SIGNED_CONTRACT' && d.status === 'PENDING')
  ).length
  const approvedContractsCount = applications.filter(app => 
    app.documents?.some((d: any) => d.type === 'SIGNED_CONTRACT' && d.status === 'APPROVED')
  ).length

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Header 
          title="Contract Management" 
          description="Manage student-specific contracts and review signed agreements." 
        />

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-5 flex items-center justify-between border-2 border-primary/10 bg-white">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">In Contract Stage</p>
              <h3 className="text-2xl font-black text-foreground mt-1">{totalContracts}</h3>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <ClipboardList className="w-5 h-5" />
            </div>
          </Card>
          <Card className="p-5 flex items-center justify-between border-2 border-blue-500/10 bg-white">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Custom Uploads</p>
              <h3 className="text-2xl font-black text-blue-700 mt-1">{adminUploadedCount}</h3>
            </div>
            <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
          </Card>
          <Card className="p-5 flex items-center justify-between border-2 border-amber-500/10 bg-white">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pending Review</p>
              <h3 className="text-2xl font-black text-amber-700 mt-1">{signedSubmittedCount}</h3>
            </div>
            <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-600">
              <Eye className="w-5 h-5" />
            </div>
          </Card>
          <Card className="p-5 flex items-center justify-between border-2 border-green-500/10 bg-white">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Approved Contracts</p>
              <h3 className="text-2xl font-black text-green-700 mt-1">{approvedContractsCount}</h3>
            </div>
            <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </Card>
        </div>

        {/* Search Filter Card */}
        <Card className="p-4 bg-white border border-slate-200">
          <div className="flex items-center gap-3 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 border-slate-200 focus:ring-primary rounded-xl"
            />
          </div>
        </Card>

        {/* Candidates Table List */}
        <div className="grid gap-4">
          {loading ? (
            <Card className="p-12 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted-foreground animate-pulse">Loading contract list...</p>
            </Card>
          ) : filteredApps.length === 0 ? (
            <Card className="p-12 text-center bg-white border border-slate-200">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium text-lg">No students are currently in the contract step.</p>
              <p className="text-slate-400 text-sm mt-1">Once a student reaches the contract signing stage, they will appear here.</p>
            </Card>
          ) : (
            filteredApps.map((app) => {
              const studentName = `${app.user?.firstName || ''} ${app.user?.lastName || ''}`
              const unsignedContract = app.documents?.find((d: any) => d.type === 'UNSIGNED_CONTRACT')
              const signedContract = app.documents?.find((d: any) => d.type === 'SIGNED_CONTRACT')
              const extraDoc1 = app.documents?.find((d: any) => d.type === 'CONTRACT_EXTRA_1')
              const extraDoc2 = app.documents?.find((d: any) => d.type === 'CONTRACT_EXTRA_2')
              const extraDoc3 = app.documents?.find((d: any) => d.type === 'CONTRACT_EXTRA_3')
              const extraDoc4 = app.documents?.find((d: any) => d.type === 'CONTRACT_EXTRA_4')

              // Helper for per-app per-slot name keys
              const nameKey = (slot: number) => `${app.id}_extra${slot}`
              const getDocName = (slot: number, fallback: string) => extraDocNames[nameKey(slot)] ?? fallback
              const setDocName = (slot: number, val: string) =>
                setExtraDocNames(prev => ({ ...prev, [nameKey(slot)]: val }))

              return (
                <Card key={app.id} className="p-6 bg-white border border-slate-200 hover:shadow-md transition-shadow rounded-3xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Student Identity */}
                    <div className="flex-1 space-y-1">
                      <h3 className="text-lg font-bold text-slate-800">{studentName}</h3>
                      <p className="text-xs text-slate-500 font-medium">{app.user?.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Step: {app.currentStepId}
                        </span>
                      </div>
                    </div>

                    {/* Unsigned Contract Manager (Admin) */}
                    <div className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unsigned Contract</span>
                        {unsignedContract ? (
                          <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">Uploaded</span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Waiting Upload</span>
                        )}
                      </div>
                      {unsignedContract ? (
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          <a 
                            href={unsignedContract.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs font-bold text-primary hover:underline truncate flex-1"
                          >
                            {unsignedContract.fileName || 'Contract.docx'}
                          </a>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleOpenUpload(app.id, studentName, 'UNSIGNED_CONTRACT', 'Unsigned Contract')} 
                              className="h-8 w-8 hover:bg-slate-200"
                              title="Replace file"
                            >
                              <Upload className="w-3.5 h-3.5 text-slate-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteUnsigned(unsignedContract.id)} 
                              className="h-8 w-8 hover:bg-red-50 text-red-500"
                              title="Delete contract"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleOpenUpload(app.id, studentName, 'UNSIGNED_CONTRACT', 'Unsigned Contract')}
                          className="w-full text-xs font-bold border-dashed border-2 border-slate-300 bg-white hover:border-primary hover:text-primary gap-1.5 h-9"
                        >
                          <Upload className="w-3.5 h-3.5" /> Upload Specific Contract
                        </Button>
                      )}
                    </div>

                    {/* Signed Contract Manager (Student) */}
                    <div className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Signed Contract</span>
                        {signedContract ? (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            signedContract.status === 'APPROVED' 
                              ? 'bg-green-100 text-green-700' 
                              : signedContract.status === 'REJECTED' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {signedContract.status}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Not Submitted</span>
                        )}
                      </div>
                      
                      {signedContract ? (
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />
                          <a 
                            href={signedContract.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs font-bold text-primary hover:underline truncate flex-1"
                          >
                            {signedContract.fileName || 'Signed_Contract.pdf'}
                          </a>
                          
                          {signedContract.status === 'PENDING' ? (
                            <Button 
                              onClick={() => setSelectedDocToReview(signedContract)}
                              size="sm"
                              className="h-8 text-xs font-bold bg-primary text-white hover:opacity-90 px-3 rounded-lg"
                            >
                              Review
                            </Button>
                          ) : (
                            <Button 
                              variant="outline"
                              onClick={() => setSelectedDocToReview(signedContract)}
                              size="sm"
                              className="h-8 text-xs font-bold px-2 rounded-lg"
                            >
                              Review again
                            </Button>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 font-medium italic text-center py-2">Waiting for student signature</p>
                      )}
                    </div>
                  </div>

                  {/* Additional Contract Documents Row */}
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Additional Documents — Admin Upload (4 Slots)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                      {([1, 2, 3, 4] as const).map((slot) => {
                        const extraDoc = [null, extraDoc1, extraDoc2, extraDoc3, extraDoc4][slot]
                        const typeKey = `CONTRACT_EXTRA_${slot}`
                        const defaultLabel = `Additional Document ${slot}`
                        const savedLabel = app.data?.contractExtraLabels?.[typeKey] || defaultLabel
                        const customName = extraDocNames[nameKey(slot)] !== undefined ? extraDocNames[nameKey(slot)] : savedLabel
                        return (
                          <div key={slot} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                            {/* Name input */}
                            <div className="flex items-center gap-1.5">
                              <Input
                                value={customName}
                                onChange={(e) => setDocName(slot, e.target.value)}
                                placeholder={`Document ${slot} name...`}
                                className="h-7 text-[10px] font-bold bg-white border-slate-200 rounded-lg px-2 flex-1"
                              />
                              {customName !== savedLabel && (
                                <Button
                                  size="sm"
                                  className="h-7 px-2 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shrink-0"
                                  onClick={async () => {
                                    try {
                                      const currentLabels = app.data?.contractExtraLabels || {}
                                      const updatedLabels = {
                                        ...currentLabels,
                                        [typeKey]: customName
                                      }
                                      const updatedData = {
                                        ...app.data,
                                        contractExtraLabels: updatedLabels
                                      }
                                      await applicationService.update(app.id, { data: updatedData })
                                      toast.success('Document title updated!')
                                      fetchData()
                                    } catch (err: any) {
                                      toast.error(err.message || 'Failed to update title')
                                    }
                                  }}
                                >
                                  Save
                                </Button>
                              )}
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                {extraDoc ? (
                                  <a href={extraDoc.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-primary hover:underline truncate block">
                                    {extraDoc.fileName || customName}
                                  </a>
                                ) : (
                                  <p className="text-xs text-slate-400 italic">Not uploaded</p>
                                )}
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 hover:bg-slate-200"
                                  title={`Upload ${customName}`}
                                  onClick={() => handleOpenUpload(app.id, studentName, typeKey, customName)}
                                >
                                  <Upload className="w-3 h-3 text-slate-600" />
                                </Button>
                                {extraDoc && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 hover:bg-red-50 text-red-500"
                                    onClick={() => handleDeleteUnsigned(extraDoc.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>

      {/* Upload Popup for Admin Custom Contract */}
      {uploadTargetAppId && (() => {
        const activeApp = applications.find(app => app.id === uploadTargetAppId);
        return (
          <DocumentUploadDialog
            isOpen={isUploadOpen}
            onClose={() => {
              setIsUploadOpen(false)
              setUploadTargetAppId(null)
            }}
            onUploadComplete={handleUploadComplete}
            token={token}
            applicationId={uploadTargetAppId}
            documentType={uploadDocType}
            documentName={`${uploadTargetStudentName} - ${uploadDocLabel}`}
            studentData={activeApp ? {
              studentName: `${activeApp.user?.firstName || ''} ${activeApp.user?.lastName || ''}`.trim(),
              firstName: activeApp.user?.firstName || '',
              lastName: activeApp.user?.lastName || '',
              email: activeApp.user?.email || '',
              passportNumber: activeApp.passportNumber || activeApp.data?.passportNumber || '',
              educationalInstitution: activeApp.educationalInstitution || activeApp.data?.educationalInstitution || '',
              enrollmentStatus: activeApp.enrollmentStatus || activeApp.data?.enrollmentStatus || '',
              cgpa: String(activeApp.cgpa || activeApp.data?.cgpa || ''),
              preferredDepartment: activeApp.preferredDepartment || activeApp.department || activeApp.data?.preferredDepartment || '',
              statementOfPurpose: activeApp.statementOfPurpose || activeApp.data?.statementOfPurpose || '',
              phone: activeApp.phone || '',
              applicationId: activeApp.id || '',
              visaNumber: activeApp.visa?.visaNumber || '',
              visaDate: activeApp.visa?.issuedAt ? new Date(activeApp.visa.issuedAt).toLocaleDateString() : '',
              hotelName: activeApp.hotelAssignment?.hotel?.name || '',
              checkIn: activeApp.hotelAssignment?.checkIn ? new Date(activeApp.hotelAssignment.checkIn).toLocaleDateString() : '',
              checkOut: activeApp.hotelAssignment?.checkOut ? new Date(activeApp.hotelAssignment.checkOut).toLocaleDateString() : '',
            } : {}}
          />
        );
      })()}

      {/* Review Signed Contract Modal */}
      {selectedDocToReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Review Student Signed Contract</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{selectedDocToReview.fileName || 'Signed_Contract.pdf'}</p>
              </div>
              <button 
                onClick={() => {
                  setSelectedDocToReview(null)
                  setReviewRemarks('')
                }} 
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Document link / preview info */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Signed Document PDF</p>
                  <p className="text-[10px] text-slate-500">File is hosted securely on Cloudinary</p>
                </div>
              </div>
              <a 
                href={selectedDocToReview.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline bg-white px-4 py-2 border rounded-xl shadow-sm hover:bg-slate-50"
              >
                <Eye className="w-3.5 h-3.5" /> View / Download Document
              </a>
            </div>

            {/* Remarks Area */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 ml-1">Review Remarks / Notes (Required if rejecting)</label>
              <textarea
                value={reviewRemarks}
                onChange={(e) => setReviewRemarks(e.target.value)}
                placeholder="Enter approval details or reason for rejection..."
                className="w-full h-24 p-3 border rounded-xl text-sm text-slate-800 bg-white focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDocToReview(null)
                  setReviewRemarks('')
                }}
                className="flex-1 rounded-xl"
                disabled={submittingReview}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleReviewAction('REJECTED')}
                disabled={submittingReview || !reviewRemarks.trim()}
                className="flex-1 rounded-xl bg-red-600 text-white hover:bg-red-700 gap-1.5"
              >
                <X className="w-4 h-4" /> Reject Contract
              </Button>
              <Button
                onClick={() => handleReviewAction('APPROVED')}
                disabled={submittingReview}
                className="flex-1 rounded-xl bg-green-600 text-white hover:bg-green-700 gap-1.5"
              >
                <Check className="w-4 h-4" /> Approve & Verify
              </Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
