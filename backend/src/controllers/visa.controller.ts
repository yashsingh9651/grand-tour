import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { google } from 'googleapis';
import logger from '../utils/logger';
import activityService from '../services/activity.service';
import applicationService from '../services/application.service';
import emailService from '../services/email.service';

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
  const { startTime, endTime, capacity, documentUrl, notes, location } = req.body;
  const slot = await prisma.visaSlot.create({
    data: {
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      capacity: capacity || 1,
      documentUrl: documentUrl || null,
      notes: notes || null,
      meetLink: location || null,
    },
  });
  res.status(201).json({ success: true, data: slot });
};

// Admin: Generate visa slots in bulk
export const generateVisaSlots = async (req: Request, res: Response) => {
  const { startDate, endDate, bufferTime = 0, availability = [], location } = req.body;

  try {
    if (!availability || availability.length === 0) {
      return res.status(400).json({ success: false, error: 'No availability rules provided.' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Normalize dates to start/end of day
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const slotsToCreate = [];

    // Loop through each day in the range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const dayAvail = availability.find((a: any) => a.dayOfWeek === dayOfWeek);

      if (!dayAvail || !dayAvail.isActive) continue;

      const [startH, startM] = dayAvail.startTime.split(':').map(Number);
      const [endH, endM] = dayAvail.endTime.split(':').map(Number);

      let current = new Date(d);
      current.setHours(startH, startM, 0, 0);

      const dayEnd = new Date(d);
      dayEnd.setHours(endH, endM, 0, 0);

      const lunchStart = dayAvail.lunchStart ? dayAvail.lunchStart.split(':').map(Number) : null;
      const lunchEnd = dayAvail.lunchEnd ? dayAvail.lunchEnd.split(':').map(Number) : null;

      while (current < dayEnd) {
        const slotEnd = new Date(current.getTime() + dayAvail.slotDuration * 60000);

        if (slotEnd > dayEnd) break;

        // Check for lunch gap
        let isLunch = false;
        if (lunchStart && lunchEnd) {
          const lStart = new Date(d);
          lStart.setHours(lunchStart[0], lunchStart[1], 0, 0);
          const lEnd = new Date(d);
          lEnd.setHours(lunchEnd[0], lunchEnd[1], 0, 0);

          if ((current >= lStart && current < lEnd) || (slotEnd > lStart && slotEnd <= lEnd)) {
            isLunch = true;
          }
        }

        if (!isLunch) {
          // Check if slot already exists to avoid duplicates
          const existing = await prisma.visaSlot.findFirst({
            where: {
              startTime: current,
              endTime: slotEnd,
            },
          });

          if (!existing) {
            slotsToCreate.push({
              startTime: new Date(current),
              endTime: new Date(slotEnd),
              capacity: dayAvail.capacity || 1,
              meetLink: location || null,
            });
          }
        }

        // Advance current time by duration + buffer
        current = new Date(slotEnd.getTime() + bufferTime * 60000);
      }
    }

    if (slotsToCreate.length > 0) {
      await prisma.visaSlot.createMany({
        data: slotsToCreate,
      });
    }

    return res.status(200).json({
      success: true,
      message: `${slotsToCreate.length} visa slots generated successfully`,
      count: slotsToCreate.length,
    });
  } catch (error) {
    logger.error('Error generating visa slots:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
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

  const meetLink = updated.meetLink; // We treat this database field as the Location address

  await activityService.log('Visa appointment booked', 'VISA_BOOKED', application.id, userId);

  // Notify student via email
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    try {
      await emailService.sendVisaSlotBookedEmail(user.email, {
        studentName: `${user.firstName} ${user.lastName}`,
        dateTime: updated.startTime.toLocaleString(),
        meetLink: meetLink || 'Location will be shared soon'
      });
    } catch (error) {
      logger.error('Failed to send visa booking email notification:', error);
    }
  }

  res.status(200).json({ success: true, data: updated });
};

// Student: Get my visa slot booking
export const getMyVisaSlot = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const application = await applicationService.getApplicationByUserId(userId);
  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

  const slot = await prisma.visaSlot.findUnique({ where: { applicationId: application.id } });
  res.status(200).json({ success: true, data: slot });
};

// Admin: Approve a visa booking (moves candidate to travel step)
export const approveVisaSlot = async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminId = (req as any).user?.id;

  const slot = await prisma.visaSlot.findUnique({
    where: { id },
    include: { application: { include: { user: true } } }
  });

  if (!slot || !slot.applicationId) {
    return res.status(404).json({ success: false, message: 'Booked slot not found' });
  }

  // Move application to travel step
  await prisma.application.update({
    where: { id: slot.applicationId },
    data: { currentStepId: 'travel' },
  });

  // Log activity
  await activityService.log('Visa slot approved', 'VISA_APPROVED', slot.applicationId, adminId);

  // Send confirmation email
  if (slot.application && slot.application.user) {
    try {
      await emailService.sendEmail(slot.application.user.email, 'APPLICATION_UPDATE', {
        studentName: `${slot.application.user.firstName} ${slot.application.user.lastName}`,
        status: 'VISA APPROVED',
        notes: 'Your visa appointment has been approved by the admin. You have been advanced to the travel documents stage.',
        applicationId: slot.applicationId
      });
    } catch (error) {
      logger.error('Failed to send visa approval email:', error);
    }
  }

  res.status(200).json({ success: true, message: 'Visa slot approved successfully' });
};

// Admin: Reject a visa booking (resets slot so student can book again)
export const rejectVisaSlot = async (req: Request, res: Response) => {
  const { id } = req.params;
  const adminId = (req as any).user?.id;

  const slot = await prisma.visaSlot.findUnique({
    where: { id },
    include: { application: { include: { user: true } } }
  });

  if (!slot || !slot.applicationId) {
    return res.status(404).json({ success: false, message: 'Booked slot not found' });
  }

  const studentEmail = slot.application?.user?.email;
  const studentName = slot.application?.user ? `${slot.application.user.firstName} ${slot.application.user.lastName}` : 'Student';
  const appId = slot.applicationId;

  // Release the slot booking
  await prisma.visaSlot.update({
    where: { id },
    data: {
      isBooked: false,
      applicationId: null,
      meetLink: null // reset meet link so a new one generates for next booking
    }
  });

  // Log activity
  await activityService.log('Visa slot rejected', 'VISA_REJECTED', appId, adminId);

  // Send rejection email
  if (studentEmail) {
    try {
      await emailService.sendEmail(studentEmail, 'APPLICATION_UPDATE', {
        studentName,
        status: 'VISA REJECTED',
        notes: 'Your visa appointment slot has been rejected/cancelled. Please log in to your dashboard to choose another available time slot.',
        applicationId: appId
      });
    } catch (error) {
      logger.error('Failed to send visa rejection email:', error);
    }
  }

  res.status(200).json({ success: true, message: 'Visa slot rejected successfully' });
};
