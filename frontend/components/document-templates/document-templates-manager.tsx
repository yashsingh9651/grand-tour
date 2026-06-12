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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { documentTemplateService } from '@/lib/services/api.service'
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
  { type: 'PAYMENT1_DOCUMENT', label: 'Payment 1 Document Template', description: 'Predefined slot for documents sent in Installment 1.' },
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

export default function DocumentTemplatesManager() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
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
      // 1. Read file as array buffer and parse with PizZip
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

      // 2. Upload file to Cloudinary
      const { getSession } = await import('next-auth/react')
      const session = await getSession()
      const token = (session as any)?.backendToken || (session as any)?.user?.token || localStorage.getItem('token') || ''
      const result = await uploadFile(file, token, (p) => setFileProgress(p))
      
      setForm(prev => {
        const mergedVars = [...prev.variables]
        extractedVars.forEach(v => {
          if (!mergedVars.includes(v)) {
            mergedVars.push(v)
          }
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
                      {/* Add system category options dynamically if editing a system template */}
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
    </div>
  )
}
