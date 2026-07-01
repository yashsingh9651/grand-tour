'use client'

import { useState, useEffect } from 'react'
import { StudentLayout } from '@/components/student/student-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Lock, 
  MapPin, 
  Calendar as CalendarIcon, 
  FileText, 
  Building2, 
  Loader2,
  ChevronRight,
  Download,
  Clock,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  X,
} from 'lucide-react'
import { hotelService, applicationService } from '@/lib/services/api.service'
import { format } from 'date-fns'
import { toast } from 'sonner'
import Link from 'next/link'

export default function HotelPage() {
  const [application, setApplication] = useState<any>(null)
  const [assignment, setAssignment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [payment1Approved, setPayment1Approved] = useState(false)
  const [responding, setResponding] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [declineNote, setDeclineNote] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const appData = await applicationService.getMy()
      setApplication(appData)
      const stepsAfterP1 = ['hotel', 'payment2', 'contract', 'payment3', 'workpermit', 'visa', 'travel']
      const isP1Approved = appData.payment1?.status === 'COMPLETED' || stepsAfterP1.includes(appData.currentStepId)
      setPayment1Approved(isP1Approved)
      if (isP1Approved) {
        const assignData = await hotelService.getMyAssignment()
        setAssignment(assignData)
      }
    } catch (error) {
      console.error('Failed to fetch hotel data', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    setResponding(true)
    try {
      await hotelService.respondToAssignment('ACCEPTED')
      toast.success('Hotel accepted! Moving to Payment 2...')
      setTimeout(() => { window.location.href = '/dashboard/payment2' }, 1500)
    } catch {
      toast.error('Failed to respond')
    } finally {
      setResponding(false)
    }
  }

  const handleDecline = async () => {
    setResponding(true)
    try {
      await hotelService.respondToAssignment('DECLINED', declineNote)
      toast.success('Response submitted. Our team will reach out to you.')
      setShowDeclineModal(false)
      fetchData()
    } catch {
      toast.error('Failed to respond')
    } finally {
      setResponding(false)
    }
  }

  if (loading) {
    return (
      <StudentLayout currentStep="hotel">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </StudentLayout>
    )
  }

  if (!payment1Approved) {
    return (
      <StudentLayout currentStep="hotel">
        <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Hotel Allocation</h1>
            <p className="text-muted-foreground">View your accommodation details</p>
          </div>
          <Card className="p-12 border-2 border-dashed bg-secondary/20 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center shadow-inner mb-6">
              <Lock className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold">Step Locked</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Your hotel allocation will be available once your <span className="font-semibold text-primary">Payment 1</span> is approved.
            </p>
            <Link href="/dashboard/payment1">
              <Button className="mt-8">Go to Payment Step <ChevronRight className="w-4 h-4 ml-2" /></Button>
            </Link>
          </Card>
        </div>
      </StudentLayout>
    )
  }

  if (!assignment) {
    return (
      <StudentLayout currentStep="hotel">
        <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-primary">Hotel Selection</h1>
            <p className="text-muted-foreground">Our team is finding the best match for you</p>
          </div>
          <Card className="p-12 bg-primary/5 border-primary/20 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Building2 className="w-32 h-32" /></div>
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 relative">
              <Clock className="w-10 h-10 text-primary animate-pulse" />
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <h2 className="text-2xl font-bold text-primary">Assignment Pending</h2>
            <p className="text-muted-foreground mt-2 max-w-md">Our team is reviewing your profile and will assign a hotel shortly.</p>
            <div className="mt-8 flex gap-3">
              <div className="px-4 py-2 bg-background rounded-lg border text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Status: Finding best match
              </div>
            </div>
          </Card>
        </div>
      </StudentLayout>
    )
  }

  const hasResponded = !!assignment.studentResponse
  const accepted = assignment.studentResponse === 'ACCEPTED'
  const declined = assignment.studentResponse === 'DECLINED'

  return (
    <StudentLayout currentStep="hotel">
      <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">Hotel Assigned!</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" /> Your accommodation has been finalized
            </p>
          </div>
          {accepted && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> Accepted — Proceeding to Payment 2
            </div>
          )}
          {declined && (
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full text-sm font-semibold text-rose-600 dark:text-rose-400">
              <ThumbsDown className="w-4 h-4" /> Declined — Team will contact you
            </div>
          )}
        </div>

        {/* Hotel Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 p-0 overflow-hidden border border-border shadow-md">
            <div className="relative h-48 bg-gradient-to-br from-primary to-accent p-8 flex flex-col justify-end">
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-lg p-2">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">{assignment.hotel.name}</h2>
              <p className="text-white/80 flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" /> {assignment.hotel.location}
              </p>
            </div>
            <div className="p-6 bg-card grid grid-cols-2 gap-8 text-foreground">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Check-in</p>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <p className="text-lg font-bold">{format(new Date(assignment.checkIn), 'PPP')}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Check-out</p>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  <p className="text-lg font-bold">{format(new Date(assignment.checkOut), 'PPP')}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 flex flex-col items-center justify-center text-center space-y-4 border border-border bg-muted">
            <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center shadow-md">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-1 text-foreground">
              <h3 className="font-bold">Hotel Proposal</h3>
              <p className="text-xs text-muted-foreground">Download the complete hotel details and proposal.</p>
            </div>
            {assignment.hotel.proposalPdf ? (
              <a href={assignment.hotel.proposalPdf} target="_blank" rel="noopener noreferrer" className="w-full">
                <Button variant="outline" className="w-full bg-card hover:bg-muted text-foreground">
                  <Download className="w-4 h-4 mr-2" /> Download PDF
                </Button>
              </a>
            ) : (
              <p className="text-xs text-muted-foreground">No PDF uploaded yet</p>
            )}
          </Card>
        </div>

        {/* Accept / Decline Section */}
        {!hasResponded && (
          <Card className="p-6 border border-border bg-muted">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1 text-foreground">Confirm Your Hotel Allocation</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Please review the hotel details above and either accept or decline this allocation. 
                  Accepting will move you to the next payment step. Declining will notify our team to find an alternative.
                </p>
                <div className="flex gap-3">
                  <Button onClick={handleAccept} disabled={responding} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                    {responding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                    Accept Hotel
                  </Button>
                  <Button onClick={() => setShowDeclineModal(true)} variant="outline" className="border-rose-500/30 text-rose-500 hover:bg-rose-500/10 gap-2">
                    <ThumbsDown className="w-4 h-4" /> Decline
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {accepted && (
          <Card className="p-6 border border-emerald-500/20 bg-emerald-500/10 flex items-center gap-4 text-foreground">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-emerald-600 dark:text-emerald-400">You've accepted this hotel allocation!</h3>
              <p className="text-sm text-muted-foreground mt-1">Your next step is <strong>Payment 2</strong>. Click below to proceed.</p>
              <Link href="/dashboard/payment2"><Button className="mt-3 bg-green-600 hover:bg-green-700">Go to Payment 2 <ChevronRight className="w-4 h-4 ml-2" /></Button></Link>
            </div>
          </Card>
        )}

        {declined && (
          <Card className="p-6 border border-rose-500/20 bg-rose-500/10 flex items-center gap-4 text-foreground">
            <ThumbsDown className="w-10 h-10 text-rose-500 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-rose-600 dark:text-rose-400">You've declined this hotel allocation.</h3>
              <p className="text-sm text-muted-foreground mt-1">Our team has been notified and will contact you with alternatives shortly.</p>
              {assignment.responseNote && <p className="text-xs text-rose-600 mt-2 italic font-bold">Your note: "{assignment.responseNote}"</p>}
            </div>
          </Card>
        )}

        {/* Important Info */}
        <Card className="p-6 bg-muted border border-border">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-foreground"><MapPin className="w-5 h-5 text-primary" /> Important Information</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {['Please carry your valid ID proof (Passport/Aadhar) at the time of check-in.', 
              'Standard check-in time is 2:00 PM and check-out time is 11:00 AM.',
              'Breakfast is included in your stay as per the proposal.',
              'For any issues during your stay, contact your internship coordinator.'].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-foreground">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Decline Hotel Allocation</h3>
              <button onClick={() => setShowDeclineModal(false)} className="p-1 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-muted-foreground">Please provide a reason for declining. Our team will reach out to you with alternatives.</p>
            <textarea
              value={declineNote}
              onChange={(e) => setDeclineNote(e.target.value)}
              placeholder="Optional: Reason for declining..."
              className="w-full h-28 rounded-xl border border-border bg-muted p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 text-foreground"
            />
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowDeclineModal(false)} className="hover:bg-muted text-foreground">Cancel</Button>
              <Button onClick={handleDecline} disabled={responding} className="bg-rose-600 hover:bg-rose-700 text-white gap-2">
                {responding ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Confirm Decline
              </Button>
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  )
}
