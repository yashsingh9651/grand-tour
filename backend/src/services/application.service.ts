import { prisma } from '../config/db';
import { ApplicationStatus } from '@prisma/client';
import emailService from './email.service';
import notificationService from './notification.service';


class ApplicationService {
  async createApplication(data: any) {
    const existingApplication = await prisma.application.findUnique({
      where: { userId: data.userId },
      select: { id: true }
    });

    const payloadData = data.data || {};
    const passportNumber = data.passportNumber !== undefined ? data.passportNumber : payloadData.passportNumber;
    const educationalInstitution = data.educationalInstitution !== undefined ? data.educationalInstitution : payloadData.educationalInstitution;
    const enrollmentStatus = data.enrollmentStatus !== undefined ? data.enrollmentStatus : payloadData.enrollmentStatus;
    const preferredDepartment = data.preferredDepartment !== undefined ? data.preferredDepartment : payloadData.preferredDepartment;
    const statementOfPurpose = data.statementOfPurpose !== undefined ? data.statementOfPurpose : payloadData.statementOfPurpose;

    const application = await prisma.application.upsert({
      where: { userId: data.userId },
      update: {
        status: data.status,
        currentStepId: data.currentStepId,
        notes: data.notes,
        data: data.data,
        passportNumber,
        educationalInstitution,
        enrollmentStatus,
        preferredDepartment,
        statementOfPurpose,
        payment1Id: data.payment1Id || (data.payment1?.id),
        payment2Id: data.payment2Id || (data.payment2?.id),
      },
      create: {
        userId: data.userId,
        status: data.status || 'DRAFT',
        currentStepId: data.currentStepId || 'application',
        notes: data.notes,
        data: data.data || {},
        passportNumber,
        educationalInstitution,
        enrollmentStatus,
        preferredDepartment,
        statementOfPurpose,
        payment1Id: data.payment1Id || (data.payment1?.id),
        payment2Id: data.payment2Id || (data.payment2?.id),
      },
      include: {
        user: true,
        payment1: true,
        payment2: true,
        payments: true,
      },
    });

    if (!existingApplication && application.status !== 'DRAFT') {
      try {
        await emailService.sendApplicationSubmittedEmail(application.user.email, {
          studentName: `${application.user.firstName} ${application.user.lastName}`.trim(),
          applicationId: application.id,
          status: application.status,
        });

        await notificationService.notify(
          application.userId,
          'Application Submitted',
          'Your application has been submitted successfully and is being reviewed.',
          'SUCCESS'
        );
      } catch (error) {
        console.error('Failed to send application submitted email or notification:', error);
      }
    }

    return application;
  }

  async updateApplication(id: string, data: any) {
    const existingApplication = await prisma.application.findUnique({
      where: { id },
      select: { status: true }
    });

    const payloadData = data.data || {};
    const passportNumber = data.passportNumber !== undefined ? data.passportNumber : payloadData.passportNumber;
    const educationalInstitution = data.educationalInstitution !== undefined ? data.educationalInstitution : payloadData.educationalInstitution;
    const enrollmentStatus = data.enrollmentStatus !== undefined ? data.enrollmentStatus : payloadData.enrollmentStatus;
    const preferredDepartment = data.preferredDepartment !== undefined ? data.preferredDepartment : payloadData.preferredDepartment;
    const statementOfPurpose = data.statementOfPurpose !== undefined ? data.statementOfPurpose : payloadData.statementOfPurpose;

    const application = await prisma.application.update({
      where: { id },
      data: {
        status: data.status,
        currentStepId: data.currentStepId,
        notes: data.notes,
        data: data.data,
        passportNumber,
        educationalInstitution,
        enrollmentStatus,
        preferredDepartment,
        statementOfPurpose,
        payment1Id: data.payment1Id || (data.payment1?.id),
        payment2Id: data.payment2Id || (data.payment2?.id),
      },
      include: {
        user: true,
        payment1: true,
        payment2: true,
        payments: true,
      }
    });

    if (existingApplication && existingApplication.status === 'DRAFT' && application.status !== 'DRAFT') {
      try {
        await emailService.sendApplicationSubmittedEmail(application.user.email, {
          studentName: `${application.user.firstName} ${application.user.lastName}`.trim(),
          applicationId: application.id,
          status: application.status,
        });
      } catch (error) {
        console.error('Failed to send application submitted email:', error);
      }
    }

    return application;
  }

  async getAllApplications() {
    return await prisma.application.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          }
        },
        interviews: true,
        documents: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateApplicationStatus(id: string, status: ApplicationStatus) {
    const application = await prisma.application.update({
      where: { id },
      data: { status },
      include: {
        user: true
      }
    });

    try {
      await emailService.sendApplicationUpdateEmail(application.user.email, {
        studentName: `${application.user.firstName} ${application.user.lastName}`,
        status: application.status,
        notes: application.notes || undefined,
        applicationId: application.id
      });

      await notificationService.notify(
        application.userId,
        'Application Status Updated',
        `Your application status has been updated to ${application.status}.`,
        application.status === 'REJECTED' ? 'ERROR' : 'INFO'
      );
    } catch (error) {
      console.error('Failed to send application update email or notification:', error);
    }

    return application;

  }

  async updateApplicationCurrentStep(id: string, currentStepId: string) {
    return await prisma.application.update({
      where: { id },
      data: { currentStepId },
    });
  }

  async updateApplicationNotes(id: string, notes: string) {
    return await prisma.application.update({
      where: { id },
      data: { notes },
    });
  }

  async updateApplicationStep(id: string, currentStepId: string) {
    return await prisma.application.update({
      where: { id },
      data: { currentStepId },
    });
  }

  async getApplicationByUserId(userId: string) {
    return await prisma.application.findFirst({
      where: { userId },
      include: {
        user: true,
        interviews: {
          orderBy: { scheduledAt: 'desc' },
          take: 1
        },
        documents: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        payment1: true,
        payment2: true,
        payments: true,
        workPermit: true,
        travelDocuments: true,
        hotelAssignment: {
          include: {
            hotel: true
          }
        }
      }
    });
  }

  async deleteApplication(id: string) {
    return await prisma.application.delete({
      where: { id },
    });
  }

  async getApplicationById(id: string) {
    return await prisma.application.findUnique({
      where: { id },
      include: {
        user: true,
        interviews: {
          orderBy: { scheduledAt: 'desc' }
        },
        documents: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        payment1: true,
        payment2: true,
        payments: true,
        workPermit: true,
        travelDocuments: true,
        hotelAssignment: {
          include: {
            hotel: true
          }
        }
      }
    });
  }
}

export default new ApplicationService();
