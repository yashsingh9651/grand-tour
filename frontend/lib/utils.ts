import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStudentFullName(appOrUser: any): string {
  if (!appOrUser) return 'Student'

  const app = appOrUser.data !== undefined ? appOrUser : null
  const data = app?.data || appOrUser.data || appOrUser

  const filled =
    data?.studentName ||
    data?.fullName ||
    data?.applicantName ||
    data?.candidateName ||
    data?.name ||
    appOrUser?.studentName

  if (filled && typeof filled === 'string' && filled.trim()) {
    return filled.trim()
  }

  const user = app?.user || appOrUser.user || appOrUser
  const userFullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
  if (userFullName) return userFullName

  if (user?.name && typeof user.name === 'string' && user.name.trim()) {
    return user.name.trim()
  }

  return user?.email?.split('@')[0] || 'Student'
}

export function getStudentFirstName(appOrUser: any): string {
  const fullName = getStudentFullName(appOrUser)
  return fullName.split(' ')[0] || 'Student'
}
