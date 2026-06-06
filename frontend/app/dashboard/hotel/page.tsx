'use client'

import { useState, useEffect } from 'react'
import { StudentLayout } from '@/components/student/student-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Lock, 
  MapPin, 
  Home, 
  Calendar as CalendarIcon, 
  FileText, 
  Building2, 
  Loader2,
  ChevronRight,
  ExternalLink,
  Download,
  Clock,
  CheckCircle2
} from 'lucide-react'
import { hotelService, applicationService, paymentService } from '@/lib/services/api.service'
import { format } from 'date-fns'
import { toast } from 'sonner'
import Link from 'next/link'

export default function HotelPage() {
  const [application, setApplication] = useState<any>(null)
  const [assignment, setAssignment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [payment1Approved, setPayment1Approved] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const appData = await applicationService.getMy()
      setApplication(appData)
      
      // Check if Payment 1 is approved directly from the application data
      const isP1Approved = appData.payment1?.status === 'COMPLETED'
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

  const handleNextStep = async () => {
    try {
      await applicationService.updateStep(application.id, 'contract')
      toast.success('Moving to next step...')
      window.location.href = '/dashboard/contract'
    } catch (error) {
      toast.error('Failed to update progress')
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

  // State 1: Payment 1 not approved
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
            <h2 className="text-2xl font-bold text-foreground">Step Locked</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Your hotel allocation will be available once your <span className="font-semibold text-primary">Payment 1</span> is approved by the administration.
            </p>
            <Link href="/dashboard/payment1">
              <Button className="mt-8">
                Go to Payment Step
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </Card>
        </div>
      </StudentLayout>
    )
  }

  // State 2: Payment approved but no hotel assigned
  if (!assignment) {
    return (
      <StudentLayout currentStep="hotel">
        <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-primary">Hotel Selection</h1>
            <p className="text-muted-foreground">Wait until hotel is assigned to you</p>
          </div>

          <Card className="p-12 bg-primary/5 border-primary/20 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Building2 className="w-32 h-32" />
            </div>
            
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 relative">
              <Clock className="w-10 h-10 text-primary animate-pulse" />
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            
            <h2 className="text-2xl font-bold text-primary">Assignment Pending</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Thank you for the payment! Our team is currently reviewing your profile and will assign a hotel shortly.
            </p>
            <div className="mt-8 flex gap-3">
              <div className="px-4 py-2 bg-background rounded-lg border text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                Status: Finding best match
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Home className="w-5 h-5" />
              What to Expect
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Accommodation', desc: 'Premium hotels near your internship' },
                { label: 'Check-in/Out', desc: 'Pre-arranged dates for your stay' },
                { label: 'Amenities', desc: 'High-speed Wi-Fi, laundry & more' },
                { label: 'Support', desc: '24/7 dedicated hotel concierge' }
              ].map((item, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg border bg-secondary/10">
                  <div className="w-8 h-8 rounded bg-background flex items-center justify-center flex-shrink-0">
                    <ChevronRight className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </StudentLayout>
    )
  }

  // State 3: Hotel Assigned
  return (
    <StudentLayout currentStep="hotel">
      <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">Hotel Assigned!</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              Your accommodation has been finalized
            </p>
          </div>
          <Button onClick={handleNextStep} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            Proceed to Next Step
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 p-0 overflow-hidden border-none shadow-xl">
            <div className="relative h-48 bg-gradient-to-br from-primary to-accent p-8 flex flex-col justify-end">
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-lg p-2">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white">{assignment.hotel.name}</h2>
              <p className="text-white/80 flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {assignment.hotel.location}
              </p>
            </div>
            <div className="p-6 bg-card grid grid-cols-2 gap-8">
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

          <Card className="p-6 flex flex-col items-center justify-center text-center space-y-4 border-primary/20 bg-primary/5">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold">Hotel Proposal</h3>
              <p className="text-xs text-muted-foreground">Download the complete hotel details and proposal.</p>
            </div>
            <a 
              href={assignment.hotel.proposalPdf} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full"
            >
              <Button variant="outline" className="w-full bg-white hover:bg-secondary">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </a>
          </Card>
        </div>

        <Card className="p-6 bg-secondary/10 border-none">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Important Information
          </h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span>Please carry your valid ID proof (Passport/Aadhar) at the time of check-in.</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span>Standard check-in time is 2:00 PM and check-out time is 11:00 AM.</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span>Breakfast is included in your stay as per the proposal.</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <span>For any issues during your stay, contact the hotel front desk or your internship coordinator.</span>
            </li>
          </ul>
        </Card>
      </div>
    </StudentLayout>
  )
}
