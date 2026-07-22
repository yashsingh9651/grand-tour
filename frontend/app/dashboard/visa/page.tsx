'use client'

import { useState, useEffect } from 'react'
import { StudentLayout } from '@/components/student/student-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { applicationService, visaService } from '@/lib/services/api.service'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
  Loader2, Lock, Stamp, Calendar, Clock, Video, Download,
  ChevronRight, CheckCircle2, FileDown, AlertCircle, Globe, ExternalLink, MapPin
} from 'lucide-react'
import Link from 'next/link'

export default function VisaPage() {
  const [application, setApplication] = useState<any>(null)
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [mySlot, setMySlot] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const appData = await applicationService.getMy()
      setApplication(appData)

      const isUnlocked = ['visa', 'travel'].includes(appData?.currentStepId)
      if (isUnlocked) {
        const [slots, myBooking] = await Promise.all([
          visaService.getAvailableSlots().catch(() => []),
          visaService.getMySlot().catch(() => null),
        ])
        setAvailableSlots(slots || [])
        setMySlot(myBooking)
      }
    } catch {
      toast.error('Failed to load visa data')
    } finally {
      setLoading(false)
    }
  }

  const handleBookSlot = async () => {
    if (!selectedSlot) { toast.error('Please select a time slot'); return }
    setBooking(true)
    try {
      const result = await visaService.bookSlot(selectedSlot)
      setMySlot(result)
      toast.success('Visa appointment booked successfully!')
      fetchData()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to book slot')
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <StudentLayout currentStep="visa">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </StudentLayout>
    )
  }

  const isUnlocked = ['visa', 'travel'].includes(application?.currentStepId)

  if (!isUnlocked) {
    return (
      <StudentLayout currentStep="visa">
        <div className="max-w-3xl rounded-3xl border-2 border-dashed border-border bg-secondary/20 p-12 flex flex-col items-center text-center text-foreground mx-auto mt-10">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">Visa Appointment — Locked</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            Visa scheduling unlocks after your <strong>Work Permit</strong> is issued.
          </p>
          <Button className="mt-8" onClick={() => window.location.href = `/dashboard/${application?.currentStepId || 'application'}`}>
            Return to Current Step <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </StudentLayout>
    )
  }

  const hasBooked = !!mySlot

  return (
    <StudentLayout currentStep="visa">
      <div className="max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-foreground">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Stamp className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Visa Appointment</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Schedule your visa processing appointment</p>
            </div>
          </div>
          {hasBooked && (
            <span className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-bold rounded-full self-start sm:self-auto">
              <CheckCircle2 className="w-4 h-4" /> Appointment Booked
            </span>
          )}
        </div>

        {/* Booked Appointment Card */}
        {hasBooked && (
          <Card className="p-0 overflow-hidden border border-border shadow-md bg-card">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-violet-600" />
            <div className="p-4 sm:p-6 lg:p-8">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Date & Time */}
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Appointment Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <p className="text-xl font-bold">{format(new Date(mySlot.startTime), 'PPP')}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Time Slot</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <p className="text-xl font-bold">
                      {format(new Date(mySlot.startTime), 'p')} – {format(new Date(mySlot.endTime), 'p')}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Location / Venue</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <p className="text-xl font-bold">{mySlot.meetLink || 'VFS Center / Consulate'}</p>
                  </div>
                </div>
              </div>

              {/* Document download if available */}
              {mySlot.documentUrl && (
                <div className="mt-4 p-4 bg-muted border border-border rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center shadow-sm flex-shrink-0">
                    <FileDown className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">Official Documents</p>
                    <p className="text-sm text-muted-foreground">Download your visa appointment documents.</p>
                  </div>
                  <a href={mySlot.documentUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="gap-2 border-border text-foreground hover:bg-muted">
                      <Download className="w-4 h-4" /> Download
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Slot Picker (if not booked) */}
        {!hasBooked && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Available Appointment Slots</h2>
              <span className="text-sm text-muted-foreground">{availableSlots.length} slots available</span>
            </div>

            {availableSlots.length === 0 ? (
              <Card className="p-12 text-center border border-border border-dashed bg-muted">
                <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                <h3 className="font-bold text-lg">No Slots Available</h3>
                <p className="text-muted-foreground mt-1">Our team is scheduling new appointment slots. Please check back shortly.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableSlots.map((slot) => (
                  <Card
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot.id)}
                    className={`p-5 cursor-pointer transition-all duration-200 hover:shadow-lg border ${selectedSlot === slot.id ? 'border-primary bg-primary/10 shadow-lg' : 'border-border hover:border-primary bg-card text-foreground'}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedSlot === slot.id ? 'bg-[#C6F16D] text-[#1A1A1A]' : 'bg-muted'}`}>
                        <Calendar className={`w-5 h-5 ${selectedSlot === slot.id ? 'text-[#1A1A1A]' : 'text-muted-foreground'}`} />
                      </div>
                      {selectedSlot === slot.id && (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <p className="font-bold text-foreground">{format(new Date(slot.startTime), 'EEEE, PPP')}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(new Date(slot.startTime), 'p')} – {format(new Date(slot.endTime), 'p')}
                    </p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-green-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Available
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {availableSlots.length > 0 && (
              <div className="flex justify-end">
                <Button
                  size="lg"
                  onClick={handleBookSlot}
                  disabled={!selectedSlot || booking}
                  className="gap-3 shadow-lg"
                >
                  {booking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
                  Confirm Appointment
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <Card className="p-6 bg-muted border border-border rounded-2xl">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" /> Before Your Appointment
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Ensure you have a stable internet connection for the video call.',
              'Keep all original documents ready (passport, photos, form copies).',
              'Join the meeting 5 minutes before the scheduled time.',
              'Dress professionally as you would for an in-person interview.',
              'Have your work permit document ready to share on screen if requested.',
              'Test your camera and microphone before the appointment.',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                {tip}
              </div>
            ))}
          </div>
        </Card>

        {hasBooked && (
          <div className="flex justify-end">
            <Link href="/dashboard/travel">
              <Button variant="outline" className="gap-2">
                Next: Travel Arrangements <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </StudentLayout>
  )
}
