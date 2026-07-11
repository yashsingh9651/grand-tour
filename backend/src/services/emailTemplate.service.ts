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
      },
      {
        name: 'VISA_SLOT_BOOKED',
        subject: 'Visa Slot Booked - Meeting Link Attached',
        body: '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;"> <h1 style="color: #8B48F6;">Visa Appointment Scheduled</h1> <p>Hi {{studentName}},</p> <p>Your visa appointment has been scheduled successfully.</p> <p><strong>Date/Time:</strong> {{dateTime}}</p> <p><strong>Google Meet Link:</strong> <a href="{{meetLink}}">{{meetLink}}</a></p> <p>Please make sure to join the meeting on time for your visa interview processing.</p> </div>',
        variables: ['studentName', 'dateTime', 'meetLink']
      },
      {
        name: 'INTERVIEW_BOOKED',
        subject: 'Interview Scheduled - Meeting Link Attached',
        body: '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;"> <h1 style="color: #8B48F6;">Interview Scheduled</h1> <p>Hi {{studentName}},</p> <p>Your interview has been scheduled successfully.</p> <p><strong>Date/Time:</strong> {{dateTime}}</p> <p><strong>Google Meet Link:</strong> <a href="{{meetLink}}">{{meetLink}}</a></p> <p>Please make sure to join the meeting on time.</p> </div>',
        variables: ['studentName', 'dateTime', 'meetLink']
      },
      {
        name: 'HOTEL_CONFIRMATION',
        subject: 'Hotel Host Confirmed - {{hotelName}}',
        body: '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;"> <h1 style="color: #8B48F6;">Hotel Selection Confirmed</h1> <p>Hi {{studentName}},</p> <p>You have successfully accepted the hotel host for <strong>{{hotelName}}</strong>.</p> <p>Please log in to your dashboard to view the details: <a href="{{portalLink}}" style="display: inline-block; padding: 10px 20px; background-color: #CCFF00; color: #111; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 15px;">View Hotel Step</a></p> </div>',
        variables: ['studentName', 'hotelName', 'portalLink']
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
