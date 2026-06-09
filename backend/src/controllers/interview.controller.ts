import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { google } from 'googleapis';
import logger from '../utils/logger';

const normalizePrivateKey = (value?: string) => (value || '').replace(/\\n/g, '\n').trim();

const createGoogleMeetClient = () => {
    const serviceAccountEmail = process.env.GOOGLE_MEET_SERVICE_ACCOUNT_EMAIL;
    const privateKey = normalizePrivateKey(process.env.GOOGLE_MEET_PRIVATE_KEY);

    if (!serviceAccountEmail || !privateKey) {
        return null;
    }

    const auth = new google.auth.JWT({
        email: serviceAccountEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/calendar.events'],
    });

    return {
        auth,
        calendarId: process.env.GOOGLE_MEET_CALENDAR_ID || 'primary',
    };
};

const generateMeetLinkForSlot = async (slot: { id: string; startTime: Date; endTime: Date }) => {
    const googleMeetClient = createGoogleMeetClient();

    if (!googleMeetClient) {
        logger.warn('Google Meet integration is not configured. Skipping automatic meeting link generation.');
        return null;
    }

    try {
        const calendar = google.calendar({ version: 'v3', auth: googleMeetClient.auth });
        const requestId = `interview-${slot.id}-${slot.startTime.getTime()}`;

        const event = await calendar.events.insert({
            calendarId: googleMeetClient.calendarId,
            conferenceDataVersion: 1,
            sendUpdates: 'none',
            requestBody: {
                summary: 'Interview Session',
                start: {
                    dateTime: slot.startTime.toISOString(),
                    timeZone: 'UTC',
                },
                end: {
                    dateTime: slot.endTime.toISOString(),
                    timeZone: 'UTC',
                },
                conferenceData: {
                    createRequest: {
                        requestId,
                        conferenceSolutionKey: {
                            type: 'hangoutsMeet',
                        },
                    },
                },
            },
        });

        const generatedLink = event.data.hangoutLink || event.data.conferenceData?.entryPoints?.find((entryPoint) => entryPoint.entryPointType === 'video')?.uri;

        if (!generatedLink) {
            logger.warn('Google Meet link was not returned from calendar API.');
            return null;
        }

        return generatedLink;
    } catch (error) {
        logger.error('Error generating Google Meet link:', error);
        return null;
    }
};

const syncMeetLinkForSlot = async (slot: { id: string; applicationId: string | null; meetLink: string | null }, meetLink: string | null) => {
    const persistedSlot = await prisma.interviewSlot.update({
        where: { id: slot.id },
        data: {
            meetLink,
        },
    });

    if (meetLink && slot.applicationId) {
        const interview = await prisma.interview.findFirst({
            where: { applicationId: slot.applicationId },
        });

        if (interview) {
            await prisma.interview.update({
                where: { id: interview.id },
                data: {
                    locationUrl: meetLink,
                },
            });
        }
    }

    return persistedSlot;
};

export const getMy = async (req: Request, res: Response) => {
  const userId = (req as any).user.id; // Assuming user is attached by auth middleware

  try {
    const application = await prisma.application.findUnique({
      where: { userId },
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const interview = await prisma.interview.findFirst({
      where: { applicationId: application.id },
      include: {
        interviewer: {
            select: {
                firstName: true,
                lastName: true,
                email: true
            }
        }
      }
    });

    return res.status(200).json(interview);
  } catch (error) {
    logger.error('Error fetching student interview:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// --- Availability ---


export const getAvailability = async (req: Request, res: Response) => {
  try {
    const availability = await prisma.availability.findMany({
      orderBy: { dayOfWeek: 'asc' },
    });
    return res.status(200).json(availability);
  } catch (error) {
    logger.error('Error fetching availability:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAvailability = async (req: Request, res: Response) => {
  const { availability } = req.body; // Array of availability objects

  try {
    // Delete all and recreate for simplicity, or update individually
    await prisma.$transaction(async (tx) => {
      await tx.availability.deleteMany({});
      await tx.availability.createMany({
        data: availability.map((a: any) => ({
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
          slotDuration: a.slotDuration || 30,
          lunchStart: a.lunchStart,
          lunchEnd: a.lunchEnd,
          isActive: a.isActive ?? true,
        })),
      });
    });

    return res.status(200).json({ message: 'Availability updated successfully' });
  } catch (error) {
    logger.error('Error updating availability:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// --- Slots ---

export const generateSlots = async (req: Request, res: Response) => {
  const { startDate, endDate, bufferTime = 0 } = req.body;

  try {
    const availability = await prisma.availability.findMany({ where: { isActive: true } });
    logger.info(`Generating slots for range: ${startDate} to ${endDate}. Found ${availability.length} availability rules.`);
    
    if (availability.length === 0) {
        return res.status(400).json({ error: 'No availability rules set. Please set your working hours first.' });
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
      const dayAvail = availability.find((a) => a.dayOfWeek === dayOfWeek);
      
      if (!dayAvail) continue;

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

            // If slot overlaps with lunch, skip it
            if ((current >= lStart && current < lEnd) || (slotEnd > lStart && slotEnd <= lEnd)) {
                isLunch = true;
            }
        }

        if (!isLunch) {
            // Check if slot already exists to avoid duplicates
            const existing = await prisma.interviewSlot.findFirst({
                where: {
                    startTime: current,
                    endTime: slotEnd
                }
            });

            if (!existing) {
                slotsToCreate.push({
                    startTime: new Date(current),
                    endTime: new Date(slotEnd),
                });
            }
        }

        // Advance current time by duration + buffer
        current = new Date(slotEnd.getTime() + bufferTime * 60000);
      }
    }

    if (slotsToCreate.length > 0) {
        await prisma.interviewSlot.createMany({
            data: slotsToCreate,
        });
    }

    return res.status(200).json({ 
        message: `${slotsToCreate.length} slots generated successfully`,
        count: slotsToCreate.length 
    });
  } catch (error) {
    logger.error('Error generating slots:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const addManualSlot = async (req: Request, res: Response) => {
    const { startTime, endTime } = req.body;

    try {
        const slot = await prisma.interviewSlot.create({
            data: {
                startTime: new Date(startTime),
                endTime: new Date(endTime),
            }
        });
        return res.status(201).json(slot);
    } catch (error) {
        logger.error('Error adding manual slot:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const slots = await prisma.interviewSlot.findMany({
      where: {
        isBooked: false,
        startTime: { gte: new Date() },
      },
      orderBy: { startTime: 'asc' },
    });
    return res.status(200).json(slots);
  } catch (error) {
    logger.error('Error fetching available slots:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const bookSlot = async (req: Request, res: Response) => {
  const { slotId, applicationId } = req.body;

  try {
    const slot = await prisma.interviewSlot.findUnique({ where: { id: slotId } });

    if (!slot || slot.isBooked) {
      return res.status(400).json({ error: 'Slot is not available' });
    }

    // Check if application already has a slot
    const existingBooking = await prisma.interviewSlot.findUnique({
        where: { applicationId }
    });

    if (existingBooking) {
        // Free up the old slot
        await prisma.interviewSlot.update({
            where: { id: existingBooking.id },
            data: { isBooked: false, applicationId: null }
        });
    }

    const updatedSlot = await prisma.interviewSlot.update({
      where: { id: slotId },
      data: {
        isBooked: true,
        applicationId,
      },
    });

    let generatedMeetLink = updatedSlot.meetLink;

    if (!generatedMeetLink) {
        generatedMeetLink = await generateMeetLinkForSlot({
            id: updatedSlot.id,
            startTime: updatedSlot.startTime,
            endTime: updatedSlot.endTime,
        });

        if (generatedMeetLink) {
            await syncMeetLinkForSlot({
                id: updatedSlot.id,
                applicationId: updatedSlot.applicationId,
                meetLink: updatedSlot.meetLink,
            }, generatedMeetLink);
        }
    }

    // Create/Update Interview record
    const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: { user: true }
    });

    if (application) {
        const existingInterview = await prisma.interview.findFirst({
            where: { applicationId },
        });

        await prisma.interview.upsert({
            where: { id: existingInterview?.id || 'temp-id' },
            create: {
                applicationId,
                interviewerId: application.userId, // Default to student for now, admin will change
                scheduledAt: slot.startTime,
                locationUrl: generatedMeetLink || null,
                status: 'PENDING',
                notes: 'Custom slot booked'
            },
            update: {
                scheduledAt: slot.startTime,
                status: 'PENDING',
                locationUrl: generatedMeetLink || null,
            }
        });

        await prisma.activityLog.create({
            data: {
                applicationId,
                description: `Interview scheduled for ${new Date(slot.startTime).toLocaleString()}`,
                type: 'INTERVIEW_SCHEDULED'
            }
        });
    }

    return res.status(200).json({
        ...updatedSlot,
        meetLink: generatedMeetLink,
    });
  } catch (error) {
    logger.error('Error booking slot:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAdminSlots = async (req: Request, res: Response) => {
    try {
        const slots = await prisma.interviewSlot.findMany({
            include: {
                application: {
                    include: {
                        user: true
                    }
                }
            },
            orderBy: { startTime: 'desc' }
        });
        return res.status(200).json(slots);
    } catch (error) {
        logger.error('Error fetching admin slots:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateSlotLink = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { meetLink } = req.body;

    try {
        const existingSlot = await prisma.interviewSlot.findUnique({
            where: { id }
        });

        if (!existingSlot) {
            return res.status(404).json({ error: 'Interview slot not found' });
        }

        let generatedMeetLink: string | null = typeof meetLink === 'string' ? meetLink.trim() || null : null;

        if (!generatedMeetLink) {
            generatedMeetLink = await generateMeetLinkForSlot({
                id: existingSlot.id,
                startTime: existingSlot.startTime,
                endTime: existingSlot.endTime,
            }) || null;
        }

        const slot = await syncMeetLinkForSlot({
            id: existingSlot.id,
            applicationId: existingSlot.applicationId,
            meetLink: existingSlot.meetLink,
        }, generatedMeetLink);

        return res.status(200).json(slot);
    } catch (error) {
        logger.error('Error updating slot link:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteSlot = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await prisma.interviewSlot.delete({
            where: { id }
        });
        return res.status(200).json({ message: 'Slot deleted successfully' });
    } catch (error) {
        logger.error('Error deleting slot:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// --- Admin: Approve / Reject an interview ---

export const updateInterviewStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body; // 'COMPLETED' | 'REJECTED'

    if (!['COMPLETED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Use COMPLETED or REJECTED.' });
    }

    try {
        const interview = await prisma.interview.update({
            where: { id },
            data: { status },
        });

        // On approval, advance the application to the next workflow step
        if (status === 'COMPLETED' && interview.applicationId) {
            const application = await prisma.application.findUnique({
                where: { id: interview.applicationId },
            });

            // steps is a Json field, not a relation — fetch without include
            const workflow = await prisma.workflow.findFirst();

            if (application && workflow) {
                // Parse steps from Json field and sort by order
                const rawSteps = Array.isArray(workflow.steps) ? workflow.steps : [];
                const steps = [...rawSteps].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

                const currentIdx = steps.findIndex((s: any) => s.id === application.currentStepId);
                const nextStep = currentIdx >= 0 && currentIdx < steps.length - 1
                    ? steps[currentIdx + 1]
                    : null;

                if (nextStep) {
                    await prisma.application.update({
                        where: { id: interview.applicationId },
                        data: { currentStepId: (nextStep as any).id },
                    });

                    await prisma.activityLog.create({
                        data: {
                            applicationId: interview.applicationId,
                            description: `Interview approved. Candidate advanced to step: ${(nextStep as any).name}`,
                            type: 'STEP_ADVANCED',
                        },
                    });
                }
            }
        }


        if (status === 'REJECTED' && interview.applicationId) {
            await prisma.activityLog.create({
                data: {
                    applicationId: interview.applicationId,
                    description: 'Interview rejected by admin.',
                    type: 'INTERVIEW_REJECTED',
                },
            });
        }

        return res.status(200).json({ message: `Interview ${status.toLowerCase()} successfully`, interview });
    } catch (error) {
        logger.error('Error updating interview status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
