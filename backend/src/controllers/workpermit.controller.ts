import { Request, Response } from 'express';
import { prisma } from '../config/db';
import activityService from '../services/activity.service';
import applicationService from '../services/application.service';
import emailService from '../services/email.service';

// Admin: Upload work permit for a student
export const uploadWorkPermit = async (req: Request, res: Response) => {
  const { applicationId, documentUrl, documentUrl2, notes } = req.body;
  const adminId = (req as any).user?.id;

  const existing = await prisma.workPermit.findUnique({ where: { applicationId } });

  let workPermit;
  if (existing) {
    workPermit = await prisma.workPermit.update({
      where: { applicationId },
      data: { documentUrl, documentUrl2, notes, status: 'ISSUED', updatedAt: new Date() },
    });
  } else {
    workPermit = await prisma.workPermit.create({
      data: { applicationId, documentUrl, documentUrl2, notes, status: 'ISSUED' },
    });
  }

  // Find application to check current step
  const app = await prisma.application.findUnique({
    where: { id: applicationId }
  });

  const nextStepId = (app?.currentStepId === 'payment3') ? 'payment3' : 'visa';

  // Move application to appropriate step
  const application = await prisma.application.update({
    where: { id: applicationId },
    data: { currentStepId: nextStepId },
    include: { user: true }
  });

  // Notify student via email
  if (application && application.user) {
    try {
      const portalUrl = process.env.PORTAL_URL || 'http://localhost:3000/login';
      await emailService.sendEmail(application.user.email, 'WORK_PERMIT_APPROVED', {
        'First Name': application.user.firstName || 'Student',
        'portalUrl': portalUrl,
      });
    } catch (error) {
      console.error('Failed to send work permit email notification:', error);
    }
  }

  await activityService.log('Work permit uploaded and issued', 'WORK_PERMIT_ISSUED', applicationId, adminId);

  res.status(200).json({ success: true, data: workPermit });
};

// Admin: Get all work permits
export const getAllWorkPermits = async (req: Request, res: Response) => {
  // Fetch all applications at workpermit step or with work permit records
  const applications = await prisma.application.findMany({
    where: {
      OR: [
        { currentStepId: 'payment3' },
        { currentStepId: 'workpermit' },
        { workPermit: { isNot: null } }
      ]
    },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      workPermit: true,
    },
  });
  res.status(200).json({ success: true, data: applications });
};

// Student: Get my work permit
export const getMyWorkPermit = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const application = await applicationService.getApplicationByUserId(userId);
  if (!application) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }

  const workPermit = await prisma.workPermit.findUnique({
    where: { applicationId: application.id },
  });

  res.status(200).json({ success: true, data: workPermit });
};
