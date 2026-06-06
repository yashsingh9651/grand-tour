export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  role: string
  department: string
  joinDate: Date
  status: 'active' | 'inactive'
  timezone: string
  bio?: string
  permissions: string[]
  createdAt: Date
}

export const currentUserProfile: UserProfile = {
  id: 'user-current',
  name: 'Alex Thompson',
  email: 'alex.thompson@company.com',
  phone: '+1 (555) 901-2345',
  avatar: '/avatars/avatar-1.jpg',
  role: 'Hiring Manager',
  department: 'Human Resources',
  joinDate: new Date('2023-01-15'),
  status: 'active',
  timezone: 'EST',
  bio: 'Experienced hiring manager with 8+ years in talent acquisition and recruitment.',
  permissions: [
    'view_candidates',
    'create_workflows',
    'manage_interviews',
    'approve_documents',
    'manage_users',
    'view_reports',
    'manage_notifications',
    'system_admin',
  ],
  createdAt: new Date('2023-01-15'),
}
