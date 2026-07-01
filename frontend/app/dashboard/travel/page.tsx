'use client'

import { useState, useEffect } from 'react'
import { StudentLayout } from '@/components/student/student-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { applicationService, travelService } from '@/lib/services/api.service'
import { toast } from 'sonner'
import {
  Loader2, Lock, Plane, FileDown, ChevronRight, PartyPopper,
  Download, CheckCircle2, Sparkles
} from 'lucide-react'

export default function TravelPage() {
  const [application, setApplication] = useState<any>(null)
  const [travelDocs, setTravelDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const appData = await applicationService.getMy()
      setApplication(appData)
      if (appData?.currentStepId === 'travel') {
        const docs = await travelService.getMyDocuments().catch(() => [])
        setTravelDocs(docs || [])
      }
    } catch {
      toast.error('Failed to load travel data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <StudentLayout currentStep="travel">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </StudentLayout>
    )
  }

  const isUnlocked = application?.currentStepId === 'travel'

  if (!isUnlocked) {
    return (
      <StudentLayout currentStep="travel">
        <div className="max-w-3xl rounded-3xl border-2 border-dashed border-border bg-secondary/20 p-12 flex flex-col items-center text-center text-foreground mx-auto mt-10">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <Lock className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">Travel — Locked</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            Travel arrangements will be available after your visa appointment is completed.
          </p>
          <Button className="mt-8" onClick={() => window.location.href = `/dashboard/${application?.currentStepId || 'application'}`}>
            Return to Current Step <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </StudentLayout>
    )
  }

  return (
    <StudentLayout currentStep="travel">
      <div className="max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-foreground">
        {/* 🎉 Congratulations Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-violet-600 to-indigo-700 p-8 text-white">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
          {/* Animated dots */}
          <div className="absolute top-4 right-8 w-2 h-2 rounded-full bg-white/50 animate-ping" />
          <div className="absolute top-12 right-20 w-1.5 h-1.5 rounded-full bg-yellow-300/70 animate-ping" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-8 left-12 w-2 h-2 rounded-full bg-white/40 animate-ping" style={{ animationDelay: '1s' }} />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-xl">
              <PartyPopper className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span className="text-xs font-black tracking-widest text-yellow-300 uppercase">Congratulations!</span>
              </div>
              <h1 className="text-4xl font-black leading-tight mb-2">You're Almost There!</h1>
              <p className="text-white/80 max-w-lg leading-relaxed">
                You've successfully completed all the required steps. Your travel documents are ready. 
                Download them below and get ready for your Grand Tour!
              </p>
            </div>
            <div className="hidden md:flex flex-col items-center gap-2">
              <div className="text-6xl font-black text-white/20">🌍</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative z-10 mt-6 pt-6 border-t border-white/20">
            <div className="flex items-center justify-between text-xs font-bold text-white/70 mb-2">
              <span>Journey Progress</span>
              <span>100%</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-300 to-green-400 rounded-full animate-pulse" style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        {/* Travel Documents */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Plane className="w-5 h-5 text-primary" />
              </div>
              Travel Documents
            </h2>
            <span className="text-sm text-muted-foreground">{travelDocs.length} document{travelDocs.length !== 1 ? 's' : ''}</span>
          </div>

          {travelDocs.length === 0 ? (
            <Card className="p-10 border border-border border-dashed text-center bg-muted">
              <Plane className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
              <h3 className="font-bold text-lg text-foreground">Documents Coming Soon</h3>
              <p className="text-muted-foreground mt-1 text-sm">Our team is preparing your travel documents. They'll appear here shortly.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {travelDocs.map((doc) => (
                <Card key={doc.id} className="p-5 border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileDown className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Ready to download</p>
                    </div>
                    <a 
                      href={doc.url?.includes('cloudinary.com') ? doc.url.replace('/upload/', '/upload/fl_attachment/') : doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      download
                    >
                      <Button size="sm" className="gap-2 shrink-0">
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Next Steps */}
        <Card className="p-6 bg-muted border border-border rounded-2xl">
          <h3 className="font-bold mb-4 text-foreground">What to do next</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Print Documents', desc: 'Print all downloaded documents and keep them safe.' },
              { step: '2', title: 'Pack & Prepare', desc: 'Prepare your luggage based on the travel itinerary.' },
              { step: '3', title: 'Stay Tuned', desc: 'Your coordinator will send final departure details soon.' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl shadow-sm text-foreground">
                <div className="w-8 h-8 rounded-full bg-primary text-[#1A1A1A] flex items-center justify-center text-sm font-black flex-shrink-0">{item.step}</div>
                <div>
                  <p className="font-bold text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </StudentLayout>
  )
}
