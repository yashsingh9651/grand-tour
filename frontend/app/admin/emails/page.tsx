'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Mail, 
  Edit, 
  CheckCircle2, 
  Loader2,
  AlertCircle
} from 'lucide-react'
import { emailTemplateService, EmailTemplate } from '@/lib/services/email-template.service'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const data = await emailTemplateService.getTemplates()
      setTemplates(data)
    } catch (error) {
      console.error('Failed to fetch templates', error)
      toast.error('Failed to load email templates')
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (template: EmailTemplate) => {
    setEditingTemplate({ ...template })
    setIsEditDialogOpen(true)
  }

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return
    
    setSaving(true)
    try {
      await emailTemplateService.updateTemplate(editingTemplate.id, {
        subject: editingTemplate.subject,
        body: editingTemplate.body
      })
      toast.success('Template updated successfully')
      setIsEditDialogOpen(false)
      fetchTemplates()
    } catch {
      toast.error('Failed to update template')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <main className="flex-1 p-3 md:p-4 lg:p-5 lg:ml-64">
        <Header
          title="Email Templates"
          description="Edit the HTML templates assigned to automated actions. These templates are system-managed and cannot be added here."
        />

        <div className="mt-8 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-muted-foreground animate-pulse">Loading templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <Card className="p-12 text-center border-dashed bg-secondary/10">
              <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-semibold">No templates found</h3>
              <p className="text-muted-foreground">The system templates have not been initialized yet.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {templates.map(template => (
                <Card key={template.id} className="p-6 overflow-hidden relative group hover:shadow-lg transition-all border-l-4 border-l-primary">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold tracking-tight">{template.name.replace(/_/g, ' ')}</h3>
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded-full uppercase tracking-wider">
                          Auto-flow
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                        <Mail className="w-3.5 h-3.5" />
                        Subject: <span className="text-foreground">{template.subject}</span>
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="hidden md:block text-right mr-4">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Available Variables</p>
                        <div className="flex gap-1 flex-wrap justify-end">
                          {template.variables.map(v => (
                            <code key={v} className="px-1.5 py-0.5 bg-secondary text-[10px] rounded text-secondary-foreground font-mono">
                              {`{{${v}}}`}
                            </code>
                          ))}
                        </div>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => handleEditClick(template)} className="flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Template
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t bg-muted/30 -mx-6 -mb-6 p-6">
                    <div className="text-xs font-mono text-muted-foreground line-clamp-2 opacity-60">
                      {template.body.replace(/<[^>]*>/g, ' ')}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Edit Template Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Edit className="w-6 h-6 text-primary" />
                Edit Template: {editingTemplate?.name.replace(/_/g, ' ')}
              </DialogTitle>
              <DialogDescription>
                Customize the email subject and HTML body. Use placeholders like 
                <code className="mx-1 text-primary">{"{{variableName}}"}</code> 
                to inject dynamic data.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Email Subject</Label>
                <Input 
                  value={editingTemplate?.subject || ''}
                  onChange={e => setEditingTemplate(prev => prev ? ({ ...prev, subject: e.target.value }) : null)}
                  placeholder="Enter email subject"
                  className="font-medium"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Email Body (HTML)</Label>
                  <div className="flex gap-1">
                    {editingTemplate?.variables.map(v => (
                      <button
                        key={v}
                        onClick={() => {
                          const body = editingTemplate.body + `{{${v}}}`;
                          setEditingTemplate({ ...editingTemplate, body });
                        }}
                        className="text-[10px] px-1.5 py-0.5 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 rounded font-mono transition-colors"
                      >
                        {`+ {{${v}}}`}
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea 
                  value={editingTemplate?.body || ''}
                  onChange={e => setEditingTemplate(prev => prev ? ({ ...prev, body: e.target.value }) : null)}
                  placeholder="Enter HTML body..."
                  className="min-h-[300px] font-mono text-sm leading-relaxed"
                />
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">Pro Tip</p>
                  <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
                    You can use standard HTML tags like <code className="font-mono">{`<h1>, <p>, <strong>`}</code> to style your emails. Always test your templates after editing.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTemplate} disabled={saving} className="min-w-[120px]">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Save Template
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
