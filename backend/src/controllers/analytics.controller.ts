import { Request, Response } from 'express';
import analyticsService from '../services/analytics.service';

export const getDashboardStats = async (req: Request, res: Response) => {
  const stats = await analyticsService.getDashboardStats();
  res.status(200).json({
    success: true,
    data: stats
  });
};

export const getWorkflowStats = async (req: Request, res: Response) => {
  const stats = await analyticsService.getWorkflowStats();
  res.status(200).json({
    success: true,
    data: stats
  });
};
