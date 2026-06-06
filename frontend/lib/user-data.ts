export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'team_member'
  | 'marketing'
  | 'hr'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: 'active' | 'inactive'
  department?: string
  joinDate: Date
  avatar?: string
  phone?: string
}

export const dummyUsers: User[] = [
  {
    id: 'user-001',
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'super_admin',
    status: 'active',
    department: 'Management',
    joinDate: new Date('2023-01-01'),
    phone: '+1 (555) 111-0000',
  },
  {
    id: 'user-002',
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@company.com',
    role: 'admin',
    status: 'active',
    department: 'Operations',
    joinDate: new Date('2023-06-15'),
    phone: '+1 (555) 222-1111',
  },
  {
    id: 'user-003',
    name: 'James Wilson',
    email: 'james.wilson@company.com',
    role: 'team_member',
    status: 'active',
    department: 'Sales',
    joinDate: new Date('2023-09-01'),
    phone: '+1 (555) 333-2222',
  },
  {
    id: 'user-004',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@company.com',
    role: 'marketing',
    status: 'active',
    department: 'Marketing',
    joinDate: new Date('2024-01-10'),
    phone: '+1 (555) 444-3333',
  },
  {
    id: 'user-005',
    name: 'Robert Taylor',
    email: 'robert.taylor@company.com',
    role: 'hr',
    status: 'active',
    department: 'Human Resources',
    joinDate: new Date('2023-03-20'),
    phone: '+1 (555) 555-4444',
  },
  {
    id: 'user-006',
    name: 'Patricia Brown',
    email: 'patricia.brown@company.com',
    role: 'team_member',
    status: 'inactive',
    department: 'Sales',
    joinDate: new Date('2023-11-05'),
    phone: '+1 (555) 666-5555',
  },
  {
    id: 'user-007',
    name: 'Michael Johnson',
    email: 'michael.johnson@company.com',
    role: 'team_member',
    status: 'active',
    department: 'Operations',
    joinDate: new Date('2023-12-01'),
    phone: '+1 (555) 777-6666',
  },
]

export const rolePermissions: Record<
  UserRole,
  {
    name: string
    description: string
    permissions: string[]
  }
> = {
  super_admin: {
    name: 'Super Admin',
    description: 'Full system access',
    permissions: [
      'View all data',
      'Create workflows',
      'Manage all candidates',
      'Manage users and roles',
      'Generate reports',
      'View activity logs',
      'System settings',
      'Delete data',
    ],
  },
  admin: {
    name: 'Admin',
    description: 'Administrative access',
    permissions: [
      'View all data',
      'Create workflows',
      'Manage candidates',
      'Manage team members',
      'Generate reports',
      'View activity logs',
      'Update workflows',
    ],
  },
  team_member: {
    name: 'Team Member',
    description: 'Standard user access',
    permissions: [
      'View assigned candidates',
      'Update candidate status',
      'Add interview notes',
      'View own activity',
      'Download documents',
    ],
  },
  marketing: {
    name: 'Marketing',
    description: 'Marketing department access',
    permissions: [
      'View candidate database',
      'View reports',
      'Generate marketing reports',
      'View activity logs',
      'Export data',
    ],
  },
  hr: {
    name: 'HR Manager',
    description: 'HR department access',
    permissions: [
      'Manage users',
      'View all candidates',
      'Manage interviews',
      'View HR reports',
      'Manage documents',
      'View activity logs',
    ],
  },
}
