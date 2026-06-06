'use client'

import { DynamicPageContentEditor } from '@/components/admin/dynamic-page-content-editor'
import { DocumentsStepPreview } from '@/components/student/documents-step-preview'

export function DocumentsPageContentEditor() {
  return (
    <DynamicPageContentEditor
      pageKey="documents"
      builderTitle="Documents Step Builder"
      builderDescription="Customize the document upload experience, block ordering, and the student-facing compliance guidance for the documents step."
      previewComponent={DocumentsStepPreview}
    />
  )
}
