export type WorkflowStep = 
  | 'application'
  | 'documents'
  | 'interview'
  | 'payment1'
  | 'hotel'
  | 'payment2'
  | 'contract'
  | 'payment3'
  | 'workpermit'
  | 'visapayments'
  | 'visa'
  | 'googlerate'
  | 'travel'

export interface WorkflowStepData {
  id: WorkflowStep
  title: string
  description: string
  icon: string
  order: number
  completed: boolean
  current: boolean
  locked: boolean
}

export const WORKFLOW_STEPS: Record<WorkflowStep, Omit<WorkflowStepData, 'completed' | 'current' | 'locked'>> = {
  application: { id: 'application', title: 'Application Form', description: 'Submit your details', icon: '✓', order: 1 },
  documents: { id: 'documents', title: 'Documents Upload', description: 'Upload required docs', icon: '✓', order: 2 },
  interview: { id: 'interview', title: 'Interview Booking', description: 'Book Your Interview', icon: '🔓', order: 3 },
  payment1: { id: 'payment1', title: 'First Installment', description: 'First Installment Payment', icon: '🔒', order: 4 },
  hotel: { id: 'hotel', title: 'Property Confirmation', description: 'Accommodation details', icon: '🔒', order: 5 },
  payment2: { id: 'payment2', title: 'Second Installment', description: 'Payment installment 2', icon: '🔒', order: 6 },
  contract: { id: 'contract', title: 'Convention', description: 'Convention de Stage', icon: '🔒', order: 7 },
  workpermit: { id: 'workpermit', title: 'Work Permit / DREET', description: 'Work Permit / DREET Documents', icon: '🔒', order: 8 },
  payment3: { id: 'payment3', title: 'Third Installment', description: 'Payment installment 3', icon: '🔒', order: 9 },
  visapayments: { id: 'visapayments', title: 'VFS & Visa Fees', description: 'VFS Appointment & Insurance Fees', icon: '🔒', order: 10 },
  visa: { id: 'visa', title: 'Visa Stage', description: 'Visa Appointment booking', icon: '🔒', order: 11 },
  googlerate: { id: 'googlerate', title: 'Google Rating', description: 'Rate us on Google & upload screenshot', icon: '🔒', order: 12 },
  travel: { id: 'travel', title: 'Visa Documentation', description: 'Visa Application Documents', icon: '🔒', order: 13 },
}


export const getWorkflowSteps = (currentStepId: WorkflowStep): WorkflowStepData[] => {
  const steps = Object.values(WORKFLOW_STEPS)
  const currentIndex = steps.findIndex(s => s.id === currentStepId)
  
  return steps.map((step, index) => ({
    ...step,
    completed: index < currentIndex,
    current: index === currentIndex,
    locked: index > currentIndex,
  }))
}
