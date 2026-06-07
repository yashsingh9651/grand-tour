import { Request, Response } from 'express';
import { prisma } from '../config/db';
import activityService from '../services/activity.service';
import applicationService from '../services/application.service';

// Admin: Upload a travel document for a student
export const uploadTravelDocument = async (req: Request, res: Response) => {
  const { applicationId, name, url } = req.body;
  const adminId = (req as any).user?.id;

  const doc = await prisma.travelDocument.create({
    data: { applicationId, name, url, isPublished: false },
  });

  await activityService.log(`Travel document added: ${name}`, 'TRAVEL_DOCUMENT_ADDED', applicationId, adminId);
  res.status(201).json({ success: true, data: doc });
};

// Admin: Publish travel documents for a student (unlocks travel step)
export const publishTravelDocuments = async (req: Request, res: Response) => {
  const { applicationId } = req.body;
  const adminId = (req as any).user?.id;

  await prisma.travelDocument.updateMany({
    where: { applicationId },
    data: { isPublished: true },
  });

  // Move application to travel step and set status to ACCEPTED (Approved)
  await prisma.application.update({
    where: { id: applicationId },
    data: { 
      currentStepId: 'travel',
      status: 'ACCEPTED'
    },
  });

  await activityService.log('Travel documents published', 'TRAVEL_PUBLISHED', applicationId, adminId);
  res.status(200).json({ success: true, message: 'Travel documents published' });
};

// Admin: Get all travel documents (for management)
export const getAllTravelDocuments = async (req: Request, res: Response) => {
  const applications = await prisma.application.findMany({
    where: { currentStepId: { in: ['travel', 'workpermit', 'visa'] } },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      travelDocuments: true,
    },
  });
  res.status(200).json({ success: true, data: applications });
};

// Admin: Delete a travel document
export const deleteTravelDocument = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.travelDocument.delete({ where: { id } });
  res.status(200).json({ success: true, message: 'Document deleted' });
};

// Student: Get my travel documents (only published)
export const getMyTravelDocuments = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const application = await applicationService.getApplicationByUserId(userId);
  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

  const docs = await prisma.travelDocument.findMany({
    where: { applicationId: application.id, isPublished: true },
    orderBy: { createdAt: 'asc' },
  });

  res.status(200).json({ success: true, data: docs });
};
