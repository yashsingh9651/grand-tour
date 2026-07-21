'use client'

import { useState } from 'react'
import { Workflow, WorkflowStep } from '@/lib/workflow-schema'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StepEditor } from './step-editor'
import { 
  GripVertical, 
  Plus, 
  Trash2, 
  Settings2, 
  Workflow as WorkflowIcon, 
  ArrowRight,
  Eye,
  Layout,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react'

interface WorkflowBuilderProps {
  workflow?: Workflow
  onSave: (workflow: Workflow) => void
  onCancel: () => void
}

export function WorkflowBuilder({ workflow, onSave, onCancel }: WorkflowBuilderProps) {
  const [name, setName] = useState(workflow?.name || '')
  const [description, setDescription] = useState(workflow?.description || '')
  const [status, setStatus] = useState<'active' | 'draft' | 'archived'>(workflow?.status || 'draft')
  const [steps, setSteps] = useState<WorkflowStep[]>(workflow?.steps || [])
  const [editingStepId, setEditingStepId] = useState<string | null>(null)

  const handleAddStep = () => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      name: 'New Process Step',
      description: 'Describe what happens in this stage',
      order: steps.length + 1,
      enabled: true,
      fields: [],
    }
    setSteps([...steps, newStep])
    setEditingStepId(newStep.id)
  }

  const handleDeleteStep = (id: string) => {
    if (confirm('Are you sure you want to delete this step? All configured fields will be lost.')) {
      setSteps(steps.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i + 1 })))
    }
  }

  const handleSaveStep = (updatedStep: WorkflowStep) => {
    setSteps(steps.map((s) => (s.id === updatedStep.id ? updatedStep : s)))
    setEditingStepId(null)
  }

  const handleSaveWorkflow = () => {
    if (!name.trim()) {
      alert('Please enter a workflow name')
      return
    }

    const updatedWorkflow: Workflow = {
      id: workflow?.id || `wf-${Date.now()}`,
      name,
      description,
      status,
      steps,
      createdAt: workflow?.createdAt || new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
    }

    onSave(updatedWorkflow)
  }

  if (editingStepId) {
    const step = steps.find((s) => s.id === editingStepId)
    if (step) {
      return (
        <StepEditor
          step={step}
          onSave={handleSaveStep}
          onCancel={() => setEditingStepId(null)}
        />
      )
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs mb-1">
            <WorkflowIcon className="w-4 h-4" />
            Process Management
          </div>
          <h2 className="text-4xl font-black tracking-tight text-foreground">Workflow Master</h2>
          <p className="text-muted-foreground text-lg">Define the journey for your internship candidates</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="px-6 h-12 border-2 hover:bg-secondary">
            Cancel Changes
          </Button>
          <Button onClick={handleSaveWorkflow} className="px-8 h-12 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 text-lg font-bold">
            Publish Workflow
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Workflow Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 border-2 border-primary/10 shadow-sm space-y-6 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Workflow Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Grand Tour Summer 2024"
                  className="bg-background border-2 h-11 focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is the goal of this workflow?"
                  className="w-full h-24 p-3 bg-background border-2 border-input rounded-md focus:border-primary transition-all outline-none text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">Global Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'draft' | 'archived')}
                  className="w-full h-11 px-3 bg-background border-2 border-input rounded-md focus:border-primary transition-all outline-none text-sm font-bold"
                >
                  <option value="draft">Draft - Private</option>
                  <option value="active">Active - Live for Students</option>
                  <option value="archived">Archived - Hidden</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-indigo-950 text-indigo-50 border-none shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <WorkflowIcon className="w-24 h-24 rotate-12" />
            </div>
            <div className="relative z-10 space-y-4">
              <h4 className="font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-indigo-300" />
                Live Synchronization
              </h4>
              <p className="text-sm text-indigo-200/80 leading-relaxed">
                Every step you define here is instantly converted into a dedicated student dashboard page with real-time data persistence.
              </p>
              <div className="pt-2 flex items-center gap-4 text-xs font-bold text-indigo-300 uppercase tracking-tighter">
                <div className="flex items-center gap-1">
                  <Layout className="w-3 h-3" />
                  Auto-Layout
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Real-time
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Steps Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end">
            <h3 className="text-2xl font-black text-foreground flex items-center gap-3">
              Journey Steps
              <span className="text-sm font-bold bg-secondary px-3 py-1 rounded-full text-muted-foreground">{steps.length} STAGES</span>
            </h3>
            <Button onClick={handleAddStep} variant="outline" className="h-10 border-2 border-dashed border-primary/50 text-primary hover:bg-primary/5 font-bold gap-2">
              <Plus className="w-4 h-4" />
              Add Journey Stage
            </Button>
          </div>

          {steps.length === 0 ? (
            <Card className="p-16 text-center border-2 border-dashed border-muted bg-muted/5 group hover:bg-muted/10 transition-colors">
              <div className="max-w-xs mx-auto space-y-6">
                <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground font-bold">No steps in this journey yet.</p>
                  <p className="text-xs text-muted-foreground/60">Start by adding the first stage of your candidate&apos;s process.</p>
                </div>
                <Button onClick={handleAddStep} className="w-full font-bold">Create First Step</Button>
              </div>
            </Card>
          ) : (
            <div className="relative space-y-4 before:absolute before:left-8 before:top-4 before:bottom-4 before:w-1 before:bg-gradient-to-b before:from-primary/20 before:via-primary/20 before:to-transparent">
              {steps.map((step, index) => (
                <div key={step.id} className="relative pl-14 animate-in slide-in-from-left-4 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                  {/* Timeline Node */}
                  <div className="absolute left-[26px] top-8 w-4 h-4 bg-background border-4 border-primary rounded-full z-10 shadow-[0_0_0_4px_rgba(var(--primary),0.1)]" />
                  
                  <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30 group bg-card/50 backdrop-blur-sm overflow-hidden relative">
                    {/* Background Index */}
                    <div className="absolute -right-4 -bottom-8 text-8xl font-black text-muted-foreground/5 italic pointer-events-none group-hover:text-primary/5 transition-colors">
                      0{index + 1}
                    </div>

                    <div className="flex items-center justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[10px] font-black bg-primary text-primary-foreground px-2 py-0.5 rounded tracking-tighter">STAGE {index + 1}</span>
                          <h4 className="text-xl font-bold text-foreground truncate">{step.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground truncate italic">{step.description || 'No description provided'}</p>
                        
                        <div className="flex items-center gap-6 mt-4">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                            <Layout className="w-3.5 h-3.5" />
                            {step.fields.length} Configured Fields
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground/60">
                            <Eye className="w-3.5 h-3.5" />
                            {step.fields.filter(f => f.type === 'file').length} Document Uploads
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingStepId(step.id)}
                          aria-label={`Configure stage ${step.name}`}
                          title={`Configure stage ${step.name}`}
                          className="w-12 h-12 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                        >
                          <Settings2 className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteStep(step.id)}
                          aria-label={`Delete stage ${step.name}`}
                          title={`Delete stage ${step.name}`}
                          className="w-12 h-12 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                        <div className="h-8 w-px bg-border mx-2" />
                        <GripVertical className="w-5 h-5 text-muted-foreground/30 cursor-grab" />
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
              
              <div className="pl-14 pt-4">
                 <Button onClick={handleAddStep} variant="ghost" className="w-full py-8 border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 group transition-all">
                   <div className="flex flex-col items-center gap-2">
                     <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                     <span className="text-xs font-black text-muted-foreground group-hover:text-primary tracking-widest uppercase">Append Next Stage</span>
                   </div>
                 </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
