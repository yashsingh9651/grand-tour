export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";

export interface Payment {
  id: string;
  applicantId: string;
  applicantName: string;
  program: string;
  amount: number;
  status: PaymentStatus;
  method: string;
  transactionId: string;
  date: string;
}

export const payments: Payment[] = [
  { id: "pay_001", applicantId: "app_001", applicantName: "Aanya Sharma", program: "Product Management", amount: 12000, status: "paid", method: "UPI", transactionId: "TXN20260201001", date: "2026-02-10T09:15:00Z" },
  { id: "pay_002", applicantId: "app_002", applicantName: "Rohan Mehta", program: "UI/UX Design", amount: 9500, status: "paid", method: "Net Banking", transactionId: "TXN20260215002", date: "2026-02-15T11:30:00Z" },
  { id: "pay_003", applicantId: "app_003", applicantName: "Priya Nair", program: "Data Science", amount: 15000, status: "paid", method: "Credit Card", transactionId: "TXN20260220003", date: "2026-02-20T14:00:00Z" },
  { id: "pay_004", applicantId: "app_004", applicantName: "Karan Joshi", program: "Product Management", amount: 12000, status: "pending", method: "—", transactionId: "—", date: "2026-02-25T10:00:00Z" },
  { id: "pay_005", applicantId: "app_005", applicantName: "Sneha Patel", program: "Marketing", amount: 8000, status: "pending", method: "—", transactionId: "—", date: "2026-03-01T15:00:00Z" },
  { id: "pay_006", applicantId: "app_006", applicantName: "Arjun Kapoor", program: "Data Science", amount: 15000, status: "failed", method: "Debit Card", transactionId: "TXN20260205006", date: "2026-02-05T12:00:00Z" },
  { id: "pay_007", applicantId: "app_007", applicantName: "Divya Krishnan", program: "UI/UX Design", amount: 9500, status: "paid", method: "UPI", transactionId: "TXN20260208007", date: "2026-02-12T13:00:00Z" },
  { id: "pay_008", applicantId: "app_008", applicantName: "Vikram Singh", program: "Marketing", amount: 8000, status: "paid", method: "Net Banking", transactionId: "TXN20260301008", date: "2026-03-01T14:00:00Z" },
  { id: "pay_009", applicantId: "app_009", applicantName: "Tanvi Gupta", program: "Product Management", amount: 12000, status: "paid", method: "UPI", transactionId: "TXN20260308009", date: "2026-03-08T11:00:00Z" },
  { id: "pay_010", applicantId: "app_010", applicantName: "Manish Rao", program: "Data Science", amount: 15000, status: "pending", method: "—", transactionId: "—", date: "2026-03-10T14:00:00Z" },
  { id: "pay_011", applicantId: "app_011", applicantName: "Ritu Verma", program: "Marketing", amount: 8000, status: "refunded", method: "UPI", transactionId: "TXN20260110011", date: "2026-01-10T09:00:00Z" },
  { id: "pay_012", applicantId: "app_012", applicantName: "Aarav Shah", program: "Product Management", amount: 12000, status: "paid", method: "Credit Card", transactionId: "TXN20260115012", date: "2026-01-15T16:00:00Z" },
];

export const revenueByMonth = [
  { month: "Jan", revenue: 84000, target: 90000 },
  { month: "Feb", revenue: 127500, target: 110000 },
  { month: "Mar", revenue: 96000, target: 100000 },
  { month: "Apr", revenue: 143500, target: 130000 },
  { month: "May", revenue: 108000, target: 120000 },
  { month: "Jun", revenue: 162000, target: 150000 },
];

export const revenueStats = {
  totalRevenue: 721000,
  paidRevenue: 603500,
  pendingRevenue: 83000,
  failedRevenue: 34500,
};
