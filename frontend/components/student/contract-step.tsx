'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Upload, CheckCircle2, FileText, Loader2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import UploadPopup from '@/components/UploadPopup'
import { useSession } from 'next-auth/react'
import { DynamicForm } from './dynamic-form'
import { applicationService } from '@/lib/services/api.service'

interface ContractStepProps {
  application: any
  currentStepConfig: any
  onSubmit: (data: any, overrideApp?: any) => Promise<void>
  submitting: boolean
}

export function ContractStep({ application, currentStepConfig, onSubmit, submitting }: ContractStepProps) {
  const { data: session } = useSession()
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [signedContractUrl, setSignedContractUrl] = useState<string | null>(
    application?.data?.[currentStepConfig?.name]?.signedContract || null
  )

  const config = currentStepConfig?.contractConfig || {}
  const unsignedContractDoc = application?.documents?.find(
    (d: any) => d.type === 'UNSIGNED_CONTRACT'
  )

  const handleDownload = async () => {
    if (unsignedContractDoc?.url) {
      // Direct download of the student-specific unsigned contract uploaded by the admin
      const a = document.createElement('a')
      a.href = unsignedContractDoc.url
      a.download = unsignedContractDoc.fileName || `${application.user?.firstName || 'Student'}_Contract`
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      toast.success('Custom contract downloaded! Please sign every page and upload below.')
      return
    }

    if (!config.templateUrl) {
      toast.error('No contract template has been uploaded by the admin yet. Please check back later.')
      return
    }

    try {
      setIsGenerating(true)

      // Try advanced docxtemplater generation first (needs packages installed)
      try {
        const [{ default: PizZip }, { default: Docxtemplater }, { saveAs }] = await Promise.all([
          import('pizzip'),
          import('docxtemplater'),
          import('file-saver'),
        ])

        const response = await fetch(config.templateUrl)
        if (!response.ok) throw new Error('Failed to fetch template')
        const blob = await response.blob()
        const arrayBuffer = await blob.arrayBuffer()

        const zip = new PizZip(arrayBuffer)
        const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })

        // Build replacement data from application
        const appData = application?.data || {}
        const personalInfo = appData['Application Form']?.['Personal Information'] || {}
        const eduInfo = appData['Application Form']?.['Educational Information'] || {}

        doc.render({
          firstName: application.user?.firstName || '',
          lastName: application.user?.lastName || '',
          fullName: `${application.user?.firstName || ''} ${application.user?.lastName || ''}`.trim(),
          email: application.user?.email || '',
          phone: personalInfo['Phone / WhatsApp'] || application.user?.whatsapp || '',
          collegeName: eduInfo['College Name'] || application.educationalInstitution || '',
          university: eduInfo['University'] || '',
          course: eduInfo['Course'] || '',
          department: eduInfo['Department'] || '',
          year: eduInfo['Current Year'] || '',
          cgpa: eduInfo['CGPA'] || '',
          internshipStart: personalInfo['Preferred Start Date'] || eduInfo['Preferred Start Date'] || '',
          internshipEnd: personalInfo['Preferred End Date'] || eduInfo['Preferred End Date'] || '',
          duration: eduInfo['Duration'] || '',
          applicationId: application.id || '',
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
        })

        const out = doc.getZip().generate({
          type: 'blob',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        })

        saveAs(out, `${application.user?.firstName || 'Student'}_Contract.docx`)
        toast.success('Pre-filled contract downloaded successfully!')
        return
      } catch (pkgError: any) {
        // Package not installed or CORS issue — fall back to direct download
        console.warn('docxtemplater unavailable, falling back to direct download:', pkgError?.message)
      }

      // Fallback: Direct download of the template file
      const a = document.createElement('a')
      a.href = config.templateUrl
      a.download = `${config.contractTitle || 'Contract'}.docx`
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      toast.success('Contract template downloaded! Fill in your details and sign every page.')
    } catch (error) {
      console.error('Error downloading contract:', error)
      toast.error('Failed to download contract. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleContractUploadComplete = async (doc: any) => {
    const uploadedUrl = doc.url || doc.data?.url || ''
    if (uploadedUrl) {
      setSignedContractUrl(uploadedUrl)
      toast.success('Signed contract uploaded!')

      const stageName = currentStepConfig?.name || 'Contract Signing'
      const currentData = application?.data || {}
      if (!currentData[stageName]) currentData[stageName] = {}
      currentData[stageName].signedContract = uploadedUrl

      try {
        await applicationService.update(application.id, { data: currentData })
      } catch (err) {
        console.error('Failed to auto-save contract url:', err)
      }
    }
  }

  const hasAdditionalFields = currentStepConfig?.fields && currentStepConfig.fields.length > 0

  const handleFinalSubmit = async (formData: any = {}) => {
    if (!signedContractUrl) {
      toast.error('Please upload your signed contract before continuing.')
      return
    }

    await onSubmit({ ...formData, signedContract: signedContractUrl })
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card className="p-8 border-2 border-amber-500/20 bg-gradient-to-br from-background to-amber-50/50 shadow-xl rounded-[2rem]">
        <div className="space-y-6 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <FileText className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-foreground">
            {config.contractTitle || 'Internship Contract'}
          </h2>
          <p className="text-muted-foreground font-medium text-lg leading-relaxed">
            Please download your contract, print it, sign every page, and upload a scanned copy back here.
          </p>

          {/* Template URL info — shown if admin has set one */}
          {unsignedContractDoc?.url ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3 text-left">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Custom Contract Ready</p>
                <p className="text-xs text-emerald-700 truncate mt-0.5">{unsignedContractDoc.fileName || 'Your custom contract'}</p>
              </div>
              <a
                href={unsignedContractDoc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-800 flex-shrink-0"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : config.templateUrl ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3 text-left">
              <FileText className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Contract Template Ready</p>
                <p className="text-xs text-amber-700 truncate mt-0.5">{config.contractTitle || 'Internship Contract'}</p>
              </div>
              <a
                href={config.templateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 hover:text-amber-800 flex-shrink-0"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-left">
              <p className="text-xs text-gray-500 font-medium">⏳ Waiting for admin to upload the contract template. Check back soon.</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 pt-4">
            {/* Step 1: Download */}
            <Card className="p-6 border-2 border-dashed hover:border-primary/50 transition-colors bg-white/50 space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-bold">1. Download Contract</h3>
              <p className="text-sm text-muted-foreground">Get your contract document, print and sign every page.</p>
              <Button
                onClick={handleDownload}
                disabled={isGenerating || (!config.templateUrl && !unsignedContractDoc?.url)}
                className="w-full gap-2 rounded-xl"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {unsignedContractDoc?.url 
                  ? 'Download Custom Contract' 
                  : config.templateUrl 
                  ? 'Download Contract' 
                  : 'Not Available Yet'}
              </Button>
            </Card>

            {/* Step 2: Upload Signed */}
            <Card className="p-6 border-2 border-dashed hover:border-amber-500/50 transition-colors bg-white/50 space-y-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-bold">2. Upload Signed Copy</h3>
              <p className="text-sm text-muted-foreground">Upload the scanned, signed pages as a single file.</p>

              {signedContractUrl ? (
                <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-xs font-medium text-green-700 truncate flex-1">Signed Contract Uploaded</span>
                  <Button variant="ghost" size="sm" className="h-7 text-green-600 hover:text-green-700 hover:bg-green-100 text-xs" onClick={() => setIsUploadOpen(true)}>
                    Change
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsUploadOpen(true)}
                  variant="outline"
                  className="w-full gap-2 rounded-xl border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                >
                  <Upload className="w-4 h-4" />
                  Upload Signed Document
                </Button>
              )}
            </Card>
          </div>
        </div>
      </Card>

      {/* Additional admin-configured fields */}
      {hasAdditionalFields ? (
        <div className="space-y-4 pt-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full inline-block" />
            Additional Requirements
          </h3>
          <DynamicForm
            fields={currentStepConfig.fields}
            onSubmit={handleFinalSubmit}
            initialData={application?.data?.[currentStepConfig?.name] || {}}
            submitting={submitting}
            buttonText="Submit Contract & Documents"
            applicationId={application.id}
          />
        </div>
      ) : (
        <div className="pt-6">
          <Button
            onClick={() => handleFinalSubmit({})}
            disabled={submitting || !signedContractUrl}
            className="w-full h-16 text-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all rounded-2xl bg-gradient-to-r from-primary to-accent disabled:opacity-50 disabled:scale-100"
          >
            {submitting ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6" />
                Submit & Continue
              </div>
            )}
          </Button>
          {!signedContractUrl && (
            <p className="text-center text-xs text-muted-foreground mt-3">
              Upload your signed contract above to enable this button.
            </p>
          )}
        </div>
      )}

      <UploadPopup
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadComplete={handleContractUploadComplete}
        token={(session as any)?.backendToken || ''}
        applicationId={application?.id}
        documentType="SIGNED_CONTRACT"
        documentName={`${application?.user?.firstName || 'Student'} - Signed Contract`}
      />
    </div>
  )
}
