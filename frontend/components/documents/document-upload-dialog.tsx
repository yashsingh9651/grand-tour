'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Variable,
  ChevronDown,
  Wand2,
  FolderOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { uploadFile } from '@/lib/services/upload.service'
import { documentTemplateService, documentService } from '@/lib/services/api.service'

interface DocumentTemplate {
  id: string
  name: string
  description?: string
  fileUrl: string
  fileName: string
  variables: string[]
  category?: string
}

interface DocumentUploadDialogProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete?: (data: any) => void
  token: string
  applicationId?: string
  documentType?: string
  documentName?: string
  // Pre-fill data from student application
  studentData?: Record<string, string>
}

type Mode = 'template' | 'upload'
type Status = 'idle' | 'uploading' | 'generating' | 'success' | 'error'

export default function DocumentUploadDialog({
  isOpen,
  onClose,
  onUploadComplete,
  token,
  applicationId,
  documentType,
  documentName,
  studentData = {},
}: DocumentUploadDialogProps) {
  const [mode, setMode] = useState<Mode>('template')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  // Template mode
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null)
  const [varValues, setVarValues] = useState<Record<string, string>>({})

  // Raw upload mode
  const [file, setFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setStatus('idle')
      setError(null)
      setProgress(0)
      setFile(null)
      setSelectedTemplate(null)
      setVarValues({})
      loadTemplates()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && templates.length > 0) {
      if (documentType) {
        const match = templates.find(t => t.category === documentType)
        if (match) {
          setSelectedTemplate(match)
          setMode('template')
        } else {
          setMode('upload')
        }
      } else {
        setMode('template')
      }
    }
  }, [templates, documentType, isOpen])

  useEffect(() => {
    if (selectedTemplate) {
      // Pre-fill variables from studentData
      const prefilled: Record<string, string> = {}
      selectedTemplate.variables.forEach(v => {
        prefilled[v] = studentData[v] || ''
      })
      setVarValues(prefilled)
    }
  }, [selectedTemplate, studentData])

  async function loadTemplates() {
    setLoadingTemplates(true)
    try {
      const data = await documentTemplateService.getAll()
      setTemplates(data || [])
    } catch (e) {
      // silently fail
    } finally {
      setLoadingTemplates(false)
    }
  }

  // ——————————————————————————
  // Template mode: generate docx
  // ——————————————————————————
  async function handleGenerateAndUpload() {
    if (!selectedTemplate) return
    const missing = selectedTemplate.variables.filter(v => !varValues[v]?.trim())
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(', ')}`)
      return
    }

    setStatus('generating')
    setError(null)

    try {
      // 1. Fetch the template .docx as ArrayBuffer
      const templateRes = await fetch(selectedTemplate.fileUrl)
      if (!templateRes.ok) throw new Error('Failed to fetch template file')
      const arrayBuffer = await templateRes.arrayBuffer()

      // 2. Use docxtemplater + pizzip to fill variables
      const PizZip = (await import('pizzip')).default
      const Docxtemplater = (await import('docxtemplater')).default

      const zip = new PizZip(arrayBuffer)
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      })

      doc.setData(varValues)

      try {
        doc.render()
      } catch (renderError: any) {
        const message = renderError?.properties?.errors
          ?.map((e: any) => e.message)
          .join(', ')
        throw new Error(message || 'Template rendering failed — check variable names match {{variable}} tags in your .docx')
      }

      const outBlob = doc.getZip().generate({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })

      // 3. Upload generated blob to Cloudinary
      setStatus('uploading')
      const generatedFileName = `${selectedTemplate.name.replace(/\s+/g, '_')}_filled.docx`
      const generatedFile = new File([outBlob], generatedFileName, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })

      const authToken = await getToken()
      const uploadResult = await uploadFile(generatedFile, authToken, (p) => setProgress(p))

      // 4. Save to backend Document model if applicationId is provided
      let finalData = uploadResult.data
      if (applicationId && documentType) {
        const newDoc = await documentService.create({
          applicationId,
          name: documentName || selectedTemplate.name,
          type: documentType,
          url: uploadResult.data.url,
          fileName: generatedFileName,
          size: outBlob.size / (1024 * 1024),
          status: 'PENDING',
        })
        finalData = newDoc
      }

      setStatus('success')
      onUploadComplete?.(finalData)
      setTimeout(onClose, 2000)
    } catch (e: any) {
      setStatus('error')
      setError(e.message || 'Something went wrong')
    }
  }

  // ——————————————————————————
  // Raw upload mode
  // ——————————————————————————
  async function handleRawUpload() {
    if (!file) return
    setStatus('uploading')
    setProgress(0)
    setError(null)

    try {
      const authToken = await getToken()
      const uploadResult = await uploadFile(file, authToken, (p) => setProgress(p))

      let finalData = uploadResult.data
      if (applicationId && documentType) {
        const newDoc = await documentService.create({
          applicationId,
          name: documentName || file.name,
          type: documentType,
          url: uploadResult.data.url,
          fileName: file.name,
          size: file.size / (1024 * 1024),
          status: 'PENDING',
        })
        finalData = newDoc
      }

      setStatus('success')
      onUploadComplete?.(finalData)
      setTimeout(onClose, 2000)
    } catch (e: any) {
      setStatus('error')
      setError(e.message || 'Upload failed')
    }
  }

  async function getToken() {
    if (token) return token
    const { getSession } = await import('next-auth/react')
    const session = await getSession()
    return (session as any)?.backendToken || (session as any)?.user?.token || localStorage.getItem('token') || ''
  }

  function handleFileSelect(f: File) {
    const valid = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!valid.includes(f.type) && !f.name.endsWith('.docx')) {
      setError('Invalid file type. Supported: JPG, PNG, PDF, DOCX, MP4')
      return
    }
    if (f.size > 50 * 1024 * 1024) {
      setError('File too large. Max 50MB.')
      return
    }
    setFile(f)
    setError(null)
  }

  const isWorking = status === 'uploading' || status === 'generating'

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isWorking ? onClose : undefined}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="pointer-events-auto w-full max-w-lg bg-background border-2 border-primary/10 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-7 py-5 border-b border-border/30" style={{ background: '#141414' }}>
                <div>
                  <h3 className="text-base font-black tracking-tight" style={{ color: '#CCFF00' }}>Upload Document</h3>
                  <p className="text-[11px] mt-0.5" style={{ color: '#555' }}>Choose how to create this document</p>
                </div>
                {!isWorking && (
                  <button onClick={onClose} className="p-2 rounded-2xl hover:bg-white/10 text-gray-400 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Mode Tabs */}
              {status === 'idle' || status === 'error' ? (
                <div className="p-7 space-y-5">
                  {/* Tab switcher */}
                  <div className="flex gap-1 p-1 bg-muted/40 rounded-2xl">
                    <button
                      onClick={() => { setMode('template'); setError(null) }}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200',
                        mode === 'template' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      From Template
                    </button>
                    <button
                      onClick={() => { setMode('upload'); setError(null) }}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200',
                        mode === 'upload' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload New File
                    </button>
                  </div>

                  {/* ——————— TEMPLATE MODE ——————— */}
                  {mode === 'template' && (
                    <div className="space-y-4">
                      {loadingTemplates ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : templates.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-10 rounded-2xl border-2 border-dashed border-border/40">
                          <FolderOpen className="w-8 h-8 text-muted-foreground" />
                          <p className="text-sm font-semibold text-muted-foreground">No templates available</p>
                          <p className="text-xs text-muted-foreground text-center px-4">
                            Create templates in <strong>Admin → Doc Templates</strong> first.
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Template selector */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Select Template</label>
                            <div className="relative">
                              <select
                                value={selectedTemplate?.id || ''}
                                onChange={e => {
                                  const t = templates.find(t => t.id === e.target.value) || null
                                  setSelectedTemplate(t)
                                }}
                                className="w-full appearance-none px-4 py-3 rounded-2xl border border-border/60 bg-muted/20 text-sm font-medium pr-10 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                              >
                                <option value="">— Choose a template —</option>
                                {templates.map(t => (
                                  <option key={t.id} value={t.id}>{t.name} {t.category ? `(${t.category})` : ''}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            </div>
                          </div>

                          {/* Variables form */}
                          {selectedTemplate && selectedTemplate.variables.length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-1.5">
                                <Variable className="w-3.5 h-3.5 text-muted-foreground" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Fill Variables</p>
                              </div>
                              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                                {selectedTemplate.variables.map(v => (
                                  <div key={v} className="space-y-1">
                                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                      <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">{`{{${v}}}`}</span>
                                      {v}
                                    </label>
                                    <input
                                      value={varValues[v] || ''}
                                      onChange={e => setVarValues(prev => ({ ...prev, [v]: e.target.value }))}
                                      placeholder={`Enter ${v}...`}
                                      className="w-full px-3 py-2 rounded-xl border border-border/50 bg-muted/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedTemplate && selectedTemplate.variables.length === 0 && (
                            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 text-xs text-muted-foreground">
                              <FileText className="w-4 h-4 shrink-0" />
                              This template has no variables — the document will be uploaded as-is.
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* ——————— RAW UPLOAD MODE ——————— */}
                  {mode === 'upload' && (
                    <div className="space-y-4">
                      <input
                        type="file"
                        ref={fileRef}
                        className="hidden"
                        accept="image/*,video/*,application/pdf,.docx"
                        onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                      />
                      <div
                        onClick={() => fileRef.current?.click()}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => { e.preventDefault(); e.dataTransfer.files?.[0] && handleFileSelect(e.dataTransfer.files[0]) }}
                        className={cn(
                          'relative group cursor-pointer flex flex-col items-center justify-center gap-4 py-12 px-6 border-2 border-dashed rounded-[2rem] transition-all duration-300',
                          file ? 'border-primary bg-primary/5' : 'border-border/40 hover:border-primary/30 hover:bg-primary/5'
                        )}
                      >
                        <div className={cn('p-4 rounded-[1.5rem] transition-all duration-300', file ? 'bg-primary/10' : 'bg-muted/50 group-hover:bg-primary/10')}>
                          <FileText className={cn('w-8 h-8 transition-colors', file ? 'text-primary' : 'text-muted-foreground group-hover:text-primary')} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-foreground">{file ? file.name : 'Click or drag to upload'}</p>
                          <p className="text-[11px] font-medium text-muted-foreground mt-1">PNG, JPG, PDF, DOCX, MP4 (Max 50MB)</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-500/5 border border-red-500/15 text-red-600 text-xs font-semibold"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      {error}
                    </motion.div>
                  )}

                  {/* CTA */}
                  <button
                    onClick={mode === 'template' ? handleGenerateAndUpload : handleRawUpload}
                    disabled={mode === 'template' ? !selectedTemplate : !file}
                    className={cn(
                      'w-full py-4 rounded-[1.25rem] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 text-sm',
                      (mode === 'template' ? !!selectedTemplate : !!file)
                        ? 'shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                        : 'opacity-40 cursor-not-allowed'
                    )}
                    style={(mode === 'template' ? !!selectedTemplate : !!file) ? { background: '#141414', color: '#CCFF00' } : {}}
                  >
                    {mode === 'template' ? (
                      <><Wand2 className="w-4 h-4" /> Generate &amp; Upload</>
                    ) : (
                      <><Upload className="w-4 h-4" /> Upload File</>
                    )}
                  </button>
                </div>
              ) : status === 'generating' ? (
                <div className="p-10 flex flex-col items-center gap-6">
                  <div className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center" style={{ background: '#141414' }}>
                    <Wand2 className="w-10 h-10 animate-pulse" style={{ color: '#CCFF00' }} />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black tracking-tight text-foreground">Generating Document...</p>
                    <p className="text-xs text-muted-foreground mt-1">Filling template variables and creating your file</p>
                  </div>
                </div>
              ) : status === 'uploading' ? (
                <div className="p-10 flex flex-col items-center gap-8">
                  <div className="relative flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full border-8 border-muted" />
                    <svg className="absolute w-28 h-28 -rotate-90">
                      <circle cx="56" cy="56" r="48"
                        stroke="currentColor" strokeWidth="8" fill="transparent"
                        className="text-primary transition-all duration-700"
                        style={{ strokeDasharray: 301.6, strokeDashoffset: 301.6 - (progress / 100) * 301.6 }}
                      />
                    </svg>
                    <span className="absolute text-xl font-black">{progress}%</span>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black tracking-tight">Uploading...</p>
                    <p className="text-xs text-muted-foreground mt-1">Please keep this window open</p>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-10 flex flex-col items-center gap-5"
                >
                  <div className="w-20 h-20 rounded-[1.5rem] bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-primary" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-xl font-black tracking-tight">
                      {mode === 'template' ? 'Document Generated!' : 'Upload Complete!'}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">Your document has been saved successfully</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
