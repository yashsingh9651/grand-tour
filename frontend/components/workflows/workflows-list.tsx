'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { workflowService } from '@/lib/services/api.service'
import { Edit2, Loader2, Settings } from 'lucide-react'
import { WorkflowBuilder } from './workflow-builder'
import { toast } from 'sonner'

export function WorkflowsList() {
  const [workflow, setWorkflow] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showBuilder, setShowBuilder] = useState(false)

  useEffect(() => {
    fetchWorkflow()
  }, [])

  const fetchWorkflow = async () => {
    try {
      setLoading(true)
      const data = await workflowService.get()
      setWorkflow(data)
    } catch (error: any) {
      toast.error('Failed to load workflow')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (updated: any) => {
    try {
      const data = await workflowService.update(updated)
      setWorkflow(data)
      setShowBuilder(false)
      toast.success('Workflow updated successfully')
    } catch (error: any) {
      toast.error('Failed to update workflow')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-muted-foreground">Loading workflow configuration...</p>
      </div>
    )
  }

  if (showBuilder && workflow) {
    return (
      <WorkflowBuilder
        workflow={workflow}
        onSave={handleSave}
        onCancel={() => setShowBuilder(false)}
      />
    )
  }

  if (!workflow) return null

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Main Application Process</h2>
          <p className="text-sm text-muted-foreground">
            Configure the steps and fields for the Grand Tour internship process.
          </p>
        </div>
      </div>

      <Card className="p-6 border-l-4 border-l-primary">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-xl text-foreground">{workflow.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {workflow.description || 'Manage the core steps for all internship applications.'}
            </p>
            
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Workflow Steps ({workflow.steps?.length || 0})
              </p>
              <div className="flex flex-wrap gap-2">
                {workflow.steps?.map((step: any, index: number) => (
                  <div 
                    key={step.id} 
                    className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border"
                  >
                    <span className="text-xs font-bold bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{step.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-100 text-green-700 border border-green-200">
                Active Process
              </span>
              <span className="text-xs text-muted-foreground">
                Last updated: {new Date(workflow.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <Button
            onClick={() => setShowBuilder(true)}
            className="gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Configure Workflow
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-muted/30 border-dashed">
        <h4 className="font-semibold text-sm mb-2 text-foreground">Global Workflow Note</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Changes to this workflow will immediately affect all new applications. Existing applications 
          will maintain their current step but follow the updated structure for subsequent stages.
        </p>
      </Card>
    </div>
  )
}
