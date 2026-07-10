'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  FileText,
  Trash2,
  Pencil,
  X,
  Upload,
  Tag,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Variable,
  FolderOpen,
  Download,
  ClipboardList,
  Wand2,
  User,
  Building2,
  ChevronRight,
  ChevronLeft,
  Search,
  Hotel,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { documentTemplateService, userService, applicationService, hotelService } from '@/lib/services/api.service'
import { uploadFile } from '@/lib/services/upload.service'
import { toast } from 'sonner'

const CATEGORIES = [
  { value: 'visa', label: 'Visa' },
  { value: 'work-permit', label: 'Work Permit' },
  { value: 'offer-letter', label: 'Offer Letter' },
  { value: 'travel', label: 'Travel Document' },
  { value: 'hotel', label: 'Hotel Booking' },
  { value: 'contract', label: 'Contract' },
  { value: 'other', label: 'Other' },
]

const SYSTEM_TEMPLATES = [
  { type: 'UNSIGNED_CONTRACT', label: 'Main Contract Template', description: 'Used for the main contract signed by students.' },
  { type: 'CONTRACT_EXTRA_1', label: 'Contract Additional Document 1', description: 'Predefined slot for additional document 1.' },
  { type: 'CONTRACT_EXTRA_2', label: 'Contract Additional Document 2', description: 'Predefined slot for additional document 2.' },
  { type: 'CONTRACT_EXTRA_3', label: 'Contract Additional Document 3', description: 'Predefined slot for additional document 3.' },
  { type: 'PAYMENT2_DOCUMENT', label: 'Payment 2 Document Template', description: 'Predefined slot for documents sent in Installment 2.' },
  { type: 'PAYMENT3_DOCUMENT', label: 'Payment 3 Document Template', description: 'Predefined slot for documents sent in Installment 3.' },
]

const SUGGESTED_VARIABLES = [
  'studentName', 'firstName', 'lastName', 'email',
  'passportNumber', 'dateOfBirth', 'nationality',
  'applicationId', 'visaDate', 'visaNumber',
  'hotelName', 'checkIn', 'checkOut',
  'workPermitNumber', 'startDate', 'endDate',
  'companyName', 'position', 'salary',
]

interface Template {
  id: string
  name: string
  description?: string
  fileUrl: string
  fileName: string
  variables: string[]
  category?: string
  createdAt: string
}

interface UserData {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  dateOfBirth?: string
  whatsapp?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
}

interface ApplicationData {
  id: string
  userId: string
  passportNumber?: string
  educationalInstitution?: string
  enrollmentStatus?: string
  preferredDepartment?: string
  data?: Record<string, any>
  hotelAssignment?: {
    checkIn: string
    checkOut: string
    hotel: HotelData
  }
}

interface HotelData {
  id: string
  name: string
  location: string
  address?: string
  phone?: string
  email?: string
  position?: string
  representedBy?: string
  siretNo?: string
  natureOfActivity?: string
}

// ─── Variable mapping helper ─────────────────────────────────────────────────

function buildVariableMap(
  user: UserData,
  application: ApplicationData | null,
  hotel: HotelData | null
): Record<string, string> {
  const fullName = `${user.firstName} ${user.lastName}`.trim()
  const assignment = application?.hotelAssignment

  const map: Record<string, string> = {
    // Student
    studentName: fullName,
    fullName,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    dateOfBirth: user.dateOfBirth || '',
    whatsapp: user.whatsapp || '',
    address: user.address || '',
    city: user.city || '',
    state: user.state || '',
    pincode: user.pincode || '',
    nationality: user.address || '',

    // Application
    applicationId: application?.id || '',
    passportNumber: application?.passportNumber || '',
    educationalInstitution: application?.educationalInstitution || '',
    enrollmentStatus: application?.enrollmentStatus || '',
    preferredDepartment: application?.preferredDepartment || '',

    // Hotel from assignment on application
    hotelName: assignment?.hotel?.name || hotel?.name || '',
    hotelLocation: assignment?.hotel?.location || hotel?.location || '',
    hotelAddress: assignment?.hotel?.address || hotel?.address || '',
    hotelPhone: assignment?.hotel?.phone || hotel?.phone || '',
    hotelEmail: assignment?.hotel?.email || hotel?.email || '',
    position: assignment?.hotel?.position || hotel?.position || '',
    representedBy: assignment?.hotel?.representedBy || hotel?.representedBy || '',
    siretNo: assignment?.hotel?.siretNo || hotel?.siretNo || '',
    companyName: assignment?.hotel?.name || hotel?.name || '',
    natureOfActivity: assignment?.hotel?.natureOfActivity || hotel?.natureOfActivity || '',

    // Hotel dates
    checkIn: assignment ? new Date(assignment.checkIn).toLocaleDateString('en-GB') : '',
    checkOut: assignment ? new Date(assignment.checkOut).toLocaleDateString('en-GB') : '',
  }

  // Spread any dynamic application.data fields
  if (application?.data && typeof application.data === 'object') {
    for (const [k, v] of Object.entries(application.data)) {
      if (typeof v === 'string' || typeof v === 'number') {
        map[k] = String(v)
      }
    }
  }

  return map
}

// ─── Generate Document Modal ─────────────────────────────────────────────────

interface GenerateModalProps {
  templates: Template[]
  onClose: () => void
  initialTemplate?: Template | null
}

function GenerateDocumentModal({ templates, onClose, initialTemplate }: GenerateModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(initialTemplate ? 2 : 1)

  // Step 1
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(initialTemplate ?? null)
  const [templateSearch, setTemplateSearch] = useState('')

  // Step 2
  const [users, setUsers] = useState<UserData[]>([])
  const [applications, setApplications] = useState<ApplicationData[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [userSearch, setUserSearch] = useState('')

  // Step 3
  const [hotels, setHotels] = useState<HotelData[]>([])
  const [loadingHotels, setLoadingHotels] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState<HotelData | null>(null)
  const [hotelSearch, setHotelSearch] = useState('')

  // Step 4: Variable Review
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})

  // Generation
  const [generating, setGenerating] = useState(false)

  // Reset variable values when template, user, or hotel changes
  useEffect(() => {
    setVariableValues({})
  }, [selectedTemplate, selectedUser, selectedHotel])

  // Initialize and update variable values when step/template/user/hotel changes
  useEffect(() => {
    if (selectedTemplate && selectedUser) {
      const application = getUserApplication(selectedUser.id)
      const hotel = selectedHotel || application?.hotelAssignment?.hotel || null
      const autoMap = buildVariableMap(selectedUser, application, hotel)
      
      const newValues = { ...variableValues }
      selectedTemplate.variables.forEach(v => {
        if (newValues[v] === undefined) {
          newValues[v] = autoMap[v] || ''
        }
      })
      setVariableValues(newValues)
    }
  }, [step, selectedTemplate, selectedUser, selectedHotel, applications])

  // Fetch users & applications when reaching step 2
  useEffect(() => {
    if (step === 2 && users.length === 0) {
      setLoadingUsers(true)
      Promise.all([
        userService.getAll(),
        applicationService.getAll(),
      ]).then(([u, a]) => {
        setUsers(u || [])
        setApplications(a || [])
      }).catch(() => toast.error('Failed to load users')).finally(() => setLoadingUsers(false))
    }
  }, [step])

  // Fetch hotels when reaching step 3
  useEffect(() => {
    if (step === 3 && hotels.length === 0) {
      setLoadingHotels(true)
      hotelService.getAll().then(h => setHotels(h || [])).catch(() => toast.error('Failed to load hotels')).finally(() => setLoadingHotels(false))
    }
  }, [step])

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(templateSearch.toLowerCase())
  )

  const filteredUsers = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(userSearch.toLowerCase())
  )

  const filteredHotels = hotels.filter(h =>
    `${h.name} ${h.location}`.toLowerCase().includes(hotelSearch.toLowerCase())
  )

  // Get user's application (including hotel assignment)
  const getUserApplication = (userId: string): ApplicationData | null => {
    return applications.find(a => a.userId === userId) || null
  }

  async function handleGenerate() {
    if (!selectedTemplate || !selectedUser) return

    setGenerating(true)
    try {
      // Fetch the template file as blob
      const response = await fetch(selectedTemplate.fileUrl)
      if (!response.ok) throw new Error('Failed to fetch template file')
      const arrayBuffer = await response.arrayBuffer()

      // Dynamically import pizzip and docxtemplater
      const PizZip = (await import('pizzip')).default
      const Docxtemplater = (await import('docxtemplater')).default

      const zip = new PizZip(arrayBuffer)

      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        // Error handler – replace unresolved variables with empty string
        nullGetter: () => '',
      })

      doc.render(variableValues)

      const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })

      // Trigger download
      const url = URL.createObjectURL(out)
      const link = document.createElement('a')
      const safeUserName = `${selectedUser.firstName}_${selectedUser.lastName}`.replace(/\s+/g, '_')
      link.href = url
      link.download = `${selectedTemplate.name}_${safeUserName}.docx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Document generated and downloaded!')
      onClose()
    } catch (e: any) {
      console.error('Document generation error:', e)
      toast.error(e?.message || 'Failed to generate document')
    } finally {
      setGenerating(false)
    }
  }

  const canGoNext = () => {
    if (step === 1) return !!selectedTemplate
    if (step === 2) return !!selectedUser
    return true
  }

  const STEPS = [
    { num: 1, label: 'Template', icon: FileText },
    { num: 2, label: 'Student', icon: User },
    { num: 3, label: 'Hotel', icon: Hotel },
    { num: 4, label: 'Variables', icon: Variable },
  ]

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => !generating && onClose()}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="pointer-events-auto w-full max-w-2xl bg-background rounded-3xl border border-border/60 shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: '90vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border/40 shrink-0" style={{ background: '#141414' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#CCFF0020' }}>
                <Wand2 className="w-4 h-4" style={{ color: '#CCFF00' }} />
              </div>
              <div>
                <h2 className="text-base font-bold" style={{ color: '#CCFF00' }}>Generate Document</h2>
                <p className="text-[11px] mt-0.5" style={{ color: '#555' }}>Auto-fill a template with student & hotel data</p>
              </div>
            </div>
            {!generating && (
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-all">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-0 px-6 py-4 border-b border-border/30 bg-muted/10 shrink-0">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const isActive = step === s.num
              const isDone = step > s.num
              return (
                <div key={s.num} className="flex items-center gap-0 flex-1">
                  <div className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all text-xs font-bold',
                    isActive ? 'text-foreground' : isDone ? 'text-muted-foreground' : 'text-muted-foreground/50'
                  )}>
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all',
                      isActive ? 'text-black' : isDone ? 'bg-green-500/20 text-green-600' : 'bg-muted/50 text-muted-foreground/50'
                    )}
                      style={isActive ? { background: '#CCFF00' } : {}}>
                      {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}
                    </div>
                    <span className="hidden sm:block">{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-px bg-border/40 mx-2" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Step Body */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {/* ── Step 1: Select Template ── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Select a Template</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Choose the document template to fill.</p>
                  </div>
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      value={templateSearch}
                      onChange={e => setTemplateSearch(e.target.value)}
                      placeholder="Search templates..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/60 bg-muted/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  {/* Template list */}
                  <div className="space-y-2 max-h-[42vh] overflow-y-auto pr-1">
                    {filteredTemplates.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground text-xs">No templates found</div>
                    )}
                    {filteredTemplates.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplate(t)}
                        className={cn(
                          'w-full flex items-start gap-3 p-4 rounded-2xl border text-left transition-all duration-150',
                          selectedTemplate?.id === t.id
                            ? 'border-primary/40 bg-primary/5 ring-2 ring-primary/20'
                            : 'border-border/50 hover:border-border bg-background hover:bg-muted/20'
                        )}
                      >
                        <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-foreground truncate">{t.name}</p>
                          {t.description && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{t.description}</p>}
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {t.variables.slice(0, 5).map(v => (
                              <span key={v} className="text-[10px] font-mono bg-muted/60 text-foreground/70 px-1.5 py-0.5 rounded">{`{{${v}}}`}</span>
                            ))}
                            {t.variables.length > 5 && (
                              <span className="text-[10px] text-muted-foreground px-1">+{t.variables.length - 5} more</span>
                            )}
                          </div>
                        </div>
                        {selectedTemplate?.id === t.id && (
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-1" style={{ color: '#CCFF00' }} />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Step 2: Select User / Student ── */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Select a Student</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Student data will be used to auto-fill the template.</p>
                  </div>
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      placeholder="Search by name or email..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/60 bg-muted/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  {/* User list */}
                  {loadingUsers ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[42vh] overflow-y-auto pr-1">
                      {filteredUsers.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-xs">No users found</div>
                      )}
                      {filteredUsers.map(u => {
                        const app = getUserApplication(u.id)
                        return (
                          <button
                            key={u.id}
                            onClick={() => setSelectedUser(u)}
                            className={cn(
                              'w-full flex items-start gap-3 p-4 rounded-2xl border text-left transition-all duration-150',
                              selectedUser?.id === u.id
                                ? 'border-primary/40 bg-primary/5 ring-2 ring-primary/20'
                                : 'border-border/50 hover:border-border bg-background hover:bg-muted/20'
                            )}
                          >
                            <div className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center shrink-0 font-bold text-sm text-muted-foreground">
                              {u.firstName?.[0]?.toUpperCase()}{u.lastName?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-foreground">{u.firstName} {u.lastName}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                              <div className="flex flex-wrap gap-2 mt-1.5">
                                <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground">{u.role}</span>
                                {app?.passportNumber && (
                                  <span className="text-[10px] text-muted-foreground font-mono">Passport: {app.passportNumber}</span>
                                )}
                                {app?.hotelAssignment && (
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Hotel className="w-3 h-3" /> {app.hotelAssignment.hotel?.name}
                                  </span>
                                )}
                              </div>
                            </div>
                            {selectedUser?.id === u.id && (
                              <CheckCircle2 className="w-4 h-4 shrink-0 mt-1" style={{ color: '#CCFF00' }} />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Step 3: Select Hotel (Optional) ── */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Select a Hotel Property</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Optional – override hotel details for template variables like <span className="font-mono">{'{{hotelName}}'}</span>, <span className="font-mono">{'{{position}}'}</span>, etc.
                      {selectedUser && getUserApplication(selectedUser.id)?.hotelAssignment && (
                        <span className="block mt-1 text-green-600 font-semibold">
                          ✓ Student already has an assigned hotel. Skip this step or override below.
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Summary card */}
                  {selectedTemplate && selectedUser && (
                    <div className="p-4 rounded-2xl border border-border/50 bg-muted/10 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ready to generate</p>
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold">{selectedTemplate.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold">{selectedUser.firstName} {selectedUser.lastName}</span>
                        <span className="text-[10px] text-muted-foreground">{selectedUser.email}</span>
                      </div>
                      {selectedHotel && (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-xs font-semibold">{selectedHotel.name}</span>
                          <span className="text-[10px] text-muted-foreground">{selectedHotel.location}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      value={hotelSearch}
                      onChange={e => setHotelSearch(e.target.value)}
                      placeholder="Search hotels..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border/60 bg-muted/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  {/* Hotel list */}
                  {loadingHotels ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
                      {/* None option */}
                      <button
                        onClick={() => setSelectedHotel(null)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all duration-150',
                          !selectedHotel
                            ? 'border-primary/40 bg-primary/5 ring-2 ring-primary/20'
                            : 'border-border/50 hover:border-border bg-background hover:bg-muted/20'
                        )}
                      >
                        <div className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                          <X className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">No override</p>
                          <p className="text-xs text-muted-foreground">Use student's assigned hotel (if any)</p>
                        </div>
                        {!selectedHotel && <CheckCircle2 className="w-4 h-4 ml-auto shrink-0" style={{ color: '#CCFF00' }} />}
                      </button>

                      {filteredHotels.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground text-xs">No hotels found</div>
                      )}
                      {filteredHotels.map(h => (
                        <button
                          key={h.id}
                          onClick={() => setSelectedHotel(h)}
                          className={cn(
                            'w-full flex items-start gap-3 p-4 rounded-2xl border text-left transition-all duration-150',
                            selectedHotel?.id === h.id
                              ? 'border-primary/40 bg-primary/5 ring-2 ring-primary/20'
                              : 'border-border/50 hover:border-border bg-background hover:bg-muted/20'
                          )}
                        >
                          <div className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-foreground">{h.name}</p>
                            <p className="text-xs text-muted-foreground">{h.location}</p>
                            {h.address && <p className="text-[11px] text-muted-foreground/70 mt-0.5 line-clamp-1">{h.address}</p>}
                          </div>
                          {selectedHotel?.id === h.id && (
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-1" style={{ color: '#CCFF00' }} />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── Step 4: Review / Edit Variables ── */}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-foreground">Review & Edit Variables</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Verify auto-filled details or fill in custom variables before generating.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#CCFF0020] text-[#CCFF00] border border-[#CCFF0030]">
                      {selectedTemplate?.variables.length} placeholders
                    </span>
                  </div>

                  {/* Variables Grid */}
                  <div className="space-y-3 max-h-[42vh] overflow-y-auto pr-1">
                    {selectedTemplate?.variables.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground text-xs">
                        No variables detected in this template. Click "Download" to generate directly.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedTemplate?.variables.map(v => {
                          const autoMap = selectedUser ? buildVariableMap(
                            selectedUser,
                            getUserApplication(selectedUser.id),
                            selectedHotel || getUserApplication(selectedUser.id)?.hotelAssignment?.hotel || null
                          ) : {};
                          const isAutoFilled = autoMap[v] !== undefined && autoMap[v] !== '';

                          return (
                            <div key={v} className="p-3.5 rounded-2xl border border-border/40 bg-muted/10 space-y-1.5 flex flex-col justify-between">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-[11px] font-bold text-foreground/80 truncate">
                                  {`{{${v}}}`}
                                </span>
                                {isAutoFilled && (
                                  <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.2 rounded-full border border-emerald-500/20">
                                    Auto-filled
                                  </span>
                                )}
                              </div>
                              <input
                                value={variableValues[v] || ''}
                                onChange={e => setVariableValues(prev => ({ ...prev, [v]: e.target.value }))}
                                placeholder={`Value for ${v}...`}
                                className="w-full px-3 py-1.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-foreground"
                              />
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border/40 bg-muted/10 shrink-0">
            <button
              onClick={() => step > 1 ? setStep((step - 1) as 1 | 2 | 3 | 4) : onClose()}
              disabled={generating}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-muted/50 hover:bg-muted/80 transition-all disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              {step === 1 ? 'Cancel' : 'Back'}
            </button>

            {step < 4 ? (
              <button
                onClick={() => setStep((step + 1) as 2 | 3 | 4)}
                disabled={!canGoNext()}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                style={{ background: '#141414', color: '#CCFF00' }}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={generating || !selectedTemplate || !selectedUser}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                style={{ background: '#141414', color: '#CCFF00' }}
              >
                {generating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                ) : (
                  <><Download className="w-4 h-4" /> Download Document</>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DocumentTemplatesManager() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [showGenerate, setShowGenerate] = useState(false)
  const [selectedTemplateForGen, setSelectedTemplateForGen] = useState<Template | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    variables: [] as string[],
    fileUrl: '',
    fileName: '',
  })
  const [varInput, setVarInput] = useState('')
  const [fileStatus, setFileStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [fileProgress, setFileProgress] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    try {
      setLoading(true)
      const data = await documentTemplateService.getAll()
      setTemplates(data || [])
    } catch (e) {
      toast.error('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditingTemplate(null)
    setForm({ name: '', description: '', category: '', variables: [], fileUrl: '', fileName: '' })
    setVarInput('')
    setFileStatus('idle')
    setFileProgress(0)
    setShowDialog(true)
  }

  function openSystemTemplateCreate(type: string, label: string) {
    const existing = templates.find(t => t.category === type)
    if (existing) {
      openEdit(existing)
      return
    }
    setEditingTemplate(null)
    setForm({
      name: label,
      description: `Predefined system template for ${label}`,
      category: type,
      variables: [],
      fileUrl: '',
      fileName: '',
    })
    setVarInput('')
    setFileStatus('idle')
    setFileProgress(0)
    setShowDialog(true)
  }

  function openEdit(t: Template) {
    setEditingTemplate(t)
    setForm({
      name: t.name,
      description: t.description || '',
      category: t.category || '',
      variables: [...t.variables],
      fileUrl: t.fileUrl,
      fileName: t.fileName,
    })
    setVarInput('')
    setFileStatus('done')
    setFileProgress(100)
    setShowDialog(true)
  }

  async function handleFileSelect(file: File) {
    if (!file.name.endsWith('.docx')) {
      toast.error('Only .docx files are supported as templates')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File must be under 20MB')
      return
    }

    setFileStatus('uploading')
    setFileProgress(0)

    try {
      const reader = new FileReader()
      const arrayBufferPromise = new Promise<ArrayBuffer>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as ArrayBuffer)
        reader.onerror = () => reject(new Error('Failed to read file buffer'))
        reader.readAsArrayBuffer(file)
      })
      const arrayBuffer = await arrayBufferPromise

      const PizZip = (await import('pizzip')).default
      const zip = new PizZip(arrayBuffer)

      const xmlFiles = Object.keys(zip.files).filter(name => name.endsWith('.xml'))
      let fullText = ''
      for (const xmlFile of xmlFiles) {
        const fileContent = zip.files[xmlFile].asText()
        const cleanText = fileContent.replace(/<[^>]+>/g, '')
        fullText += ' ' + cleanText
      }

      const regex = /\{\{([^}]+)\}\}/g
      const extractedVars: string[] = []
      let match
      while ((match = regex.exec(fullText)) !== null) {
        const varName = match[1].trim().replace(/[^a-zA-Z0-9_]/g, '')
        if (varName && !extractedVars.includes(varName)) {
          extractedVars.push(varName)
        }
      }

      const { getSession } = await import('next-auth/react')
      const session = await getSession()
      const token = (session as any)?.backendToken || (session as any)?.user?.token || localStorage.getItem('token') || ''
      const result = await uploadFile(file, token, (p) => setFileProgress(p))

      setForm(prev => {
        const mergedVars = [...prev.variables]
        extractedVars.forEach(v => {
          if (!mergedVars.includes(v)) mergedVars.push(v)
        })
        return {
          ...prev,
          fileUrl: result.data.url,
          fileName: file.name,
          variables: mergedVars
        }
      })

      setFileStatus('done')
      if (extractedVars.length > 0) {
        toast.success(`Extracted ${extractedVars.length} variables: ${extractedVars.join(', ')}`)
      } else {
        toast.success('File uploaded successfully')
      }
    } catch (e: any) {
      setFileStatus('error')
      toast.error(e.message || 'Upload failed')
    }
  }

  function addVariable(v: string) {
    const trimmed = v.trim().replace(/[^a-zA-Z0-9_]/g, '')
    if (!trimmed || form.variables.includes(trimmed)) return
    setForm(prev => ({ ...prev, variables: [...prev.variables, trimmed] }))
    setVarInput('')
  }

  function removeVariable(v: string) {
    setForm(prev => ({ ...prev, variables: prev.variables.filter(x => x !== v) }))
  }

  async function handleSave() {
    if (!form.name.trim()) return toast.error('Template name is required')
    if (!form.fileUrl) return toast.error('Please upload a .docx template file')

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        fileUrl: form.fileUrl,
        fileName: form.fileName,
        variables: form.variables,
        category: form.category || undefined,
      }

      if (editingTemplate) {
        const updated = await documentTemplateService.update(editingTemplate.id, payload)
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? updated : t))
        toast.success('Template updated')
      } else {
        const created = await documentTemplateService.create(payload)
        setTemplates(prev => [created, ...prev])
        toast.success('Template created')
      }
      setShowDialog(false)
    } catch (e: any) {
      toast.error(e.message || 'Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await documentTemplateService.delete(id)
      setTemplates(prev => prev.filter(t => t.id !== id))
      setDeleteConfirm(null)
      toast.success('Template deleted')
    } catch (e) {
      toast.error('Failed to delete template')
    }
  }

  const categoryColor: Record<string, string> = {
    visa: 'bg-blue-500/10 text-blue-600',
    'work-permit': 'bg-purple-500/10 text-purple-600',
    'offer-letter': 'bg-green-500/10 text-green-600',
    travel: 'bg-sky-500/10 text-sky-600',
    hotel: 'bg-orange-500/10 text-orange-600',
    contract: 'bg-red-500/10 text-red-600',
    other: 'bg-gray-500/10 text-gray-600',

    UNSIGNED_CONTRACT: 'bg-violet-500/10 text-violet-600',
    CONTRACT_EXTRA_1: 'bg-fuchsia-500/10 text-fuchsia-600',
    CONTRACT_EXTRA_2: 'bg-fuchsia-500/10 text-fuchsia-600',
    CONTRACT_EXTRA_3: 'bg-fuchsia-500/10 text-fuchsia-600',
    PAYMENT1_DOCUMENT: 'bg-emerald-500/10 text-emerald-600',
    PAYMENT2_DOCUMENT: 'bg-emerald-500/10 text-emerald-600',
    PAYMENT3_DOCUMENT: 'bg-emerald-500/10 text-emerald-600',
  }

  return (
    <div className="space-y-10">

      {/* ── Generate Document Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border/50 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ background: 'linear-gradient(135deg, #141414 0%, #1a1a1a 100%)' }}
      >
        {/* Decorative glow */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: '#CCFF00' }} />

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: '#CCFF0015', border: '1px solid #CCFF0030' }}>
            <Wand2 className="w-5 h-5" style={{ color: '#CCFF00' }} />
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: '#CCFF00' }}>Generate a Filled Document</h3>
            <p className="text-xs mt-0.5" style={{ color: '#888' }}>
              Select a template, pick a student and hotel — download a fully auto-filled <span className="font-mono">.docx</span> instantly.
            </p>
          </div>
        </div>

        <button
          id="generate-document-btn"
          onClick={() => setShowGenerate(true)}
          disabled={templates.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shrink-0"
          style={{ background: '#CCFF00', color: '#141414' }}
        >
          <Wand2 className="w-4 h-4" />
          Generate Document
        </button>
      </motion.div>

      {/* Predefined System Templates */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="w-5 h-5" style={{ color: '#CCFF00' }} />
            System Document Templates
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Predefined document slots integrated directly with candidate application stages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {SYSTEM_TEMPLATES.map(slot => {
            const t = templates.find(item => item.category === slot.type)
            if (t) {
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative bg-background rounded-2xl border border-border/60 p-5 hover:border-border hover:shadow-md transition-all duration-200"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">{t.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{slot.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => { setSelectedTemplateForGen(t); setShowGenerate(true) }}
                        className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
                        title="Generate document from this template"
                        id={`gen-btn-${t.id}`}
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={t.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
                        title="Download template"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => openEdit(t)}
                        className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
                        title="Edit template"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(t.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-all"
                        title="Delete template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Badge */}
                  <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-3', categoryColor[t.category || ''] || categoryColor.other)}>
                    <Tag className="w-2.5 h-2.5" />
                    System Slot: {slot.label}
                  </span>

                  {/* Variables */}
                  {t.variables.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                        <Variable className="w-3 h-3" /> Variables ({t.variables.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {t.variables.slice(0, 6).map(v => (
                          <span key={v} className="text-[10px] font-mono font-semibold bg-muted/60 text-foreground px-2 py-0.5 rounded-md">
                            {`{{${v}}}`}
                          </span>
                        ))}
                        {t.variables.length > 6 && (
                          <span className="text-[10px] font-semibold text-muted-foreground px-2 py-0.5">
                            +{t.variables.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                    <p className="text-[10px] text-muted-foreground truncate max-w-[160px]">{t.fileName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Delete confirm overlay */}
                  <AnimatePresence>
                    {deleteConfirm === t.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-4 p-5"
                      >
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </div>
                        <p className="text-sm font-bold text-center">Delete &ldquo;{t.name}&rdquo;?</p>
                        <p className="text-xs text-muted-foreground text-center">This slot will become empty.</p>
                        <div className="flex gap-2">
                          <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-xl text-xs font-bold bg-muted/50 hover:bg-muted">Cancel</button>
                          <button onClick={() => handleDelete(t.id)} className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600">Delete</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            } else {
              // Empty dashed upload box
              return (
                <button
                  key={slot.type}
                  onClick={() => openSystemTemplateCreate(slot.type, slot.label)}
                  className="flex flex-col items-center justify-center text-center p-6 rounded-2xl border-2 border-dashed border-border/60 hover:border-primary/45 hover:bg-primary/5 transition-all duration-200 cursor-pointer min-h-[180px] bg-background w-full"
                >
                  <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-bold text-foreground">Upload {slot.label}</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">{slot.description}</p>
                </button>
              )
            }
          })}
        </div>
      </div>

      <hr className="border-border/40" />

      {/* Custom templates section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <FolderOpen className="w-5 h-5" style={{ color: '#CCFF00' }} />
              Custom Document Templates
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create and manage other reusable custom templates.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md cursor-pointer"
            style={{ background: '#141414', color: '#CCFF00' }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Custom Template
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (() => {
          const customTemplates = templates.filter(t => !SYSTEM_TEMPLATES.some(s => s.type === t.category))
          if (customTemplates.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center py-12 rounded-2xl border-2 border-dashed border-border/40 bg-muted/10">
                <FolderOpen className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-xs font-semibold text-muted-foreground">No custom templates yet</p>
              </div>
            )
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence>
                {customTemplates.map((t) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative bg-background rounded-2xl border border-border/60 p-5 hover:border-border hover:shadow-md transition-all duration-200"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-foreground truncate">{t.name}</p>
                          {t.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{t.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => { setSelectedTemplateForGen(t); setShowGenerate(true) }}
                          className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
                          title="Generate document from this template"
                          id={`gen-custom-btn-${t.id}`}
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={t.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
                          title="Download template"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => openEdit(t)}
                          className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(t.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Category badge */}
                    {t.category && (
                      <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-3', categoryColor[t.category] || categoryColor.other)}>
                        <Tag className="w-2.5 h-2.5" />
                        {CATEGORIES.find(c => c.value === t.category)?.label || t.category}
                      </span>
                    )}

                    {/* Variables */}
                    {t.variables.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                          <Variable className="w-3 h-3" /> Variables ({t.variables.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {t.variables.slice(0, 6).map(v => (
                            <span key={v} className="text-[10px] font-mono font-semibold bg-muted/60 text-foreground px-2 py-0.5 rounded-md">
                              {`{{${v}}}`}
                            </span>
                          ))}
                          {t.variables.length > 6 && (
                            <span className="text-[10px] font-semibold text-muted-foreground px-2 py-0.5">
                              +{t.variables.length - 6} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                      <p className="text-[10px] text-muted-foreground truncate max-w-[160px]">{t.fileName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Delete confirm overlay */}
                    <AnimatePresence>
                      {deleteConfirm === t.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-4 p-5"
                        >
                          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <Trash2 className="w-5 h-5 text-red-500" />
                          </div>
                          <p className="text-sm font-bold text-center">Delete &ldquo;{t.name}&rdquo;?</p>
                          <p className="text-xs text-muted-foreground text-center">This cannot be undone.</p>
                          <div className="flex gap-2">
                            <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-xl text-xs font-bold bg-muted/50 hover:bg-muted">Cancel</button>
                            <button onClick={() => handleDelete(t.id)} className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600">Delete</button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )
        })()}
      </div>

      {/* Create / Edit Dialog */}
      <AnimatePresence>
        {showDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !saving && setShowDialog(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="pointer-events-auto w-full max-w-xl bg-background rounded-3xl border border-border/60 shadow-2xl overflow-hidden"
              >
                {/* Dialog Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border/40" style={{ background: '#141414' }}>
                  <div>
                    <h2 className="text-base font-bold" style={{ color: '#CCFF00' }}>
                      {editingTemplate ? 'Edit Template' : 'New Document Template'}
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: '#555' }}>
                      Upload a .docx file with {`{{variable}}`} placeholders
                    </p>
                  </div>
                  {!saving && (
                    <button onClick={() => setShowDialog(false)} className="p-2 rounded-xl hover:bg-white/10 transition-all">
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Dialog Body */}
                <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                  {(() => {
                    const isSystemSlot = SYSTEM_TEMPLATES.some(s => s.type === form.category);
                    return isSystemSlot ? (
                      <div className="p-3 bg-primary/10 border border-primary/20 rounded-2xl text-xs font-semibold text-foreground flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-primary shrink-0" />
                        This is a predefined system template slot. The template name and category are managed automatically.
                      </div>
                    ) : null;
                  })()}

                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Template Name *</label>
                    <input
                      value={form.name}
                      onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Visa Approval Letter"
                      disabled={SYSTEM_TEMPLATES.some(s => s.type === form.category)}
                      className="w-full px-4 py-3 rounded-xl border border-border/60 bg-muted/20 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</label>
                    <input
                      value={form.description}
                      onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Optional description..."
                      className="w-full px-4 py-3 rounded-xl border border-border/60 bg-muted/20 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category</label>
                    <select
                      value={form.category}
                      onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                      disabled={SYSTEM_TEMPLATES.some(s => s.type === form.category)}
                      className="w-full px-4 py-3 rounded-xl border border-border/60 bg-muted/20 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      <option value="">— Select category —</option>
                      {CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                      {SYSTEM_TEMPLATES.some(s => s.type === form.category) && (
                        <option value={form.category}>
                          {SYSTEM_TEMPLATES.find(s => s.type === form.category)?.label}
                        </option>
                      )}
                    </select>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Template File (.docx) *</label>
                    <input
                      type="file"
                      ref={fileRef}
                      accept=".docx"
                      className="hidden"
                      onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    />

                    {fileStatus === 'idle' && (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center gap-3 py-8 rounded-2xl border-2 border-dashed border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                          <Upload className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-foreground">Click to upload .docx template</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Use {`{{variableName}}`} syntax in your Word doc</p>
                        </div>
                      </button>
                    )}

                    {fileStatus === 'uploading' && (
                      <div className="flex flex-col items-center gap-3 py-8 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <div className="w-full max-w-xs">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${fileProgress}%` }} />
                          </div>
                          <p className="text-xs text-muted-foreground text-center mt-1">Uploading... {fileProgress}%</p>
                        </div>
                      </div>
                    )}

                    {fileStatus === 'done' && (
                      <div className="flex items-center gap-3 p-4 rounded-xl border border-green-500/20 bg-green-500/5">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground truncate">{form.fileName}</p>
                          <p className="text-xs text-muted-foreground">Template file ready</p>
                        </div>
                        <button
                          onClick={() => { setForm(prev => ({ ...prev, fileUrl: '', fileName: '' })); setFileStatus('idle') }}
                          className="p-1 rounded-lg hover:bg-muted/50 text-muted-foreground"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {fileStatus === 'error' && (
                      <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                        <p className="text-sm text-red-600">Upload failed. <button onClick={() => setFileStatus('idle')} className="underline">Try again</button></p>
                      </div>
                    )}
                  </div>

                  {/* Variables */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <Variable className="w-3 h-3" />
                      Define Variables
                    </label>
                    <p className="text-[11px] text-muted-foreground">
                      List all {`{{variable}}`} names used in your Word template. These become form fields when generating the document.
                    </p>

                    {/* Variable input */}
                    <div className="flex gap-2">
                      <input
                        value={varInput}
                        onChange={e => setVarInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addVariable(varInput) } }}
                        placeholder="e.g. studentName"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-border/60 bg-muted/20 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => addVariable(varInput)}
                        className="px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
                        style={{ background: '#141414', color: '#CCFF00' }}
                      >
                        Add
                      </button>
                    </div>

                    {/* Current variables */}
                    {form.variables.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-muted/20 rounded-xl border border-border/40">
                        {form.variables.map(v => (
                          <span key={v} className="inline-flex items-center gap-1.5 bg-background border border-border/60 text-xs font-mono font-semibold px-2.5 py-1 rounded-lg">
                            {`{{${v}}}`}
                            <button onClick={() => removeVariable(v)} className="text-muted-foreground hover:text-red-500 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Suggestions */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Quick add suggestions</p>
                      <div className="flex flex-wrap gap-1.5">
                        {SUGGESTED_VARIABLES.filter(s => !form.variables.includes(s)).slice(0, 12).map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => addVariable(s)}
                            className="text-[10px] font-mono font-semibold bg-muted/40 hover:bg-muted/70 text-muted-foreground hover:text-foreground px-2 py-1 rounded-md transition-all"
                          >
                            +{s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dialog Footer */}
                <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border/40 bg-muted/10">
                  <button
                    onClick={() => !saving && setShowDialog(false)}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold bg-muted/50 hover:bg-muted/80 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !form.name || !form.fileUrl}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    style={{ background: '#141414', color: '#CCFF00' }}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {saving ? 'Saving...' : editingTemplate ? 'Save Changes' : 'Create Template'}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Generate Document Modal */}
      <AnimatePresence>
        {showGenerate && (
          <GenerateDocumentModal
            templates={templates}
            onClose={() => { setShowGenerate(false); setSelectedTemplateForGen(null) }}
            initialTemplate={selectedTemplateForGen}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
