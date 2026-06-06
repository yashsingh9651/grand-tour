'use client'

import { use } from 'react'
import { DashboardLayout } from '@/components/dashboard/layout-wrapper'
import { Header } from '@/components/dashboard/header'
import { DynamicPageContentEditor } from '@/components/admin/dynamic-page-content-editor'
import { ApplicationPageContentEditor } from '@/components/admin/application-page-content-editor'
import { DocumentsPageContentEditor } from '@/components/admin/documents-page-content-editor'
import { PaymentStepEditor } from '@/components/admin/payment-step-editor'

const STEP_EDITOR_CONFIGS: Record<string, { label: string; description: string; editorComponent?: React.ComponentType; previewComponent?: React.ComponentType<any>; previewComponentProps?: Record<string, any> }> = {
  applications: {
    label: 'Applications',
    description: 'Manage the student-facing application step content and preview the application form.',
    editorComponent: ApplicationPageContentEditor,
  },
  documents: {
    label: 'Documents',
    description: 'Manage the document step content used in the student workflow and preview the upload experience.',
    editorComponent: DocumentsPageContentEditor,
  },
  payment: {
    label: 'Payment',
    description: 'Manage the payment bank details, QR image, and installment schedule for the student finance stage.',
    editorComponent: PaymentStepEditor,
  },
}

export default function AdminStepEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const config = STEP_EDITOR_CONFIGS[slug]

  if (!config) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          <Header title="Step Editor" description="Select a step editor from the sidebar." />
          <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
            Unsupported step editor requested.
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const EditorComponent = config.editorComponent

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <Header
          title={`${config.label} Step Editor`}
          description={config.description}
        />
        {EditorComponent ? (
          <EditorComponent />
        ) : (
          <DynamicPageContentEditor
            pageKey={slug}
            builderTitle={`${config.label} Step Builder`}
            builderDescription={config.description}
            previewComponent={config.previewComponent}
            previewComponentProps={config.previewComponentProps}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
