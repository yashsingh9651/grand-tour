import { prisma } from '../config/db';

class NotificationService {
  async notify(userId: string, title: string, message: string, type: string = 'INFO') {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type
      }
    });
  }

  async getNotifications(userId: string) {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async markAsRead(id: string) {
    return await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  }

  async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  }
}

export default new NotificationService();
