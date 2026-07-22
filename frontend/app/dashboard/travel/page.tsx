'use client'

import { useState, useEffect } from 'react'
import { StudentLayout } from '@/components/student/student-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { applicationService, travelService, documentTemplateService } from '@/lib/services/api.service'
import { toast } from 'sonner'
import { OFFICIAL_TRAVEL_TEMPLATES, resolveData, fillDocxFromTemplateUrl } from '@/lib/docx-templates'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import {
  Loader2, Lock, Plane, FileDown, ChevronRight, PartyPopper,
  Download, CheckCircle2, Sparkles, FileText, Edit3, Check
} from 'lucide-react'

export default function TravelPage() {
  const [application, setApplication] = useState<any>(null)
  const [travelDocs, setTravelDocs] = useState<any[]>([])
  const [uploadedTemplates, setUploadedTemplates] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  
  // Interactive Document Edit Modal state
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [documentForm, setDocumentForm] = useState<any>({})
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const appData = await applicationService.getMy()
      setApplication(appData)
      if (appData?.currentStepId === 'travel') {
        const [docs, dbTemplates] = await Promise.all([
          travelService.getMyDocuments().catch(() => []),
          documentTemplateService.getAll().catch(() => [])
        ])
        setTravelDocs(docs || [])
        
        const tmplMap: Record<string, any> = {}
        if (Array.isArray(dbTemplates)) {
          dbTemplates.forEach((t: any) => {
            if (t.category) {
              tmplMap[t.category] = t
            }
          })
        }
        setUploadedTemplates(tmplMap)
      }
    } catch {
      toast.error('Failed to load travel data')
    } finally {
      setLoading(false)
    }
  }

  const openTemplateModal = (tmpl: any) => {
    const resolvedValues = resolveData(application)
    setDocumentForm(resolvedValues)
    setSelectedTemplate(tmpl)
  }

  const handleGenerateDocument = async () => {
    if (!selectedTemplate) return
    try {
      setIsGenerating(true)
      toast.info(`Generating ${selectedTemplate.name}...`)

      const uploaded = uploadedTemplates[selectedTemplate.category]
      if (uploaded && uploaded.fileUrl) {
        await fillDocxFromTemplateUrl(
          uploaded.fileUrl,
          uploaded.fileName || selectedTemplate.filename,
          documentForm
        )
      } else {
        await selectedTemplate.generateFallback(documentForm)
      }

      toast.success(`${selectedTemplate.name} downloaded successfully!`)
      setSelectedTemplate(null)
    } catch (err: any) {
      console.error('Docx generation error:', err)
      toast.error('Failed to generate document: ' + (err?.message || 'Unknown error'))
    } finally {
      setIsGenerating(false)
    }
  }


  if (loading) {
    return (
      <StudentLayout currentStep="travel">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </StudentLayout>
    )
  }

  const isUnlocked = application?.currentStepId === 'travel'

  if (!isUnlocked) {
    return (
      <StudentLayout currentStep="travel">
        <div className="max-w-3xl rounded-3xl border-2 border-dashed border-border bg-secondary/20 p-12 flex flex-col items-center text-center text-foreground mx-auto mt-10">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">Visa Documentation — Locked</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            Visa documentation will be available after your visa appointment is completed.
          </p>
          <Button className="mt-8" onClick={() => window.location.href = `/dashboard/${application?.currentStepId || 'application'}`}>
            Return to Current Step <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout currentStep="travel">
      <div className="max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-foreground">
        {/* 🎉 Congratulations Banner */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary via-violet-600 to-indigo-700 p-4 sm:p-6 lg:p-8 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-4 right-8 w-2 h-2 rounded-full bg-white/50 animate-ping" />
          <div className="absolute top-12 right-20 w-1.5 h-1.5 rounded-full bg-yellow-300/70 animate-ping" style={{ animationDelay: '0.5s' }} />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-xl">
              <PartyPopper className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 animate-pulse" />
                <span className="text-[10px] sm:text-xs font-black tracking-widest text-yellow-300 uppercase">Congratulations!</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight mb-1.5 sm:mb-2">You're Almost There!</h1>
              <p className="text-xs sm:text-sm text-white/80 max-w-lg leading-relaxed">
                You've successfully completed all required steps. Download your official travel and visa templates below.
              </p>
            </div>
            <div className="hidden md:flex flex-col items-center gap-2">
              <div className="text-6xl font-black text-white/20">🌍</div>
            </div>
          </div>

          <div className="relative z-10 mt-6 pt-6 border-t border-white/20">
            <div className="flex items-center justify-between text-xs font-bold text-white/70 mb-2">
              <span>Journey Progress</span>
              <span>100%</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-300 to-green-400 rounded-full animate-pulse" style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        {/* Official .docx Templates Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-violet-600" />
              </div>
              Visa Application Documents (.docx)
            </h2>
            <span className="text-xs bg-violet-100 text-violet-800 font-bold px-2.5 py-1 rounded-full border border-violet-200">
              Auto-Filled & Customizable
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {OFFICIAL_TRAVEL_TEMPLATES.map((tmpl) => {
              const uploaded = uploadedTemplates[tmpl.category]
              return (
                <Card key={tmpl.id} className="p-5 border border-border bg-gradient-to-br from-card to-secondary/30 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 via-violet-500/10 to-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FileDown className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-sm sm:text-base leading-snug">{tmpl.name}</h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded">
                              {tmpl.language}
                            </span>
                            {uploaded?.fileUrl && (
                              <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded">
                                Custom Template Uploaded
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{tmpl.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] font-mono text-muted-foreground">{uploaded?.fileName || tmpl.filename}</span>
                    <Button
                      size="sm"
                      className="gap-2 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm"
                      onClick={() => openTemplateModal(tmpl)}
                    >
                      <Download className="w-4 h-4" />
                      Review & Download .docx
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>

        </div>

        {/* Admin Uploaded Travel Documents */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Plane className="w-5 h-5 text-primary" />
              </div>
              Travel Tickets & Additional Files
            </h2>
            <span className="text-sm text-muted-foreground">{travelDocs.length} file{travelDocs.length !== 1 ? 's' : ''}</span>
          </div>

          {travelDocs.length === 0 ? (
            <Card className="p-8 border border-border border-dashed text-center bg-muted/50 rounded-2xl">
              <Plane className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="font-bold text-base text-foreground">Flight Tickets & Itineraries</h3>
              <p className="text-muted-foreground mt-1 text-xs">Your program coordinator will upload your flight tickets and hotel vouchers here.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {travelDocs.map((doc) => (
                <Card key={doc.id} className="p-5 border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileDown className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Ready to download</p>
                    </div>
                    <a 
                      href={doc.url?.includes('cloudinary.com') ? doc.url.replace('/upload/', '/upload/fl_attachment/') : doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      download
                    >
                      <Button size="sm" className="gap-2 shrink-0">
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Next Steps */}
        <Card className="p-6 bg-muted border border-border rounded-2xl">
          <h3 className="font-bold mb-4 text-foreground">What to do next</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Print Documents', desc: 'Print all downloaded documents and keep them safe.' },
              { step: '2', title: 'Pack & Prepare', desc: 'Prepare your luggage based on the travel itinerary.' },
              { step: '3', title: 'Stay Tuned', desc: 'Your coordinator will send final departure details soon.' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl shadow-sm text-foreground">
                <div className="w-8 h-8 rounded-full bg-primary text-[#1A1A1A] flex items-center justify-center text-sm font-black flex-shrink-0">{item.step}</div>
                <div>
                  <p className="font-bold text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Interactive Document Review & Customization Modal */}
      <Dialog open={Boolean(selectedTemplate)} onOpenChange={(open) => { if (!open) setSelectedTemplate(null) }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-violet-100 text-violet-800 px-2.5 py-0.5 rounded-full border border-violet-200">
                {selectedTemplate?.language}
              </span>
              <DialogTitle className="text-xl font-bold">{selectedTemplate?.name}</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Review and confirm your details below before generating your official Word document. All values are pre-filled from your profile and application.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div className="p-3 bg-muted/60 rounded-xl border border-border space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-primary" /> Student Credentials
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Student Full Name</label>
                  <Input
                    value={documentForm.studentName || ''}
                    onChange={(e) => setDocumentForm({ ...documentForm, studentName: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Passport Number</label>
                  <Input
                    value={documentForm.studentPassportNumber || ''}
                    onChange={(e) => setDocumentForm({ ...documentForm, studentPassportNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Mobile Number</label>
                  <Input
                    value={documentForm.studentNumber || ''}
                    onChange={(e) => setDocumentForm({ ...documentForm, studentNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Email</label>
                  <Input
                    value={documentForm.studentEmail || ''}
                    onChange={(e) => setDocumentForm({ ...documentForm, studentEmail: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Residential Address</label>
                  <Input
                    value={documentForm.studentAddress || ''}
                    onChange={(e) => setDocumentForm({ ...documentForm, studentAddress: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-muted/60 rounded-xl border border-border space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Academic & Sponsor Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">College / Institution</label>
                  <Input
                    value={documentForm.collegeName || ''}
                    onChange={(e) => setDocumentForm({ ...documentForm, collegeName: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Degree / Course</label>
                  <Input
                    value={documentForm.degreeName || ''}
                    onChange={(e) => setDocumentForm({ ...documentForm, degreeName: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Sponsor Full Name</label>
                  <Input
                    value={documentForm.sponsorName || ''}
                    onChange={(e) => setDocumentForm({ ...documentForm, sponsorName: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Sponsor Relation (e.g. Father)</label>
                  <Input
                    value={documentForm.sponsorRelationToStudent || ''}
                    onChange={(e) => setDocumentForm({ ...documentForm, sponsorRelationToStudent: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-muted/60 rounded-xl border border-border space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Internship & Arrival Dates</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Host Hotel Name</label>
                  <Input
                    value={documentForm.hotelName || ''}
                    onChange={(e) => setDocumentForm({ ...documentForm, hotelName: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Department</label>
                  <Input
                    value={documentForm.departmentName || ''}
                    onChange={(e) => setDocumentForm({ ...documentForm, departmentName: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Internship Start Date</label>
                  <Input
                    value={documentForm.internshipDate || ''}
                    onChange={(e) => setDocumentForm({ ...documentForm, internshipDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground">Revised Arrival Date (France)</label>
                  <Input
                    value={documentForm.revisedArrivalDate || ''}
                    onChange={(e) => setDocumentForm({ ...documentForm, revisedArrivalDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setSelectedTemplate(null)} disabled={isGenerating}>
              Cancel
            </Button>
            <Button onClick={handleGenerateDocument} disabled={isGenerating} className="gap-2 bg-primary hover:bg-primary/90 font-bold shadow-md">
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Generate & Download .docx
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StudentLayout>
  )
}

