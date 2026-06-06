export type LogActionType =
  | "applicant_applied"
  | "applicant_verified"
  | "applicant_rejected"
  | "payment_received"
  | "payment_failed"
  | "interview_scheduled"
  | "interview_completed"
  | "applicant_selected"
  | "template_updated"
  | "program_created"
  | "program_updated"
  | "user_added"
  | "pipeline_updated"
  | "admin_login";

export interface ActivityLog {
  id: string;
  actor: string;
  actorRole: string;
  actorAvatar: string;
  action: LogActionType;
  description: string;
  entity: string;
  entityType: "applicant" | "payment" | "interview" | "program" | "template" | "user" | "pipeline" | "system";
  timestamp: string;
  metadata?: Record<string, string>;
}

export const activityLogs: ActivityLog[] = [
  {
    id: "log_001",
    actor: "System",
    actorRole: "Automated",
    actorAvatar: "SY",
    action: "applicant_applied",
    description: "Manish Rao submitted an application for Data Science",
    entity: "app_010",
    entityType: "applicant",
    timestamp: "2026-04-08T14:00:00Z",
  },
  {
    id: "log_002",
    actor: "Neha Jain",
    actorRole: "HR",
    actorAvatar: "NJ",
    action: "interview_scheduled",
    description: "Interview scheduled for Tanvi Gupta on Apr 15 at 10:30 AM",
    entity: "int_005",
    entityType: "interview",
    timestamp: "2026-04-08T11:30:00Z",
  },
  {
    id: "log_003",
    actor: "System",
    actorRole: "Automated",
    actorAvatar: "SY",
    action: "payment_received",
    description: "Payment of ₹12,000 received from Tanvi Gupta",
    entity: "pay_009",
    entityType: "payment",
    timestamp: "2026-04-08T11:00:00Z",
  },
  {
    id: "log_004",
    actor: "Adi Banerjee",
    actorRole: "Super Admin",
    actorAvatar: "AB",
    action: "pipeline_updated",
    description: "Updated Pipeline 1 — added 'Background Check' stage",
    entity: "pipe_001",
    entityType: "pipeline",
    timestamp: "2026-04-08T09:45:00Z",
  },
  {
    id: "log_005",
    actor: "Neha Jain",
    actorRole: "HR",
    actorAvatar: "NJ",
    action: "applicant_verified",
    description: "Verified documents for Karan Joshi",
    entity: "app_004",
    entityType: "applicant",
    timestamp: "2026-04-07T17:00:00Z",
  },
  {
    id: "log_006",
    actor: "System",
    actorRole: "Automated",
    actorAvatar: "SY",
    action: "payment_failed",
    description: "Payment of ₹15,000 failed for Arjun Kapoor",
    entity: "pay_006",
    entityType: "payment",
    timestamp: "2026-04-07T15:30:00Z",
  },
  {
    id: "log_007",
    actor: "Adi Banerjee",
    actorRole: "Super Admin",
    actorAvatar: "AB",
    action: "program_created",
    description: "Created new program: Business Development",
    entity: "prog_005",
    entityType: "program",
    timestamp: "2026-04-07T10:00:00Z",
  },
  {
    id: "log_008",
    actor: "Aryan Kapoor",
    actorRole: "HR",
    actorAvatar: "AK",
    action: "interview_completed",
    description: "Completed interview with Divya Krishnan — Score: 95",
    entity: "int_003",
    entityType: "interview",
    timestamp: "2026-04-06T16:00:00Z",
  },
  {
    id: "log_009",
    actor: "Neha Jain",
    actorRole: "HR",
    actorAvatar: "NJ",
    action: "applicant_selected",
    description: "Aanya Sharma selected for Product Management",
    entity: "app_001",
    entityType: "applicant",
    timestamp: "2026-04-06T14:00:00Z",
  },
  {
    id: "log_010",
    actor: "Adi Banerjee",
    actorRole: "Super Admin",
    actorAvatar: "AB",
    action: "template_updated",
    description: "Updated email template: Selection Congratulations",
    entity: "tpl_005",
    entityType: "template",
    timestamp: "2026-04-05T11:00:00Z",
  },
  {
    id: "log_011",
    actor: "Ravi Sharma",
    actorRole: "Admin",
    actorAvatar: "RS",
    action: "user_added",
    description: "Added new team member: Meera Desai (Ops)",
    entity: "usr_006",
    entityType: "user",
    timestamp: "2026-04-04T09:00:00Z",
  },
  {
    id: "log_012",
    actor: "System",
    actorRole: "Automated",
    actorAvatar: "SY",
    action: "applicant_applied",
    description: "Sneha Patel submitted an application for Growth Marketing",
    entity: "app_005",
    entityType: "applicant",
    timestamp: "2026-04-03T15:00:00Z",
  },
];
