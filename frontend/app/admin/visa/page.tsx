'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/layout-wrapper'
import { Header } from '@/components/dashboard/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Plus, Trash2, Clock, CheckCircle2, Loader2,
  Video, X, Calendar as CalendarIcon, Upload, FileText,
  Search, Info, Zap, Save, CalendarDays, ExternalLink, Settings, List
} from 'lucide-react'
import { visaService, uploadService } from '@/lib/services/api.service'
import { toast } from 'sonner'
import { format, addDays } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'

const DAYS = [
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
  { label: 'Sunday', value: 0 },
]

export default function AdminVisaPage() {
  const [slots, setSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDocModal, setShowDocModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Slot creation states
  const [newSlot, setNewSlot] = useState({ date: new Date(), startTime: '10:00', endTime: '10:30', capacity: 1 })
  const [docUrl, setDocUrl] = useState('')
  const [docSlotId, setDocSlotId] = useState<string | null>(null)

  // Availability / Bulk Generation States
  const [availability, setAvailability] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('visa_availability')
      if (saved) return JSON.parse(saved)
    }
    return DAYS.map(day => ({
      dayOfWeek: day.value,
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30,
      lunchStart: '13:00',
      lunchEnd: '14:00',
      capacity: 1,
      isActive: day.value !== 0 && day.value !== 6,
    }))
  })
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: addDays(new Date(), 14),
  })

  useEffect(() => {
    fetchData()
  }, [])

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
    try {
      setCreating(true)
      const start = new Date(newSlot.date)
      const [h, m] = newSlot.startTime.split(':').map(Number)
      start.setHours(h, m, 0, 0)

      const end = new Date(newSlot.date)
      const [eh, em] = newSlot.endTime.split(':').map(Number)
      end.setHours(eh, em, 0, 0)

      if (end <= start) {
        toast.error('End time must be after start time')
        return
      }

      await visaService.createSlot({
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        capacity: newSlot.capacity
      })

      toast.success('Visa slot created successfully')
      setShowCreateModal(false)
      setNewSlot({ date: new Date(), startTime: '10:00', endTime: '10:30', capacity: 1 })
      fetchData()
    } catch {
      toast.error('Failed to create slot')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteSlot = async (id: string) => {
    if (!confirm('Are you sure you want to delete this visa slot?')) return
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
    if (!docUrl) {
      toast.error('Please upload a document first')
      return
    }
    try {
      await visaService.uploadDocument({ documentUrl: docUrl, slotId: docSlotId || undefined })
      toast.success(docSlotId ? 'Document assigned to slot' : 'Document assigned to all slots')
      setShowDocModal(false)
      setDocUrl('')
      setDocSlotId(null)
      fetchData()
    } catch {
      toast.error('Failed to assign document')
    }
  }

  const handleApproveBooking = async (slotId: string) => {
    try {
      await visaService.approveSlot(slotId)
      toast.success('Visa appointment approved!')
      fetchData()
    } catch {
      toast.error('Failed to approve visa appointment')
    }
  }

  const handleRejectBooking = async (slotId: string) => {
    if (!confirm('Are you sure you want to reject this visa booking? The slot will be released.')) return
    try {
      await visaService.rejectSlot(slotId)
      toast.success('Visa booking rejected!')
      fetchData()
    } catch {
      toast.error('Failed to reject visa booking')
    }
  }

  const handleAvailabilityUpdate = (dayOfWeek: number, field: string, value: any) => {
    setAvailability(prev => prev.map(a => a.dayOfWeek === dayOfWeek ? { ...a, [field]: value } : a))
  }

  const saveAvailability = () => {
    setSaving(true)
    try {
      localStorage.setItem('visa_availability', JSON.stringify(availability))
      toast.success('Visa default working hours updated locally')
    } catch {
      toast.error('Failed to save working hours')
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateSlots = async () => {
    if (!dateRange.from || !dateRange.to) {
      toast.error('Please select a date range')
      return
    }

    setGenerating(true)
    try {
      const activeAvailability = availability.filter(a => a.isActive)
      if (activeAvailability.length === 0) {
        toast.error('Please enable at least one active day in your schedule.')
        return
      }

      const res = await visaService.generateSlots(
        dateRange.from.toISOString(),
        dateRange.to.toISOString(),
        0, // bufferTime
        availability
      )
      toast.success(res.message || 'Visa slots generated successfully')
      fetchData()
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to generate visa slots')
    } finally {
      setGenerating(false)
    }
  }

  // Filter logic
  const filteredSlots = slots.filter(slot => {
    const matchesSearch = !searchQuery ||
      slot.application?.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot.application?.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot.application?.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const bookedSlots = filteredSlots.filter(s => s.isBooked)
  const availableSlots = filteredSlots.filter(s => !s.isBooked)

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Header
          title="Visa Slots Config"
          description="Design weekly hours, auto-generate calendar dates, and manage visa pipelines."
          actions={
            <Button onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-emerald-700 text-white font-bold px-6 rounded-xl shadow-lg shadow-emerald-500/20">
              <Plus className="w-4 h-4 mr-2" /> Quick Add Slot
            </Button>
          }
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border border-slate-200 bg-white rounded-3xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Slots</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{slots.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-slate-600" />
            </div>
          </Card>
          <Card className="p-6 border border-emerald-100 bg-emerald-50/10 rounded-3xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Booked Appointments</p>
              <h3 className="text-3xl font-black text-emerald-700 mt-1">{slots.filter(s => s.isBooked).length}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/50 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
          </Card>
          <Card className="p-6 border border-indigo-100 bg-indigo-50/10 rounded-3xl shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Available Slots</p>
              <h3 className="text-3xl font-black text-indigo-700 mt-1">{slots.filter(s => !s.isBooked).length}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-100/50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-indigo-600" />
            </div>
          </Card>
        </div>

        {/* Tabs System */}
        <Tabs defaultValue="slots" className="w-full">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
            <TabsList className="bg-slate-100/50 p-1 rounded-2xl border border-slate-200 shadow-inner">
              <TabsTrigger value="slots" className="gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs font-semibold uppercase tracking-wider">
                <List className="w-4 h-4" /> Visa Pipeline
              </TabsTrigger>
              <TabsTrigger value="availability" className="gap-2 px-6 py-2.5 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs font-semibold uppercase tracking-wider">
                <Settings className="w-4 h-4" /> Bulk Generator
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by student name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 border-slate-200 focus:border-primary rounded-xl text-xs font-semibold bg-white"
                />
              </div>
              <Button variant="outline" className="border-slate-200 rounded-xl h-10 gap-2 bg-white" onClick={() => { setDocSlotId(null); setShowDocModal(true); }}>
                <Upload className="w-4 h-4" /> Global Doc
              </Button>
            </div>
          </div>

          <TabsContent value="slots" className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-32 gap-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-100 animate-pulse" />
                  <Loader2 className="w-10 h-10 animate-spin text-primary absolute top-3 left-3" />
                </div>
                <p className="text-slate-500 font-bold tracking-wide text-xs">LOADING VISA DATABASE...</p>
              </div>
            ) : slots.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-20 text-center flex flex-col items-center gap-6 bg-white rounded-3xl border border-dashed border-slate-200 shadow-inner"
              >
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
                  <CalendarIcon className="w-10 h-10 text-slate-300" />
                </div>
                <div className="space-y-2 max-w-xs">
                  <p className="text-lg font-bold text-slate-800">No Visa Slots Configured</p>
                  <p className="text-xs text-slate-500 leading-relaxed">Create single slots using the quick add menu or populate the calendar instantly with the bulk generator.</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} variant="outline" className="rounded-xl px-8 h-11 hover:bg-slate-50 text-xs font-bold border-slate-200">
                  Create First Visa Slot
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Booked Pipeline Column */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booked Appointments ({bookedSlots.length})</span>
                  </div>

                  {bookedSlots.length === 0 ? (
                    <Card className="p-16 text-center border-dashed border-slate-200 bg-white rounded-3xl flex flex-col items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-slate-300 mb-3" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">All bookings are clear</p>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {bookedSlots.map(slot => (
                        <Card key={slot.id} className="p-5 border border-slate-100 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                          <div className="absolute left-0 top-0 w-1.5 h-full bg-emerald-500" />
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#CCFF00] text-black font-black text-sm flex items-center justify-center ring-2 ring-white">
                                {slot.application?.user?.firstName?.[0] || '?'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-extrabold text-slate-900 text-sm truncate">{slot.application?.user?.firstName} {slot.application?.user?.lastName}</p>
                                <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{slot.application?.user?.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6 self-end sm:self-center">
                              <div className="text-right">
                                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-black">Scheduled Date</p>
                                <p className="font-bold text-slate-800 text-xs mt-0.5">{format(new Date(slot.startTime), 'MMM do, yyyy')}</p>
                                <p className="text-[10px] text-slate-500 font-medium">{format(new Date(slot.startTime), 'p')} – {format(new Date(slot.endTime), 'p')}</p>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {slot.meetLink && (
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-slate-50 rounded-lg" asChild>
                                    <a href={slot.meetLink} target="_blank" rel="noopener noreferrer">
                                      <Video className="w-4 h-4 text-emerald-600" />
                                    </a>
                                  </Button>
                                )}
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg" onClick={() => { setDocSlotId(slot.id); setShowDocModal(true); }}>
                                  <FileText className="w-4 h-4" />
                                </Button>

                                {slot.application?.currentStepId === 'travel' ? (
                                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2 py-0.5 rounded-full text-[10px] uppercase">Approved</Badge>
                                ) : (
                                  <div className="flex gap-1">
                                    <Button size="sm" onClick={() => handleApproveBooking(slot.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg px-3 py-1">
                                      Approve
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleRejectBooking(slot.id)} className="text-red-600 border-red-100 hover:bg-red-50 font-bold text-[10px] rounded-lg px-3 py-1">
                                      Reject
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {slot.documentUrl && (
                            <div className="mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-primary" /> Document Assigned</span>
                              <a href={slot.documentUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5">
                                View <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Available Slots Column */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Slots ({availableSlots.length})</span>
                  </div>

                  {availableSlots.length === 0 ? (
                    <Card className="p-16 text-center border-dashed border-slate-200 bg-white rounded-3xl flex flex-col items-center justify-center">
                      <Clock className="w-10 h-10 text-slate-300 mb-3" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No active open slots</p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {availableSlots.map(slot => (
                        <Card key={slot.id} className="p-4 border border-slate-100 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 relative group overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-slate-300 group-hover:bg-primary transition-colors" />
                          <div className="flex justify-between items-start mb-2">
                            <Badge className="bg-slate-100 text-slate-600 border border-slate-200 font-bold px-2 py-0.5 rounded-full text-[9px] uppercase">Open</Badge>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400 hover:text-slate-900 rounded-lg" onClick={() => { setDocSlotId(slot.id); setShowDocModal(true); }}>
                                <FileText className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-50 rounded-lg" onClick={() => handleDeleteSlot(slot.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                          <p className="font-extrabold text-slate-800 text-xs truncate">{format(new Date(slot.startTime), 'EEEE, MMM do')}</p>
                          <p className="text-[10px] text-slate-500 mt-1 font-bold">{format(new Date(slot.startTime), 'p')} – {format(new Date(slot.endTime), 'p')}</p>
                          {slot.capacity > 1 && (
                            <p className="text-[9px] font-bold text-indigo-600 bg-indigo-50/50 border border-indigo-100/50 inline-block px-1.5 py-0.5 rounded-md mt-2">Capacity: {slot.capacity}</p>
                          )}
                          {slot.documentUrl && (
                            <div className="mt-2.5 flex items-center justify-between text-[9px] text-indigo-600 font-bold bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                              <span className="flex items-center gap-1"><FileText className="w-3 h-3 text-primary" /> Doc Attached</span>
                              <a href={slot.documentUrl} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-0.5">View <ExternalLink className="w-2.5 h-2.5" /></a>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="availability" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Working Hours Settings */}
              <div className="xl:col-span-2 space-y-6">
                <Card className="p-0 overflow-hidden border border-slate-200 bg-white rounded-3xl shadow-sm">
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold">Default Weekly Hours</h3>
                        <p className="text-slate-400 text-xs">Configure your recurring visa appointment schedule</p>
                      </div>
                    </div>
                    <Button onClick={saveAvailability} disabled={saving} className="bg-white text-slate-900 hover:bg-slate-100 font-bold shadow-lg text-xs rounded-xl h-10 px-5">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Template
                    </Button>
                  </div>

                  <div className="p-6 divide-y divide-slate-100">
                    {DAYS.map((day, idx) => {
                      const dayAvail = availability.find(a => a.dayOfWeek === day.value) || {
                        isActive: false,
                        startTime: '09:00',
                        endTime: '17:00',
                        slotDuration: 30,
                        capacity: 1
                      }

                      return (
                        <div key={day.value} className={`py-5 flex flex-col md:flex-row md:items-center gap-6 group transition-colors ${dayAvail.isActive ? 'bg-transparent' : 'bg-slate-50/50 grayscale-[0.2]'}`}>
                          <div className="flex items-center gap-4 w-40 shrink-0">
                            <Switch
                              checked={dayAvail.isActive}
                              onCheckedChange={(val) => handleAvailabilityUpdate(day.value, 'isActive', val)}
                              className="data-[state=checked]:bg-primary"
                            />
                            <span className={`font-extrabold text-xs uppercase tracking-wider ${dayAvail.isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                              {day.label}
                            </span>
                          </div>

                          <AnimatePresence mode="wait">
                            {dayAvail.isActive ? (
                              <motion.div
                                key="active"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4"
                              >
                                <div className="space-y-1">
                                  <Label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Start Time</Label>
                                  <div className="relative">
                                    <Clock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                                    <Input
                                      type="time"
                                      value={dayAvail.startTime}
                                      onChange={(e) => handleAvailabilityUpdate(day.value, 'startTime', e.target.value)}
                                      className="pl-9 h-9 border-slate-200 focus:border-primary text-xs font-semibold"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">End Time</Label>
                                  <div className="relative">
                                    <Clock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                                    <Input
                                      type="time"
                                      value={dayAvail.endTime}
                                      onChange={(e) => handleAvailabilityUpdate(day.value, 'endTime', e.target.value)}
                                      className="pl-9 h-9 border-slate-200 focus:border-primary text-xs font-semibold"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Lunch Break</Label>
                                  <div className="flex gap-1.5 items-center">
                                    <Input
                                      type="time"
                                      value={dayAvail.lunchStart || ''}
                                      onChange={(e) => handleAvailabilityUpdate(day.value, 'lunchStart', e.target.value)}
                                      className="h-9 border-slate-200 focus:border-primary text-[10px] px-2 font-semibold"
                                      placeholder="Start"
                                    />
                                    <span className="text-slate-300">-</span>
                                    <Input
                                      type="time"
                                      value={dayAvail.lunchEnd || ''}
                                      onChange={(e) => handleAvailabilityUpdate(day.value, 'lunchEnd', e.target.value)}
                                      className="h-9 border-slate-200 focus:border-primary text-[10px] px-2 font-semibold"
                                      placeholder="End"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Duration</Label>
                                  <div className="relative">
                                    <Input
                                      type="number"
                                      value={dayAvail.slotDuration}
                                      onChange={(e) => handleAvailabilityUpdate(day.value, 'slotDuration', parseInt(e.target.value) || 30)}
                                      className="h-9 border-slate-200 focus:border-primary text-xs font-semibold pr-8"
                                    />
                                    <span className="absolute right-2.5 top-2.5 text-[8px] font-black text-slate-400 uppercase">min</span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Capacity</Label>
                                  <Input
                                    type="number"
                                    min={1}
                                    value={dayAvail.capacity || 1}
                                    onChange={(e) => handleAvailabilityUpdate(day.value, 'capacity', parseInt(e.target.value) || 1)}
                                    className="h-9 border-slate-200 focus:border-primary text-xs font-semibold"
                                  />
                                </div>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="inactive"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex-1 flex items-center h-12 text-slate-400 italic text-xs font-medium"
                              >
                                Not accepting appointments on {day.label}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>

              {/* Generator Settings Sidebar */}
              <div className="space-y-6">
                <Card className="p-0 overflow-hidden border border-slate-200 bg-white rounded-3xl shadow-sm">
                  <div className="bg-gradient-to-r from-emerald-600 to-primary p-6 text-white">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-base font-bold">Auto-Generate Calendar</h3>
                    </div>
                    <p className="text-emerald-100 text-xs mt-1">Populate visa slots instantly using the template settings.</p>
                  </div>

                  <div className="p-6 space-y-5">
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">From Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-semibold border-slate-200 hover:border-primary h-11 rounded-xl text-xs bg-white">
                              <CalendarIcon className="mr-2 h-4 w-4 text-emerald-600" />
                              {dateRange.from ? format(dateRange.from, 'PPP') : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dateRange.from}
                              onSelect={(date) => setDateRange(prev => ({ ...prev, from: date || new Date() }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">To Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-semibold border-slate-200 hover:border-primary h-11 rounded-xl text-xs bg-white">
                              <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                              {dateRange.to ? format(dateRange.to, 'PPP') : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dateRange.to}
                              onSelect={(date) => setDateRange(prev => ({ ...prev, to: date || new Date() }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <Button
                      onClick={handleGenerateSlots}
                      disabled={generating}
                      className="w-full h-12 bg-primary hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      {generating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Zap className="w-4 h-4 fill-current" />
                          Generate Slots Now
                        </>
                      )}
                    </Button>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3">
                      <Info className="w-5 h-5 text-indigo-500 shrink-0" />
                      <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                        This operation generates slots based on your weekly working hours schedule. Existing slots with the exact same times will be automatically skipped to prevent duplicates.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Manual Slot Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-slate-100">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Create Visa Slot</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Date</Label>
                <Input type="date" className="h-10 rounded-xl" value={format(newSlot.date, 'yyyy-MM-dd')} onChange={e => setNewSlot(p => ({ ...p, date: new Date(e.target.value) }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Start Time</Label>
                  <Input type="time" className="h-10 rounded-xl" value={newSlot.startTime} onChange={e => setNewSlot(p => ({ ...p, startTime: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">End Time</Label>
                  <Input type="time" className="h-10 rounded-xl" value={newSlot.endTime} onChange={e => setNewSlot(p => ({ ...p, endTime: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Capacity</Label>
                <Input type="number" min={1} className="h-10 rounded-xl" value={newSlot.capacity} onChange={e => setNewSlot(p => ({ ...p, capacity: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" className="rounded-xl h-10 px-5 text-xs font-bold" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button onClick={handleCreateSlot} disabled={creating} className="h-10 px-6 rounded-xl text-xs font-bold bg-primary hover:bg-emerald-700 text-white">
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />} Create Slot
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Document Upload Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-slate-100">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-900">{docSlotId ? 'Assign Document to Slot' : 'Upload Document (Global)'}</h3>
              <button onClick={() => { setShowDocModal(false); setDocSlotId(null); setDocUrl(''); }} className="p-1.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              {docSlotId ? 'This document will be made available to the specific student who books this appointment slot.' : 'This document will act as a global template/instructions file assigned to all slots.'}
            </p>
            <div className="space-y-3">
              <div>
                <Label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Document File (PDF)</Label>
                <div className="mt-1 flex gap-3">
                  <Input type="file" accept=".pdf" className="rounded-xl flex-1 h-10 pt-1.5" onChange={handleDocFileUpload} disabled={uploadingDoc} />
                  {uploadingDoc && <Loader2 className="w-5 h-5 animate-spin self-center text-primary" />}
                </div>
                {docUrl && <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> File uploaded and ready to assign</p>}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" className="rounded-xl h-10 px-5 text-xs font-bold" onClick={() => { setShowDocModal(false); setDocSlotId(null); setDocUrl(''); }}>Cancel</Button>
              <Button onClick={handleAssignDocument} disabled={!docUrl || uploadingDoc} className="h-10 px-6 rounded-xl text-xs font-bold bg-primary hover:bg-emerald-700 text-white">
                <Upload className="w-4 h-4 mr-2" /> Assign File
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
