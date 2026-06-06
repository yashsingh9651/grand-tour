'use client'

import { useState, useEffect } from 'react'
import { interviewService } from '@/lib/services/api.service'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  Loader2,
  AlertCircle
} from 'lucide-react'
import { format, isSameDay } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { motion } from 'framer-motion'

interface SlotPickerProps {
  applicationId: string
  onComplete?: () => void
}

export function SlotPicker({ applicationId, onComplete }: SlotPickerProps) {
  const [slots, setSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    fetchAvailableSlots()
  }, [])

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true)
      const data = await interviewService.getAvailableSlots()
      setSlots(data || [])
    } catch (error) {
      toast.error('Failed to fetch available slots')
    } finally {
      setLoading(false)
    }
  }

  const handleBook = async () => {
    if (!selectedSlotId) return

    try {
      setBooking(true)
      await interviewService.bookSlot(selectedSlotId, applicationId)
      toast.success('Interview slot booked successfully!')
      if (onComplete) onComplete()
    } catch (error) {
      toast.error('Failed to book interview slot')
    } finally {
      setBooking(false)
    }
  }

  const availableTimeSlots = selectedDate 
    ? slots.filter(slot => isSameDay(new Date(slot.startTime), selectedDate))
    : []

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Finding available slots...</p>
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <Card className="p-16 text-center border-2 border-dashed border-slate-200 bg-slate-50/50">
        <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-800">No Slots Available</h3>
        <p className="text-slate-500 max-w-xs mx-auto mt-2">
            There are currently no interview slots available. Please check back later or contact support.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-slate-800">Select Interview Date</h3>
            </div>
            <Card className="p-4 border border-slate-100 shadow-xl shadow-slate-500/5 bg-white">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date)
                  setSelectedSlotId(null)
                }}
                disabled={(date) => {
                   const daySlots = slots.filter(s => isSameDay(new Date(s.startTime), date))
                   return date < new Date(new Date().setHours(0,0,0,0)) || daySlots.length === 0
                }}
                className="rounded-xl mx-auto"
              />
            </Card>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-slate-800">Available Time Slots</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {selectedDate ? (
                availableTimeSlots.length > 0 ? (
                  availableTimeSlots.map((slot) => (
                    <Button
                      key={slot.id}
                      variant={selectedSlotId === slot.id ? 'default' : 'outline'}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`h-12 text-sm font-bold rounded-xl transition-all ${
                        selectedSlotId === slot.id 
                          ? 'bg-primary hover:bg-emerald-700 text-white shadow-md scale-[1.02]' 
                          : 'hover:border-primary hover:bg-emerald-50 border-slate-200'
                      }`}
                    >
                      {format(new Date(slot.startTime), 'p')}
                    </Button>
                  ))
                ) : (
                  <div className="col-span-2 py-20 text-center flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                    <CalendarIcon className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-sm text-slate-400 font-medium">No slots for this date</p>
                  </div>
                )
              ) : (
                <div className="col-span-2 py-20 text-center flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                  <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400 font-medium">Select a date from the calendar</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedSlotId && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-emerald-500/5"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl text-primary shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Selected Interview Time</p>
                <p className="text-lg font-black text-slate-900">
                    {(() => {
                        const s = slots.find(s => s.id === selectedSlotId);
                        if (!s) return 'Select a slot';
                        return `${format(new Date(s.startTime), 'PPPP')} at ${format(new Date(s.startTime), 'p')}`;
                    })()}
                </p>
              </div>
            </div>
            <Button 
                onClick={handleBook} 
                disabled={booking}
                className="w-full md:w-auto bg-primary hover:bg-emerald-700 text-white font-black px-10 h-14 rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all"
            >
              {booking ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Confirm Selection
            </Button>
          </motion.div>
        )}
    </div>
  )
}
