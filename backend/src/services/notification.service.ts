import { prisma } from '../config/db';

class NotificationService {
  async notify(userId: string, title: string, message: string, type: string = 'INFO', metadata?: Record<string, any>) {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        metadata: metadata || undefined,
      }
    });
  }

  /**
   * Broadcast a notification to all ADMIN and SUPER_ADMIN users.
   * Used when student actions need admin attention.
   */
  async notifyAdmin(title: string, message: string, type: string = 'INFO', metadata?: Record<string, any>) {
    const admins = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
      select: { id: true },
    });

    if (admins.length === 0) return;

    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        title,
        message,
        type,
        metadata: metadata || undefined,
      })),
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

  async markAsRead(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      const error: any = new Error('Notification not found');
      error.statusCode = 404;
      throw error;
    }

    if (notification.userId !== userId) {
      const error: any = new Error('Forbidden: You do not own this notification');
      error.statusCode = 403;
      throw error;
    }

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
