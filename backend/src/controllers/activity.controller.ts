import { Request, Response } from 'express';
import activityService from '../services/activity.service';

export const getActivities = async (req: Request, res: Response) => {
  const activities = await activityService.getRecentActivity();
  res.status(200).json({
    success: true,
    data: activities
  });
};