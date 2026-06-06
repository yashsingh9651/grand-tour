export type InterviewStatus =
  | 'pending'
  | 'completed'
  | 'rescheduled'
  | 'cancelled'

export interface Interview {
  id: string
  candidateId: string
  candidateName: string
  candidateEmail: string
  interviewerName: string
  interviewerId: string
  type: string // e.g., "Phone Screen", "Technical", "Final"
  scheduledDate: Date
  duration: number // in minutes
  status: InterviewStatus
  location?: string
  notes?: string
  feedback?: string
  rating?: number // 1-5
  createdAt: Date
  updatedAt: Date
}

export const dummyInterviews: Interview[] = [
  {
    id: 'int-001',
    candidateId: 'cand-001',
    candidateName: 'Sarah Johnson',
    candidateEmail: 'sarah.johnson@email.com',
    interviewerName: 'James Wilson',
    interviewerId: 'user-003',
    type: 'Initial Assessment',
    scheduledDate: new Date('2024-04-20T10:00:00'),
    duration: 45,
    status: 'pending',
    location: 'Conference Room B',
    notes: 'Sales qualification discussion',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15'),
  },
  {
    id: 'int-002',
    candidateId: 'cand-002',
    candidateName: 'Michael Chen',
    candidateEmail: 'michael.chen@email.com',
    interviewerName: 'Sarah Mitchell',
    interviewerId: 'user-002',
    type: 'Documentation Review',
    scheduledDate: new Date('2024-04-22T14:00:00'),
    duration: 30,
    status: 'pending',
    location: 'Virtual - Zoom',
    notes: 'Document verification meeting',
    createdAt: new Date('2024-03-16'),
    updatedAt: new Date('2024-03-16'),
  },
  {
    id: 'int-003',
    candidateId: 'cand-003',
    candidateName: 'Emily Rodriguez',
    candidateEmail: 'emily.rodriguez@email.com',
    interviewerName: 'Robert Taylor',
    interviewerId: 'user-005',
    type: 'Technical Interview',
    scheduledDate: new Date('2024-04-25T09:00:00'),
    duration: 60,
    status: 'pending',
    location: 'Technical Lab',
    notes: 'Technical skills assessment',
    createdAt: new Date('2024-03-16'),
    updatedAt: new Date('2024-03-16'),
  },
  {
    id: 'int-004',
    candidateId: 'cand-005',
    candidateName: 'Jessica Lee',
    candidateEmail: 'jessica.lee@email.com',
    interviewerName: 'Lisa Anderson',
    interviewerId: 'user-004',
    type: 'Phone Screen',
    scheduledDate: new Date('2024-04-19T11:00:00'),
    duration: 30,
    status: 'pending',
    location: 'Phone',
    notes: 'Initial screening call',
    createdAt: new Date('2024-03-14'),
    updatedAt: new Date('2024-03-14'),
  },
  {
    id: 'int-005',
    candidateId: 'cand-007',
    candidateName: 'Amanda Thompson',
    candidateEmail: 'amanda.thompson@email.com',
    interviewerName: 'Robert Taylor',
    interviewerId: 'user-005',
    type: 'Phone Screen',
    scheduledDate: new Date('2024-04-18T15:30:00'),
    duration: 30,
    status: 'pending',
    location: 'Phone',
    notes: 'Recent graduate initial call',
    createdAt: new Date('2024-03-17'),
    updatedAt: new Date('2024-03-17'),
  },
  {
    id: 'int-006',
    candidateId: 'cand-008',
    candidateName: 'Christopher Davis',
    candidateEmail: 'christopher.davis@email.com',
    interviewerName: 'James Wilson',
    interviewerId: 'user-003',
    type: 'Initial Assessment',
    scheduledDate: new Date('2024-04-21T13:00:00'),
    duration: 45,
    status: 'pending',
    location: 'Virtual - Teams',
    notes: 'Enterprise client discussion',
    createdAt: new Date('2024-03-19'),
    updatedAt: new Date('2024-03-19'),
  },
  {
    id: 'int-007',
    candidateId: 'cand-001',
    candidateName: 'Sarah Johnson',
    candidateEmail: 'sarah.johnson@email.com',
    interviewerName: 'Lisa Anderson',
    interviewerId: 'user-004',
    type: 'Initial Assessment',
    scheduledDate: new Date('2024-03-10T10:00:00'),
    duration: 45,
    status: 'completed',
    location: 'Conference Room A',
    feedback: 'Great communication skills, strong fit for the role',
    rating: 4.5,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-03-10'),
  },
  {
    id: 'int-008',
    candidateId: 'cand-004',
    candidateName: 'David Williams',
    candidateEmail: 'david.williams@email.com',
    interviewerName: 'Sarah Mitchell',
    interviewerId: 'user-002',
    type: 'Final Round',
    scheduledDate: new Date('2024-02-15T11:00:00'),
    duration: 60,
    status: 'completed',
    location: 'Executive Conference Room',
    feedback: 'Excellent candidate. Offer accepted.',
    rating: 5,
    createdAt: new Date('2024-01-28'),
    updatedAt: new Date('2024-02-15'),
  },
]
