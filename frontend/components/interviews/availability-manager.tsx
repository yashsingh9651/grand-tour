'use client'

import { useState, useEffect } from 'react'
import { interviewService } from '@/lib/services/api.service'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Loader2, 
  Save, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Coffee, 
  Zap,
  Info,
  CalendarDays
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format, addDays, startOfDay, endOfDay } from 'date-fns'
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

export function AvailabilityManager() {
  const [availability, setAvailability] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [bufferTime, setBufferTime] = useState(0)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: addDays(new Date(), 14),
  })

  useEffect(() => {
    fetchAvailability()
  }, [])

  const fetchAvailability = async () => {
    try {
      setLoading(true)
      const data = await interviewService.getAvailability()
      if (data && data.length > 0) {
        setAvailability(data)
      } else {
        setAvailability(DAYS.map(day => ({
          dayOfWeek: day.value,
          startTime: '09:00',
          endTime: '18:00',
          slotDuration: 30,
          lunchStart: '13:00',
          lunchEnd: '14:00',
          isActive: day.value !== 0 && day.value !== 6,
        })))
      }
    } catch (error) {
      toast.error('Failed to fetch availability')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = (dayOfWeek: number, field: string, value: any) => {
    setAvailability(prev => prev.map(a => a.dayOfWeek === dayOfWeek ? { ...a, [field]: value } : a))
  }

  const saveAvailability = async () => {
    try {
      setSaving(true)
      await interviewService.updateAvailability(availability)
      toast.success('Availability settings updated')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const generateSlots = async () => {
    if (!dateRange.from || !dateRange.to) {
        toast.error('Select a date range')
        return
    }

    try {
      setGenerating(true)
      const res = await interviewService.generateSlots(
        dateRange.from.toISOString(),
        dateRange.to.toISOString(),
        bufferTime
      )
      toast.success(res.message || 'Slots generated successfully')
    } catch (error) {
      toast.error('Failed to generate slots')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-muted-foreground font-medium">Loading your schedule...</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-2 space-y-6">
        <Card className="p-0 overflow-hidden border-indigo-100 shadow-xl shadow-indigo-500/5">
          <div className="bg-gradient-to-r from-primary to-emerald-600 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Working Hours</h3>
                <p className="text-emerald-50 text-sm">Define your default weekly schedule</p>
              </div>
            </div>
            <Button 
                onClick={saveAvailability} 
                disabled={saving}
                className="bg-white text-primary hover:bg-emerald-50 font-bold shadow-lg"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Schedule
            </Button>
          </div>


          <div className="p-6 divide-y divide-slate-100">
            {DAYS.map((day, idx) => {
              const dayAvail = availability.find(a => a.dayOfWeek === day.value) || {
                  isActive: false,
                  startTime: '09:00',
                  endTime: '18:00',
                  slotDuration: 30
              }
              
              return (
                <motion.div 
                  key={day.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`py-6 flex flex-col md:flex-row md:items-center gap-6 group transition-colors ${dayAvail.isActive ? 'bg-transparent' : 'bg-slate-50/50 grayscale-[0.5]'}`}
                >
                  <div className="flex items-center gap-4 w-40 flex-shrink-0">
                    <Switch 
                      checked={dayAvail.isActive} 
                      onCheckedChange={(val) => handleUpdate(day.value, 'isActive', val)}
                      className="data-[state=checked]:bg-primary"
                    />

                    <span className={`font-bold ${dayAvail.isActive ? 'text-slate-900' : 'text-slate-400'}`}>
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
                        className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4"
                      >
                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Start Time</Label>
                          <div className="relative group/input">
                            <Clock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                            <Input 
                              type="time" 
                              value={dayAvail.startTime} 
                              onChange={(e) => handleUpdate(day.value, 'startTime', e.target.value)}
                              className="pl-9 h-9 border-slate-200 focus:border-primary transition-all text-sm"
                            />

                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">End Time</Label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                            <Input 
                              type="time" 
                              value={dayAvail.endTime} 
                              onChange={(e) => handleUpdate(day.value, 'endTime', e.target.value)}
                              className="pl-9 h-9 border-slate-200 focus:border-indigo-500 transition-all text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Lunch Break</Label>
                          <div className="flex gap-2 items-center">
                            <Input 
                              type="time" 
                              value={dayAvail.lunchStart || ''} 
                              onChange={(e) => handleUpdate(day.value, 'lunchStart', e.target.value)}
                              className="h-9 border-slate-200 focus:border-indigo-500 transition-all text-xs"
                              placeholder="Start"
                            />
                            <span className="text-slate-300">-</span>
                            <Input 
                              type="time" 
                              value={dayAvail.lunchEnd || ''} 
                              onChange={(e) => handleUpdate(day.value, 'lunchEnd', e.target.value)}
                              className="h-9 border-slate-200 focus:border-indigo-500 transition-all text-xs"
                              placeholder="End"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Slot Duration</Label>
                          <div className="relative">
                             <Input 
                                type="number" 
                                value={dayAvail.slotDuration} 
                                onChange={(e) => handleUpdate(day.value, 'slotDuration', parseInt(e.target.value))}
                                className="h-9 border-slate-200 focus:border-indigo-500 transition-all text-sm"
                              />
                              <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400">min</span>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="inactive"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex items-center h-16 text-slate-400 italic text-sm"
                      >
                        Taking a break on {day.label}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-0 overflow-hidden border-emerald-100 shadow-xl shadow-emerald-500/5">
          <div className="bg-gradient-to-r from-emerald-600 to-primary p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Auto-Generate</h3>
            </div>
            <p className="text-emerald-50 text-sm mt-1">Populate your calendar instantly</p>
          </div>


          <div className="p-6 space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500">FROM DATE</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal border-slate-200 hover:border-indigo-500 h-11">
                                <CalendarIcon className="mr-2 h-4 w-4 text-indigo-500" />
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

                <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500">TO DATE</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal border-slate-200 hover:border-indigo-500 h-11">
                                <CalendarIcon className="mr-2 h-4 w-4 text-violet-500" />
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

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <Label className="text-xs font-bold text-slate-500">BUFFER TIME</Label>
                        <span className="text-xs font-bold text-indigo-600">{bufferTime} mins</span>
                    </div>
                    <Input 
                        type="range" 
                        min="0" 
                        max="60" 
                        step="5"
                        value={bufferTime}
                        onChange={(e) => setBufferTime(parseInt(e.target.value))}
                        className="h-6 accent-indigo-600"
                    />
                    <p className="text-[10px] text-slate-400 italic">Adds extra time between back-to-back interviews</p>
                </div>
            </div>

            <Button 
                onClick={generateSlots} 
                disabled={generating} 
                className="w-full h-12 bg-primary hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 group overflow-hidden relative"
            >
              {generating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        <Zap className="w-4 h-4 fill-current" />
                        Generate Slots Now
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </Button>

            
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-3">
                <Info className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <p className="text-[11px] text-slate-600 leading-relaxed">
                    This will create individual slots based on your weekly availability for every day in the range. <strong>Existing slots with the same time will be skipped.</strong>
                </p>
            </div>
          </div>
        </Card>

        <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                <CalendarDays className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
                <p className="font-bold text-indigo-900 text-sm">Need manual slots?</p>
                <p className="text-indigo-700 text-xs">You can also add single slots from the calendar view.</p>
            </div>
        </div>
      </div>
    </div>
  )
}
