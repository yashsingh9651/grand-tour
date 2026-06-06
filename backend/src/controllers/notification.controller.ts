import { Request, Response } from 'express';
import notificationService from '../services/notification.service';

export const getNotifications = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const notifications = await notificationService.getNotifications(userId);
  res.status(200).json({
    success: true,
    data: notifications
  });
};

export const markRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  await notificationService.markAsRead(id);
  res.status(200).json({
    success: true,
    message: 'Notification marked as read'
  });
};

export const markAllRead = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  await notificationService.markAllAsRead(userId);
  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
};
