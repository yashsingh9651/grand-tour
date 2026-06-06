export type WorkflowStep = 
  | 'application'
  | 'documents'
  | 'interview'
  | 'selection'
  | 'payment1'
  | 'hotel'
  | 'contract'
  | 'payment2'
  | 'workpermit'
  | 'finaldocs'
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
  application: { id: 'application', title: 'Application Form', description: 'Submit your details', icon: '✓', order: 2 },
  documents: { id: 'documents', title: 'Documents Upload', description: 'Upload required docs', icon: '✓', order: 3 },
  interview: { id: 'interview', title: 'Interview Booking', description: 'Schedule interview', icon: '🔓', order: 4 },
  selection: { id: 'selection', title: 'Selection Status', description: 'Await selection', icon: '🔒', order: 5 },
  payment1: { id: 'payment1', title: 'First Payment', description: 'Payment confirmation', icon: '🔒', order: 6 },
  hotel: { id: 'hotel', title: 'Hotel Allocation', description: 'Accommodation details', icon: '🔒', order: 7 },
  contract: { id: 'contract', title: 'Contract', description: 'Sign agreement', icon: '🔒', order: 8 },
  payment2: { id: 'payment2', title: 'Second Installment', description: 'Final payment', icon: '🔒', order: 9 },
  workpermit: { id: 'workpermit', title: 'Work Permit', description: 'Permit processing', icon: '🔒', order: 10 },
  finaldocs: { id: 'finaldocs', title: 'Final Documents', description: 'Submit final docs', icon: '🔒', order: 11 },
  visa: { id: 'visa', title: 'Visa Stage', description: 'Visa application', icon: '🔒', order: 12 },
  travel: { id: 'travel', title: 'Travel Details', description: 'Travel information', icon: '🔒', order: 13 },
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
