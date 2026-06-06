'use client'

import { useState, useEffect } from 'react'
import { StudentLayout } from '@/components/student/student-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { applicationService, workflowService } from '@/lib/services/api.service'
import { 
  ShieldCheck, Download, Award, CheckCircle2, Clock, Users, ArrowRight, Loader2, Sparkles, AlertTriangle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function SelectionPage() {
  const router = useRouter()
  const [application, setApplication] = useState<any>(null)
  const [workflow, setWorkflow] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // Selection states
  const [selectionAction, setSelectionAction] = useState<'ACCEPT' | 'REJECT' | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [appData, wfData] = await Promise.all([
          applicationService.getMy(),
          workflowService.get()
        ])
        setApplication(appData)
        setWorkflow(wfData)
      } catch (error: any) {
        toast.error('Failed to load selection details')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleConfirmSelection = async () => {
    if (!selectionAction) return

    try {
      setSubmitting(true)
      
      if (selectionAction === 'ACCEPT') {
        // Advance step to payment1 and set status to ACCEPTED
        let nextStepId = 'payment1'
        if (workflow?.steps) {
          const currentIdx = workflow.steps.findIndex((s: any) => s.id === 'selection')
          if (currentIdx !== -1 && currentIdx < workflow.steps.length - 1) {
            nextStepId = workflow.steps[currentIdx + 1].id
          }
        }

        const updatedApp = {
          ...application,
          status: 'ACCEPTED',
          currentStepId: nextStepId,
        }
        
        await applicationService.update(application.id, updatedApp)
        toast.success('Congratulations! Offer accepted successfully.')
        router.push(`/dashboard/${nextStepId}`)
      } else {
        // Update status to REJECTED
        const updatedApp = {
          ...application,
          status: 'REJECTED',
        }
        await applicationService.update(application.id, updatedApp)
        toast.error('Offer rejected. Your decision has been saved.')
        window.location.reload()
      }
    } catch (error: any) {
      toast.error('Failed to submit your selection decision')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  const isAlreadyAccepted = application?.status === 'ACCEPTED' || 
    (workflow?.steps?.findIndex((s: any) => s.id === application?.currentStepId) > 
     workflow?.steps?.findIndex((s: any) => s.id === 'selection'))

  const isAlreadyRejected = application?.status === 'REJECTED'

  return (
    <StudentLayout 
      currentStep="selection"
      headerContent={
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          APPLICATIONS › <span className="text-[#84CC16] font-extrabold">OFFER LETTER</span>
        </div>
      }
    >
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Page Title Section & Status Badge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-[#1A1A1A]">
              Selection Verdict
            </h1>
            <p className="text-gray-500 text-base max-w-2xl font-medium">
              Congratulations! Your performance in the Creative Strategy cohort has been exemplary.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-[#BEF264]/20 border border-[#BEF264]/50 px-5 py-3 rounded-2xl shrink-0 self-start md:self-center">
            <div className="w-8 h-8 bg-[#BEF264] rounded-full flex items-center justify-center">
              <Award className="w-4 h-4 text-[#3F6212]" />
            </div>
            <div>
              <p className="text-[9px] font-bold tracking-widest text-[#3F6212] uppercase leading-none">SELECTION STATUS</p>
              <p className="text-sm font-extrabold text-[#2F4F08] mt-0.5">Status: Selected</p>
            </div>
          </div>
        </div>

        {/* Main Grid Content */}
        <div className="grid lg:grid-cols-5 gap-8">
          
          {/* Left Column (3/5 width) — Internship & Document Details */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Offer details Card */}
            <Card className="p-8 border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-[2rem] bg-white relative overflow-hidden">
              {/* Background "OFFER" watermark text */}
              <div className="absolute right-8 top-4 text-[120px] font-black text-slate-50 select-none pointer-events-none tracking-tighter leading-none opacity-80">
                OFFER
              </div>
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{application?.hotelAssignment ? 'Hospitality Intern' : 'Principal Design Intern'}</h2>
                    <p className="text-sm text-gray-400 font-medium">{application?.hotelAssignment?.hotel?.name || 'Lumina Global Creative Studio'} • Full-time</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-100">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">START DATE</p>
                    <p className="text-base font-extrabold text-gray-900 mt-1">
                      {application?.hotelAssignment?.checkIn ? new Date(application.hotelAssignment.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Sept 15, 2024'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">DURATION</p>
                    <p className="text-base font-extrabold text-gray-900 mt-1">
                      {application?.hotelAssignment?.checkIn && application?.hotelAssignment?.checkOut ? 
                        `${Math.max(1, Math.round((new Date(application.hotelAssignment.checkOut).getTime() - new Date(application.hotelAssignment.checkIn).getTime()) / (1000 * 60 * 60 * 24 * 30)))} Months` 
                        : '6 Months'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">STIPEND</p>
                    <p className="text-base font-extrabold text-purple-600 mt-1">$3,200 / mo</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed font-medium">
                    We are pleased to offer you the position of {application?.hotelAssignment ? 'Hospitality Intern' : 'Principal Design Intern'}. This role will involve working directly with the {application?.hotelAssignment ? 'hotel management at ' + (application.hotelAssignment.hotel?.name || '') : 'Senior Creative Leads on global campaigns'}. You've demonstrated exceptional technical skills and an editorial eye that aligns perfectly with our vision.
                  </p>
                  
                  <ul className="space-y-3 pl-1">
                    {[
                      "Ownership of 2 major project workstreams.",
                      "Weekly mentorship sessions with the Design Director.",
                      "Full access to Lumina's internal research library."
                    ].map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-gray-600 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>

            {/* Document Card */}
            <Card className="border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-[2rem] bg-white overflow-hidden border-b-4 border-purple-500">
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Official Contract Agreement</h3>
                    <p className="text-xs text-gray-400 font-semibold mt-0.5">Word Document • 1.4 MB • Updated 2 hours ago</p>
                  </div>
                </div>

                <a href={application?.hotelAssignment?.hotel?.proposalPdf || "#"} target={application?.hotelAssignment?.hotel?.proposalPdf ? "_blank" : undefined} onClick={(e) => { if(!application?.hotelAssignment?.hotel?.proposalPdf) { e.preventDefault(); toast.success('Contract download started') } }} className="shrink-0">
                  <Button className="bg-[#1A1A1A] hover:bg-[#333] text-white rounded-xl h-11 px-5 gap-2 font-bold text-xs uppercase tracking-wider">
                    <Download className="w-4 h-4" />
                    Download Contract
                  </Button>
                </a>
              </div>
            </Card>
          </div>

          {/* Right Column (2/5 width) — Decision & Sidecards */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Action Required Card */}
            <Card className="p-8 border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-[2rem] bg-[#0A0A0A] text-white space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-lime-500/10 to-transparent rounded-full blur-2xl" />
              
              <div className="space-y-2">
                <span className="text-[10px] font-black tracking-widest text-[#BEF264] uppercase block">
                  ACTION REQUIRED
                </span>
                <h3 className="text-2xl font-bold tracking-tight">
                  {isAlreadyAccepted ? 'Offer Accepted' : isAlreadyRejected ? 'Offer Declined' : 'Accept your placement'}
                </h3>
                <p className="text-gray-400 text-xs font-semibold leading-relaxed">
                  {isAlreadyAccepted 
                    ? 'You have accepted your internship position at Lumina Academy! Please proceed to the Financial Center to secure it.' 
                    : isAlreadyRejected
                    ? 'You have declined this internship offer. If this was a mistake, please reach out to candidate support.'
                    : 'Please review the contract and make your decision by July 28, 2024 at 11:59 PM PST.'
                  }
                </p>
              </div>

              {!isAlreadyAccepted && !isAlreadyRejected ? (
                <div className="space-y-4 pt-2">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setSelectionAction('ACCEPT')}
                      className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-bold transition-all border ${
                        selectionAction === 'ACCEPT' 
                          ? 'bg-[#BEF264] border-[#BEF264] text-[#1A1A1A] scale-[1.02]' 
                          : 'bg-transparent border-gray-800 text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      Accept
                    </button>
                    
                    <button 
                      onClick={() => setSelectionAction('REJECT')}
                      className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-sm font-bold transition-all border ${
                        selectionAction === 'REJECT' 
                          ? 'bg-rose-500/15 border-rose-500/30 text-rose-400 scale-[1.02]' 
                          : 'bg-transparent border-gray-800 text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" stroke="currentColor" />
                      </svg>
                      Reject
                    </button>
                  </div>

                  <Button 
                    onClick={handleConfirmSelection}
                    disabled={submitting || !selectionAction}
                    className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-800 text-[#1A1A1A] disabled:text-gray-500 font-extrabold h-12 rounded-xl tracking-wider text-xs uppercase transition-all mt-2"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'CONFIRM SELECTION'}
                  </Button>
                </div>
              ) : (
                <div className="pt-2">
                  {isAlreadyAccepted ? (
                    <Button 
                      onClick={() => router.push('/dashboard/payment1')}
                      className="w-full bg-[#BEF264] hover:bg-[#aee64b] text-[#1A1A1A] font-extrabold h-12 rounded-xl tracking-wider text-xs uppercase transition-all gap-2"
                    >
                      PROCEED TO FINANCIAL CENTER
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      <span className="text-xs font-semibold">Offer has been declined.</span>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Your Future Peers Card */}
            <Card className="p-6 border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-[2rem] bg-white space-y-4">
              <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase block">
                YOUR FUTURE PEERS
              </span>
              
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3 overflow-hidden">
                  <img 
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white" 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" 
                    alt="Peer avatar 1" 
                  />
                  <img 
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white" 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" 
                    alt="Peer avatar 2" 
                  />
                  <img 
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white" 
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100" 
                    alt="Peer avatar 3" 
                  />
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-purple-100 ring-2 ring-white text-[11px] font-bold text-purple-600">
                    +12
                  </div>
                </div>
                
                <p className="text-xs font-semibold text-gray-600 leading-normal flex-1">
                  Join 15 other high-performing students selected for this cohort.
                </p>
              </div>
            </Card>

            {/* Tour the HQ Card */}
            <Card className="h-44 border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-[2rem] overflow-hidden relative group cursor-pointer" onClick={() => toast.info('Tour booking available soon!')}>
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: "url('/lumina_hq.png')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent z-10" />
              
              <div className="absolute bottom-6 left-6 right-6 z-20 text-white space-y-1">
                <h4 className="text-lg font-bold tracking-tight">Tour the HQ</h4>
                <p className="text-gray-300 text-xs font-medium">See where you'll be working this fall.</p>
              </div>
            </Card>
            
          </div>
        </div>
      </div>
    </StudentLayout>
  )
}
