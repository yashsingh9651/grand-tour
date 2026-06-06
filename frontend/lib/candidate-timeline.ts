export interface TimelineEvent {
  id: string
  candidateId: string
  date: Date
  title: string
  description: string
  type: 'registration' | 'status_change' | 'interview' | 'document' | 'note' | 'action'
  icon?: string
}

export const getCandidateTimeline = (candidateId: string): TimelineEvent[] => {
  const timelines: Record<string, TimelineEvent[]> = {
    'cand-001': [
      {
        id: 'evt-001',
        candidateId: 'cand-001',
        date: new Date('2024-03-01'),
        title: 'Registered',
        description: 'Sarah Johnson registered in the system',
        type: 'registration',
      },
      {
        id: 'evt-002',
        candidateId: 'cand-001',
        date: new Date('2024-03-03'),
        title: 'Application Received',
        description: 'Initial application submitted for Sales Qualification Process',
        type: 'action',
      },
      {
        id: 'evt-003',
        candidateId: 'cand-001',
        date: new Date('2024-03-08'),
        title: 'Moved to Initial Assessment',
        description: 'Application reviewed and moved to Initial Assessment stage',
        type: 'status_change',
      },
      {
        id: 'evt-004',
        candidateId: 'cand-001',
        date: new Date('2024-03-12'),
        title: 'Documents Uploaded',
        description: 'company_profile.pdf and quote_acceptance.pdf submitted',
        type: 'document',
      },
      {
        id: 'evt-005',
        candidateId: 'cand-001',
        date: new Date('2024-03-15'),
        title: 'Note Added',
        description: 'Strong profile, good industry fit. Waiting for budget confirmation.',
        type: 'note',
      },
      {
        id: 'evt-006',
        candidateId: 'cand-001',
        date: new Date('2024-04-01'),
        title: 'Interview Scheduled',
        description: 'Interview scheduled for April 20, 2024 at 2:00 PM',
        type: 'interview',
      },
    ],
    'cand-002': [
      {
        id: 'evt-201',
        candidateId: 'cand-002',
        date: new Date('2024-02-20'),
        title: 'Registered',
        description: 'Michael Chen registered in the system',
        type: 'registration',
      },
      {
        id: 'evt-202',
        candidateId: 'cand-002',
        date: new Date('2024-02-22'),
        title: 'Application Received',
        description: 'Initial application submitted for Sales Qualification Process',
        type: 'action',
      },
      {
        id: 'evt-203',
        candidateId: 'cand-002',
        date: new Date('2024-02-28'),
        title: 'Moved to Screening',
        description: 'Application advanced to screening stage',
        type: 'status_change',
      },
      {
        id: 'evt-204',
        candidateId: 'cand-002',
        date: new Date('2024-03-05'),
        title: 'Phone Screen Completed',
        description: 'Candidate passed initial phone screening with Alex Thompson',
        type: 'action',
      },
      {
        id: 'evt-205',
        candidateId: 'cand-002',
        date: new Date('2024-03-10'),
        title: 'Moved to Documentation',
        description: 'Candidate advanced to documentation stage',
        type: 'status_change',
      },
      {
        id: 'evt-206',
        candidateId: 'cand-002',
        date: new Date('2024-03-18'),
        title: 'Note Added',
        description: 'Excellent fit. Pending document submission.',
        type: 'note',
      },
      {
        id: 'evt-207',
        candidateId: 'cand-002',
        date: new Date('2024-04-02'),
        title: 'Interview Scheduled',
        description: 'Interview scheduled for April 22, 2024 at 3:00 PM',
        type: 'interview',
      },
    ],
    'cand-003': [
      {
        id: 'evt-301',
        candidateId: 'cand-003',
        date: new Date('2024-02-01'),
        title: 'Registered',
        description: 'Emily Rodriguez registered in the system',
        type: 'registration',
      },
      {
        id: 'evt-302',
        candidateId: 'cand-003',
        date: new Date('2024-02-05'),
        title: 'Application Received',
        description: 'Initial application submitted for Hiring Process',
        type: 'action',
      },
      {
        id: 'evt-303',
        candidateId: 'cand-003',
        date: new Date('2024-02-12'),
        title: 'Moved to Initial Screening',
        description: 'Application advanced to initial screening',
        type: 'status_change',
      },
      {
        id: 'evt-304',
        candidateId: 'cand-003',
        date: new Date('2024-02-20'),
        title: 'Screening Interview Completed',
        description: 'Candidate cleared screening interview with HR',
        type: 'action',
      },
      {
        id: 'evt-305',
        candidateId: 'cand-003',
        date: new Date('2024-03-01'),
        title: 'Moved to Technical Interview',
        description: 'Candidate advanced to technical interview stage',
        type: 'status_change',
      },
      {
        id: 'evt-306',
        candidateId: 'cand-003',
        date: new Date('2024-03-15'),
        title: 'Technical Interview Scheduled',
        description: 'Technical interview with engineering team scheduled',
        type: 'interview',
      },
    ],
  }

  return timelines[candidateId] || []
}
