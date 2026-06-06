'use client'

import { DynamicPageContentEditor } from '@/components/admin/dynamic-page-content-editor'
import { ProfileBuilderStep } from '@/components/student/profile-builder-step'

const defaultPreviewApplication = {
  user: {
    firstName: 'Avery',
    lastName: 'Morgan',
    email: 'avery.morgan@example.com',
  },
  passportNumber: 'E1234567',
  passportConfirmed: true,
  educationalInstitution: 'Metropolitan Institute of Technology',
  enrollmentStatus: 'Active Candidate',
  cgpa: 8.8,
  preferredDepartment: 'Journalism',
  preferredStartDate: '2026-07-15',
  statementOfPurpose: 'This internship will help me sharpen my editorial voice, build a resilient research practice, and contribute thoughtfully to campus storytelling initiatives across editorial, digital, and publishing teams.',
  data: {
    passportConfirmed: true,
    cgpa: 8.8,
    preferredStartDate: '2026-07-15',
  },
}

export function ApplicationPageContentEditor() {
  return (
    <DynamicPageContentEditor
      pageKey="application"
      builderTitle="Application Page Builder"
      builderDescription="Customize the copy, fields, and field types used on the student application page. The mock schema supports text, textarea, select, user, number, date, checkbox, and radio fields."
      previewComponent={ProfileBuilderStep}
      previewComponentProps={{
        application: defaultPreviewApplication,
        onSubmit: async () => undefined,
        submitting: false,
      }}
    />
  )
}
