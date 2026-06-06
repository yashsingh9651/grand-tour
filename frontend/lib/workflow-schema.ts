// Workflow data types and interfaces

export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'number'
  | 'file'
  | 'section'

export interface WorkflowField {
  id: string
  type: FieldType
  name: string
  required: boolean
  order?: number
  options?: string[]
  placeholder?: string
  wordLimit?: number
  fileTypes?: string[]
  maxSize?: number
  description?: string
  defaultValue?: string | boolean | string[]
}

export interface WorkflowStep {
  id: string
  name: string
  description?: string
  order?: number
  emailTrigger?: boolean
  assignedRole?: string
  
  enabled?: boolean
  fields: WorkflowField[]
  deadline?: number // days
  roleAssignment?: string
  triggerEmail?: boolean
  emailSubject?: string
  notes?: string
  isInterviewStep?: boolean
  
  // Payment configuration
  isPaymentStep?: boolean
  amount?: number
  gstPercentage?: number
  discountPercentage?: number
  paymentConfig?: {
    accountName: string
    accountNumber: string
    ifsc: string
    bankName: string
    currency?: string
    merchant?: string
    reference?: string
    qrCodeUrl?: string
    installments?: Array<{
      label: string
      amount: number
      dueDate?: string
    }>
  }

  // Contract configuration
  isContractStep?: boolean
  contractConfig?: {
    templateUrl?: string
    contractTitle?: string
  }
}

export interface Workflow {
  id: string
  name: string
  description?: string
  status: 'active' | 'draft' | 'archived'
  steps: WorkflowStep[]
  createdAt: Date
  updatedAt?: Date
  createdBy?: string
  candidateCount?: number
}

// Dummy workflow data
export const dummyWorkflows: Workflow[] = [
  {
    id: 'wf-001',
    name: 'Sales Qualification Process',
    description: 'Multi-step workflow for qualifying new sales leads',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-10'),
    createdBy: 'admin',
    steps: [
      {
        id: 'step-001',
        name: 'Lead Information',
        description: 'Collect basic lead details',
        order: 1,
        enabled: true,
        fields: [
          {
            id: 'field-001',
            type: 'text',
            name: 'Full Name',
            required: true,
            order: 1,
            placeholder: 'John Doe',
          },
          {
            id: 'field-002',
            type: 'text',
            name: 'Email',
            required: true,
            order: 2,
            placeholder: 'john@example.com',
          },
          {
            id: 'field-003',
            type: 'text',
            name: 'Phone Number',
            required: false,
            order: 3,
            placeholder: '+1 (555) 123-4567',
          },
          {
            id: 'field-004',
            type: 'select',
            name: 'Industry',
            required: true,
            order: 4,
            options: ['Technology', 'Finance', 'Healthcare', 'Retail', 'Other'],
          },
        ],
        deadline: 1,
        roleAssignment: 'Sales Representative',
        triggerEmail: true,
        emailSubject: 'New Lead Qualification Started',
      },
      {
        id: 'step-002',
        name: 'Initial Assessment',
        description: 'Assess lead fit and budget',
        order: 2,
        enabled: true,
        fields: [
          {
            id: 'field-005',
            type: 'textarea',
            name: 'Lead Description',
            required: true,
            order: 1,
            wordLimit: 500,
            placeholder: 'Describe the lead and their needs...',
          },
          {
            id: 'field-006',
            type: 'select',
            name: 'Budget Range',
            required: true,
            order: 2,
            options: ['$0-10k', '$10k-50k', '$50k-100k', '$100k+'],
          },
          {
            id: 'field-007',
            type: 'date',
            name: 'Expected Decision Date',
            required: false,
            order: 3,
          },
        ],
        deadline: 3,
        roleAssignment: 'Sales Manager',
        triggerEmail: true,
        emailSubject: 'Assessment Review Required',
      },
      {
        id: 'step-003',
        name: 'Documentation',
        description: 'Upload required documents',
        order: 3,
        enabled: true,
        fields: [
          {
            id: 'field-008',
            type: 'file',
            name: 'Company Profile',
            required: true,
            order: 1,
            fileTypes: ['pdf', 'doc', 'docx'],
            maxSize: 5,
          },
          {
            id: 'field-009',
            type: 'checkbox',
            name: 'I confirm all information is accurate',
            required: true,
            order: 2,
          },
        ],
        deadline: 2,
        roleAssignment: 'Admin',
      },
    ],
  },
  {
    id: 'wf-002',
    name: 'Hiring Process',
    description: 'Complete recruitment workflow',
    status: 'active',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-05'),
    createdBy: 'admin',
    steps: [
      {
        id: 'step-004',
        name: 'Application',
        order: 1,
        enabled: true,
        fields: [
          {
            id: 'field-010',
            type: 'text',
            name: 'Candidate Name',
            required: true,
            order: 1,
          },
          {
            id: 'field-011',
            type: 'text',
            name: 'Email',
            required: true,
            order: 2,
          },
          {
            id: 'field-012',
            type: 'file',
            name: 'Resume',
            required: true,
            order: 3,
            fileTypes: ['pdf'],
            maxSize: 3,
          },
        ],
        deadline: 1,
        roleAssignment: 'HR',
      },
      {
        id: 'step-005',
        name: 'Phone Screen',
        order: 2,
        enabled: true,
        fields: [
          {
            id: 'field-013',
            type: 'textarea',
            name: 'Interview Notes',
            required: true,
            order: 1,
            wordLimit: 300,
          },
          {
            id: 'field-014',
            type: 'select',
            name: 'Assessment Score',
            required: true,
            order: 2,
            options: ['Poor', 'Fair', 'Good', 'Excellent'],
          },
        ],
        deadline: 2,
        roleAssignment: 'HR Manager',
      },
      {
        id: 'step-006',
        name: 'Technical Interview',
        order: 3,
        enabled: true,
        fields: [
          {
            id: 'field-015',
            type: 'textarea',
            name: 'Technical Assessment',
            required: true,
            order: 1,
            wordLimit: 500,
          },
          {
            id: 'field-016',
            type: 'number',
            name: 'Score',
            required: true,
            order: 2,
          },
        ],
        deadline: 3,
        roleAssignment: 'Tech Lead',
      },
    ],
  },
]
