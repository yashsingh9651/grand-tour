export type UserRole = "super_admin" | "admin" | "hr" | "ops";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
  phone: string;
  joinedAt: string;
  lastActive: string;
  status: "active" | "inactive";
  permissions: string[];
}

export const teamMembers: TeamMember[] = [
  {
    id: "usr_001",
    name: "Adi Banerjee",
    email: "adi@grandtour.in",
    role: "super_admin",
    avatar: "AB",
    department: "Leadership",
    phone: "+91 98765 00001",
    joinedAt: "2025-01-01T00:00:00Z",
    lastActive: "2026-04-08T18:00:00Z",
    status: "active",
    permissions: ["all"],
  },
  {
    id: "usr_002",
    name: "Neha Jain",
    email: "neha@grandtour.in",
    role: "hr",
    avatar: "NJ",
    department: "Human Resources",
    phone: "+91 98765 00002",
    joinedAt: "2025-02-15T00:00:00Z",
    lastActive: "2026-04-08T12:00:00Z",
    status: "active",
    permissions: ["applicants.read", "applicants.verify", "interviews.manage", "emails.send"],
  },
  {
    id: "usr_003",
    name: "Aryan Kapoor",
    email: "aryan@grandtour.in",
    role: "hr",
    avatar: "AK",
    department: "Human Resources",
    phone: "+91 98765 00003",
    joinedAt: "2025-03-01T00:00:00Z",
    lastActive: "2026-04-07T17:00:00Z",
    status: "active",
    permissions: ["applicants.read", "applicants.verify", "interviews.manage"],
  },
  {
    id: "usr_004",
    name: "Pooja Rao",
    email: "pooja@grandtour.in",
    role: "ops",
    avatar: "PR",
    department: "Operations",
    phone: "+91 98765 00004",
    joinedAt: "2025-04-10T00:00:00Z",
    lastActive: "2026-04-08T14:30:00Z",
    status: "active",
    permissions: ["payments.read", "programs.read", "reports.read"],
  },
  {
    id: "usr_005",
    name: "Ravi Sharma",
    email: "ravi@grandtour.in",
    role: "admin",
    avatar: "RS",
    department: "Administration",
    phone: "+91 98765 00005",
    joinedAt: "2025-05-20T00:00:00Z",
    lastActive: "2026-04-06T11:00:00Z",
    status: "active",
    permissions: ["applicants.all", "programs.all", "payments.read", "team.read", "reports.read"],
  },
  {
    id: "usr_006",
    name: "Meera Desai",
    email: "meera@grandtour.in",
    role: "ops",
    avatar: "MD",
    department: "Operations",
    phone: "+91 98765 00006",
    joinedAt: "2025-06-01T00:00:00Z",
    lastActive: "2026-03-28T09:00:00Z",
    status: "inactive",
    permissions: ["payments.read", "reports.read"],
  },
];

export const roleColors: Record<string, string> = {
  super_admin: "bg-purple-50 text-purple-700",
  admin: "bg-indigo-50 text-indigo-700",
  hr: "bg-blue-50 text-blue-700",
  ops: "bg-green-50 text-green-700",
};

export const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  hr: "HR",
  ops: "Ops",
};
