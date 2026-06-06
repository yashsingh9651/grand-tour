export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  trigger: "on_apply" | "on_verify" | "on_payment" | "on_interview" | "on_select" | "on_reject" | "manual";
  lastEdited: string;
  status: "active" | "draft";
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: "tpl_001",
    name: "Application Received",
    subject: "We received your application, {{name}}!",
    body: `Hi {{name}},

Thank you for applying to the {{program}} internship at Grand Tour.

We have successfully received your application and our team will review it within 2-3 business days. You will be notified of the next steps via email.

Application ID: {{application_id}}

Best regards,
The Grand Tour Team`,
    trigger: "on_apply",
    lastEdited: "2026-03-01T10:00:00Z",
    status: "active",
  },
  {
    id: "tpl_002",
    name: "Document Verification Approved",
    subject: "Your documents have been verified ✓",
    body: `Hi {{name}},

Great news! Your documents for the {{program}} program have been successfully verified.

The next step is to complete your payment of ₹{{amount}} to secure your seat.

Payment due date: {{payment_due_date}}

Pay now: {{payment_link}}

Best regards,
The Grand Tour Team`,
    trigger: "on_verify",
    lastEdited: "2026-03-05T14:00:00Z",
    status: "active",
  },
  {
    id: "tpl_003",
    name: "Payment Confirmation",
    subject: "Payment Confirmed — You're in! 🎉",
    body: `Hi {{name}},

Your payment of ₹{{amount}} for the {{program}} internship has been confirmed.

Transaction ID: {{transaction_id}}

You will receive your interview schedule within 48 hours.

Best regards,
The Grand Tour Team`,
    trigger: "on_payment",
    lastEdited: "2026-03-08T09:00:00Z",
    status: "active",
  },
  {
    id: "tpl_004",
    name: "Interview Scheduled",
    subject: "Your Interview is Scheduled — {{date}}",
    body: `Hi {{name}},

Your interview for the {{program}} program has been scheduled.

Date: {{date}}
Time: {{time}}
Mode: {{mode}}
Interviewer: {{interviewer}}

{{#if meet_link}}
Join: {{meet_link}}
{{/if}}

Please be ready 5 minutes before the scheduled time.

Best regards,
The Grand Tour Team`,
    trigger: "on_interview",
    lastEdited: "2026-03-10T11:00:00Z",
    status: "active",
  },
  {
    id: "tpl_005",
    name: "Selection Congratulations",
    subject: "Congratulations! You've been selected 🎊",
    body: `Hi {{name}},

We are thrilled to inform you that you have been selected for the {{program}} internship at Grand Tour!

Start Date: {{start_date}}
Reporting Manager: {{manager_name}}

Please complete your onboarding formalities by {{onboarding_deadline}}.

Welcome to the team!

Best regards,
The Grand Tour Team`,
    trigger: "on_select",
    lastEdited: "2026-03-12T15:00:00Z",
    status: "active",
  },
  {
    id: "tpl_006",
    name: "Rejection Notice",
    subject: "Update on your application",
    body: `Hi {{name}},

Thank you for your interest in the {{program}} program and for taking the time to go through our selection process.

After careful consideration, we regret to inform you that we are unable to move forward with your application at this time.

We encourage you to apply again in the next cohort.

Best regards,
The Grand Tour Team`,
    trigger: "on_reject",
    lastEdited: "2026-03-15T09:00:00Z",
    status: "draft",
  },
];
