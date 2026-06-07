'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Briefcase, FileText, CheckCircle2, Clock, Loader2,
  Upload, Download, X, ExternalLink, Search
} from 'lucide-react'
import { workPermitService, uploadService } from '@/lib/services/api.service'
import { toast } from 'sonner'

export default function AdminWorkPermitPage() {
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [docUrl, setDocUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await workPermitService.getAllWorkPermits()
      setApplications(data || [])
    } catch {
      toast.error('Failed to load work permit data')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingFile(true)
    try {
      const result = await uploadService.upload(file)
      setDocUrl(result.url)
      toast.success('File uploaded successfully')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploadingFile(false)
    }
  }

  const handleIssuePermit = async () => {
    if (!docUrl || !selectedApp) { toast.error('Please upload a document first'); return }
    try {
      await workPermitService.uploadWorkPermit({ applicationId: selectedApp.id, documentUrl: docUrl, notes })
      toast.success(`Work permit issued to ${selectedApp.user.firstName}!`)
      setShowModal(false)
      setDocUrl(''); setNotes(''); setSelectedApp(null)
      fetchData()
    } catch {
      toast.error('Failed to issue work permit')
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
          title="Work Permit Management"
          description="Issue and track work permits for students at this step"
        />

        <div className="mt-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-5 border-none shadow-sm rounded-2xl">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Pending</p>
              <p className="text-3xl font-black text-foreground">{applications.filter(a => !a.workPermit || a.workPermit.status === 'PENDING').length}</p>
            </Card>
            <Card className="p-5 border-none shadow-sm rounded-2xl bg-green-50 border-green-100">
              <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Issued</p>
              <p className="text-3xl font-black text-green-700">{applications.filter(a => a.workPermit?.status === 'ISSUED').length}</p>
            </Card>
            <Card className="p-5 border-none shadow-sm rounded-2xl">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total</p>
              <p className="text-3xl font-black text-foreground">{applications.length}</p>
            </Card>
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search students..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* List */}
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium">No students at work permit step</h3>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map(app => (
                <Card key={app.id} className="p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">
                    {app.user.firstName[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{app.user.firstName} {app.user.lastName}</p>
                    <p className="text-sm text-muted-foreground">{app.user.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {app.workPermit?.status === 'ISSUED' ? (
                      <>
                        <span className="flex items-center gap-1.5 text-green-600 text-xs font-bold px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Issued
                        </span>
                        <a href={app.workPermit.documentUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="gap-2"><ExternalLink className="w-4 h-4" /> View</Button>
                        </a>
                      </>
                    ) : (
                      <>
                        <span className="flex items-center gap-1.5 text-amber-600 text-xs font-bold px-3 py-1.5 bg-amber-50 rounded-full border border-amber-200">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                        <Button size="sm" onClick={() => { setSelectedApp(app); setShowModal(true) }} className="gap-2">
                          <Upload className="w-4 h-4" /> Issue Permit
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Issue Modal */}
      {showModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Issue Work Permit</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-muted-foreground">Issuing work permit for <strong>{selectedApp.user.firstName} {selectedApp.user.lastName}</strong></p>
            <div className="space-y-3">
              <div>
                <Label>Work Permit PDF</Label>
                <div className="mt-1 flex gap-2">
                  <Input type="file" accept=".pdf" onChange={handleFileUpload} disabled={uploadingFile} />
                  {uploadingFile && <Loader2 className="w-5 h-5 animate-spin self-center text-primary" />}
                </div>
                {docUrl && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Document uploaded</p>}
              </div>
              <div>
                <Label>Notes (Optional)</Label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special instructions..." className="w-full mt-1 h-24 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleIssuePermit} disabled={!docUrl || uploadingFile} className="gap-2">
                <FileText className="w-4 h-4" /> Issue & Notify
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
