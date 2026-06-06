import { prisma } from '../config/db';

class ActivityService {
  async log(description: string, type: string, applicationId?: string, userId?: string) {
    return await prisma.activityLog.create({
      data: {
        description,
        type,
        applicationId,
        userId
      }
    });
  }

  async getRecentActivity(limit: number = 20) {
    return await prisma.activityLog.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        application: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });
  }
}

export default new ActivityService();
