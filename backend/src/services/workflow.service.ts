import { prisma } from '../config/db';

class WorkflowService {
  async getWorkflow() {
    let workflow = await prisma.workflow.findFirst({
      where: { isActive: true }
    });

    if (!workflow) {
      // Create a default workflow if none exists
      workflow = await this.initializeDefaultWorkflow();
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
          { id: 'payment1', name: 'First Payment', description: 'Complete your initial payment', order: 4, fields: [], isPaymentStep: true, amount: 50000, gstPercentage: 18, discountPercentage: 0, paymentConfig: { accountName: 'International Education Corp', accountNumber: '1234567890', ifsc: 'ICIC0000001', bankName: 'ICICI Bank', qrCodeUrl: '' } },
          { id: 'hotel', name: 'Hotel Allocation', description: 'View your accommodation details', order: 5, fields: [] },
          { id: 'payment2', name: 'Payment 2', description: 'Complete your second payment installment', order: 6, fields: [], isPaymentStep: true, amount: 100000, gstPercentage: 18, discountPercentage: 0, paymentConfig: { accountName: 'International Education Corp', accountNumber: '1234567890', ifsc: 'ICIC0000001', bankName: 'ICICI Bank', qrCodeUrl: '' } },
          { id: 'contract', name: 'Contract Signing', description: 'Sign your internship contract', order: 7, fields: [], isContractStep: true },
          { id: 'payment3', name: 'Payment 3', description: 'Complete your third payment installment', order: 8, fields: [], isPaymentStep: true, amount: 50000, gstPercentage: 18, discountPercentage: 0, paymentConfig: { accountName: 'International Education Corp', accountNumber: '1234567890', ifsc: 'ICIC0000001', bankName: 'ICICI Bank', qrCodeUrl: '' } },
          { id: 'workpermit', name: 'Work Permit', description: 'Work permit processing', order: 9, fields: [] },
          { id: 'visa', name: 'Visa Stage', description: 'Visa application process', order: 10, fields: [] },
          { id: 'travel', name: 'Travel Details', description: 'Your travel itinerary', order: 11, fields: [] },
        ]
      }
    });
  }
}

export default new WorkflowService();
