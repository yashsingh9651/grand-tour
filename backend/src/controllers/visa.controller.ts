import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { google } from 'googleapis';
import logger from '../utils/logger';
import activityService from '../services/activity.service';
import applicationService from '../services/application.service';

const normalizePrivateKey = (value?: string) => (value || '').replace(/\\n/g, '\n').trim();

const createGoogleMeetClient = () => {
  const serviceAccountEmail = process.env.GOOGLE_MEET_SERVICE_ACCOUNT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.GOOGLE_MEET_PRIVATE_KEY);
  if (!serviceAccountEmail || !privateKey) return null;
  const auth = new google.auth.JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/calendar.events'],
  });
  return { auth, calendarId: process.env.GOOGLE_MEET_CALENDAR_ID || 'primary' };
};

const generateMeetLink = async (slot: { id: string; startTime: Date; endTime: Date }) => {
  const client = createGoogleMeetClient();
  if (!client) {
    logger.warn('Google Meet not configured — skipping link generation for visa slot');
    return null;
  }
  try {
    const calendar = google.calendar({ version: 'v3', auth: client.auth });
    const event = await calendar.events.insert({
      calendarId: client.calendarId,
      conferenceDataVersion: 1,
      sendUpdates: 'none',
      requestBody: {
        summary: 'Visa Appointment',
        start: { dateTime: slot.startTime.toISOString(), timeZone: 'UTC' },
        end: { dateTime: slot.endTime.toISOString(), timeZone: 'UTC' },
        conferenceData: {
          createRequest: {
            requestId: `visa-${slot.id}-${slot.startTime.getTime()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    });
    return event.data.hangoutLink || event.data.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri || null;
  } catch (err) {
    logger.error('Error generating Google Meet link for visa:', err);
    return null;
  }
};

// Admin: Create a visa slot
export const createVisaSlot = async (req: Request, res: Response) => {
  const { startTime, endTime, capacity, documentUrl, notes } = req.body;
  const slot = await prisma.visaSlot.create({
    data: {
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      capacity: capacity || 1,
      documentUrl: documentUrl || null,
      notes: notes || null,
    },
  });
  res.status(201).json({ success: true, data: slot });
};

// Admin: Upload document to all visa slots (or a specific one)
export const uploadVisaDocument = async (req: Request, res: Response) => {
  const { slotId, documentUrl } = req.body;
  if (slotId) {
    const slot = await prisma.visaSlot.update({ where: { id: slotId }, data: { documentUrl } });
    return res.status(200).json({ success: true, data: slot });
  }
  // Update all slots
  await prisma.visaSlot.updateMany({ data: { documentUrl } });
  res.status(200).json({ success: true, message: 'Document applied to all slots' });
};

// Admin: Get all visa slots
export const getAllVisaSlots = async (req: Request, res: Response) => {
  const slots = await prisma.visaSlot.findMany({
    include: {
      application: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
    },
    orderBy: { startTime: 'asc' },
  });
  res.status(200).json({ success: true, data: slots });
};

// Admin: Delete a visa slot
export const deleteVisaSlot = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.visaSlot.delete({ where: { id } });
  res.status(200).json({ success: true, message: 'Slot deleted' });
};

// Student: Get available visa slots
export const getAvailableVisaSlots = async (req: Request, res: Response) => {
  const slots = await prisma.visaSlot.findMany({
    where: { isBooked: false, startTime: { gte: new Date() } },
    orderBy: { startTime: 'asc' },
  });
  res.status(200).json({ success: true, data: slots });
};

// Student: Book a visa slot
export const bookVisaSlot = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { slotId } = req.body;

  const application = await applicationService.getApplicationByUserId(userId);
  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

  const slot = await prisma.visaSlot.findUnique({ where: { id: slotId } });
  if (!slot || slot.isBooked) return res.status(400).json({ success: false, message: 'Slot unavailable' });

  // Release previous booking if any
  const prev = await prisma.visaSlot.findUnique({ where: { applicationId: application.id } });
  if (prev) {
    await prisma.visaSlot.update({ where: { id: prev.id }, data: { isBooked: false, applicationId: null } });
  }

  const updated = await prisma.visaSlot.update({
    where: { id: slotId },
    data: { isBooked: true, applicationId: application.id },
  });

  let meetLink = updated.meetLink;
  if (!meetLink) {
    meetLink = await generateMeetLink({ id: updated.id, startTime: updated.startTime, endTime: updated.endTime });
    if (meetLink) {
      await prisma.visaSlot.update({ where: { id: slotId }, data: { meetLink } });
    }
  }

  await activityService.log('Visa appointment booked', 'VISA_BOOKED', application.id, userId);

  res.status(200).json({ success: true, data: { ...updated, meetLink } });
};

// Student: Get my visa slot booking
export const getMyVisaSlot = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const application = await applicationService.getApplicationByUserId(userId);
  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

  const slot = await prisma.visaSlot.findUnique({ where: { applicationId: application.id } });
  res.status(200).json({ success: true, data: slot });
};
