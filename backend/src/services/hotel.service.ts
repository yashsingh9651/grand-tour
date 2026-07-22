import { prisma } from '../config/db';
import emailService from './email.service';
import notificationService from './notification.service';


export class HotelService {
  async getAllHotels() {
    return prisma.hotel.findMany({
      include: {
        _count: {
          select: { assignments: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createHotel(data: {
    name: string;
    location: string;
    representedBy?: string;
    position?: string;
    address?: string;
    phone?: string;
    email?: string;
    natureOfActivity?: string;
    siretNo?: string;
    proposalPdf?: string;
  }) {
    return prisma.hotel.create({
      data
    });
  }

  async updateHotel(id: string, data: {
    name?: string;
    location?: string;
    representedBy?: string;
    position?: string;
    address?: string;
    phone?: string;
    email?: string;
    natureOfActivity?: string;
    siretNo?: string;
    proposalPdf?: string;
  }) {
    return prisma.hotel.update({
      where: { id },
      data
    });
  }

  async deleteHotel(id: string) {
    return prisma.hotel.delete({
      where: { id }
    });
  }

  async getCandidatesAtHotelStep() {
    // Candidates who have payment1 approved and haven't been assigned a hotel yet
    // Or we can just look for candidates whose currentStepId is 'hotel'
    return prisma.application.findMany({
      where: {
        currentStepId: 'hotel',
        hotelAssignment: null
      },
      include: {
        user: true
      }
    });
  }

  async assignHotel(data: { hotelId: string; applicationId: string; checkIn: Date; checkOut: Date }) {
    console.log('Assigning hotel with data:', data);
    const assignment = await prisma.hotelAssignment.create({
      data: {
        hotelId: data.hotelId,
        applicationId: data.applicationId,
        checkIn: data.checkIn,
        checkOut: data.checkOut
      },
      include: {
        hotel: true,
        application: {
          include: {
            user: true
          }
        }
      }
    });

    console.log('Assignment created successfully:', assignment.id);


    // Send assignment email
    try {
      await emailService.sendEmail(assignment.application.user.email, 'HOSTEL_ASSIGNMENT', {
        'First Name': assignment.application.user.firstName || 'Student',
        'Hotel Name': assignment.hotel.name,
        'Location': assignment.hotel.location || 'France',
        'Department': assignment.application.preferredDepartment || assignment.hotel.natureOfActivity || 'Hospitality'
      });

      await notificationService.notify(
        assignment.application.userId,
        'Hotel Assigned',
        `You have been assigned to ${assignment.hotel.name}. Please check your dashboard for details.`,
        'SUCCESS'
      );
    } catch (error) {
      console.error('Failed to send hostel assignment email or notification:', error);
    }

    return assignment;

  }

  async getAssignmentByApplicationId(applicationId: string) {
    return prisma.hotelAssignment.findUnique({
      where: { applicationId },
      include: { hotel: true }
    });
  }
}

export default new HotelService();
