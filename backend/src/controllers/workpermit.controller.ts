import { Request, Response } from 'express';
import { prisma } from '../config/db';
import activityService from '../services/activity.service';
import applicationService from '../services/application.service';

// Admin: Upload work permit for a student
export const uploadWorkPermit = async (req: Request, res: Response) => {
  const { applicationId, documentUrl, notes } = req.body;
  const adminId = (req as any).user?.id;

  const existing = await prisma.workPermit.findUnique({ where: { applicationId } });

  let workPermit;
  if (existing) {
    workPermit = await prisma.workPermit.update({
      where: { applicationId },
      data: { documentUrl, notes, status: 'ISSUED', updatedAt: new Date() },
    });
  } else {
    workPermit = await prisma.workPermit.create({
      data: { applicationId, documentUrl, notes, status: 'ISSUED' },
    });
  }

  // Move application to visa step
  await prisma.application.update({
    where: { id: applicationId },
    data: { currentStepId: 'visa' },
  });

  await activityService.log('Work permit uploaded and issued', 'WORK_PERMIT_ISSUED', applicationId, adminId);

  res.status(200).json({ success: true, data: workPermit });
};

// Admin: Get all work permits
export const getAllWorkPermits = async (req: Request, res: Response) => {
  // Fetch all applications at workpermit step or with work permit records
  const applications = await prisma.application.findMany({
    where: { currentStepId: 'workpermit' },
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
