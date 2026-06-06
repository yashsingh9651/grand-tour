export type CandidateStatus = 'pending' | 'approved' | 'rejected'
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'overdue'

export interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  program: string
  currentStep: string
  currentStepId: string
  status: CandidateStatus
  paymentStatus: PaymentStatus
  interviewDate?: Date
  notes: string
  createdAt: Date
  updatedAt: Date
  attachments: string[]
  
  // New Education/Profile fields
  collegeName?: string
  universityName?: string
  course?: string
  currentYear?: string
  department?: string
  cgpa?: number
  whatsapp?: string
  dateOfBirth?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  internshipStartDate?: string
  internshipEndDate?: string
  additionalData?: any
  
  // Application specifics
  passportNumber?: string
  educationalInstitution?: string
  enrollmentStatus?: string
  preferredDepartment?: string
  statementOfPurpose?: string
  documents?: any[]
}

export const dummyCandidates: Candidate[] = [
  {
    id: 'cand-001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    program: 'Sales Qualification Process',
    currentStep: 'Initial Assessment',
    currentStepId: 'step-002',
    status: 'pending',
    paymentStatus: 'unpaid',
    interviewDate: new Date('2024-04-20'),
    notes: 'Strong profile, good industry fit. Waiting for budget confirmation.',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-15'),
    attachments: ['company_profile.pdf', 'quote_acceptance.pdf'],
  },
  {
    id: 'cand-002',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1 (555) 234-5678',
    program: 'Sales Qualification Process',
    currentStep: 'Documentation',
    currentStepId: 'step-003',
    status: 'pending',
    paymentStatus: 'pending',
    interviewDate: new Date('2024-04-22'),
    notes: 'Excellent fit. Pending document submission.',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-03-18'),
    attachments: ['company_profile.pdf'],
  },
  {
    id: 'cand-003',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '+1 (555) 345-6789',
    program: 'Hiring Process',
    currentStep: 'Technical Interview',
    currentStepId: 'step-006',
    status: 'pending',
    paymentStatus: 'paid',
    interviewDate: new Date('2024-04-25'),
    notes: 'Passed all initial rounds. Technical assessment pending.',
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-16'),
    attachments: ['resume.pdf', 'references.pdf'],
  },
  {
    id: 'cand-004',
    name: 'David Williams',
    email: 'david.williams@email.com',
    phone: '+1 (555) 456-7890',
    program: 'Sales Qualification Process',
    currentStep: 'Lead Information',
    currentStepId: 'step-001',
    status: 'approved',
    paymentStatus: 'paid',
    notes: 'Contract signed. Ready to onboard.',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-03-20'),
    attachments: ['signed_contract.pdf', 'nda.pdf'],
  },
  {
    id: 'cand-005',
    name: 'Jessica Lee',
    email: 'jessica.lee@email.com',
    phone: '+1 (555) 567-8901',
    program: 'Hiring Process',
    currentStep: 'Phone Screen',
    currentStepId: 'step-005',
    status: 'pending',
    paymentStatus: 'unpaid',
    interviewDate: new Date('2024-04-19'),
    notes: 'Good communication skills. Awaiting technical round.',
    createdAt: new Date('2024-03-08'),
    updatedAt: new Date('2024-03-14'),
    attachments: [],
  },
  {
    id: 'cand-006',
    name: 'Robert Martinez',
    email: 'robert.martinez@email.com',
    phone: '+1 (555) 678-9012',
    program: 'Sales Qualification Process',
    currentStep: 'Lead Information',
    currentStepId: 'step-001',
    status: 'rejected',
    paymentStatus: 'unpaid',
    notes: 'Budget constraints. Not a good fit at this time.',
    createdAt: new Date('2024-02-28'),
    updatedAt: new Date('2024-03-10'),
    attachments: [],
  },
  {
    id: 'cand-007',
    name: 'Amanda Thompson',
    email: 'amanda.thompson@email.com',
    phone: '+1 (555) 789-0123',
    program: 'Hiring Process',
    currentStep: 'Application',
    currentStepId: 'step-004',
    status: 'pending',
    paymentStatus: 'unpaid',
    notes: 'Recent graduate with impressive portfolio. Phone screen scheduled.',
    createdAt: new Date('2024-03-12'),
    updatedAt: new Date('2024-03-17'),
    attachments: ['resume.pdf', 'portfolio.pdf'],
  },
  {
    id: 'cand-008',
    name: 'Christopher Davis',
    email: 'christopher.davis@email.com',
    phone: '+1 (555) 890-1234',
    program: 'Sales Qualification Process',
    currentStep: 'Initial Assessment',
    currentStepId: 'step-002',
    status: 'pending',
    paymentStatus: 'pending',
    interviewDate: new Date('2024-04-21'),
    notes: 'Strong enterprise background. Negotiating pricing.',
    createdAt: new Date('2024-03-02'),
    updatedAt: new Date('2024-03-19'),
    attachments: ['company_profile.pdf'],
  },
]
