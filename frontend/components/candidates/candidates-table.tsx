'use client'

import { useState, useEffect } from 'react'
import { Candidate, CandidateStatus, PaymentStatus } from '@/lib/candidate-data'
import { applicationService, workflowService, studentCategoryService } from '@/lib/services/api.service'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Eye, ArrowRight, MessageSquare, Check, X, Phone, Mail, Loader2, Download } from 'lucide-react'

interface CandidatesTableProps {
  initialStatus?: 'all' | CandidateStatus
  title?: string
}

export function CandidatesTable({ initialStatus = 'all', title }: CandidatesTableProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [workflow, setWorkflow] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | CandidateStatus>(initialStatus)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState('')
  const [showMoveStep, setShowMoveStep] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [appData, wfData, catData] = await Promise.all([
        applicationService.getAll(),
        workflowService.get(),
        studentCategoryService.getAll().catch(() => []),
      ])
      
      setWorkflow(wfData)
      setCategories(catData || [])
      
      // Map backend data to frontend Candidate type
      const mappedCandidates: Candidate[] = appData.map((app: any) => {
        let status: CandidateStatus = 'pending'
        if (app.status === 'ACCEPTED') status = 'approved'
        if (app.status === 'REJECTED') status = 'rejected'

        let currentStepName = 'Unknown'
        if (wfData && wfData.steps) {
          const step = wfData.steps.find((s: any) => s.id === app.currentStepId)
          currentStepName = step ? step.name : app.status.replace(/_/g, ' ')
        } else {
          currentStepName = app.status.replace(/_/g, ' ')
        }

        return {
          id: app.id,
          name: `${app.user.firstName} ${app.user.lastName}`,
          email: app.user.email,
          phone: app.phone || 'N/A',
          program: app.program || 'Internship Program',
          currentStep: currentStepName,
          currentStepId: app.currentStepId || '',
          status,
          paymentStatus: app.paymentStatus === 'COMPLETED' ? 'paid' : (app.paymentStatus?.toLowerCase() as PaymentStatus) || 'unpaid',
          notes: app.notes || '',
          createdAt: new Date(app.createdAt),
          updatedAt: new Date(app.updatedAt),
          attachments: app.resumeUrl ? [app.resumeUrl] : [],
          
          // New fields
          collegeName: app.collegeName,
          universityName: app.universityName,
          course: app.course,
          currentYear: app.currentYear,
          department: app.department,
          cgpa: app.cgpa,
          whatsapp: app.user.whatsapp || app.phone,
          dateOfBirth: app.user.dateOfBirth,
          address: app.user.address,
          city: app.user.city,
          state: app.user.state,
          pincode: app.user.pincode,
          internshipStartDate: app.data?.internshipStartDate, // Note: app.internshipStartDate was dropped
          internshipEndDate: app.data?.internshipEndDate,
          additionalData: app.data,
          passportNumber: app.passportNumber,
          educationalInstitution: app.educationalInstitution,
          enrollmentStatus: app.enrollmentStatus,
          preferredDepartment: app.preferredDepartment,
          statementOfPurpose: app.statementOfPurpose,
          category: app.category,
          documents: app.documents,
        }
      })
      setCandidates(mappedCandidates)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: CandidateStatus) => {
    try {
      const backendStatus = newStatus === 'approved' ? 'ACCEPTED' : newStatus === 'rejected' ? 'REJECTED' : 'PENDING'
      await applicationService.updateStatus(id, backendStatus)
      setCandidates(
        candidates.map((c) =>
          c.id === id ? { ...c, status: newStatus, updatedAt: new Date() } : c
        )
      )
      toast.success(`Candidate ${newStatus} successfully`)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleMoveStep = async (stepId: string, stepName: string) => {
    if (selectedCandidate) {
      try {
        await applicationService.updateStep(selectedCandidate.id, stepId)
        setCandidates(
          candidates.map((c) =>
            c.id === selectedCandidate.id
              ? { ...c, currentStepId: stepId, currentStep: stepName, updatedAt: new Date() }
              : c
          )
        )
        setShowMoveStep(false)
        setSelectedCandidate(null)
        toast.success(`Moved to ${stepName}`)
      } catch (error: any) {
        toast.error(error.message)
      }
    }
  }

  const handleAddNotes = async () => {
    if (selectedCandidate && notes) {
      try {
        await applicationService.updateNotes(selectedCandidate.id, notes)
        setCandidates(
          candidates.map((c) =>
            c.id === selectedCandidate.id
              ? { ...c, notes: notes, updatedAt: new Date() }
              : c
          )
        )
        setNotes('')
        setShowNotes(false)
        toast.success('Notes saved successfully')
      } catch (error: any) {
        toast.error(error.message)
      }
    }
  }

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.program.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || c.status === filterStatus
    const matchesCategory = filterCategory === 'all' || (c as any).category === filterCategory

    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStatusColor = (status: CandidateStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700'
      case 'pending':
        return 'bg-blue-100 text-blue-700'
      case 'rejected':
        return 'bg-red-100 text-red-700'
    }
  }

  const getPaymentColor = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return 'bg-green-50 text-green-700'
      case 'pending':
        return 'bg-yellow-50 text-yellow-700'
      case 'unpaid':
        return 'bg-orange-50 text-orange-700'
      case 'overdue':
        return 'bg-red-50 text-red-700'
      default:
        return 'bg-gray-50 text-gray-700'
    }
  }

  // Modal: View Candidate Details
  if (selectedCandidate && !showNotes && !showMoveStep) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">{selectedCandidate.name}</h2>
              <p className="text-muted-foreground mt-1">{selectedCandidate.program}</p>
            </div>
            <Button variant="ghost" onClick={() => setSelectedCandidate(null)}>
              ✕
            </Button>
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Email</label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${selectedCandidate.email}`} className="text-foreground hover:underline">
                    {selectedCandidate.email}
                  </a>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Phone</label>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <p className="text-foreground">{selectedCandidate.phone || 'N/A'}</p>
                </div>
              </div>
            </div>            <div className="grid md:grid-cols-1 gap-6 pt-4 border-t border-border">
              <div className="space-y-4">
                <h3 className="text-sm font-bold border-b pb-1">Submitted Documents</h3>
                {selectedCandidate.documents && selectedCandidate.documents.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {selectedCandidate.documents.map((doc: any, index: number) => (
                      <a 
                        key={index} 
                        href={doc.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-between p-3 bg-secondary/30 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-primary uppercase">{doc.type || 'DOC'}</span>
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{doc.status}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                          <Download className="w-4 h-4" />
                        </Button>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No documents submitted.</p>
                )}
              </div>
            </div>


            {selectedCandidate.address && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Address</label>
                <p className="text-sm text-foreground mt-1">
                  {selectedCandidate.address}, {selectedCandidate.city}, {selectedCandidate.state} - {selectedCandidate.pincode}
                </p>
              </div>
            )}

            {/* Dynamic Workflow Data */}
            {selectedCandidate.additionalData && Object.keys(selectedCandidate.additionalData).length > 0 && (
              <div className="space-y-6 pt-4 border-t border-border">
                <h3 className="text-lg font-bold text-foreground">Application Data</h3>
                {Object.entries(selectedCandidate.additionalData).map(([stageName, sections]: [string, any]) => {
                  // Fallback for flat data
                  if (typeof sections !== 'object' || sections === null) {
                    return (
                      <div key={stageName} className="flex flex-col">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">{stageName.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-foreground mt-1">{String(sections)}</span>
                      </div>
                    )
                  }

                  return (
                    <div key={stageName} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-primary rounded-full" />
                        <h4 className="text-sm font-black uppercase tracking-widest text-primary/80">{stageName}</h4>
                      </div>
                      <div className="grid gap-3">
                        {Object.entries(sections).map(([sectionName, fields]: [string, any]) => (
                          <Card key={sectionName} className="p-5 bg-secondary/20 border-primary/5 shadow-none">
                            <h5 className="text-[10px] font-black text-muted-foreground uppercase mb-4 tracking-widest opacity-60">{sectionName}</h5>
                            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                              {Object.entries(fields).map(([fieldName, value]: [string, any]) => (
                                <div key={fieldName} className="space-y-1">
                                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{fieldName}</label>
                                  <p className="text-sm font-semibold text-foreground leading-relaxed">{String(value)}</p>
                                </div>
                              ))}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {selectedCandidate.notes && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase">Internal Notes</label>
                <p className="text-foreground mt-2 p-3 bg-secondary rounded-lg text-sm">{selectedCandidate.notes}</p>
              </div>
            )}

            <div className="flex gap-2 border-t border-border pt-4">
              <Button
                variant="outline"
                onClick={() => setShowMoveStep(true)}
                className="gap-2 flex-1"
              >
                <ArrowRight className="w-4 h-4" />
                Move to Step
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowNotes(true)}
                className="gap-2 flex-1"
              >
                <MessageSquare className="w-4 h-4" />
                Add Notes
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedCandidate(null)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Modal: Add Notes
  if (selectedCandidate && showNotes) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Add Notes for {selectedCandidate.name}</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter your notes here..."
            className="w-full h-32 p-3 border border-border rounded-lg text-foreground bg-background mb-4"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowNotes(false)
                setNotes('')
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleAddNotes} disabled={!notes.trim()} className="flex-1">
              Save Notes
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Modal: Move to Step
  if (selectedCandidate && showMoveStep) {
    const steps = workflow?.steps || []
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Move to Step</h2>
          <div className="space-y-2 mb-4">
            {steps.length === 0 ? (
              <p className="text-sm text-muted-foreground">No workflow steps defined.</p>
            ) : (
              steps.map((step: any) => (
                <Button
                  key={step.id}
                  variant={selectedCandidate.currentStepId === step.id ? 'default' : 'outline'}
                  className="w-full justify-start gap-2"
                  onClick={() => handleMoveStep(step.id, step.name)}
                >
                  {selectedCandidate.currentStepId === step.id && <Check className="w-4 h-4" />}
                  {step.name}
                </Button>
              ))
            )}
          </div>
          <Button variant="outline" onClick={() => setShowMoveStep(false)} className="w-full">
            Cancel
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {title && <h2 className="text-2xl font-bold text-foreground">{title}</h2>}
      <Card className="p-4 space-y-4">
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or program..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | CandidateStatus)}
            className="px-3 py-2 border border-border rounded-lg text-sm text-foreground"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Category filter */}
          {categories.length > 0 && (
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg text-sm text-foreground"
            >
              <option value="all">All Categories</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.name}>{cat.name.replace(/_/g, ' ')}</option>
              ))}
            </select>
          )}

          <p className="text-sm text-muted-foreground whitespace-nowrap">
            {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''}
          </p>
        </div>
      </Card>

      <div className="grid gap-3">
        {loading ? (
          <Card className="p-12 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground animate-pulse">Loading candidates...</p>
          </Card>
        ) : filteredCandidates.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No candidates found matching your search.</p>
          </Card>
        ) : (
          filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{candidate.name}</h3>
                    <p className="text-xs text-muted-foreground">{candidate.email}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1"
                      onClick={() => setSelectedCandidate(candidate)}
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() =>
                        handleStatusChange(
                          candidate.id,
                          candidate.status === 'approved' ? 'pending' : 'approved'
                        )
                      }
                    >
                      {candidate.status === 'approved' ? (
                        <>
                          <Check className="w-3 h-3" />
                          Approved
                        </>
                      ) : (
                        <>
                          <Check className="w-3 h-3" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-red-600 hover:text-red-700"
                      onClick={() => handleStatusChange(candidate.id, 'rejected')}
                    >
                      <X className="w-3 h-3" />
                      Reject
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-1">Program</p>
                    <p className="font-medium text-foreground truncate">{candidate.program}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground mb-1">Current Step</p>
                    <p className="font-medium text-foreground truncate">{candidate.currentStep}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground mb-1">Status</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                      {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                    </span>
                  </div>

                  <div>
                    <p className="text-muted-foreground mb-1">Payment</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPaymentColor(candidate.paymentStatus)}`}>
                      {candidate.paymentStatus.charAt(0).toUpperCase() +
                        candidate.paymentStatus.slice(1).replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Category badge */}
                  {(candidate as any).category && (() => {
                    const cat = categories.find((c: any) => c.name === (candidate as any).category)
                    return (
                      <div>
                        <p className="text-muted-foreground mb-1">Category</p>
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                          style={{ background: cat?.color || '#6366F1' }}
                        >
                          {((candidate as any).category as string).replace(/_/g, ' ')}
                        </span>
                      </div>
                    )
                  })()}
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1 text-xs"
                    onClick={() => {
                      setSelectedCandidate(candidate)
                      setShowMoveStep(true)
                    }}
                  >
                    <ArrowRight className="w-3 h-3" />
                    Move to Step
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1 text-xs"
                    onClick={() => {
                      setSelectedCandidate(candidate)
                      setShowNotes(true)
                    }}
                  >
                    <MessageSquare className="w-3 h-3" />
                    Add Notes
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
