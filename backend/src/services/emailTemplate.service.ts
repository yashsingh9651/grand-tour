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
        name: 'WELCOME_PORTAL',
        subject: '🎉 Welcome to Grand Tour! Your French adventure starts now!',
        body: '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px;"> <h2 style="color: #8B48F6;">Hi {{First Name}},</h2> <p style="font-size: 16px; font-weight: bold;">Bienvenue! 🇫🇷</p> <p>You\'ve officially taken the first step towards your international hospitality journey in France, and we\'re thrilled to have you with us.</p> <p>Your student portal is now live! This is where you\'ll:</p> <ul style="list-style: none; padding-left: 0;"> <li style="margin-bottom: 8px;">✨ Complete your profile</li> <li style="margin-bottom: 8px;">📄 Upload documents</li> <li style="margin-bottom: 8px;">🏨 Apply to partner hotels</li> <li style="margin-bottom: 8px;">📍 Track your application in real time</li> <li style="margin-bottom: 8px;">✈️ Receive exciting updates every step of the way</li> </ul> <p style="margin-top: 25px; margin-bottom: 25px;"> <a href="{{portalUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #CCFF00; color: #111; font-weight: bold; text-decoration: none; border-radius: 8px; border: 1px solid #111;">👉 Complete Your Profile</a> </p> <p>We\'re excited to help you turn this dream into reality.</p> <p>See you inside!</p> <p style="font-weight: bold; color: #8B48F6;">Team Grand Tour</p> </div>',
        variables: ['First Name', 'portalUrl']
      },
      {
        name: 'PROFILE_BUILD',
        subject: '🚀 Let\'s build your profile!',
        body: '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px;"> <h2>Hi {{First Name}},</h2> <p>Your journey has officially begun!</p> <p>Before we can introduce you to our partner hotels in France, we\'d love to get to know you.</p> <p>Please complete your profile by adding:</p> <ul style="list-style: none; padding-left: 0;"> <li style="margin-bottom: 8px;">👤 Personal Details</li> <li style="margin-bottom: 8px;">🎓 College Information</li> <li style="margin-bottom: 8px;">🗣️ Language Skills</li> <li style="margin-bottom: 8px;">💼 Work Experience</li> <li style="margin-bottom: 8px;">❤️ Motivation Letter</li> </ul> <p>The stronger your profile, the better your internship opportunities.</p> <p style="margin-top: 25px; margin-bottom: 25px;"> <a href="{{portalUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #CCFF00; color: #111; font-weight: bold; text-decoration: none; border-radius: 8px; border: 1px solid #111;">👉 Complete My Profile</a> </p> <p style="font-weight: bold; color: #8B48F6;">Team Grand Tour</p> </div>',
        variables: ['First Name', 'portalUrl']
      },
      {
        name: 'DOCUMENTS_PENDING',
        subject: '📄 You\'re almost there! We just need a few documents.',
        body: '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px;"> <h2>Hi {{First Name}},</h2> <p>Great progress!</p> <p>There\'s just one thing missing before we can move forward...</p> <p>Please upload your pending documents.</p> <p><strong>📌 Pending Documents:</strong></p> <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; font-family: monospace; white-space: pre-wrap; margin-bottom: 20px;">{{Pending Documents}}</div> <p>The sooner you upload them, the sooner we can start presenting your profile to hotels.</p> <p style="margin-top: 25px; margin-bottom: 25px;"> <a href="{{portalUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #CCFF00; color: #111; font-weight: bold; text-decoration: none; border-radius: 8px; border: 1px solid #111;">👉 Upload Documents</a> </p> <p style="font-weight: bold; color: #8B48F6;">Team Grand Tour</p> </div>',
        variables: ['First Name', 'Pending Documents', 'portalUrl']
      },
      {
        name: 'INTERVIEW_BOOKING_REQUEST',
        subject: '🎙️ Time to meet us!',
        body: '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px;"> <h2>Hi {{First Name}},</h2> <p>Awesome!</p> <p>Your profile looks great, and now we\'d love to get to know YOU.</p> <p>Choose a convenient interview slot with our team.</p> <p>This is your chance to tell us about your goals and dream internship.</p> <p style="margin-top: 25px; margin-bottom: 25px;"> <a href="{{portalUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #CCFF00; color: #111; font-weight: bold; text-decoration: none; border-radius: 8px; border: 1px solid #111;">📅 Book My Interview</a> </p> <p>See you soon!</p> <p style="font-weight: bold; color: #8B48F6;">Team Grand Tour</p> </div>',
        variables: ['First Name', 'portalUrl']
      },
      {
        name: 'INTERVIEW_CLEARED',
        subject: '🎉 Congratulations! You did it!',
        body: '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px;"> <h2>Hi {{First Name}},</h2> <p>Fantastic news...</p> <p style="font-size: 18px; font-weight: bold; color: #10b981;">You\'ve successfully cleared your interview! 🥳</p> <p>Your profile will now be shared with our partner hotels across France.</p> <p>This is where the exciting part begins...</p> <p>Stay tuned—we\'ll notify you as soon as a hotel shortlists your profile.</p> <p style="font-weight: bold; color: #8B48F6;">Team Grand Tour</p> </div>',
        variables: ['First Name']
      },
      {
        name: 'HOSTEL_ASSIGNMENT',
        subject: '🇫🇷 YOU\'RE GOING TO FRANCE! 🎉',
        body: '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px;"> <h2>Hi {{First Name}},</h2> <p style="font-size: 18px; font-weight: bold; color: #8B48F6;">Congratulations!!</p> <p>A hotel has officially selected you for your internship.</p> <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;"> <p style="margin: 4px 0;"><strong>🏨 Hotel:</strong> {{Hotel Name}}</p> <p style="margin: 4px 0;"><strong>👨‍🍳 Department:</strong> {{Department}}</p> <p style="margin: 4px 0;"><strong>📍 Location:</strong> {{Location}}</p> </div> <p>Our documentation team will now begin preparing your internship documents.</p> <p>One step closer to France!</p> <p style="font-weight: bold; color: #8B48F6;">Team Grand Tour</p> </div>',
        variables: ['First Name', 'Hotel Name', 'Department', 'Location']
      },
      {
        name: 'CONVENTION_READY',
        subject: '✍️ Action Required: Your Convention is Ready!',
        body: '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px;"> <h2>Hi {{First Name}},</h2> <p>Your Convention de Stage has been prepared.</p> <p>Here\'s what you need to do:</p> <ul style="list-style: none; padding-left: 0;"> <li style="margin-bottom: 8px;">✅ Download it</li> <li style="margin-bottom: 8px;">✅ Get it signed by your college</li> <li style="margin-bottom: 8px;">✅ Sign it yourself</li> <li style="margin-bottom: 8px;">✅ Upload the scanned copy</li> </ul> <p>We\'ll take care of the rest.</p> <p style="margin-top: 25px; margin-bottom: 25px;"> <a href="{{portalUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #CCFF00; color: #111; font-weight: bold; text-decoration: none; border-radius: 8px; border: 1px solid #111;">👉 Access Portal</a> </p> <p style="font-weight: bold; color: #8B48F6;">Team Grand Tour</p> </div>',
        variables: ['First Name', 'portalUrl']
      },
      {
        name: 'WORK_PERMIT_SUBMITTED',
        subject: '🚀 Your work permit application is on its way!',
        body: '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px;"> <h2>Hi {{First Name}},</h2> <p>Good news!</p> <p>We\'ve officially submitted your work permit application to the French authorities.</p> <p>Now it\'s time for a little patience while it\'s being reviewed.</p> <p>We\'ll let you know as soon as we receive an update.</p> <p style="font-weight: bold; color: #8B48F6;">Team Grand Tour</p> </div>',
        variables: ['First Name']
      },
      {
        name: 'WORK_PERMIT_APPROVED',
        subject: '🎉 Great News! Your work permit has been approved!',
        body: '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px;"> <h2>Hi {{First Name}},</h2> <p>It\'s official!</p> <p style="font-size: 18px; font-weight: bold; color: #10b981;">Your French work permit has been approved. 🇫🇷</p> <p>The next exciting step?</p> <p>Booking your visa appointment!</p> <p>Keep an eye on your portal—we\'ll update you soon.</p> <p style="margin-top: 25px; margin-bottom: 25px;"> <a href="{{portalUrl}}" style="display: inline-block; padding: 12px 24px; background-color: #CCFF00; color: #111; font-weight: bold; text-decoration: none; border-radius: 8px; border: 1px solid #111;">🛂 Visa Appointment</a> </p> <p style="font-weight: bold; color: #8B48F6;">Team Grand Tour</p> </div>',
        variables: ['First Name', 'portalUrl']
      },
      {
        name: 'VISA_SLOT_BOOKED',
        subject: '📅 Your visa appointment is booked!',
        body: '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 16px;"> <h2>Hi {{First Name}},</h2> <p>Your visa appointment has been scheduled.</p> <p>Here\'s everything you need:</p> <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;"> <p style="margin: 4px 0;"><strong>📍 VFS Centre:</strong> {{Location}}</p> <p style="margin: 4px 0;"><strong>📅 Date:</strong> {{Date}}</p> <p style="margin: 4px 0;"><strong>🕒 Time:</strong> {{Time}}</p> </div> <p>Don\'t forget to carry all the required original documents.</p> <p>Almost there!</p> <p style="font-weight: bold; color: #8B48F6;">Team Grand Tour</p> </div>',
        variables: ['First Name', 'Location', 'Date', 'Time']
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
        name: 'HOTEL_CONFIRMATION',
        subject: 'Hotel Host Confirmed - {{hotelName}}',
        body: '<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;"> <h1 style="color: #8B48F6;">Hotel Selection Confirmed</h1> <p>Hi {{studentName}},</p> <p>You have successfully accepted the hotel host for <strong>{{hotelName}}</strong>.</p> <p>Please log in to your dashboard to view the details: <a href="{{portalLink}}" style="display: inline-block; padding: 10px 20px; background-color: #CCFF00; color: #111; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 15px;">View Hotel Step</a></p> </div>',
        variables: ['studentName', 'hotelName', 'portalLink']
      }
    ];

    for (const template of defaults) {
      await prisma.emailTemplate.upsert({
        where: { name: template.name },
        update: {
          subject: template.subject,
          body: template.body,
          variables: template.variables
        },
        create: template
      });
    }
  }
}

export default new EmailTemplateService();
