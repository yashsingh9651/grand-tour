'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Plane, Upload, Trash2, CheckCircle2, Clock, Loader2,
  Plus, X, FileText, SendHorizonal, Search
} from 'lucide-react'
import { travelService, uploadService } from '@/lib/services/api.service'
import { toast } from 'sonner'

export default function AdminTravelPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [docName, setDocName] = useState('')
  const [docUrl, setDocUrl] = useState('')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await travelService.getAllDocuments()
      setApplications(data || [])
    } catch {
      toast.error('Failed to load travel data')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await uploadService.upload(file)
      setDocUrl(result.url)
      if (!docName) setDocName(file.name.replace(/\.[^/.]+$/, ''))
      toast.success('File uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleAddDoc = async () => {
    if (!docUrl || !docName || !selectedApp) { toast.error('Please fill all fields'); return }
    try {
      await travelService.uploadDocument({ applicationId: selectedApp.id, name: docName, url: docUrl })
      toast.success('Document added successfully')
      setShowUploadModal(false); setDocName(''); setDocUrl('')
      fetchData()
    } catch {
      toast.error('Failed to add document')
    }
  }

  const handleDeleteDoc = async (id: string) => {
    try {
      await travelService.deleteDocument(id)
      toast.success('Document deleted')
      fetchData()
    } catch {
      toast.error('Failed to delete document')
    }
  }

  const handlePublish = async () => {
    if (!selectedApp) return
    setPublishing(true)
    try {
      await travelService.publishDocuments(selectedApp.id)
      toast.success('Travel documents published! Student can now access them.')
      setShowPublishConfirm(false)
      fetchData()
    } catch {
      toast.error('Failed to publish documents')
    } finally {
      setPublishing(false)
    }
  }

  const filtered = applications.filter(app =>
    `${app.user.firstName} ${app.user.lastName} ${app.user.email}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block"><Sidebar /></div>
      <main className="flex-1 p-3 md:p-5 lg:ml-64">
        <Header
          title="Travel Document Management"
          description="Upload and publish travel documents for students"
        />

        <div className="mt-6 space-y-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search students..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <Plane className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium">No students at travel stage</h3>
            </Card>
          ) : (
            <div className="space-y-6">
              {filtered.map(app => {
                const hasDocs = (app.travelDocuments || []).length > 0
                const allPublished = hasDocs && app.travelDocuments.every((d: any) => d.isPublished)
                return (
                  <Card key={app.id} className="p-6 border-none shadow-sm">
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {app.user.firstName[0]}
                        </div>
                        <div>
                          <p className="font-bold">{app.user.firstName} {app.user.lastName}</p>
                          <p className="text-sm text-muted-foreground">{app.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {allPublished ? (
                          <span className="flex items-center gap-1.5 text-green-600 text-xs font-bold px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Published
                          </span>
                        ) : (
                          <>
                            <Button size="sm" variant="outline" onClick={() => { setSelectedApp(app); setShowUploadModal(true) }} className="gap-2">
                              <Plus className="w-4 h-4" /> Add Document
                            </Button>
                            {hasDocs && (
                              <Button size="sm" onClick={() => { setSelectedApp(app); setShowPublishConfirm(true) }} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                                <SendHorizonal className="w-4 h-4" /> Publish All
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Documents list */}
                    {hasDocs ? (
                      <div className="space-y-2">
                        {app.travelDocuments.map((doc: any) => (
                          <div key={doc.id} className="flex items-center gap-3 p-3 bg-secondary/20 rounded-xl">
                            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{doc.name}</p>
                              <span className={`text-[10px] font-bold ${doc.isPublished ? 'text-green-600' : 'text-amber-600'}`}>
                                {doc.isPublished ? '✓ Published' : '● Draft'}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-primary"><FileText className="w-4 h-4" /></Button>
                              </a>
                              {!doc.isPublished && (
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteDoc(doc.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                        {!allPublished && (
                          <div className="pt-2">
                            <Button variant="outline" size="sm" onClick={() => { setSelectedApp(app); setShowUploadModal(true) }} className="gap-2">
                              <Plus className="w-4 h-4" /> Add More Documents
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                        <Plane className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-30" />
                        <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                        <Button size="sm" className="mt-3 gap-2" onClick={() => { setSelectedApp(app); setShowUploadModal(true) }}>
                          <Upload className="w-4 h-4" /> Upload First Document
                        </Button>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Add Travel Document</h3>
              <button onClick={() => setShowUploadModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-muted-foreground">For: <strong>{selectedApp.user.firstName} {selectedApp.user.lastName}</strong></p>
            <div className="space-y-3">
              <div>
                <Label>Document Name</Label>
                <Input className="mt-1" placeholder="e.g. Flight Ticket, Hotel Voucher" value={docName} onChange={e => setDocName(e.target.value)} />
              </div>
              <div>
                <Label>File (PDF)</Label>
                <div className="mt-1 flex gap-2">
                  <Input type="file" accept=".pdf,.jpg,.png" onChange={handleFileUpload} disabled={uploading} />
                  {uploading && <Loader2 className="w-5 h-5 animate-spin self-center text-primary" />}
                </div>
                {docUrl && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Uploaded</p>}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowUploadModal(false)}>Cancel</Button>
              <Button onClick={handleAddDoc} disabled={!docUrl || !docName || uploading} className="gap-2">
                <Plus className="w-4 h-4" /> Add Document
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Confirm */}
      {showPublishConfirm && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mb-2">
              <SendHorizonal className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold">Publish Travel Documents?</h3>
            <p className="text-sm text-muted-foreground">
              This will make all documents visible to <strong>{selectedApp.user.firstName}</strong> and unlock their Travel step. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowPublishConfirm(false)}>Cancel</Button>
              <Button onClick={handlePublish} disabled={publishing} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizonal className="w-4 h-4" />} Publish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

