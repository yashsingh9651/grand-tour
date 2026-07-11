import { Request, Response } from 'express';
import hotelService from '../services/hotel.service';
import activityService from '../services/activity.service';
import applicationService from '../services/application.service';

export const getHotels = async (req: Request, res: Response) => {
  const hotels = await hotelService.getAllHotels();
  res.status(200).json({ success: true, data: hotels });
};

export const createHotel = async (req: Request, res: Response) => {
  const { name, location, representedBy, position, address, phone, email, natureOfActivity, siretNo, proposalPdf } = req.body;
  const hotel = await hotelService.createHotel({
    name,
    location,
    representedBy,
    position,
    address,
    phone,
    email,
    natureOfActivity,
    siretNo,
    proposalPdf
  });
  res.status(201).json({ success: true, data: hotel });
};

export const updateHotel = async (req: Request, res: Response) => {
  const { id } = req.params;
  const hotel = await hotelService.updateHotel(id, req.body);
  res.status(200).json({ success: true, data: hotel });
};

export const deleteHotel = async (req: Request, res: Response) => {
  const { id } = req.params;
  await hotelService.deleteHotel(id);
  res.status(200).json({ success: true, message: 'Hotel deleted' });
};

export const getCandidatesAtHotelStep = async (req: Request, res: Response) => {
  const candidates = await hotelService.getCandidatesAtHotelStep();
  res.status(200).json({ success: true, data: candidates });
};

export const assignHotel = async (req: Request, res: Response) => {
  const { hotelId, applicationId, checkIn, checkOut } = req.body;
  const assignment = await hotelService.assignHotel({
    hotelId,
    applicationId,
    checkIn: new Date(checkIn),
    checkOut: new Date(checkOut)
  });

  // Log activity
  await activityService.log(
    `Hotel assigned: ${assignment.hotel.name} to ${assignment.application.user.firstName}`,
    'HOTEL_ASSIGNED',
    applicationId,
    (req as any).user?.id
  );

  // Automatically move to next step?
  // Let's check the workflow to see what the next step is.
  // For now, let's just return the assignment.
  
  res.status(201).json({ success: true, data: assignment });
};

export const getMyAssignment = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const application = await applicationService.getApplicationByUserId(userId);
  if (!application) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }

  const assignment = await hotelService.getAssignmentByApplicationId(application.id);
  res.status(200).json({ success: true, data: assignment });
};

export const respondToAssignment = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { response, note } = req.body; // response: 'ACCEPTED' | 'DECLINED'

  const application = await applicationService.getApplicationByUserId(userId);
  if (!application) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }

  const { prisma } = await import('../config/db');
  const assignment = await prisma.hotelAssignment.findUnique({
    where: { applicationId: application.id },
    include: { hotel: true }
  });

  if (!assignment) {
    return res.status(404).json({ success: false, message: 'No hotel assignment found' });
  }

  const updated = await prisma.hotelAssignment.update({
    where: { id: assignment.id },
    data: { studentResponse: response, responseNote: note || null },
  });

  // If accepted, log activity and send initial alert (step is unlocked only when confirmation email is sent)
  if (response === 'ACCEPTED') {
    await activityService.log('Student accepted hotel host', 'HOTEL_ACCEPTED', application.id, userId);
  } else {
    await activityService.log('Student declined hotel host', 'HOTEL_DECLINED', application.id, userId);
  }

  // Notify admin of student's response
  try {
    const notificationService = (await import('../services/notification.service')).default;
    const studentName = `${application.user?.firstName || ''} ${application.user?.lastName || ''}`.trim() || 'Student';
    if (response === 'ACCEPTED') {
      await notificationService.notifyAdmin(
        `🏨 Hotel Assignment Accepted`,
        `${studentName} has accepted their hotel assignment. You may now send them the official confirmation email to unlock the next step.`,
        'SUCCESS',
        { applicationId: application.id, stepKey: 'hotel', studentName }
      );
    } else {
      await notificationService.notifyAdmin(
        `🏨 Hotel Assignment Declined`,
        `${studentName} has declined their hotel assignment${note ? `: "${note}"` : '.'}  You may need to reassign them.`,
        'ERROR',
        { applicationId: application.id, stepKey: 'hotel', studentName, declineNote: note }
      );
    }
  } catch { /* non-critical */ }

  res.status(200).json({ success: true, data: updated });
};

export const resendConfirmationEmail = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  const application = await applicationService.getApplicationByUserId(userId);
  if (!application) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }

  const { prisma } = await import('../config/db');
  const assignment = await prisma.hotelAssignment.findUnique({
    where: { applicationId: application.id },
    include: { hotel: true }
  });

  if (!assignment) {
    return res.status(404).json({ success: false, message: 'No hotel assignment found' });
  }

  if (assignment.studentResponse !== 'ACCEPTED') {
    return res.status(400).json({ success: false, message: 'Hotel assignment has not been accepted' });
  }

  // Advance application step to payment2
  await prisma.application.update({
    where: { id: application.id },
    data: { currentStepId: 'payment2' },
  });

  try {
    if (application.user?.email) {
      const studentName = `${application.user.firstName || ''} ${application.user.lastName || ''}`.trim() || 'Student';
      const hotelName = assignment.hotel?.name || 'Assigned Hotel';
      const portalLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/payment2`;
      
      const emailService = (await import('../services/email.service')).default;
      await emailService.sendHotelConfirmationEmail(application.user.email, {
        studentName,
        hotelName,
        portalLink
      });
    }
  } catch (err) {
    console.error('Failed to send hotel confirmation email:', err);
    return res.status(500).json({ success: false, message: 'Failed to send email' });
  }

  res.status(200).json({ success: true, message: 'Confirmation email sent and next step unlocked' });
};

