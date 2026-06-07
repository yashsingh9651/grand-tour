'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Stamp, Plus, Trash2, Clock, CheckCircle2, Loader2,
  Video, X, Calendar, Upload, FileText, ExternalLink
} from 'lucide-react'
import { visaService, uploadService } from '@/lib/services/api.service'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function AdminVisaPage() {
  const [slots, setSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDocModal, setShowDocModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(false)

  const [newSlot, setNewSlot] = useState({ startTime: '', endTime: '', capacity: 1 })
  const [docUrl, setDocUrl] = useState('')
  const [docSlotId, setDocSlotId] = useState<string | null>(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await visaService.getAllSlots()
      setSlots(data || [])
    } catch {
      toast.error('Failed to load visa slots')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSlot = async () => {
    if (!newSlot.startTime || !newSlot.endTime) { toast.error('Please fill all fields'); return }
    setCreating(true)
    try {
      await visaService.createSlot({ startTime: newSlot.startTime, endTime: newSlot.endTime, capacity: newSlot.capacity })
      toast.success('Slot created successfully')
      setShowCreateModal(false)
      setNewSlot({ startTime: '', endTime: '', capacity: 1 })
      fetchData()
    } catch {
      toast.error('Failed to create slot')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('Delete this slot?')) return
    try {
      await visaService.deleteSlot(id)
      toast.success('Slot deleted')
      fetchData()
    } catch {
      toast.error('Failed to delete slot')
    }
  }

  const handleDocFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingDoc(true)
    try {
      const result = await uploadService.upload(file)
      setDocUrl(result.url)
      toast.success('Document uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploadingDoc(false)
    }
  }

  const handleAssignDocument = async () => {
    if (!docUrl) { toast.error('Please upload a document first'); return }
    try {
      await visaService.uploadDocument({ documentUrl: docUrl, slotId: docSlotId || undefined })
      toast.success(docSlotId ? 'Document assigned to slot' : 'Document assigned to all slots')
      setShowDocModal(false); setDocUrl(''); setDocSlotId(null)
      fetchData()
    } catch {
      toast.error('Failed to assign document')
    }
  }

  const bookedSlots = slots.filter(s => s.isBooked)
  const availableSlots = slots.filter(s => !s.isBooked)

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block"><Sidebar /></div>
      <main className="flex-1 p-3 md:p-5 lg:ml-64">
        <Header
          title="Visa Appointment Management"
          description="Create slots and manage student visa appointments"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDocModal(true)} className="gap-2">
                <FileText className="w-4 h-4" /> Upload Document
              </Button>
              <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                <Plus className="w-4 h-4" /> Create Slot
              </Button>
            </div>
          }
        />

        <div className="mt-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="p-5 border-none shadow-sm rounded-2xl">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Slots</p>
              <p className="text-3xl font-black">{slots.length}</p>
            </Card>
            <Card className="p-5 border-none shadow-sm rounded-2xl bg-green-50">
              <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Booked</p>
              <p className="text-3xl font-black text-green-700">{bookedSlots.length}</p>
            </Card>
            <Card className="p-5 border-none shadow-sm rounded-2xl bg-blue-50">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Available</p>
              <p className="text-3xl font-black text-blue-700">{availableSlots.length}</p>
            </Card>
          </div>

          <Tabs defaultValue="booked">
            <TabsList>
              <TabsTrigger value="booked">Booked Appointments ({bookedSlots.length})</TabsTrigger>
              <TabsTrigger value="available">Available Slots ({availableSlots.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="booked" className="mt-4">
              {loading ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
              ) : bookedSlots.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                  <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-medium">No appointments booked yet</h3>
                </Card>
              ) : (
                <div className="space-y-3">
                  {bookedSlots.map(slot => (
                    <Card key={slot.id} className="p-5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                        {slot.application?.user?.firstName?.[0] || '?'}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold">{slot.application?.user?.firstName} {slot.application?.user?.lastName}</p>
                        <p className="text-sm text-muted-foreground">{slot.application?.user?.email}</p>
                      </div>
                      <div className="text-center hidden md:block">
                        <p className="text-xs text-muted-foreground">Date</p>
                        <p className="font-semibold text-sm">{format(new Date(slot.startTime), 'PPP')}</p>
                      </div>
                      <div className="text-center hidden md:block">
                        <p className="text-xs text-muted-foreground">Time</p>
                        <p className="font-semibold text-sm">{format(new Date(slot.startTime), 'p')} – {format(new Date(slot.endTime), 'p')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {slot.meetLink && (
                          <a href={slot.meetLink} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                              <Video className="w-4 h-4" /> Meet
                            </Button>
                          </a>
                        )}
                        <Button size="sm" variant="ghost" className="text-primary" onClick={() => { setDocSlotId(slot.id); setShowDocModal(true) }}>
                          <FileText className="w-4 h-4" />
                        </Button>
                        <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
                          Booked
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="available" className="mt-4">
              {availableSlots.length === 0 ? (
                <Card className="p-12 text-center border-dashed">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-medium">No available slots</h3>
                  <p className="text-muted-foreground mt-1">Create new appointment slots for students to book.</p>
                  <Button className="mt-4 gap-2" onClick={() => setShowCreateModal(true)}><Plus className="w-4 h-4" /> Create Slot</Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableSlots.map(slot => (
                    <Card key={slot.id} className="p-5 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => { setDocSlotId(slot.id); setShowDocModal(true) }}>
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteSlot(slot.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="font-bold">{format(new Date(slot.startTime), 'EEEE, PPP')}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(slot.startTime), 'p')} – {format(new Date(slot.endTime), 'p')}
                      </p>
                      {slot.documentUrl && (
                        <div className="mt-3 flex items-center gap-1.5 text-xs text-primary">
                          <FileText className="w-3.5 h-3.5" /> Document attached
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Create Slot Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Create Visa Slot</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <Label>Start Time</Label>
                <Input type="datetime-local" className="mt-1" value={newSlot.startTime} onChange={e => setNewSlot(p => ({ ...p, startTime: e.target.value }))} />
              </div>
              <div>
                <Label>End Time</Label>
                <Input type="datetime-local" className="mt-1" value={newSlot.endTime} onChange={e => setNewSlot(p => ({ ...p, endTime: e.target.value }))} />
              </div>
              <div>
                <Label>Capacity</Label>
                <Input type="number" min={1} className="mt-1" value={newSlot.capacity} onChange={e => setNewSlot(p => ({ ...p, capacity: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button onClick={handleCreateSlot} disabled={creating} className="gap-2">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">{docSlotId ? 'Assign Document to Slot' : 'Upload Document (All Slots)'}</h3>
              <button onClick={() => { setShowDocModal(false); setDocSlotId(null) }} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-muted-foreground">
              {docSlotId ? 'This document will be available to the student who books this slot.' : 'This document will be assigned to all visa slots.'}
            </p>
            <div>
              <Label>Document File (PDF)</Label>
              <div className="mt-1 flex gap-2">
                <Input type="file" accept=".pdf" onChange={handleDocFileUpload} disabled={uploadingDoc} />
                {uploadingDoc && <Loader2 className="w-5 h-5 animate-spin self-center text-primary" />}
              </div>
              {docUrl && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Uploaded</p>}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => { setShowDocModal(false); setDocSlotId(null) }}>Cancel</Button>
              <Button onClick={handleAssignDocument} disabled={!docUrl || uploadingDoc} className="gap-2">
                <Upload className="w-4 h-4" /> Assign
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

