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
  interview: { id: 'interview', title: 'Interview Booking', description: 'Schedule interview', icon: '🔓', order: 3 },
  payment1: { id: 'payment1', title: 'First Payment', description: 'Payment confirmation', icon: '🔒', order: 4 },
  hotel: { id: 'hotel', title: 'Hotel Allocation', description: 'Accommodation details', icon: '🔒', order: 5 },
  payment2: { id: 'payment2', title: 'Second Payment', description: 'Payment installment 2', icon: '🔒', order: 6 },
  contract: { id: 'contract', title: 'Contract', description: 'Sign agreement', icon: '🔒', order: 7 },
  payment3: { id: 'payment3', title: 'Third Payment', description: 'Payment installment 3', icon: '🔒', order: 8 },
  workpermit: { id: 'workpermit', title: 'Work Permit', description: 'Permit processing', icon: '🔒', order: 9 },
  visapayments: { id: 'visapayments', title: 'Visa Payments', description: 'Pay visa fees & SEVIS', icon: '🔒', order: 10 },
  visa: { id: 'visa', title: 'Visa Stage', description: 'Visa application', icon: '🔒', order: 11 },
  travel: { id: 'travel', title: 'Travel Details', description: 'Travel information', icon: '🔒', order: 12 },
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
