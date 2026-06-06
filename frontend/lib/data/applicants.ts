export type ApplicantStatus =
  | "applied"
  | "verified"
  | "paid"
  | "interview"
  | "selected"
  | "rejected";

export type PaymentStatus = "paid" | "pending" | "failed" | "waived";

export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  program: string;
  programId: string;
  status: ApplicantStatus;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  interviewDate: string | null;
  appliedAt: string;
  verifiedAt: string | null;
  avatar: string;
  college: string;
  score: number;
}

export const applicants: Applicant[] = [
  {
    id: "app_001",
    name: "Aanya Sharma",
    email: "aanya.sharma@email.com",
    phone: "+91 98765 43210",
    program: "Product Management",
    programId: "prog_001",
    status: "selected",
    paymentStatus: "paid",
    paymentAmount: 12000,
    interviewDate: "2026-03-15T10:00:00Z",
    appliedAt: "2026-02-01T09:00:00Z",
    verifiedAt: "2026-02-05T14:00:00Z",
    avatar: "AS",
    college: "IIT Delhi",
    score: 92,
  },
  {
    id: "app_002",
    name: "Rohan Mehta",
    email: "rohan.mehta@email.com",
    phone: "+91 91234 56789",
    program: "UI/UX Design",
    programId: "prog_002",
    status: "interview",
    paymentStatus: "paid",
    paymentAmount: 9500,
    interviewDate: "2026-04-10T14:00:00Z",
    appliedAt: "2026-02-10T11:00:00Z",
    verifiedAt: "2026-02-14T10:00:00Z",
    avatar: "RM",
    college: "NID Ahmedabad",
    score: 87,
  },
  {
    id: "app_003",
    name: "Priya Nair",
    email: "priya.nair@email.com",
    phone: "+91 87654 32109",
    program: "Data Science",
    programId: "prog_003",
    status: "paid",
    paymentStatus: "paid",
    paymentAmount: 15000,
    interviewDate: null,
    appliedAt: "2026-02-15T08:30:00Z",
    verifiedAt: "2026-02-20T12:00:00Z",
    avatar: "PN",
    college: "BITS Pilani",
    score: 78,
  },
  {
    id: "app_004",
    name: "Karan Joshi",
    email: "karan.joshi@email.com",
    phone: "+91 76543 21098",
    program: "Product Management",
    programId: "prog_001",
    status: "verified",
    paymentStatus: "pending",
    paymentAmount: 12000,
    interviewDate: null,
    appliedAt: "2026-02-20T10:00:00Z",
    verifiedAt: "2026-02-25T09:00:00Z",
    avatar: "KJ",
    college: "XLRI Jamshedpur",
    score: 81,
  },
  {
    id: "app_005",
    name: "Sneha Patel",
    email: "sneha.patel@email.com",
    phone: "+91 65432 10987",
    program: "Marketing",
    programId: "prog_004",
    status: "applied",
    paymentStatus: "pending",
    paymentAmount: 8000,
    interviewDate: null,
    appliedAt: "2026-03-01T15:00:00Z",
    verifiedAt: null,
    avatar: "SP",
    college: "IIM Bangalore",
    score: 74,
  },
  {
    id: "app_006",
    name: "Arjun Kapoor",
    email: "arjun.kapoor@email.com",
    phone: "+91 54321 09876",
    program: "Data Science",
    programId: "prog_003",
    status: "rejected",
    paymentStatus: "failed",
    paymentAmount: 15000,
    interviewDate: null,
    appliedAt: "2026-02-05T12:00:00Z",
    verifiedAt: null,
    avatar: "AK",
    college: "VIT Vellore",
    score: 52,
  },
  {
    id: "app_007",
    name: "Divya Krishnan",
    email: "divya.k@email.com",
    phone: "+91 43210 98765",
    program: "UI/UX Design",
    programId: "prog_002",
    status: "selected",
    paymentStatus: "paid",
    paymentAmount: 9500,
    interviewDate: "2026-03-20T11:00:00Z",
    appliedAt: "2026-02-08T08:00:00Z",
    verifiedAt: "2026-02-12T13:00:00Z",
    avatar: "DK",
    college: "Srishti Institute",
    score: 95,
  },
  {
    id: "app_008",
    name: "Vikram Singh",
    email: "vikram.singh@email.com",
    phone: "+91 32109 87654",
    program: "Marketing",
    programId: "prog_004",
    status: "interview",
    paymentStatus: "paid",
    paymentAmount: 8000,
    interviewDate: "2026-04-12T16:00:00Z",
    appliedAt: "2026-02-25T10:30:00Z",
    verifiedAt: "2026-03-01T11:00:00Z",
    avatar: "VS",
    college: "MICA Ahmedabad",
    score: 83,
  },
  {
    id: "app_009",
    name: "Tanvi Gupta",
    email: "tanvi.gupta@email.com",
    phone: "+91 21098 76543",
    program: "Product Management",
    programId: "prog_001",
    status: "paid",
    paymentStatus: "paid",
    paymentAmount: 12000,
    interviewDate: null,
    appliedAt: "2026-03-05T09:00:00Z",
    verifiedAt: "2026-03-08T14:00:00Z",
    avatar: "TG",
    college: "NMIMS Mumbai",
    score: 76,
  },
  {
    id: "app_010",
    name: "Manish Rao",
    email: "manish.rao@email.com",
    phone: "+91 10987 65432",
    program: "Data Science",
    programId: "prog_003",
    status: "applied",
    paymentStatus: "pending",
    paymentAmount: 15000,
    interviewDate: null,
    appliedAt: "2026-03-10T14:00:00Z",
    verifiedAt: null,
    avatar: "MR",
    college: "IIT Bombay",
    score: 68,
  },
];

export const funnelData = [
  { stage: "Applied", count: 248, color: "#6366f1" },
  { stage: "Verified", count: 187, color: "#8b5cf6" },
  { stage: "Paid", count: 134, color: "#06b6d4" },
  { stage: "Interview", count: 89, color: "#f59e0b" },
  { stage: "Selected", count: 52, color: "#10b981" },
];
