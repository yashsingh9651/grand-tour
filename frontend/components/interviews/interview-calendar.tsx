'use client'

import { useState, useEffect } from 'react'
import { interviewService } from '@/lib/services/api.service'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  Video, 
  Loader2, 
  ExternalLink,
  Settings,
  List,
  Plus,
  Search,
  Filter,
  MoreVertical,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Save
} from 'lucide-react'


import { AvailabilityManager } from './availability-manager'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion, AnimatePresence } from 'framer-motion'
import { format, isSameDay } from 'date-fns'

export function InterviewCalendar() {
  const [slots, setSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null)
  const [meetLink, setMeetLink] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newSlot, setNewSlot] = useState({ date: new Date(), startTime: '10:00', endTime: '10:30' })
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    try {
      setLoading(true)
      const data = await interviewService.getAdminSlots()
      setSlots(data || [])
    } catch (error) {
      toast.error('Failed to fetch slots')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateLink = async (id: string) => {
    try {
      await interviewService.updateSlotLink(id, meetLink)
      toast.success('Meet link updated')
      setEditingSlotId(null)
      fetchSlots()
    } catch (error) {
      toast.error('Failed to update meet link')
    }
  }

  const handleAddManualSlot = async () => {
    try {
        setAdding(true)
        const start = new Date(newSlot.date)
        const [h, m] = newSlot.startTime.split(':').map(Number)
        start.setHours(h, m, 0, 0)

        const end = new Date(newSlot.date)
        const [eh, em] = newSlot.endTime.split(':').map(Number)
        end.setHours(eh, em, 0, 0)

        await interviewService.addManualSlot(start.toISOString(), end.toISOString())
        toast.success('Slot added manually')
        setIsAddDialogOpen(false)
        fetchSlots()
    } catch (error) {
        toast.error('Failed to add slot')
    } finally {
        setAdding(false)
    }
  }

  const filteredSlots = slots.filter(slot => {
    const d = new Date(slot.startTime)
    const matchesMonth = d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()
    const matchesSearch = !searchQuery || 
        slot.application?.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slot.application?.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slot.application?.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesMonth && matchesSearch
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  return (
    <div className="space-y-8">
      <Tabs defaultValue="slots" className="w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <TabsList className="bg-slate-100/50 p-1 rounded-xl border border-slate-200 shadow-inner">
            <TabsTrigger value="slots" className="gap-2 px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <List className="w-4 h-4" />
              Interview Pipeline
            </TabsTrigger>
            <TabsTrigger value="availability" className="gap-2 px-6 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Settings className="w-4 h-4" />
              Availability Engine
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-xl border border-slate-200 shadow-sm">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-slate-50"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-bold text-sm min-w-[120px] text-center text-slate-700">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-slate-50"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-emerald-700 text-white font-bold px-6 rounded-xl shadow-lg shadow-emerald-500/20">
                        <Plus className="w-4 h-4 mr-2" />
                        Quick Add Slot
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Manual Slot Entry</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input 
                                type="date" 
                                value={format(newSlot.date, 'yyyy-MM-dd')}
                                onChange={(e) => setNewSlot(prev => ({ ...prev, date: new Date(e.target.value) }))}
                                className="h-11"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Time</Label>
                                <Input 
                                    type="time" 
                                    value={newSlot.startTime}
                                    onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                                    className="h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Time</Label>
                                <Input 
                                    type="time" 
                                    value={newSlot.endTime}
                                    onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                                    className="h-11"
                                />
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-indigo-500" />
                            <p className="text-xs text-slate-600">This slot will be immediately available for students to book.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddManualSlot} disabled={adding} className="bg-primary hover:bg-emerald-700">
                            {adding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Create Slot
                        </Button>
                    </DialogFooter>

                </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="slots" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <Input 
                    placeholder="Search by candidate name or email..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 border-slate-200 focus:border-primary rounded-xl"
                />
            </div>

            <div className="flex items-center gap-2">
                <Badge variant="outline" className="h-8 px-3 rounded-lg border-slate-200 text-slate-600 bg-slate-50">
                    Total: {filteredSlots.length}
                </Badge>
                <Badge variant="outline" className="h-8 px-3 rounded-lg border-emerald-200 text-emerald-700 bg-emerald-50">
                    Booked: {filteredSlots.filter(s => s.isBooked).length}
                </Badge>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-32 gap-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-100 animate-pulse" />
                <Loader2 className="w-10 h-10 animate-spin text-primary absolute top-3 left-3" />
              </div>

              <p className="text-slate-500 font-bold animate-pulse tracking-wide">CALIBRATING YOUR PIPELINE...</p>
            </div>
          ) : filteredSlots.length === 0 ? (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-20 text-center flex flex-col items-center gap-6 bg-white rounded-3xl border-2 border-dashed border-slate-100 shadow-inner"
            >
              <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
                <CalendarDays className="w-10 h-10 text-slate-300" />
              </div>
              <div className="space-y-2 max-w-xs">
                <p className="text-xl font-bold text-slate-800">No Interview Slots</p>
                <p className="text-sm text-slate-500">Your pipeline is clear. Start by generating new slots or manually adding one for today.</p>
              </div>
              <Button onClick={() => setIsAddDialogOpen(true)} variant="outline" className="rounded-xl px-8 h-12 hover:bg-slate-50">
                Add Your First Slot
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredSlots.map((slot, idx) => (
                  <motion.div
                    key={slot.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <Card className={`relative group overflow-hidden transition-all duration-300 hover:shadow-2xl border-none ring-1 ${slot.isBooked ? 'ring-emerald-100 bg-emerald-50/10' : 'ring-slate-100 bg-white'}`}>
                      <div className={`absolute top-0 left-0 w-1 h-full ${slot.isBooked ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <Badge className={slot.isBooked ? 'bg-emerald-500' : 'bg-slate-400'}>
                                    {slot.isBooked ? 'Booked' : 'Open'}
                                </Badge>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interview Slot</span>
                            </div>
                            <h4 className="text-lg font-extrabold text-slate-800">
                                {format(new Date(slot.startTime), 'EEEE, MMM do')}
                            </h4>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this slot?')) {
                                  try {
                                    await interviewService.deleteSlot(slot.id)
                                    toast.success('Slot deleted')
                                    fetchSlots()
                                  } catch (e) {
                                    toast.error('Failed to delete slot')
                                  }
                                }
                              }}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>

                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6 bg-white/50 p-3 rounded-2xl border border-white/80 shadow-inner">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-emerald-50 rounded-lg">
                                    <Clock className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <span className="text-sm font-bold text-slate-700">
                                    {format(new Date(slot.startTime), 'p')}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-emerald-50 rounded-lg">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <span className="text-sm font-bold text-slate-700">
                                    {format(new Date(slot.endTime), 'p')}
                                </span>
                            </div>
                        </div>


                        {slot.isBooked && slot.application ? (
                          <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-emerald-100 shadow-sm">
                              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xs ring-2 ring-white">
                                {slot.application.user.firstName[0]}{slot.application.user.lastName[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-900 truncate">
                                  {slot.application.user.firstName} {slot.application.user.lastName}
                                </p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase truncate tracking-tight">
                                    {slot.application.user.email}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-[10px] uppercase tracking-wider text-slate-400 font-black">Video Integration</Label>
                              {editingSlotId === slot.id ? (
                                <div className="flex gap-2">
                                  <Input 
                                    value={meetLink} 
                                    onChange={(e) => setMeetLink(e.target.value)}
                                    placeholder="Paste link here..."
                                    className="h-9 text-xs border-emerald-200 focus:border-primary"
                                    autoFocus
                                  />
                                  <Button size="sm" className="h-9 px-4 bg-primary" onClick={() => handleUpdateLink(slot.id)}>Save</Button>
                                  <Button size="sm" variant="ghost" className="h-9" onClick={() => setEditingSlotId(null)}><Plus className="rotate-45 w-4 h-4" /></Button>
                                </div>

                              ) : (
                                <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-50/80 rounded-2xl border border-slate-100 group/link">
                                  <div className="flex items-center gap-2 truncate">
                                    <Video className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                                    <span className="text-xs text-slate-600 font-bold truncate">
                                        {slot.meetLink || 'Awaiting meeting link...'}
                                    </span>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-7 w-7 rounded-lg hover:bg-white hover:shadow-sm" 
                                        onClick={() => {
                                            setEditingSlotId(slot.id)
                                            setMeetLink(slot.meetLink || '')
                                        }}
                                    >
                                      <Settings className="w-3.5 h-3.5" />
                                    </Button>
                                    {slot.meetLink && (
                                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-white hover:shadow-sm" asChild>
                                        <a href={slot.meetLink} target="_blank" rel="noopener noreferrer">
                                          <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                                        </a>
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-8 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30">
                            <Clock className="w-6 h-6 text-slate-200 mb-2" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Open for Candidate Booking</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="availability" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <AvailabilityManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
