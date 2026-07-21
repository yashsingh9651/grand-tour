import { Request, Response } from 'express';
import workflowService from '../services/workflow.service';
import activityService from '../services/activity.service';

export const getWorkflow = async (req: Request, res: Response) => {
  const workflow = await workflowService.getWorkflow();
  res.status(200).json({
    success: true,
    data: workflow
  });
};

export const updateWorkflow = async (req: Request, res: Response) => {
  const workflow = await workflowService.updateWorkflow(req.body);

  await activityService.log(
    `Admin updated workflow "${workflow.name}"`,
    'ADMIN_UPDATE_WORKFLOW',
    undefined,
    (req as any).user?.id
  );

  res.status(200).json({
    success: true,
    data: workflow
  });
};
