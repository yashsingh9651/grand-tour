import { Request, Response } from 'express';
import workflowService from '../services/workflow.service';

export const getWorkflow = async (req: Request, res: Response) => {
  const workflow = await workflowService.getWorkflow();
  res.status(200).json({
    success: true,
    data: workflow
  });
};

export const updateWorkflow = async (req: Request, res: Response) => {
  const workflow = await workflowService.updateWorkflow(req.body);
  res.status(200).json({
    success: true,
    data: workflow
  });
};
