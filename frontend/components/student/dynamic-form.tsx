'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Upload, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useSession } from 'next-auth/react'
import UploadPopup from '@/components/UploadPopup'

interface Field {
  id: string
  type: string
  name: string
  required?: boolean
  options?: string[]
  placeholder?: string
}

interface DynamicFormProps {
  fields: Field[]
  onSubmit: (data: any) => Promise<void>
  initialData?: any
  submitting?: boolean
  buttonText?: string
  applicationId?: string
}

export function DynamicForm({ fields, onSubmit, initialData = {}, submitting = false, buttonText = 'Submit', applicationId }: DynamicFormProps) {
  const { data: session } = useSession()
  const [formData, setFormData] = useState(initialData)
  const [isUploadPopupOpen, setIsUploadPopupOpen] = useState(false)
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null)
  const [activeFieldName, setActiveFieldName] = useState<string>('')

  const handleInputChange = (id: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [id]: value }))
  }

  const handleUploadComplete = (data: any) => {
    if (activeFieldId) {
      // The uploadFile service returns data with a 'url' field
      // If UploadPopup also saves to DB, it might return a full document object which also has a 'url'
      const url = data.url || data.data?.url
      if (url) {
        handleInputChange(activeFieldId, url)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  // Group fields by sections
  const sections: { id: string; name: string; fields: Field[] }[] = []
  let currentSection: any = null

  fields.forEach(field => {
    if (field.type === 'section') {
      currentSection = { id: field.id, name: field.name, fields: [] }
      sections.push(currentSection)
    } else {
      if (!currentSection) {
        currentSection = { id: 'default', name: 'General Information', fields: [] }
        sections.push(currentSection)
      }
      currentSection.fields.push(field)
    }
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in duration-700">
      {sections.map((section, idx) => (
        <div key={section.id} className="space-y-4">
          <div className="flex items-center gap-3 ml-1">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            <h2 className="text-xl font-black tracking-tight text-foreground">{section.name}</h2>
          </div>
          
          <Card className="p-8 shadow-sm border-2 border-primary/5 bg-gradient-to-br from-background to-secondary/10">
            <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
              {section.fields.map(field => (
                <div key={field.id} className="space-y-2.5">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                    <span>
                      {field.name}
                      {field.required && <span className="text-red-500 ml-1 font-bold">*</span>}
                    </span>
                    {formData[field.id] && <CheckCircle2 className="w-3.5 h-3.5 text-green-500 animate-in zoom-in" />}
                  </label>

                  {field.type === 'text' && (
                    <Input
                      required={field.required}
                      placeholder={field.placeholder}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="h-11 bg-background border-2 focus:border-primary transition-all rounded-xl"
                    />
                  )}

                  {field.type === 'number' && (
                    <Input
                      type="number"
                      step="0.01"
                      required={field.required}
                      placeholder={field.placeholder}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="h-11 bg-background border-2 focus:border-primary transition-all rounded-xl"
                    />
                  )}

                  {field.type === 'date' && (
                    <Input
                      type="date"
                      required={field.required}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="h-11 bg-background border-2 focus:border-primary transition-all rounded-xl"
                    />
                  )}

                  {field.type === 'select' && (
                    <div className="relative group">
                      <select
                        required={field.required}
                        className="w-full h-11 px-4 border-2 border-input rounded-xl bg-background text-sm font-medium focus:border-primary focus:ring-0 transition-all appearance-none cursor-pointer"
                        value={formData[field.id] || ''}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                      >
                        <option value="">Choose {field.name}...</option>
                        {field.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-primary transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  )}

                  {field.type === 'textarea' && (
                    <textarea
                      required={field.required}
                      placeholder={field.placeholder}
                      className="w-full p-4 border-2 border-input rounded-xl bg-background text-sm font-medium focus:border-primary focus:ring-0 transition-all min-h-[120px] outline-none"
                      value={formData[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                    />
                  )}

                  {field.type === 'file' && (
                    <div className="relative">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setActiveFieldId(field.id)
                          setActiveFieldName(field.name)
                          setIsUploadPopupOpen(true)
                        }}
                        className={`w-full gap-3 h-12 border-2 border-dashed rounded-xl transition-all ${formData[field.id] ? 'border-green-500 bg-green-50/50' : 'hover:border-primary hover:bg-primary/5'}`}
                      >
                        {formData[field.id] ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <span className="text-green-700 truncate max-w-[200px]">
                              {typeof formData[field.id] === 'string' && formData[field.id].startsWith('http') 
                                ? 'File Uploaded' 
                                : 'File Selected'}
                            </span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5 text-muted-foreground" />
                            <span>Upload {field.name}</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      ))}

      <div className="pt-6">
        <Button 
          type="submit" 
          disabled={submitting} 
          className="w-full h-16 text-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all rounded-2xl bg-gradient-to-r from-primary to-accent"
        >
          {submitting ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6" />
              {buttonText}
            </div>
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-2 font-medium">
          <Info className="w-3.5 h-3.5" />
          By clicking {buttonText}, you agree to the program terms and conditions.
        </p>
      </div>
      <UploadPopup 
        isOpen={isUploadPopupOpen}
        onClose={() => setIsUploadPopupOpen(false)}
        onUploadComplete={handleUploadComplete}
        token={(session as any)?.backendToken || ''}
        applicationId={applicationId}
        documentType="DYNAMIC_FORM_UPLOAD"
        documentName={activeFieldName}
      />
    </form>
  )
}
