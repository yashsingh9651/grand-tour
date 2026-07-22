'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { WorkflowStep, WorkflowField, FieldType } from '@/lib/workflow-schema'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import UploadPopup from '@/components/UploadPopup'
import { applicationPageContentService } from '@/lib/services/api.service'
import { ApplicationPageContentEditor } from '@/components/admin/application-page-content-editor'
import { toast } from 'sonner'
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Settings2, 
  X, 
  Layout, 
  Type, 
  ChevronDown, 
  ChevronUp,
  Save,
  Calendar,
  CheckCircle,
  FileText,
  Hash,
  Upload,
  CreditCard,
  Eye,
  Sliders,
  Sparkles
} from 'lucide-react'

const FIELD_TYPES: { value: FieldType; label: string; icon: any }[] = [
  { value: 'text', label: 'Short Text', icon: Type },
  { value: 'textarea', label: 'Long Text', icon: Layout },
  { value: 'select', label: 'Dropdown', icon: ChevronDown },
  { value: 'checkbox', label: 'Checkbox', icon: CheckCircle },
  { value: 'date', label: 'Date', icon: Calendar },
  { value: 'number', label: 'Number', icon: Hash },
  { value: 'file', label: 'File Upload', icon: Upload },
]

const generateUniqueId = (prefix: string) => {
  return `${prefix}-${Date.now()}`
}

const DOCX_PRESET_FIELDS: { label: string; type: FieldType; key: string; placeholder: string; options?: string[] }[] = [
  { label: 'Passport Number', type: 'text', key: 'studentPassportNumber', placeholder: 'e.g. A1234567' },
  { label: 'College / Institution', type: 'text', key: 'collegeName', placeholder: 'e.g. IHM Delhi' },
  { label: 'Degree / Course Name', type: 'text', key: 'degreeName', placeholder: 'e.g. B.Sc Hospitality' },
  { label: 'Current Year of Study', type: 'select', key: 'yearOfDegree', placeholder: 'Select Year', options: ['1st Year', '2nd Year', '3rd Year', '4th Year'] },
  { label: 'Financial Sponsor Name', type: 'text', key: 'sponsorName', placeholder: 'e.g. Robert Morgan' },
  { label: 'Sponsor Relationship', type: 'select', key: 'sponsorRelationToStudent', placeholder: 'Select Relationship', options: ['Father', 'Mother', 'Guardian', 'Self'] },
  { label: 'Internship Duration', type: 'select', key: 'internshipDuration', placeholder: 'Select Duration', options: ['3 Months', '6 Months', '12 Months'] },
]


function convertPageBlocksToWorkflowFields(blocks: any[]): WorkflowField[] {
  if (!Array.isArray(blocks)) return []
  return blocks.map((block: any, idx: number) => {
    if (block.type === 'section') {
      return {
        id: block.id || `sec-${idx}`,
        type: 'section' as FieldType,
        name: block.label || block.section || 'Section',
        required: false,
        order: block.order || idx + 1,
      }
    }
    return {
      id: block.id || `field-${idx}`,
      type: (block.type === 'upload' ? 'file' : block.type || 'text') as FieldType,
      name: block.label || block.fieldKey || 'Field',
      required: Boolean(block.required),
      placeholder: block.placeholder || '',
      options: Array.isArray(block.options) ? block.options : [],
      order: block.order || idx + 1,
    }
  })
}

function convertWorkflowFieldsToPageBlocks(fields: WorkflowField[]): any[] {
  let currentSectionName = 'General Information'
  let orderCounter = 1
  const blocks: any[] = []

  ;(fields || []).forEach((field: any) => {
    if (field.type === 'section') {
      currentSectionName = field.name || field.label || 'Section'
      blocks.push({
        id: field.id || `section-${orderCounter}`,
        type: 'section',
        label: currentSectionName,
        section: currentSectionName,
        column: 'left',
        order: orderCounter++,
        enabled: true,
      })
    } else {
      const sanitizedKey = (field.name || field.id || `field_${orderCounter}`)
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, '')
      blocks.push({
        id: field.id || `field-${orderCounter}`,
        type: field.type === 'file' ? 'upload' : (field.type || 'text'),
        label: field.name || 'Field',
        fieldKey: sanitizedKey,
        placeholder: field.placeholder || '',
        section: currentSectionName,
        column: 'left',
        order: orderCounter++,
        required: Boolean(field.required),
        options: Array.isArray(field.options) ? field.options : [],
        enabled: true,
      })
    }
  })

  return blocks
}

interface StepEditorProps {
  step: WorkflowStep
  onSave: (step: WorkflowStep) => void
  onCancel: () => void
}


export function StepEditor({ step, onSave, onCancel }: StepEditorProps) {
  const { data: session } = useSession()
  const [name, setName] = useState(step.name)
  const [description, setDescription] = useState(step.description || '')
  const [fields, setFields] = useState<WorkflowField[]>(step.fields || [])
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
  const [isInterviewStep, setIsInterviewStep] = useState(step.isInterviewStep || false)
  const [isQrUploadOpen, setIsQrUploadOpen] = useState(false)
  const [isTemplateUploadOpen, setIsTemplateUploadOpen] = useState(false)
  
  // Payment configuration state
  const [isPaymentStep, setIsPaymentStep] = useState(step.isPaymentStep || false)
  const [amount, setAmount] = useState(step.amount || 0)
  const [gstPercentage, setGstPercentage] = useState(step.gstPercentage || 18)
  const [discountPercentage, setDiscountPercentage] = useState(step.discountPercentage || 0)
  const [paymentConfig, setPaymentConfig] = useState<any>(step.paymentConfig || {
    accountName: '',
    accountNumber: '',
    ifsc: '',
    bankName: '',
    currency: 'INR',
    merchant: '',
    reference: '',
    qrCodeUrl: ''
  })

  // Contract configuration state
  const [isContractStep, setIsContractStep] = useState(step.isContractStep || false)
  const [contractConfig, setContractConfig] = useState<any>(step.contractConfig || {
    templateUrl: '',
    contractTitle: 'Convention'

  })

  const handleQrUploadComplete = (doc: any) => {
    const uploadedUrl = doc.url || doc.data?.url || ''
    if (uploadedUrl) {
      setPaymentConfig((prev: any) => ({ ...prev, qrCodeUrl: uploadedUrl }))
    }
  }

  // Group fields by sections for visual representation
  const sections: { id: string; name: string; fields: WorkflowField[] }[] = []
  let currentSec: any = null

  fields.forEach(f => {
    if (f.type === 'section') {
      currentSec = { id: f.id, name: f.name, fields: [] }
      sections.push(currentSec)
    } else {
      if (!currentSec) {
        currentSec = { id: 'default', name: 'General Information', fields: [] }
        sections.push(currentSec)
      }
      currentSec.fields.push(f)
    }
  })

  const handleAddSection = () => {
    const newSection: WorkflowField = {
      id: generateUniqueId('sec'),
      type: 'section',
      name: 'New Section',
      required: false,
      order: fields.length + 1,
    }
    setFields([...fields, newSection])
  }

  const handleAddField = (sectionId: string, type: FieldType) => {
    const newField: WorkflowField = {
      id: generateUniqueId('field'),
      type,
      name: `New ${type} field`,
      required: false,
      order: fields.length + 1,
    }
    
    // Find the section and insert after its last field
    const sectionIdx = fields.findIndex(f => f.id === sectionId)
    if (sectionIdx === -1) {
      setFields([...fields, newField])
    } else {
      // Find the last field in this section
      let lastIdx = sectionIdx
      for (let i = sectionIdx + 1; i < fields.length; i++) {
        if (fields[i].type === 'section') break
        lastIdx = i
      }
      const newFields = [...fields]
      newFields.splice(lastIdx + 1, 0, newField)
      setFields(newFields)
    }
    setEditingFieldId(newField.id)
  }

  const handleDeleteField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id))
  }

  const handleUpdateField = (id: string, updates: Partial<WorkflowField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)))
  }

  const handleAddPresetField = (preset: typeof DOCX_PRESET_FIELDS[0]) => {
    const exists = fields.some(f => f.name?.toLowerCase().includes(preset.label.toLowerCase()) || f.id === preset.key)
    if (exists) {
      toast.info(`Field "${preset.label}" is already in your form!`)
      return
    }

    const newField: WorkflowField = {
      id: preset.key,
      type: preset.type,
      name: preset.label,
      required: true,
      placeholder: preset.placeholder,
      options: preset.options,
      order: fields.length + 1,
    }

    setFields([...fields, newField])
    toast.success(`Added preset field "${preset.label}" for .docx template matching!`)
  }


  const isApplicationStep = step.id === 'application' || step.id === 'applications' || (name || '').toLowerCase().includes('application')

  const [viewMode, setViewMode] = useState<'quick' | 'builder'>('quick')

  useEffect(() => {
    if (isApplicationStep) {
      applicationPageContentService.get('application')
        .then((contentData: any) => {
          if (contentData?.blocks && Array.isArray(contentData.blocks) && contentData.blocks.length > 0) {
            const syncedFields = convertPageBlocksToWorkflowFields(contentData.blocks)
            if (syncedFields.length > 0) {
              setFields(syncedFields)
            }
          }
        })
        .catch(() => {})
    }
  }, [isApplicationStep])

  const handleSave = async () => {
    const updatedStep = {
      ...step, 
      name, 
      description, 
      fields, 
      isInterviewStep,
      isPaymentStep,
      amount,
      gstPercentage,
      discountPercentage,
      paymentConfig,
      isContractStep,
      contractConfig
    }

    if (isApplicationStep) {
      try {
        const pageBlocks = convertWorkflowFieldsToPageBlocks(fields)
        await applicationPageContentService.update('application', {
          title: name,
          subtitle: description,
          blocks: pageBlocks,
        })
        toast.success('Synced step with Student Application Form!')
      } catch (error) {
        console.error('Failed to sync page content:', error)
      }
    }

    onSave(updatedStep)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Step Designer</h2>
            {isApplicationStep && (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                Synced with Student Step 1
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-lg">Configure sections and fields for &ldquo;{name}&rdquo;</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isApplicationStep && (
            <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl border border-slate-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setViewMode('quick')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'quick' ? 'bg-white shadow text-slate-900' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" /> Fields & Settings
              </button>
              <button
                type="button"
                onClick={() => setViewMode('builder')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'builder' ? 'bg-white shadow text-slate-900' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-emerald-600" /> Live Student Builder & Preview
              </button>
            </div>
          )}

          <Button variant="outline" onClick={onCancel} className="px-6">Cancel</Button>
          <Button onClick={handleSave} className="px-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>

      {viewMode === 'builder' && isApplicationStep ? (
        <div className="space-y-4">
          <Card className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Using Live Student Application Page Builder. Any changes saved here update the student-facing Step 1 form in real-time.</span>
          </Card>
          <ApplicationPageContentEditor />
        </div>
      ) : (
        <>
          <Card className="p-8 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 border-primary/10 shadow-sm">

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">Step Name</label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="bg-background/50 backdrop-blur-sm border-2 focus:border-primary text-lg h-12"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">Help Text / Description</label>
            <Input 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="bg-background/50 backdrop-blur-sm border-2 focus:border-primary text-lg h-12"
            />
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" />
              <div>
                <p className="font-bold text-foreground">Is this an Interview Step?</p>
                <p className="text-xs text-muted-foreground">This will enable the custom interview slot booking for this stage.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isInterviewStep} 
                  onChange={(e) => {
                    setIsInterviewStep(e.target.checked)
                    if (e.target.checked) setIsPaymentStep(false)
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-emerald-600" />
              <div>
                <p className="font-bold text-emerald-900">Is this a Payment Step?</p>
                <p className="text-xs text-emerald-700">This will enable the dynamic payment collection interface.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isPaymentStep} 
                  onChange={(e) => {
                    setIsPaymentStep(e.target.checked)
                    if (e.target.checked) { setIsInterviewStep(false); setIsContractStep(false); }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-emerald-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-emerald-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-amber-600" />
              <div>
                <p className="font-bold text-amber-900">Is this a Contract Step?</p>
                <p className="text-xs text-amber-700">Enables dynamic .docx contract generation and signing interface.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isContractStep} 
                  onChange={(e) => {
                    setIsContractStep(e.target.checked)
                    if (e.target.checked) { setIsInterviewStep(false); setIsPaymentStep(false); }
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-amber-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-500/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-amber-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
          </div>
        </div>
      </Card>

      {isPaymentStep ? (
        <Card className="p-8 border-2 border-emerald-500/20 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-emerald-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            Payment Configuration
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">Base Amount (₹)</label>
              <Input 
                type="number"
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))} 
                className="bg-background border-2 h-11 focus:border-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">GST Percentage (%)</label>
              <Input 
                type="number"
                value={gstPercentage} 
                onChange={(e) => setGstPercentage(Number(e.target.value))} 
                className="bg-background border-2 h-11 focus:border-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">Discount (%)</label>
              <Input 
                type="number"
                value={discountPercentage} 
                onChange={(e) => setDiscountPercentage(Number(e.target.value))} 
                className="bg-background border-2 h-11 focus:border-emerald-500"
              />
            </div>
          </div>
          
          <div className="pt-4 border-t border-border">
            <h4 className="font-semibold text-foreground mb-4">Bank Transfer Details</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">Account Name</label>
                <Input 
                  value={paymentConfig.accountName} 
                  onChange={(e) => setPaymentConfig({...paymentConfig, accountName: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">Account Number</label>
                <Input 
                  value={paymentConfig.accountNumber} 
                  onChange={(e) => setPaymentConfig({...paymentConfig, accountNumber: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">IFSC Code</label>
                <Input 
                  value={paymentConfig.ifsc} 
                  onChange={(e) => setPaymentConfig({...paymentConfig, ifsc: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">Bank Name</label>
                <Input 
                  value={paymentConfig.bankName} 
                  onChange={(e) => setPaymentConfig({...paymentConfig, bankName: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">Currency</label>
                <Input
                  value={paymentConfig.currency || 'INR'}
                  onChange={(e) => setPaymentConfig({...paymentConfig, currency: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">Merchant Name</label>
                <Input
                  value={paymentConfig.merchant || ''}
                  onChange={(e) => setPaymentConfig({...paymentConfig, merchant: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">Reference / Notes</label>
                <Input
                  value={paymentConfig.reference || ''}
                  onChange={(e) => setPaymentConfig({...paymentConfig, reference: e.target.value})}
                />
              </div>
              <div className="md:col-span-2 space-y-2 mt-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-bold text-muted-foreground flex items-center justify-between">
                    <span>Custom QR Code Image URL</span>
                    <span className="text-[10px] text-muted-foreground/60 font-normal ml-3">Optional (overrides dynamic QR)</span>
                  </label>
                  <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setIsQrUploadOpen(true)}>
                    <Upload className="w-4 h-4" />
                    Upload QR Image
                  </Button>
                </div>
                <Input 
                  placeholder="https://example.com/my-qr-code.png"
                  value={paymentConfig.qrCodeUrl || ''} 
                  onChange={(e) => setPaymentConfig({...paymentConfig, qrCodeUrl: e.target.value})} 
                />
                {paymentConfig.qrCodeUrl && (
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 flex items-center gap-3">
                    <img src={paymentConfig.qrCodeUrl} alt="QR Preview" className="w-16 h-16 rounded-lg border border-emerald-200 bg-white object-contain" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-900">QR preview ready</p>
                      <p className="text-xs text-emerald-700">This image will be shown on the student payment screen.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <UploadPopup
            isOpen={isQrUploadOpen}
            onClose={() => setIsQrUploadOpen(false)}
            onUploadComplete={handleQrUploadComplete}
            token={(session as any)?.backendToken || ''}
            documentType="payment_qr"
            documentName="Payment QR Image"
          />
        </Card>
      ) : isContractStep ? (
        <Card className="p-8 border-2 border-amber-500/20 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            Contract Configuration
          </h3>
          <div className="grid gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">Contract Document Title</label>
              <Input 
                value={contractConfig.contractTitle || ''} 
                onChange={(e) => setContractConfig({...contractConfig, contractTitle: e.target.value})} 
                className="bg-background border-2 h-11 focus:border-amber-500"
                placeholder="e.g. Internship Contract Agreement"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Template Document (.docx) URL
                </label>
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => setIsTemplateUploadOpen(true)}>
                  <Upload className="w-4 h-4" />
                  Upload Template
                </Button>
              </div>
              <Input 
                value={contractConfig.templateUrl || ''} 
                onChange={(e) => setContractConfig({...contractConfig, templateUrl: e.target.value})} 
                className="bg-background border-2 h-11 focus:border-amber-500"
                placeholder="https://example.com/contract-template.docx"
              />
              <p className="text-xs text-muted-foreground ml-1 mt-2">
                This template should contain tags like <code className="bg-muted px-1 py-0.5 rounded text-amber-700">{`{firstName}`}</code>, <code className="bg-muted px-1 py-0.5 rounded text-amber-700">{`{lastName}`}</code>, <code className="bg-muted px-1 py-0.5 rounded text-amber-700">{`{collegeName}`}</code> which will be replaced automatically.
              </p>
            </div>
          </div>
          
          <UploadPopup
            isOpen={isTemplateUploadOpen}
            onClose={() => setIsTemplateUploadOpen(false)}
            onUploadComplete={(doc: any) => {
              const uploadedUrl = doc.url || doc.data?.url || ''
              if (uploadedUrl) {
                setContractConfig((prev: any) => ({ ...prev, templateUrl: uploadedUrl }))
              }
            }}
            token={(session as any)?.backendToken || ''}
            documentType="contract_template"
            documentName="Contract Template (.docx)"
          />

          <div className="pt-6 border-t border-border space-y-4">
            <h4 className="font-semibold text-foreground">Additional Documents</h4>
            <p className="text-sm text-muted-foreground">
              If the user needs to upload additional documents along with the signed contract (e.g. Bank Details, Parent Consent), you can add them below as <strong>File Upload</strong> fields. The contract download and upload UI is handled automatically above these fields.
            </p>
            
            <Button onClick={handleAddSection} variant="outline" className="border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 text-primary gap-2 w-full mt-2">
              <Plus className="w-4 h-4" />
              Add Extra Form Fields / Document Uploads
            </Button>
          </div>

          {/* 📄 .docx Travel Template Presets Helper Box */}
          {isApplicationStep && (
            <Card className="p-5 bg-gradient-to-br from-violet-50/80 via-white to-indigo-50/50 border border-violet-200 shadow-sm space-y-3">

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-violet-600" />
                  <h4 className="font-bold text-violet-950 text-sm">Recommended Presets for 1-Click .docx Document Auto-Generation</h4>
                </div>
                <span className="text-[10px] font-extrabold uppercase bg-violet-100 text-violet-800 px-2 py-0.5 rounded border border-violet-200">
                  Click to Add
                </span>
              </div>
              <p className="text-xs text-violet-800/80 leading-relaxed">
                Click any preset button below to automatically insert the standardized form field. This guarantees that student data collected in Step 1 maps cleanly into the 4 official Travel & Visa .docx templates!
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {DOCX_PRESET_FIELDS.map((preset) => (
                  <Button
                    key={preset.key}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddPresetField(preset)}
                    className="gap-1.5 bg-white hover:bg-violet-50 text-violet-900 border-violet-200 text-xs font-semibold shadow-2xs transition-all hover:scale-102"
                  >
                    <Plus className="w-3.5 h-3.5 text-violet-600" />
                    {preset.label}
                  </Button>
                ))}
              </div>
            </Card>
          )}

          {sections.length > 0 && (
            <div className="space-y-6 mt-6">

              {sections.map((section) => (
                <div key={section.id} className="space-y-4 group">
                  <Card className="overflow-hidden border-2 border-primary/20 shadow-md">
                    <div className="bg-primary/5 p-4 flex items-center justify-between border-b border-primary/10">
                      <div className="flex items-center gap-3 flex-1">
                        <GripVertical className="w-5 h-5 text-primary/40 cursor-grab" />
                        {section.id === 'default' ? (
                          <h4 className="font-bold text-primary">{section.name}</h4>
                        ) : (
                          <Input 
                            value={section.name} 
                            onChange={(e) => handleUpdateField(section.id, { name: e.target.value })}
                            className="bg-transparent border-none font-bold text-primary p-0 h-auto focus-visible:ring-0 text-lg max-w-sm"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1 mr-4">
                          {FIELD_TYPES.map(type => (
                            <Button
                              key={type.value}
                              variant="ghost"
                              size="icon"
                              title={`Add ${type.label}`}
                              onClick={() => handleAddField(section.id, type.value)}
                              className="w-8 h-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all"
                            >
                              <type.icon className="w-4 h-4" />
                            </Button>
                          ))}
                        </div>
                        {section.id !== 'default' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteField(section.id)}
                            className="text-muted-foreground hover:text-red-600 h-8 w-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-4 min-h-[50px]">
                      {section.fields.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-8 border-2 border-dashed border-muted/50 rounded-xl">
                          No fields in this section. Use the icons above to add inputs.
                        </p>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                          {section.fields.map(field => (
                            <Card key={field.id} className={`p-4 transition-all duration-300 ${editingFieldId === field.id ? 'ring-2 ring-primary bg-primary/5 shadow-lg scale-[1.01]' : 'hover:border-primary/40 hover:bg-accent/5'}`}>
                              {editingFieldId === field.id ? (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary px-2 py-1 bg-primary/10 rounded-full">
                                      Configuring {field.type}
                                    </span>
                                    <Button variant="ghost" size="sm" onClick={() => setEditingFieldId(null)} className="h-6 w-6 p-0 rounded-full">
                                      <CheckCircle className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <div className="space-y-3">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-muted-foreground ml-1">LABEL</label>
                                      <Input 
                                        value={field.name} 
                                        onChange={(e) => handleUpdateField(field.id, { name: e.target.value })}
                                        className="h-9 bg-background"
                                        placeholder="Field label..."
                                      />
                                    </div>
                                    <div className="flex items-center gap-4 pt-1">
                                      <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input 
                                          type="checkbox" 
                                          checked={field.required} 
                                          onChange={(e) => handleUpdateField(field.id, { required: e.target.checked })}
                                          className="w-4 h-4 accent-primary rounded"
                                        />
                                        <span className="text-xs font-bold text-foreground">Required</span>
                                      </label>
                                    </div>
                                    {field.type === 'select' && (
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-muted-foreground ml-1">OPTIONS (COMMA SEPARATED)</label>
                                        <Input 
                                          value={field.options?.join(', ') || ''} 
                                          onChange={(e) => handleUpdateField(field.id, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                          className="h-9 bg-background"
                                          placeholder="Opt 1, Opt 2, Opt 3..."
                                        />
                                      </div>
                                    )}
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-muted-foreground ml-1">PLACEHOLDER</label>
                                      <Input 
                                        value={field.placeholder || ''} 
                                        onChange={(e) => handleUpdateField(field.id, { placeholder: e.target.value })}
                                        className="h-9 bg-background"
                                        placeholder="Hint text..."
                                      />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-secondary rounded-lg text-primary">
                                      {FIELD_TYPES.find(t => t.value === field.type)?.icon && (
                                        <div className="w-4 h-4">
                                          {(() => {
                                            const Icon = FIELD_TYPES.find(t => t.value === field.type)?.icon as any
                                            return <Icon className="w-full h-full" />
                                          })()}
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-bold text-sm text-foreground truncate">{field.name}</p>
                                      <div className="flex gap-2 mt-1">
                                        <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-tighter">{field.type}</span>
                                        {field.required && <span className="text-[9px] font-bold uppercase text-red-500 tracking-tighter">Required</span>}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" onClick={() => setEditingFieldId(field.id)} className="h-8 w-8">
                                      <Settings2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteField(field.id)} className="h-8 w-8 hover:text-red-600">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : !isInterviewStep ? (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Layout className="w-5 h-5 text-primary" />
              Step Structure
            </h3>
            <Button onClick={handleAddSection} variant="outline" className="border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 text-primary gap-2">
              <Plus className="w-4 h-4" />
              Add New Section
            </Button>
          </div>

          {sections.length === 0 ? (
            <Card className="p-16 text-center border-2 border-dashed border-muted bg-muted/5">
              <div className="max-w-xs mx-auto space-y-4">
                <Layout className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                <p className="text-muted-foreground font-medium">Your step has no structure yet. Start by adding a section.</p>
                <Button onClick={handleAddSection} className="w-full">Initialize First Section</Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-10">
              {sections.map((section) => (
                <div key={section.id} className="space-y-4 group">
                  <Card className="overflow-hidden border-2 border-primary/20 shadow-md">
                    <div className="bg-primary/5 p-4 flex items-center justify-between border-b border-primary/10">
                      <div className="flex items-center gap-3 flex-1">
                        <GripVertical className="w-5 h-5 text-primary/40 cursor-grab" />
                        {section.id === 'default' ? (
                          <h4 className="font-bold text-primary">{section.name}</h4>
                        ) : (
                          <Input 
                            value={section.name} 
                            onChange={(e) => handleUpdateField(section.id, { name: e.target.value })}
                            className="bg-transparent border-none font-bold text-primary p-0 h-auto focus-visible:ring-0 text-lg max-w-sm"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1 mr-4">
                          {FIELD_TYPES.map(type => (
                            <Button
                              key={type.value}
                              variant="ghost"
                              size="icon"
                              title={`Add ${type.label}`}
                              onClick={() => handleAddField(section.id, type.value)}
                              className="w-8 h-8 rounded-full hover:bg-primary/10 hover:text-primary transition-all"
                            >
                              <type.icon className="w-4 h-4" />
                            </Button>
                          ))}
                        </div>
                        {section.id !== 'default' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteField(section.id)}
                            className="text-muted-foreground hover:text-red-600 h-8 w-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-4 min-h-[50px]">
                      {section.fields.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-8 border-2 border-dashed border-muted/50 rounded-xl">
                          No fields in this section. Use the icons above to add inputs.
                        </p>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                          {section.fields.map(field => (
                            <Card key={field.id} className={`p-4 transition-all duration-300 ${editingFieldId === field.id ? 'ring-2 ring-primary bg-primary/5 shadow-lg scale-[1.01]' : 'hover:border-primary/40 hover:bg-accent/5'}`}>
                              {editingFieldId === field.id ? (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary px-2 py-1 bg-primary/10 rounded-full">
                                      Configuring {field.type}
                                    </span>
                                    <Button variant="ghost" size="sm" onClick={() => setEditingFieldId(null)} className="h-6 w-6 p-0 rounded-full">
                                      <CheckCircle className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <div className="space-y-3">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-muted-foreground ml-1">LABEL</label>
                                      <Input 
                                        value={field.name} 
                                        onChange={(e) => handleUpdateField(field.id, { name: e.target.value })}
                                        className="h-9 bg-background"
                                        placeholder="Field label..."
                                      />
                                    </div>
                                    <div className="flex items-center gap-4 pt-1">
                                      <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input 
                                          type="checkbox" 
                                          checked={field.required} 
                                          onChange={(e) => handleUpdateField(field.id, { required: e.target.checked })}
                                          className="w-4 h-4 accent-primary rounded"
                                        />
                                        <span className="text-xs font-bold text-foreground">Required</span>
                                      </label>
                                    </div>
                                    {field.type === 'select' && (
                                      <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-muted-foreground ml-1">OPTIONS (COMMA SEPARATED)</label>
                                        <Input 
                                          value={field.options?.join(', ') || ''} 
                                          onChange={(e) => handleUpdateField(field.id, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                          className="h-9 bg-background"
                                          placeholder="Opt 1, Opt 2, Opt 3..."
                                        />
                                      </div>
                                    )}
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-bold text-muted-foreground ml-1">PLACEHOLDER</label>
                                      <Input 
                                        value={field.placeholder || ''} 
                                        onChange={(e) => handleUpdateField(field.id, { placeholder: e.target.value })}
                                        className="h-9 bg-background"
                                        placeholder="Hint text..."
                                      />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-secondary rounded-lg text-primary">
                                      {FIELD_TYPES.find(t => t.value === field.type)?.icon && (
                                        <div className="w-4 h-4">
                                          {(() => {
                                            const Icon = FIELD_TYPES.find(t => t.value === field.type)?.icon as any
                                            return <Icon className="w-full h-full" />
                                          })()}
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-bold text-sm text-foreground truncate">{field.name}</p>
                                      <div className="flex gap-2 mt-1">
                                        <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-tighter">{field.type}</span>
                                        {field.required && <span className="text-[9px] font-bold uppercase text-red-500 tracking-tighter">Required</span>}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" onClick={() => setEditingFieldId(field.id)} className="h-8 w-8">
                                      <Settings2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteField(field.id)} className="h-8 w-8 hover:text-red-600">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Card className="p-16 text-center border-2 border-dashed border-primary/20 bg-primary/5 space-y-6">
          <Calendar className="w-16 h-16 text-primary/40 mx-auto" />
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-foreground">Interview Flow Enabled</h3>
            <p className="text-muted-foreground">This step will bypass custom fields and instead prompt the student to pick an available interview slot from your manual booking system.</p>
          </div>

        </Card>
      )}
        </>
      )}
    </div>
  )
}


