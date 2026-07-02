import nodemailer from 'nodemailer';
import { prisma } from '../config/db';
import logger from '../utils/logger';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(to: string, templateName: string, variables: Record<string, string>) {
    try {
      const template = await prisma.emailTemplate.findUnique({
        where: { name: templateName },
      });

      if (!template) {
        logger.error(`Email template ${templateName} not found`);
        throw new Error(`Email template ${templateName} not found`);
      }

      let subject = template.subject;
      let body = template.body;

      // Replace variables in subject and body
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(placeholder, value);
        body = body.replace(placeholder, value);
      });

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html: body,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }

  // Pre-defined flows
  async sendHostelAssignmentEmail(to: string, data: {
    studentName: string,
    hotelName: string,
    checkIn: string,
    checkOut: string,
    applicationId: string
  }) {
    return this.sendEmail(to, 'HOSTEL_ASSIGNMENT', {
      studentName: data.studentName,
      hotelName: data.hotelName,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      applicationId: data.applicationId
    });
  }

  async sendPaymentSubmittedEmail(to: string, data: {
    studentName: string,
    amount: string,
    paymentType: string,
    applicationId: string
  }) {
    return this.sendEmail(to, 'PAYMENT_SUBMITTED', {
      studentName: data.studentName,
      amount: data.amount,
      paymentType: data.paymentType,
      applicationId: data.applicationId
    });
  }

  async sendPaymentConfirmationEmail(to: string, data: {
    studentName: string,
    amount: string,
    paymentType: string,
    applicationId: string
  }) {
    return this.sendEmail(to, 'PAYMENT_CONFIRMATION', {
      studentName: data.studentName,
      amount: data.amount,
      paymentType: data.paymentType,
      applicationId: data.applicationId
    });
  }

  async sendApplicationSubmittedEmail(to: string, data: {
    studentName: string,
    applicationId: string,
    status?: string
  }) {
    return this.sendEmail(to, 'APPLICATION_SUBMITTED', {
      studentName: data.studentName,
      applicationId: data.applicationId,
      status: data.status || 'SUBMITTED'
    });
  }

  async sendApplicationUpdateEmail(to: string, data: {
    studentName: string,
    status: string,
    notes?: string,
    applicationId: string
  }) {
    return this.sendEmail(to, 'APPLICATION_UPDATE', {
      studentName: data.studentName,
      status: data.status,
      notes: data.notes || 'No additional notes',
      applicationId: data.applicationId
    });
  }

  async sendWorkPermitIssuedEmail(to: string, data: {
    studentName: string,
    applicationId: string
  }) {
    return this.sendEmail(to, 'WORK_PERMIT_ISSUED', {
      studentName: data.studentName,
      applicationId: data.applicationId
    });
  }

  async sendVisaSlotBookedEmail(to: string, data: {
    studentName: string,
    dateTime: string,
    meetLink: string
  }) {
    return this.sendEmail(to, 'VISA_SLOT_BOOKED', {
      studentName: data.studentName,
      dateTime: data.dateTime,
      meetLink: data.meetLink
    });
  }

  async sendInterviewBookedEmail(to: string, data: {
    studentName: string,
    dateTime: string,
    meetLink: string
  }) {
    return this.sendEmail(to, 'INTERVIEW_BOOKED', {
      studentName: data.studentName,
      dateTime: data.dateTime,
      meetLink: data.meetLink
    });
  }

  async sendHotelConfirmationEmail(to: string, data: {
    studentName: string,
    hotelName: string,
    portalLink: string
  }) {
    return this.sendEmail(to, 'HOTEL_CONFIRMATION', {
      studentName: data.studentName,
      hotelName: data.hotelName,
      portalLink: data.portalLink
    });
  }

  async sendOtpEmail(to: string, otp: string) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject: 'Your Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h2>Verification Code</h2>
            <p>Your one-time password (OTP) for authentication is:</p>
            <h1 style="font-size: 36px; letter-spacing: 5px; color: #8B48F6;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`OTP Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Error sending OTP email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(to: string, otp: string) {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject: 'Reset Your Password',
        html: `
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h2>Password Reset Verification Code</h2>
            <p>You requested to reset your password. Use the following verification code (OTP) to proceed:</p>
            <h1 style="font-size: 36px; letter-spacing: 5px; color: #8B48F6;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Password Reset Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      throw error;
    }
  }
}

export default new EmailService();
