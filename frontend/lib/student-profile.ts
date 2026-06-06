export interface StudentProfile {
  id: string
  name: string
  email: string
  whatsapp: string
  dateOfBirth: string
  placeOfBirth: string
  address: string
  collegeName: string
  tpoName: string
  tpoEmail: string
  course: string
  duration: string
  currentYear: string
  internshipStartDate: string
  internshipEndDate: string
  department: string
  currentWorkflowStep: string
}

export const dummyStudentProfile: StudentProfile = {
  id: 'STU001',
  name: 'Aditya Kumar',
  email: 'aditya.kumar@college.ac.in',
  whatsapp: '+91 98765 43210',
  dateOfBirth: '2003-05-15',
  placeOfBirth: 'New Delhi, India',
  address: '123 Apartment, Delhi - 110001',
  collegeName: 'Delhi Institute of Technology',
  tpoName: 'Dr. Rajesh Singh',
  tpoEmail: 'rajesh.singh@dit.ac.in',
  course: 'B.Tech Computer Science',
  duration: '4 Years',
  currentYear: '3rd Year',
  internshipStartDate: '2024-06-01',
  internshipEndDate: '2024-07-31',
  department: 'Information Technology',
  currentWorkflowStep: 'interview',
}

export interface ApplicationData {
  fullName: string
  dateOfBirth: string
  placeOfBirth: string
  address: string
  city: string
  state: string
  pincode: string
  whatsapp: string
  email: string
  collegeName: string
  universityName: string
  tpoName: string
  tpoEmail: string
  course: string
  duration: string
  currentYear: string
  department: string
  cgpa: number
  internshipStartDate: string
  internshipEndDate: string
  submittedAt: string
  status: 'submitted' | 'approved' | 'rejected'
}

export const dummyApplicationData: ApplicationData = {
  fullName: 'Aditya Kumar',
  dateOfBirth: '15-05-2003',
  placeOfBirth: 'New Delhi, India',
  address: '123 Apartment Block',
  city: 'Delhi',
  state: 'Delhi',
  pincode: '110001',
  whatsapp: '+91 98765 43210',
  email: 'aditya.kumar@college.ac.in',
  collegeName: 'Delhi Institute of Technology',
  universityName: 'Delhi University',
  tpoName: 'Dr. Rajesh Singh',
  tpoEmail: 'rajesh.singh@dit.ac.in',
  course: 'B.Tech Computer Science',
  duration: '4 Years',
  currentYear: '3rd Year',
  department: 'Information Technology',
  cgpa: 8.2,
  internshipStartDate: '01-06-2024',
  internshipEndDate: '31-07-2024',
  submittedAt: '10-04-2024',
  status: 'approved',
}

export type DocumentStatus = 'pending' | 'approved' | 'rejected'

export interface UploadedDocument {
  id: string
  name: string
  type: 'cv' | 'photo' | 'passport' | 'itar' | 'iti' | 'gst' | 'visa' | 'other'
  uploadedAt: string
  status: DocumentStatus
  feedback?: string
}

export const dummyDocuments: UploadedDocument[] = [
  {
    id: 'doc1',
    name: 'Resume_Aditya_Kumar.pdf',
    type: 'cv',
    uploadedAt: '12-04-2024',
    status: 'approved',
  },
  {
    id: 'doc2',
    name: 'Passport_Photo.jpg',
    type: 'photo',
    uploadedAt: '12-04-2024',
    status: 'approved',
  },
  {
    id: 'doc3',
    name: 'Passport_Pages.pdf',
    type: 'passport',
    uploadedAt: '13-04-2024',
    status: 'approved',
  },
  {
    id: 'doc4',
    name: 'Sponsor_ITR_2023.pdf',
    type: 'itar',
    uploadedAt: '13-04-2024',
    status: 'pending',
    feedback: 'Awaiting verification',
  },
]
