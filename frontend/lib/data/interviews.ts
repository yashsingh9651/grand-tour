export type InterviewStatus = "scheduled" | "completed" | "cancelled" | "rescheduled";

export interface Interview {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantAvatar: string;
  program: string;
  interviewer: string;
  scheduledAt: string;
  duration: number; // minutes
  status: InterviewStatus;
  mode: "video" | "in-person" | "phone";
  meetLink?: string;
  notes?: string;
  score?: number;
}

export const interviews: Interview[] = [
  {
    id: "int_001",
    applicantId: "app_001",
    applicantName: "Aanya Sharma",
    applicantAvatar: "AS",
    program: "Product Management",
    interviewer: "Neha Jain",
    scheduledAt: "2026-03-15T10:00:00Z",
    duration: 45,
    status: "completed",
    mode: "video",
    meetLink: "https://meet.google.com/abc-def-ghi",
    score: 92,
  },
  {
    id: "int_002",
    applicantId: "app_002",
    applicantName: "Rohan Mehta",
    applicantAvatar: "RM",
    program: "UI/UX Design",
    interviewer: "Aryan Kapoor",
    scheduledAt: "2026-04-10T14:00:00Z",
    duration: 60,
    status: "scheduled",
    mode: "video",
    meetLink: "https://meet.google.com/jkl-mno-pqr",
  },
  {
    id: "int_003",
    applicantId: "app_007",
    applicantName: "Divya Krishnan",
    applicantAvatar: "DK",
    program: "UI/UX Design",
    interviewer: "Aryan Kapoor",
    scheduledAt: "2026-03-20T11:00:00Z",
    duration: 60,
    status: "completed",
    mode: "video",
    meetLink: "https://meet.google.com/stu-vwx-yz1",
    score: 95,
  },
  {
    id: "int_004",
    applicantId: "app_008",
    applicantName: "Vikram Singh",
    applicantAvatar: "VS",
    program: "Growth Marketing",
    interviewer: "Pooja Rao",
    scheduledAt: "2026-04-12T16:00:00Z",
    duration: 30,
    status: "scheduled",
    mode: "phone",
  },
  {
    id: "int_005",
    applicantId: "app_009",
    applicantName: "Tanvi Gupta",
    applicantAvatar: "TG",
    program: "Product Management",
    interviewer: "Neha Jain",
    scheduledAt: "2026-04-15T10:30:00Z",
    duration: 45,
    status: "scheduled",
    mode: "video",
    meetLink: "https://meet.google.com/234-567-890",
  },
  {
    id: "int_006",
    applicantId: "app_004",
    applicantName: "Karan Joshi",
    applicantAvatar: "KJ",
    program: "Product Management",
    interviewer: "Neha Jain",
    scheduledAt: "2026-04-08T09:00:00Z",
    duration: 45,
    status: "rescheduled",
    mode: "video",
    notes: "Applicant requested reschedule due to exam",
  },
];

export const interviewSlots = [
  { date: "2026-04-10", slots: ["10:00", "14:00", "16:00"], booked: ["14:00"] },
  { date: "2026-04-11", slots: ["09:00", "11:00", "15:00"], booked: [] },
  { date: "2026-04-12", slots: ["10:00", "13:00", "16:00"], booked: ["16:00"] },
  { date: "2026-04-15", slots: ["09:30", "10:30", "14:00"], booked: ["09:30", "10:30"] },
];
