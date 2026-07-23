import { prisma } from '../config/db';

class WorkflowService {
  async getWorkflow() {
    let workflow = await prisma.workflow.findFirst({
      where: { isActive: true }
    });

    if (!workflow) {
      // Create a default workflow if none exists
      workflow = await this.initializeDefaultWorkflow();
    } else if (Array.isArray(workflow.steps)) {
      // Ensure workpermit (order 8) comes before payment3 (order 9)
      let steps = workflow.steps as any[];
      let updated = false;
      steps = steps.map((s: any) => {
        if (s.id === 'workpermit' && s.order !== 8) {
          updated = true;
          return { ...s, order: 8 };
        }
        if (s.id === 'payment3' && s.order !== 9) {
          updated = true;
          return { ...s, order: 9 };
        }
        return s;
      });

      if (updated) {
        steps.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        workflow = await prisma.workflow.update({
          where: { id: workflow.id },
          data: { steps }
        });
      }
    }

    return workflow;
  }

  async updateWorkflow(data: any) {
    const existing = await prisma.workflow.findFirst({
      where: { isActive: true }
    });

    if (existing) {
      return await prisma.workflow.update({
        where: { id: existing.id },
        data: {
          name: data.name || existing.name,
          description: data.description || existing.description,
          steps: data.steps || existing.steps,
        }
      });
    } else {
      return await prisma.workflow.create({
        data: {
          name: data.name || 'Grand Tour Process',
          description: data.description || 'The standard internship management workflow',
          steps: data.steps || [],
        }
      });
    }
  }

  private async initializeDefaultWorkflow() {
    return await prisma.workflow.create({
      data: {
        name: 'Grand Tour Internship Process',
        description: 'The complete workflow from application to travel',
        steps: [
          { 
            id: 'application', 
            name: 'Application Form', 
            description: 'Submit your personal and educational details', 
            order: 1,
            fields: [
              { id: 'sec-1', type: 'section', name: 'Personal Information' },
              { id: 'phone', type: 'text', name: 'Phone / WhatsApp', required: true, placeholder: '+91 9876543210' },
              { id: 'sec-2', type: 'section', name: 'Educational Information' },
              { id: 'collegeName', type: 'text', name: 'College Name', required: true, placeholder: 'e.g. IIT Delhi' },
              { id: 'universityName', type: 'text', name: 'University', required: true },
              { id: 'course', type: 'text', name: 'Course', required: true },
              { id: 'currentYear', type: 'select', name: 'Current Year', required: true, options: ['1st Year', '2nd Year', '3rd Year', '4th Year'] },
              { id: 'department', type: 'text', name: 'Department', required: true },
              { id: 'cgpa', type: 'number', name: 'CGPA', required: true },
              { id: 'sec-3', type: 'section', name: 'Internship Details' },
              { id: 'internshipStartDate', type: 'date', name: 'Preferred Start Date', required: true },
              { id: 'internshipEndDate', type: 'date', name: 'Preferred End Date', required: true },
              { id: 'duration', type: 'select', name: 'Duration', required: true, options: ['2 Months', '3 Months', '6 Months'] },
              { id: 'sec-4', type: 'section', name: 'TPO Details' },
              { id: 'tpoName', type: 'text', name: 'TPO Name', placeholder: 'Name of TPO Officer' },
              { id: 'tpoEmail', type: 'text', name: 'TPO Email', placeholder: 'TPO Official Email' },
            ]
          },
          { 
            id: 'documents', 
            name: 'Documents Upload', 
            description: 'Upload required documents for verification', 
            order: 2,
            fields: [
              { id: 'resume', type: 'file', name: 'Resume / CV', required: true },
              { id: 'passport', type: 'file', name: 'Passport Copy', required: true },
              { id: 'collegeId', type: 'file', name: 'College ID Card', required: true },
            ]
          },
          { id: 'interview', name: 'Interview Booking', description: 'Schedule your interview', order: 3, fields: [], isInterviewStep: true },
          { id: 'payment1', name: 'First Installment', description: 'To complete your registration process, pay the first installment.', order: 4, fields: [], isPaymentStep: true, amount: 50000, gstPercentage: 18, discountPercentage: 0, paymentConfig: { accountName: 'International Education Corp', accountNumber: process.env.BANK_ACCOUNT_NUMBER || 'ACCOUNT_NUMBER_PLACEHOLDER', ifsc: process.env.BANK_IFSC_CODE || 'IFSC_CODE_PLACEHOLDER', bankName: 'ICICI Bank', qrCodeUrl: '' } },
          { id: 'hotel', name: 'Property Confirmation', description: 'View your accommodation details', order: 5, fields: [] },
          { id: 'payment2', name: 'Second Installment', description: 'Complete your second installment', order: 6, fields: [], isPaymentStep: true, amount: 100000, gstPercentage: 18, discountPercentage: 0, paymentConfig: { accountName: 'International Education Corp', accountNumber: process.env.BANK_ACCOUNT_NUMBER || 'ACCOUNT_NUMBER_PLACEHOLDER', ifsc: process.env.BANK_IFSC_CODE || 'IFSC_CODE_PLACEHOLDER', bankName: 'ICICI Bank', qrCodeUrl: '' } },
          { id: 'contract', name: 'Convention', description: 'Sign your Convention de Stage', order: 7, fields: [], isContractStep: true },
          { id: 'workpermit', name: 'Work Permit / DREET', description: 'Work Permit / DREET Documents processing', order: 8, fields: [] },
          { id: 'payment3', name: 'Third Installment', description: 'Complete your third installment', order: 9, fields: [], isPaymentStep: true, amount: 50000, gstPercentage: 18, discountPercentage: 0, paymentConfig: { accountName: 'International Education Corp', accountNumber: process.env.BANK_ACCOUNT_NUMBER || 'ACCOUNT_NUMBER_PLACEHOLDER', ifsc: process.env.BANK_IFSC_CODE || 'IFSC_CODE_PLACEHOLDER', bankName: 'ICICI Bank', qrCodeUrl: '' } },
          { id: 'visapayments', name: 'VFS & Visa Fees', description: 'Pay VFS Appointment fees, Insurance Fees, and Dummy Ticket Fees', order: 10, fields: [], isVisaPaymentsStep: true, amounts: { visaFee: 15000, visaFeeName: 'VFS Appointment Fees', sevisFee: 25000, sevisFeeName: 'Insurance Fees', miscFee: 5000, miscFeeName: 'Dummy Ticket Fees' } },

          { id: 'visa', name: 'Visa Stage', description: 'Visa Appointment booking process', order: 11, fields: [] },
          { id: 'googlerate', name: 'Google Rating', description: 'Rate us on Google & upload screenshot', order: 12, fields: [], isGoogleRateStep: true },
          { id: 'travel', name: 'Visa Documentation', description: 'Visa Application Documents', order: 13, fields: [] },

        ]
      }
    });
  }
}

export default new WorkflowService();
