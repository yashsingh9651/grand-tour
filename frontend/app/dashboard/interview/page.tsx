'use client'

import { useEffect, useMemo, useState } from 'react'
import { StudentLayout } from '@/components/student/student-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { applicationService, interviewService, applicationPageContentService } from '@/lib/services/api.service'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Loader2, ChevronLeft, ChevronRight, Video,
  Calendar as CalendarIcon, FileText, Code2, Lightbulb, User, Lock
} from 'lucide-react'
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from 'date-fns'

export default function InterviewPage() {
  const router = useRouter()
  const [application, setApplication] = useState<any>(null)
  const [bookedInterview, setBookedInterview] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [slots, setSlots] = useState<any[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [bookingInProgress, setBookingInProgress] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [appData, slotData, interviewData, contentData] = await Promise.all([
          applicationService.getMy().catch(() => null),
          interviewService.getAvailableSlots().catch(() => []),
          interviewService.getMy().catch(() => null),
          applicationPageContentService.get('documents').catch(() => null),
        ])

        setApplication(appData)
        setBookedInterview(interviewData)

        const availableSlots = Array.isArray(slotData) ? slotData : []
        setSlots(availableSlots)

        // Check if all required documents are approved
        const requiredDocKeys = (contentData?.blocks || [])
          .filter((b: any) => b.type === 'upload' && b.enabled !== false)
          .map((b: any) => b.fieldKey)
        const keysToCheck = requiredDocKeys.length > 0 ? requiredDocKeys : ['RESUME', 'PASSPORT', 'PHOTO']
        
        const allVerified = keysToCheck.every((key: string) => {
          const doc = (appData?.documents || []).find((d: any) => d.type === key)
          return doc && doc.status === 'APPROVED'
        })

        const journeySteps = [
          'application',
          'documents',
          'interview',
          'payment1',
          'hotel',
          'payment2',
          'contract',
          'payment3',
          'workpermit',
          'visa',
          'travel'
        ]
        const currentStepId = appData?.currentStepId || 'interview'
        const currentStepIndex = journeySteps.indexOf(currentStepId) !== -1 
          ? journeySteps.indexOf(currentStepId) 
          : journeySteps.indexOf('interview')
        
        const isPastDocuments = currentStepIndex > journeySteps.indexOf('documents')
        setIsUnlocked(allVerified || isPastDocuments)

        if (interviewData?.scheduledAt) {
          const scheduledDate = new Date(interviewData.scheduledAt)
          setCurrentMonth(startOfMonth(scheduledDate))
          setSelectedDate(scheduledDate)
        } else if (availableSlots.length > 0) {
          const firstSlot = availableSlots[0]
          const firstSlotDate = new Date(firstSlot.startTime)
          setCurrentMonth(startOfMonth(firstSlotDate))
          setSelectedDate(firstSlotDate)
          setSelectedSlotId(firstSlot.id)
        } else {
          setCurrentMonth(startOfMonth(new Date()))
          setSelectedDate(new Date())
        }
      } catch (error: any) {
        toast.error('Failed to load interview data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (!selectedDate || slots.length === 0) return

    const availableForDate = slots.filter((slot) => isSameDay(new Date(slot.startTime), selectedDate))

    if (availableForDate.length > 0) {
      const currentSelection = availableForDate.find((slot) => slot.id === selectedSlotId)
      if (!currentSelection) {
        setSelectedSlotId(availableForDate[0].id)
      }
    } else {
      setSelectedSlotId(null)
    }
  }, [selectedDate, slots])

  const selectedSlot = useMemo(() => {
    if (!selectedSlotId) return null
    return slots.find((slot) => slot.id === selectedSlotId) || null
  }, [selectedSlotId, slots])

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    return slots.filter((slot) => isSameDay(new Date(slot.startTime), selectedDate))
  }, [selectedDate, slots])

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentMonth])

  const slotCountByDate = useMemo(() => {
    const counts = new Map<string, number>()

    slots.forEach((slot) => {
      const dayKey = format(new Date(slot.startTime), 'yyyy-MM-dd')
      counts.set(dayKey, (counts.get(dayKey) || 0) + 1)
    })

    return counts
  }, [slots])

  const upcomingInterview = bookedInterview || selectedSlot
  const upcomingDate = upcomingInterview?.scheduledAt ? new Date(upcomingInterview.scheduledAt) : selectedSlot ? new Date(selectedSlot.startTime) : null
  const interviewerName = bookedInterview?.interviewer
    ? `${bookedInterview.interviewer.firstName || ''} ${bookedInterview.interviewer.lastName || ''}`.trim()
    : 'Awaiting assignment'
  const meetingLink = bookedInterview?.locationUrl || selectedSlot?.meetLink || 'Link will be shared after booking'

  const DEFAULT_JOURNEY_STEPS = [
    'application',
    'documents',
    'interview',
    'payment1',
    'hotel',
    'payment2',
    'contract',
    'payment3',
    'workpermit',
    'visa',
    'travel'
  ]
  const currentStepId = application?.currentStepId || 'interview'
  const isPastInterview = DEFAULT_JOURNEY_STEPS.indexOf(currentStepId) > DEFAULT_JOURNEY_STEPS.indexOf('interview')
  const resolvedStatus = (isPastInterview || bookedInterview?.status === 'COMPLETED' || bookedInterview?.status === 'APPROVED')
    ? 'COMPLETED'
    : (bookedInterview?.status || 'PENDING')

  const handleBook = async () => {
    if (!selectedSlotId || !application?.id) {
      toast.error('Select an available slot first')
      return
    }

    try {
      setBookingInProgress(true)
      await interviewService.bookSlot(selectedSlotId, application.id)
      const updatedInterview = await interviewService.getMy()
      setBookedInterview(updatedInterview)
      setSlots((currentSlots) =>
        currentSlots.map((slot) =>
          slot.id === selectedSlotId ? { ...slot, isBooked: true, applicationId: application.id } : slot
        )
      )
      toast.success('Interview scheduled successfully!')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to schedule interview')
    } finally {
      setBookingInProgress(false)
    }
  }

  const handleJoinMeeting = () => {
    if (bookedInterview?.locationUrl) {
      window.open(bookedInterview.locationUrl, '_blank', 'noopener,noreferrer')
      return
    }

    if (selectedSlot?.meetLink) {
      window.open(selectedSlot.meetLink, '_blank', 'noopener,noreferrer')
      return
    }

    toast.info('Meeting link will appear here once your interview is booked')
  }

  const interviewHeader = (
    <div className="flex flex-col">
      <span className="text-[9px] font-bold tracking-widest uppercase text-[#4D6B19]">PREPARATION PHASE</span>
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground leading-none mt-1">Interview Hub</h1>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#C6F16D] animate-spin" />
      </div>
    )
  }

  if (!isUnlocked) {
    return (
      <StudentLayout currentStep="interview" headerContent={interviewHeader}>
        <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card className="p-12 border-2 border-dashed border-border bg-secondary/20 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center shadow-inner mb-6">
              <Lock className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Step Locked</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Your interview hub will unlock once all required documents are verified and approved by our team.
            </p>
            <Button className="mt-8" onClick={() => router.push('/dashboard/documents')}>
              Go to Documents Step <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout currentStep="interview" headerContent={interviewHeader}>
      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 text-foreground">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            {(!bookedInterview || bookedInterview.status === 'CANCELLED') && (
              <Card className="p-4 sm:p-6 lg:p-8 border border-border shadow-sm rounded-2xl sm:rounded-[2rem] bg-card">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">Schedule Your Slot</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">Available interview times are synced directly from the backend.</p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-muted rounded-full transition-colors"
                      onClick={() => setCurrentMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="bg-muted px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-foreground">
                      {format(currentMonth, 'MMMM yyyy')}
                    </div>
                    <button
                      className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-muted rounded-full transition-colors"
                      onClick={() => setCurrentMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-7 text-center">
                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
                      <div key={day} className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-y-3 sm:gap-y-6 text-center text-xs sm:text-sm font-bold text-foreground">
                    {calendarDays.map((day) => {
                      const dayKey = format(day, 'yyyy-MM-dd')
                      const availableCount = slotCountByDate.get(dayKey) || 0
                      const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                      const hasAvailableSlots = availableCount > 0

                      return (
                        <button
                          key={dayKey}
                          type="button"
                          onClick={() => setSelectedDate(day)}
                          className={`relative mx-auto flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all ${
                            isSelected
                              ? 'bg-[#C6F16D] text-[#1A1A1A] shadow-lg shadow-[#C6F16D]/30'
                              : isSameMonth(day, currentMonth)
                                ? 'text-foreground hover:bg-muted'
                                : 'text-muted-foreground/45'
                          }`}
                        >

                          <span>{format(day, 'd')}</span>
                          {hasAvailableSlots && (
                            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-[#C6F16D]" />
                          )}
                          {isToday(day) && !isSelected && <span className="absolute -top-1 right-1 h-2 w-2 rounded-full bg-[#8B5CF6]" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-border">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-4">
                    AVAILABLE TIMES FOR {selectedDate ? format(selectedDate, 'MMM d') : 'SELECTED DATE'}
                  </p>

                  {slotsForSelectedDate.length > 0 ? (
                    <div className="flex flex-wrap gap-4">
                      {slotsForSelectedDate.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={`px-6 py-2.5 rounded-full border text-sm font-bold transition-colors ${
                            selectedSlotId === slot.id
                              ? 'bg-[#C6F16D] border-[#C6F16D] text-[#1A1A1A] shadow-md shadow-[#C6F16D]/20'
                              : 'border-border text-foreground hover:border-[#C6F16D] hover:bg-muted'
                          }`}
                        >
                          {format(new Date(slot.startTime), 'h:mm a')}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                      No interview slots are available for this date.
                    </div>
                  )}
                </div>
              </Card>
            )}

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#8B5CF6]" />
                Booking History
              </h3>

              {bookedInterview ? (
                <div className="flex items-center justify-between p-5 bg-muted rounded-2xl border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm">
                      <div className="w-4 h-4 rounded-full border-2 border-[#4D6B19] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-[#4D6B19] rounded-full" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Interview Booked</p>
                      <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                        {resolvedStatus} • {format(new Date(bookedInterview.scheduledAt), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  <span className="bg-card px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase text-muted-foreground shadow-sm border border-border">
                    {resolvedStatus}
                  </span>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                  No interview has been scheduled yet. Select an available slot to reserve your interview.
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <Card className="p-8 border-none shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[2rem] bg-zinc-900 text-white">
              <div className="flex items-center justify-between mb-8">
                <span className="bg-[#C6F16D] text-[#1A1A1A] px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase">
                  {bookedInterview ? (resolvedStatus === 'COMPLETED' ? 'COMPLETED' : 'BOOKED') : 'UPCOMING'}
                </span>
                <Video className="w-5 h-5 text-[#C6F16D]" />
              </div>

              <h2 className="text-2xl font-bold mb-3 text-white">
                {bookedInterview 
                  ? (resolvedStatus === 'COMPLETED' ? 'Completed Interview' : 'Booked Interview') 
                  : 'Interview Session'}
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed mb-8">
                {bookedInterview
                  ? (resolvedStatus === 'COMPLETED'
                      ? 'Your interview is completed and verified. You have advanced to the next step of your journey.'
                      : 'Your interview is onboarded. Review the booking details below and join the session when ready.')
                  : 'Choose an available slot and reserve it to move your application into the interview stage.'}
              </p>

              <div className="space-y-6 mb-8">
                <div className="flex gap-4">
                  <CalendarIcon className="w-5 h-5 text-[#C6F16D] shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500">DATE & TIME</p>
                    <p className="text-sm font-bold text-white mt-0.5">
                      {upcomingDate ? format(upcomingDate, 'MMM d, h:mm a') : 'Select a slot'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <User className="w-5 h-5 text-[#C6F16D] shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500">INTERVIEWER</p>
                    <p className="text-sm font-bold text-white mt-0.5">{interviewerName}</p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-800 rounded-2xl p-4 mb-6 border border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold tracking-widest uppercase text-[#C6F16D] mb-1">MEETING ACCESS</p>
                    <p className="text-xs font-mono text-gray-300 break-all">{typeof meetingLink === 'string' ? meetingLink : 'Link will be shared after booking'}</p>
                  </div>
                  <button className="text-gray-400 hover:text-white transition-colors" onClick={() => navigator.clipboard.writeText(String(meetingLink))}>
                    <Code2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <Button
                onClick={bookedInterview && bookedInterview.status !== 'CANCELLED' ? handleJoinMeeting : handleBook}
                disabled={bookedInterview && bookedInterview.status !== 'CANCELLED' ? (resolvedStatus === 'COMPLETED') : (!selectedSlotId || bookingInProgress)}
                className="w-full bg-[#C6F16D] hover:bg-[#b5e359] text-[#1A1A1A] font-bold h-12 rounded-xl"
              >
                {bookingInProgress ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {bookedInterview && bookedInterview.status !== 'CANCELLED'
                  ? (resolvedStatus === 'COMPLETED' ? 'Interview Completed' : 'Join Meeting') 
                  : bookingInProgress ? 'Booking...' : 'Book Selected Slot'}
              </Button>
            </Card>

            <div className="bg-muted border border-border rounded-2xl p-6 border-l-4 border-l-[#8B5CF6]">
              <div className="flex gap-4">
                <Lightbulb className="w-6 h-6 text-[#8B5CF6] shrink-0" />
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-2">MENTOR TIP</p>
                  <p className="text-sm text-foreground leading-relaxed font-medium">
                    &quot;Don&apos;t just solve the problem—explain your thought process aloud. We value how you think over the final answer.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
