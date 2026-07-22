import { prisma } from '../config/db';
import { ApplicationStatus } from '@prisma/client';
import emailService from './email.service';
import notificationService from './notification.service';

const safeUserSelect = {
  select: {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    profileImage: true,
    role: true,
    isActive: true,
    isVerified: true,
  }
};

async function handleStepEmailTrigger(app: any, newStepId: string) {


  const email = app.user?.email;
  if (!email) return;
  const firstName = app.user?.firstName || 'Student';
  const portalUrl = process.env.PORTAL_URL || 'http://localhost:3000/login';

  try {
    switch (newStepId) {
      case 'application':
        await emailService.sendEmail(email, 'PROFILE_BUILD', {
          'First Name': firstName,
          'portalUrl': portalUrl
        });
        break;
      case 'documents': {
        const docs = await prisma.document.findMany({
          where: { applicationId: app.id }
        });
        const requiredDocs = ['Resume / CV', 'Passport Copy', 'College ID Card', 'Motivation Letter', 'Language Certificate'];
        const uploadedTypes = docs.map(d => d.type.toLowerCase());
        const pending = requiredDocs.filter(type => {
          const lower = type.toLowerCase();
          if (lower.includes('cv') || lower.includes('resume')) {
            return !uploadedTypes.some(t => t.includes('cv') || t.includes('resume'));
          }
          if (lower.includes('passport')) {
            return !uploadedTypes.some(t => t.includes('passport'));
          }
          if (lower.includes('college')) {
            return !uploadedTypes.some(t => t.includes('college') || t.includes('id'));
          }
          return !uploadedTypes.includes(lower);
        });
        const pendingStr = pending.length > 0 ? pending.join('\n ') : 'Pending Documents list will be reviewed by admin';

        await emailService.sendEmail(email, 'DOCUMENTS_PENDING', {
          'First Name': firstName,
          'Pending Documents': pendingStr,
          'portalUrl': portalUrl
        });
        break;
      }
      case 'interview':
        await emailService.sendEmail(email, 'INTERVIEW_BOOKING_REQUEST', {
          'First Name': firstName,
          'portalUrl': portalUrl
        });
        break;
      case 'contract':
        await emailService.sendEmail(email, 'CONVENTION_READY', {
          'First Name': firstName,
          'portalUrl': portalUrl
        });
        break;
      case 'workpermit':
        await emailService.sendEmail(email, 'WORK_PERMIT_SUBMITTED', {
          'First Name': firstName
        });
        break;
      default:
        break;
    }
  } catch (error) {
    console.error(`Failed to send step email trigger for ${newStepId}:`, error);
  }
}

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

    const email = payloadData.email || data.email;
    if (email && typeof email === 'string' && email.trim() !== '') {
      await prisma.user.update({
        where: { id: data.userId },
        data: { email: email.trim() }
      });
    }

    const application = await prisma.application.upsert({
      where: { userId: data.userId },
      update: {
        status: data.status,
        currentStepId: data.currentStepId,
        notes: data.notes,
        data: data.data,
        category: data.category,
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
        category: data.category || 'STUDENT',
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

        const studentName = `${application.user.firstName} ${application.user.lastName}`.trim();

        await notificationService.notify(
          application.userId,
          'Application Submitted',
          'Your application has been submitted successfully and is being reviewed.',
          'SUCCESS',
          { applicationId: application.id, stepKey: 'application' }
        );

        await notificationService.notifyAdmin(
          '📋 New Application Submitted',
          `${studentName} has submitted their application and is awaiting your review.`,
          'INFO',
          { applicationId: application.id, stepKey: 'application', studentName }
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
      select: { status: true, currentStepId: true }
    });

    const payloadData = data.data || {};
    const passportNumber = data.passportNumber !== undefined ? data.passportNumber : payloadData.passportNumber;
    const educationalInstitution = data.educationalInstitution !== undefined ? data.educationalInstitution : payloadData.educationalInstitution;
    const enrollmentStatus = data.enrollmentStatus !== undefined ? data.enrollmentStatus : payloadData.enrollmentStatus;
    const preferredDepartment = data.preferredDepartment !== undefined ? data.preferredDepartment : payloadData.preferredDepartment;
    const statementOfPurpose = data.statementOfPurpose !== undefined ? data.statementOfPurpose : payloadData.statementOfPurpose;

    const email = payloadData.email || data.email;
    if (email && typeof email === 'string' && email.trim() !== '') {
      const app = await prisma.application.findUnique({
        where: { id },
        select: { userId: true }
      });
      if (app?.userId) {
        await prisma.user.update({
          where: { id: app.userId },
          data: { email: email.trim() }
        });
      }
    }

    const application = await prisma.application.update({
      where: { id },
      data: {
        status: data.status,
        currentStepId: data.currentStepId,
        notes: data.notes,
        data: data.data,
        category: data.category,
        passportNumber,
        educationalInstitution,
        enrollmentStatus,
        preferredDepartment,
        statementOfPurpose,
        payment1Id: data.payment1Id || (data.payment1?.id),
        payment2Id: data.payment2Id || (data.payment2?.id),
      },
      include: {
        user: safeUserSelect,
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

    if (existingApplication && existingApplication.currentStepId !== application.currentStepId && application.currentStepId) {
      handleStepEmailTrigger(application, application.currentStepId).catch(console.error);
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
        application.status === 'REJECTED' ? 'ERROR' : 'INFO',
        { applicationId: application.id, stepKey: 'application' }
      );
    } catch (error) {
      console.error('Failed to send application update email or notification:', error);
    }

    return application;

  }  async updateApplicationCurrentStep(id: string, currentStepId: string) {
    const app = await prisma.application.update({
      where: { id },
      data: { currentStepId },
      include: { user: true },
    });
    // Trigger step-specific email
    handleStepEmailTrigger(app, currentStepId).catch(console.error);

    const studentName = `${app.user.firstName} ${app.user.lastName}`.trim();
    const stepLabel = currentStepId.charAt(0).toUpperCase() + currentStepId.slice(1);
    try {
      await notificationService.notifyAdmin(
        `⏩ Student Advanced to ${stepLabel}`,
        `${studentName} has progressed to the "${stepLabel}" step and may need your attention.`,
        'INFO',
        { applicationId: id, stepKey: currentStepId, studentName }
      );
    } catch { /* non-critical */ }
    return app;
  }
  async updateApplicationNotes(id: string, notes: string) {
    return await prisma.application.update({
      where: { id },
      data: { notes },
    });
  }  async updateApplicationStep(id: string, currentStepId: string) {
    const app = await prisma.application.update({
      where: { id },
      data: { currentStepId },
      include: { user: true },
    });
    // Trigger step-specific email
    handleStepEmailTrigger(app, currentStepId).catch(console.error);

    const studentName = `${app.user.firstName} ${app.user.lastName}`.trim();
    const stepLabel = currentStepId.charAt(0).toUpperCase() + currentStepId.slice(1);
    try {
      await notificationService.notifyAdmin(
        `⏩ Student Advanced to ${stepLabel}`,
        `${studentName} has progressed to the "${stepLabel}" step and may need your attention.`,
        'INFO',
        { applicationId: id, stepKey: currentStepId, studentName }
      );
    } catch { /* non-critical */ }
    return app;
  }
  async getApplicationByUserId(userId: string) {
    const application = await prisma.application.findFirst({
      where: { userId },
      include: {
        user: safeUserSelect,
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

    if (application) {
      const categoryObj = await prisma.studentCategory.findUnique({
        where: { name: application.category }
      });
      (application as any).studentCategoryObj = categoryObj;
    }
    return application;
  }

  async deleteApplication(id: string) {
    return await prisma.application.delete({
      where: { id },
    });
  }

  async getApplicationById(id: string) {
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: safeUserSelect,
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


    if (application) {
      const categoryObj = await prisma.studentCategory.findUnique({
        where: { name: application.category }
      });
      (application as any).studentCategoryObj = categoryObj;
    }
    return application;
  }
}

export default new ApplicationService();
