export interface Email {
  id: string
  recipient: string
  recipientEmail: string
  subject: string
  body: string
  type: 'offer' | 'rejection' | 'interview_schedule' | 'reminder' | 'followup' | 'update'
  sentAt: Date
  status: 'sent' | 'bounced' | 'opened'
  template?: string
}

export const dummyEmails: Email[] = [
  {
    id: 'email-001',
    recipient: 'John Smith',
    recipientEmail: 'john.smith@email.com',
    subject: 'Congratulations! Offer Extended - Senior Software Engineer',
    body: 'Dear John,\n\nWe are pleased to extend an offer for the Senior Software Engineer position. We were impressed with your technical skills and experience.\n\nPlease find the detailed offer letter attached. We look forward to hearing from you.\n\nBest regards,\nHR Team',
    type: 'offer',
    sentAt: new Date('2024-04-10'),
    status: 'opened',
    template: 'offer_letter',
  },
  {
    id: 'email-002',
    recipient: 'Sarah Johnson',
    recipientEmail: 'sarah.johnson@email.com',
    subject: 'Interview Scheduled - Product Manager Position',
    body: 'Dear Sarah,\n\nWe are excited to schedule your interview for the Product Manager position.\n\nInterview Details:\nDate: April 20, 2024\nTime: 2:00 PM EST\nInterviewer: Alex Thompson (Hiring Manager)\n\nPlease reply to confirm your attendance.\n\nBest regards,\nRecruiting Team',
    type: 'interview_schedule',
    sentAt: new Date('2024-04-08'),
    status: 'opened',
    template: 'interview_invitation',
  },
  {
    id: 'email-003',
    recipient: 'Emma Davis',
    recipientEmail: 'emma.davis@email.com',
    subject: 'Thank you for your interest - Position Update',
    body: 'Dear Emma,\n\nThank you for your interest in the UX Designer position. We appreciate your time and effort during the interview process.\n\nUnfortunately, we have decided to move forward with another candidate whose profile more closely matched our specific requirements at this time.\n\nBest of luck with your career endeavors!\n\nBest regards,\nHR Team',
    type: 'rejection',
    sentAt: new Date('2024-04-05'),
    status: 'opened',
    template: 'rejection_letter',
  },
  {
    id: 'email-004',
    recipient: 'Michael Brown',
    recipientEmail: 'michael.brown@email.com',
    subject: 'Interview Reminder - Data Scientist Position',
    body: 'Dear Michael,\n\nThis is a friendly reminder about your upcoming interview.\n\nInterview Details:\nDate: April 18, 2024\nTime: 10:00 AM EST\nLocation: Zoom Link: [interview-link]\n\nPlease arrive 5 minutes early.\n\nBest regards,\nRecruiting Team',
    type: 'reminder',
    sentAt: new Date('2024-04-17'),
    status: 'opened',
    template: 'interview_reminder',
  },
  {
    id: 'email-005',
    recipient: 'Lisa Chen',
    recipientEmail: 'lisa.chen@email.com',
    subject: 'Next Steps - Marketing Manager Position',
    body: 'Dear Lisa,\n\nThank you for completing your interviews. Your performance was impressive and we are moving you to the final round.\n\nNext Steps:\n1. Background check (3-5 business days)\n2. Reference check\n3. Final offer discussion\n\nWe will be in touch shortly.\n\nBest regards,\nHR Team',
    type: 'update',
    sentAt: new Date('2024-04-09'),
    status: 'opened',
    template: 'next_steps',
  },
  {
    id: 'email-006',
    recipient: 'James Wilson',
    recipientEmail: 'james.wilson@email.com',
    subject: 'Follow-up: Senior Developer Position',
    body: 'Dear James,\n\nWe are following up regarding your application for the Senior Developer position submitted on March 25, 2024.\n\nWe are still reviewing applications and will contact you within 2 weeks with an update on your status.\n\nThank you for your patience!\n\nBest regards,\nRecruiting Team',
    type: 'followup',
    sentAt: new Date('2024-04-12'),
    status: 'sent',
    template: 'followup_letter',
  },
  {
    id: 'email-007',
    recipient: 'Alice Kumar',
    recipientEmail: 'alice.kumar@email.com',
    subject: 'Welcome Aboard! - Offer Acceptance Confirmation',
    body: 'Dear Alice,\n\nCongratulations on accepting our offer for the Product Designer position!\n\nYour start date is scheduled for May 1, 2024. Please review the attached onboarding documents and schedule.\n\nWe are looking forward to having you join our team!\n\nBest regards,\nHR Team',
    type: 'offer',
    sentAt: new Date('2024-04-11'),
    status: 'opened',
    template: 'offer_accepted',
  },
  {
    id: 'email-008',
    recipient: 'Robert Thompson',
    recipientEmail: 'robert.thompson@email.com',
    subject: 'Application Status - Technical Assessment Required',
    body: 'Dear Robert,\n\nThank you for applying to the Backend Engineer position. As part of our selection process, we would like you to complete a technical assessment.\n\nPlease click the link below to begin the assessment. You will have 2 hours to complete it.\n\nAssessment Link: [link]\n\nBest regards,\nRecruiting Team',
    type: 'update',
    sentAt: new Date('2024-04-13'),
    status: 'sent',
    template: 'technical_assessment',
  },
]
