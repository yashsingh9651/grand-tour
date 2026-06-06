export type StageType = "gate" | "action" | "notify";

export interface PipelineRule {
  type: "email_trigger" | "payment_required" | "verification_required" | "interview_required";
  label: string;
  enabled: boolean;
  config?: Record<string, string>;
}

export interface PipelineStage {
  id: string;
  title: string;
  order: number;
  type: StageType;
  color: string;
  rules: PipelineRule[];
  applicantCount: number;
}

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  stages: PipelineStage[];
  programIds: string[];
}

export const pipelines: Pipeline[] = [
  {
    id: "pipe_001",
    name: "Standard Pipeline",
    description: "Default pipeline for most internship programs",
    programIds: ["prog_001", "prog_002", "prog_004"],
    stages: [
      {
        id: "stage_001",
        title: "Application Submitted",
        order: 0,
        type: "gate",
        color: "#6366f1",
        applicantCount: 124,
        rules: [
          { type: "email_trigger", label: "Send acknowledgement email", enabled: true, config: { template: "tpl_001" } },
        ],
      },
      {
        id: "stage_002",
        title: "Document Verification",
        order: 1,
        type: "gate",
        color: "#8b5cf6",
        applicantCount: 98,
        rules: [
          { type: "verification_required", label: "Documents must be verified by HR", enabled: true },
          { type: "email_trigger", label: "Send verification approval email", enabled: true, config: { template: "tpl_002" } },
        ],
      },
      {
        id: "stage_003",
        title: "Payment",
        order: 2,
        type: "gate",
        color: "#06b6d4",
        applicantCount: 76,
        rules: [
          { type: "payment_required", label: "Full fee payment required", enabled: true },
          { type: "email_trigger", label: "Send payment confirmation email", enabled: true, config: { template: "tpl_003" } },
        ],
      },
      {
        id: "stage_004",
        title: "Interview",
        order: 3,
        type: "action",
        color: "#f59e0b",
        applicantCount: 52,
        rules: [
          { type: "interview_required", label: "Schedule and complete interview", enabled: true },
          { type: "email_trigger", label: "Send interview schedule email", enabled: true, config: { template: "tpl_004" } },
        ],
      },
      {
        id: "stage_005",
        title: "Final Selection",
        order: 4,
        type: "notify",
        color: "#10b981",
        applicantCount: 28,
        rules: [
          { type: "email_trigger", label: "Send selection congratulations email", enabled: true, config: { template: "tpl_005" } },
        ],
      },
    ],
  },
  {
    id: "pipe_002",
    name: "Fast-Track Pipeline",
    description: "Accelerated pipeline for technical programs with pre-screening",
    programIds: ["prog_003", "prog_005"],
    stages: [
      {
        id: "stage_011",
        title: "Application & Screening",
        order: 0,
        type: "gate",
        color: "#6366f1",
        applicantCount: 87,
        rules: [
          { type: "email_trigger", label: "Send acknowledgement email", enabled: true, config: { template: "tpl_001" } },
          { type: "verification_required", label: "Auto-screen based on score", enabled: true },
        ],
      },
      {
        id: "stage_012",
        title: "Payment",
        order: 1,
        type: "gate",
        color: "#06b6d4",
        applicantCount: 58,
        rules: [
          { type: "payment_required", label: "Full fee payment required", enabled: true },
          { type: "email_trigger", label: "Send payment confirmation email", enabled: true, config: { template: "tpl_003" } },
        ],
      },
      {
        id: "stage_013",
        title: "Technical Interview",
        order: 2,
        type: "action",
        color: "#f59e0b",
        applicantCount: 37,
        rules: [
          { type: "interview_required", label: "Technical round required", enabled: true },
          { type: "email_trigger", label: "Send interview schedule email", enabled: true, config: { template: "tpl_004" } },
        ],
      },
      {
        id: "stage_014",
        title: "Selected",
        order: 3,
        type: "notify",
        color: "#10b981",
        applicantCount: 24,
        rules: [
          { type: "email_trigger", label: "Send selection email", enabled: true, config: { template: "tpl_005" } },
        ],
      },
    ],
  },
];
