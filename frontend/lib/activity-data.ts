export type ActivityType =
  | 'candidate_created'
  | 'candidate_status_changed'
  | 'interview_scheduled'
  | 'interview_rescheduled'
  | 'document_uploaded'
  | 'document_reviewed'
  | 'note_added'
  | 'workflow_created'
  | 'workflow_updated'
  | 'user_created'
  | 'user_updated'
  | 'payment_processed'

export interface ActivityLog {
  id: string
  type: ActivityType
  userId: string
  userName: string
  candidateId?: string
  candidateName?: string
  description: string
  timestamp: Date
  metadata?: Record<string, any>
}

export const dummyActivityLogs: ActivityLog[] = [
  {
    id: 'act-001',
    type: 'candidate_status_changed',
    userId: 'user-002',
    userName: 'Sarah Mitchell',
    candidateId: 'cand-001',
    candidateName: 'Sarah Johnson',
    description: 'Moved candidate to Initial Assessment step',
    timestamp: new Date('2024-03-20T14:30:00'),
    metadata: { previousStep: 'Lead Information', newStep: 'Initial Assessment' },
  },
  {
    id: 'act-002',
    type: 'interview_scheduled',
    userId: 'user-003',
    userName: 'James Wilson',
    candidateId: 'cand-001',
    candidateName: 'Sarah Johnson',
    description: 'Scheduled interview with Sarah Johnson for Apr 20, 2024',
    timestamp: new Date('2024-03-19T10:15:00'),
    metadata: { interviewType: 'Initial Assessment', date: '2024-04-20' },
  },
  {
    id: 'act-003',
    type: 'document_uploaded',
    userId: 'user-002',
    userName: 'Sarah Mitchell',
    candidateId: 'cand-001',
    candidateName: 'Sarah Johnson',
    description: 'NDA document uploaded',
    timestamp: new Date('2024-03-18T09:45:00'),
    metadata: { documentType: 'nda', fileName: 'sarah_johnson_nda.pdf' },
  },
  {
    id: 'act-004',
    type: 'note_added',
    userId: 'user-003',
    userName: 'James Wilson',
    candidateId: 'cand-002',
    candidateName: 'Michael Chen',
    description: 'Added internal note: Negotiating on pricing',
    timestamp: new Date('2024-03-19T16:20:00'),
    metadata: { note: 'Strong enterprise background. Negotiating pricing.' },
  },
  {
    id: 'act-005',
    type: 'candidate_created',
    userId: 'user-002',
    userName: 'Sarah Mitchell',
    candidateId: 'cand-005',
    candidateName: 'Jessica Lee',
    description: 'New candidate created',
    timestamp: new Date('2024-03-16T11:00:00'),
    metadata: { program: 'Hiring Process' },
  },
  {
    id: 'act-006',
    type: 'workflow_updated',
    userId: 'user-002',
    userName: 'Sarah Mitchell',
    description: 'Updated Sales Qualification Process workflow',
    timestamp: new Date('2024-03-15T13:30:00'),
    metadata: { workflowName: 'Sales Qualification Process', changes: 'Added field to step 2' },
  },
  {
    id: 'act-007',
    type: 'payment_processed',
    userId: 'user-002',
    userName: 'Sarah Mitchell',
    candidateId: 'cand-003',
    candidateName: 'Emily Rodriguez',
    description: 'Payment marked as paid',
    timestamp: new Date('2024-03-14T15:45:00'),
    metadata: { amount: '$5,000', status: 'paid' },
  },
  {
    id: 'act-008',
    type: 'document_reviewed',
    userId: 'user-002',
    userName: 'Sarah Mitchell',
    candidateId: 'cand-004',
    candidateName: 'David Williams',
    description: 'Approved contract document',
    timestamp: new Date('2024-02-26T10:20:00'),
    metadata: { documentType: 'contract', decision: 'approved' },
  },
  {
    id: 'act-009',
    type: 'interview_scheduled',
    userId: 'user-005',
    userName: 'Robert Taylor',
    candidateId: 'cand-005',
    candidateName: 'Jessica Lee',
    description: 'Scheduled phone screen for Apr 19, 2024',
    timestamp: new Date('2024-03-14T14:00:00'),
    metadata: { interviewType: 'Phone Screen', date: '2024-04-19' },
  },
  {
    id: 'act-010',
    type: 'candidate_status_changed',
    userId: 'user-002',
    userName: 'Sarah Mitchell',
    candidateId: 'cand-004',
    candidateName: 'David Williams',
    description: 'Candidate approved and marked for onboarding',
    timestamp: new Date('2024-03-13T09:30:00'),
    metadata: { previousStatus: 'pending', newStatus: 'approved' },
  },
  {
    id: 'act-011',
    type: 'user_created',
    userId: 'user-001',
    userName: 'Admin User',
    description: 'New user Lisa Anderson created with Marketing role',
    timestamp: new Date('2024-03-10T08:00:00'),
    metadata: { newUserName: 'Lisa Anderson', role: 'marketing' },
  },
  {
    id: 'act-012',
    type: 'workflow_created',
    userId: 'user-002',
    userName: 'Sarah Mitchell',
    description: 'Created new workflow: Hiring Process',
    timestamp: new Date('2024-02-01T10:30:00'),
    metadata: { workflowName: 'Hiring Process', steps: 3 },
  },
]
