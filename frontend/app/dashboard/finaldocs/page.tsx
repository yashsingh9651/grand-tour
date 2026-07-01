'use client'

import { useState, useEffect } from 'react'
import { StudentLayout } from '@/components/student/student-layout'
import { Card } from '@/components/ui/card'
import { Lock, Loader2 } from 'lucide-react'
import { applicationService } from '@/lib/services/api.service'

export default function FinalDocsPage() {
  const [application, setApplication] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await applicationService.getMy()
        setApplication(data)
      } catch (error: any) {
        console.error('Error fetching Final Docs application data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <StudentLayout currentStep={application?.currentStepId}>
      <div className="max-w-4xl space-y-6 text-foreground">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Final Documents</h1>
          <p className="text-muted-foreground">Submit final required documents</p>
        </div>

        <Card className="p-8 border border-border bg-card">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">This Step is Locked</h2>
              <p className="text-muted-foreground mt-1">Final documents submission will be enabled in later stages</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-border bg-card">
          <p className="text-sm text-muted-foreground">
            You will be asked to submit various final documents towards the end of your onboarding process.
          </p>
        </Card>
      </div>
    </StudentLayout>
  )
}
