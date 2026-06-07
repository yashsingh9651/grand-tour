import { prisma } from '../config/db';

class EmailTemplateService {
  async getTemplates() {
    await this.seedTemplates();
    return await prisma.emailTemplate.findMany({
      orderBy: { name: 'asc' }
    });
  }

  async getTemplateById(id: string) {
    return await prisma.emailTemplate.findUnique({
      where: { id }
    });
  }

  async getTemplateByName(name: string) {
    return await prisma.emailTemplate.findUnique({
      where: { name }
    });
  }

  async createTemplate(data: { name: string, subject: string, body: string, variables: string[] }) {
    return await prisma.emailTemplate.create({
      data
    });
  }

  async updateTemplate(id: string, data: { name?: string, subject?: string, body?: string, variables?: string[] }) {
    return await prisma.emailTemplate.update({
      where: { id },
      data
    });
  }

  async deleteTemplate(id: string) {
    return await prisma.emailTemplate.delete({
      where: { id }
    });
  }

  // Initialize default templates if they don't exist
  async seedTemplates() {
    const defaults = [
      {
        name: 'APPLICATION_SUBMITTED',
        subject: 'Application Submitted Successfully',
        body: '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;"> <h1 style="color: #8B48F6;">Application Received</h1> <p>Hi {{studentName}},</p> <p>Your application has been submitted successfully.</p> <p><strong>Application ID:</strong> {{applicationId}}</p> <p>We will review your application and keep you updated on the next steps.</p> </div>',
        variables: ['studentName', 'applicationId', 'status']
      },
      {
        name: 'HOSTEL_ASSIGNMENT',
        subject: 'Hostel Assignment - {{hotelName}}',
        body: '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;"> <h1 style="color: #8B48F6;">Hostel Assigned</h1> <p>Hi {{studentName}},</p> <p>You have been assigned to <strong>{{hotelName}}</strong>.</p> <p><strong>Application ID:</strong> {{applicationId}}</p> <p><strong>Check-in:</strong> {{checkIn}}</p> <p><strong>Check-out:</strong> {{checkOut}}</p> </div>',
        variables: ['studentName', 'hotelName', 'checkIn', 'checkOut', 'applicationId']
      },
      {
        name: 'PAYMENT_SUBMITTED',
        subject: 'Payment Submitted Successfully',
        body: '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;"> <h1 style="color: #8B48F6;">Payment Submitted</h1> <p>Hi {{studentName}},</p> <p>Your payment of <strong>{{amount}}</strong> for <strong>{{paymentType}}</strong> has been submitted and is awaiting review.</p> <p><strong>Application ID:</strong> {{applicationId}}</p> </div>',
        variables: ['studentName', 'amount', 'paymentType', 'applicationId']
      },
      {
        name: 'PAYMENT_CONFIRMATION',
        subject: 'Payment Confirmation - {{paymentType}}',
        body: '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;"> <h1 style="color: #8B48F6;">Payment Received</h1> <p>Hi {{studentName}},</p> <p>We have received your payment of <strong>{{amount}}</strong> for <strong>{{paymentType}}</strong>.</p> <p><strong>Application ID:</strong> {{applicationId}}</p> </div>',
        variables: ['studentName', 'amount', 'paymentType', 'applicationId']
      },
      {
        name: 'APPLICATION_UPDATE',
        subject: 'Application Status Update',
        body: '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;"> <h1 style="color: #8B48F6;">Status Updated</h1> <p>Hi {{studentName}},</p> <p>Your application status has been updated to: <strong>{{status}}</strong>.</p> <p><strong>Application ID:</strong> {{applicationId}}</p> <p><strong>Notes:</strong> {{notes}}</p> </div>',
        variables: ['studentName', 'status', 'notes', 'applicationId']
      },
      {
        name: 'WORK_PERMIT_ISSUED',
        subject: 'Work Permit Issued Successfully',
        body: '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;"> <h1 style="color: #8B48F6;">Work Permit Issued</h1> <p>Hi {{studentName}},</p> <p>Your work permit has been successfully issued by the admin.</p> <p><strong>Application ID:</strong> {{applicationId}}</p> <p>Please log in to your dashboard to download it and proceed to the Visa scheduling step.</p> </div>',
        variables: ['studentName', 'applicationId']
      }
    ];

    for (const template of defaults) {
      await prisma.emailTemplate.upsert({
        where: { name: template.name },
        update: {},
        create: template
      });
    }
  }
}

export default new EmailTemplateService();
