'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, FileText, Plane, Camera, ShieldCheck, Upload } from 'lucide-react'

const fallbackPageContent = {
  title: 'The Editorial Compliance',
  subtitle: 'Securely upload your credentials to advance your internship journey. All files are encrypted and verified by our editorial board within 24 hours.',
  blocks: [
    {
      id: 'document-repository-header',
      type: 'section',
      label: 'Document Repository',
      description: 'Upload the required materials to keep your internship application moving.',
      column: 'left',
      order: 1,
      enabled: true,
    },
    {
      id: 'resume-card',
      type: 'upload',
      label: 'Professional Curriculum Vitae',
      fieldKey: 'RESUME',
      description: 'Highlight your academic achievements and extracurricular contributions. Must include recent experience.',
      placeholder: 'Supported Formats: PDF (Max 5MB)',
      column: 'left',
      order: 2,
      enabled: true,
    },
    {
      id: 'passport-card',
      type: 'upload',
      label: 'Passport Pages',
      fieldKey: 'PASSPORT',
      description: 'Upload the bio-data pages from your passport so we can verify your identity.',
      placeholder: 'PDF / JPG',
      column: 'left',
      order: 3,
      enabled: true,
    },
    {
      id: 'photo-card',
      type: 'upload',
      label: 'Official Photo',
      fieldKey: 'PHOTO',
      description: 'Use a neutral background and make sure your face is clearly visible.',
      placeholder: 'JPG ONLY',
      column: 'left',
      order: 4,
      enabled: true,
    },
    {
      id: 'submission-integrity-header',
      type: 'summary',
      label: 'Submission Integrity',
      description: 'Keep these standards in mind before you finish the upload step.',
      column: 'right',
      order: 5,
      enabled: true,
    },
    {
      id: 'legibility-item',
      type: 'summary-item',
      label: 'LEGIBILITY',
      description: 'Ensure all text and edges are sharp. Scanned documents must be high-resolution.',
      column: 'right',
      order: 6,
      enabled: true,
    },
    {
      id: 'authenticity-item',
      type: 'summary-item',
      label: 'AUTHENTICITY',
      description: 'Files must be original copies. Watermarked or edited documents will be rejected.',
      column: 'right',
      order: 7,
      enabled: true,
    },
    {
      id: 'validity-item',
      type: 'summary-item',
      label: 'VALIDITY',
      description: 'ID and Passports must have at least 6 months validity remaining.',
      column: 'right',
      order: 8,
      enabled: true,
    },
  ],
}

const iconMap: Record<string, any> = {
  RESUME: FileText,
  PASSPORT: Plane,
  PHOTO: Camera,
}

const statusClasses: Record<string, string> = {
  APPROVED: 'bg-green-100 text-green-700 border-green-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
  PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  default: 'bg-red-100 text-red-600 border-red-200',
}

export function DocumentsStepPreview({ pageContent, uploadedDocs = {}, onUpload }: { pageContent?: any; uploadedDocs?: Record<string, any>; onUpload?: (docType: string, docName: string) => void }) {
  const resolvedPageContent = pageContent || fallbackPageContent
  const orderedBlocks = (resolvedPageContent?.blocks || [])
    .filter((block: any) => block.enabled !== false)
    .slice()
    .sort((a: any, b: any) => Number(a.order || 0) - Number(b.order || 0))

  const leftBlocks = orderedBlocks.filter((block: any) => block.column !== 'right')
  const rightBlocks = orderedBlocks.filter((block: any) => block.column === 'right')

  const getDocStatus = (type: string) => {
    const doc = uploadedDocs[type]
    if (!doc) return 'NOT UPLOADED'
    if (doc.status === 'APPROVED') return 'APPROVED'
    if (doc.status === 'REJECTED') return 'REJECTED'
    return 'PENDING VERIFICATION'
  }

  const getStatusColor = (status: string) => {
    return statusClasses[status] || statusClasses.default
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] font-bold tracking-widest uppercase bg-[#C6F16D] text-[#1A1A1A] px-3 py-1.5 rounded-full">
              Step 3 of 5
            </span>
            <span className="text-sm font-bold text-[#1A1A1A]">Document Repository</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1A1A] leading-tight">
            {resolvedPageContent?.title || fallbackPageContent.title}
          </h1>
          <p className="text-[#666666] text-base max-w-lg mt-2">
            {resolvedPageContent?.subtitle || fallbackPageContent.subtitle}
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#F5F5F5] rounded-full px-5 py-3">
            <span className="text-[9px] font-bold tracking-widest uppercase text-[#666666]">Journey Progress</span>
            <span className="text-sm font-bold text-[#1A1A1A]">60% Complete</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                  step < 3 ? 'bg-[#C6F16D] border-[#C6F16D] text-[#1A1A1A]' :
                  step === 3 ? 'bg-white border-[#C6F16D] text-[#1A1A1A]' :
                  'bg-white border-gray-200 text-gray-400'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {leftBlocks.map((block: any) => {
            if (block.type === 'section') {
              return (
                <Card key={block.id} className="p-6 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">{block.label || 'Section'}</h3>
                    {block.description && <p className="text-sm text-[#666666]">{block.description}</p>}
                  </div>
                </Card>
              )
            }

            if (block.type === 'upload') {
              const Icon = iconMap[block.fieldKey] || ShieldCheck
              const status = getDocStatus(block.fieldKey)

              return (
                <Card key={block.id} className="p-8 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F5F0FF] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[#8B48F6]" />
                      </div>
                      {block.label}
                    </h3>
                    <span className={`text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border ${getStatusColor(status)}`}>
                      {status}
                    </span>
                  </div>
                  <p className="text-sm text-[#666666] mb-6">{block.description || 'Document upload guidance'}</p>

                  {(status === 'NOT UPLOADED' || status === 'REJECTED') ? (
                    <>
                      <div className="border-2 border-dashed border-gray-200 rounded-2xl py-12 px-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#C6F16D] hover:bg-[#FAFFF0] transition-all group"
                        onClick={() => onUpload?.(block.fieldKey, block.label)}
                      >
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-[#C6F16D]/20 transition-colors">
                          <Upload className="w-5 h-5 text-gray-400 group-hover:text-[#4D6B19]" />
                        </div>
                        <p className="text-sm text-[#1A1A1A] font-medium">
                          Drop your document here or <span className="text-[#4D6B19] underline font-bold">browse files</span>
                        </p>
                        <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400">
                          {block.placeholder || 'Supported Formats'}
                        </p>
                      </div>

                      <div className="flex justify-end mt-4">
                        <Button
                          onClick={() => onUpload?.(block.fieldKey, block.label)}
                          className="bg-[#F5F5F5] hover:bg-[#E8E8E8] text-[#1A1A1A] font-bold rounded-full px-6 h-10 gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Upload {block.label}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="bg-[#FAFFF0] border border-[#C6F16D]/30 rounded-2xl p-6 flex flex-col items-center justify-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#C6F16D]/20 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-[#4D6B19]" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-[#1A1A1A]">Document Uploaded Successfully</p>
                        <p className="text-sm text-[#666666] mt-1">
                          {status === 'APPROVED' ? 'Your document has been verified and approved.' : 'Your document is currently under review.'}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2 w-full mt-2">
                        {uploadedDocs[block.fieldKey]?.url && (
                          <Button
                            variant="outline"
                            onClick={() => window.open(uploadedDocs[block.fieldKey].url, '_blank')}
                            className="rounded-full gap-2 text-sm"
                          >
                            <FileText className="w-4 h-4" />
                            View Document
                          </Button>
                        )}
                        <Button
                          onClick={() => onUpload?.(block.fieldKey, block.label)}
                          className="bg-[#F5F5F5] hover:bg-[#E8E8E8] text-[#1A1A1A] font-bold rounded-full px-6 h-10 gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Re-select Document
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              )
            }

            if (block.type === 'text') {
              return (
                <Card key={block.id} className="p-6 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white">
                  <h3 className="text-lg font-bold mb-2">{block.label}</h3>
                  <p className="text-sm text-[#666666]">{block.description}</p>
                </Card>
              )
            }

            return null
          })}
        </div>

        <div className="lg:col-span-1">
          <Card className="p-8 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] bg-white sticky top-32">
            {rightBlocks.map((block: any) => {
              if (block.type === 'summary') {
                return (
                  <div key={block.id} className="space-y-2">
                    <h3 className="text-xl font-bold mb-2">{block.label}</h3>
                    {block.description && <p className="text-sm text-[#666666] mb-4">{block.description}</p>}
                  </div>
                )
              }

              if (block.type === 'summary-item') {
                return (
                  <div key={block.id} className="flex items-start gap-3 pt-4 first:pt-0">
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-[#1A1A1A]">{block.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{block.description}</p>
                    </div>
                  </div>
                )
              }

              return null
            })}

            <div className="mt-8 p-4 bg-[#F5F5F5] rounded-xl flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#4D6B19] shrink-0" />
              <p className="text-[11px] text-gray-500">Your data is protected by AES-256 encryption protocols.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
