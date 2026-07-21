import { Request, Response } from 'express';
import applicationService from '../services/application.service';
import { ApplicationStatus } from '@prisma/client';
import activityService from '../services/activity.service';
import workflowService from '../services/workflow.service';

export const createApplication = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const application = await applicationService.createApplication({ ...req.body, userId });
  res.status(201).json({
    success: true,
    data: application
  });
};

export const updateApplication = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;

  // Fetch application to check ownership
  const app = await applicationService.getApplicationById(id);
  if (!app) {
    res.status(404).json({ success: false, message: 'Application not found' });
    return;
  }

  const isStaff = ['ADMIN', 'SUPER_ADMIN', 'HR', 'TEAM_MEMBER', 'TEAM', 'MARKETING'].includes(user.role);
  if (app.userId !== user.id && !isStaff) {
    res.status(403).json({ success: false, message: 'Forbidden: You do not own this application' });
    return;
  }

  const application = await applicationService.updateApplication(id, req.body);
  res.status(200).json({
    success: true,
    data: application
  });
};

export const getApplications = async (req: Request, res: Response) => {
  const applications = await applicationService.getAllApplications();
  res.status(200).json({
    success: true,
    data: applications
  });
};

export const getMyApplication = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const application = await applicationService.getApplicationByUserId(userId);
  res.status(200).json({
    success: true,
    data: application
  });
};

export const updateStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const application = await applicationService.updateApplicationStatus(id, status as ApplicationStatus);

  // Log activity
  await activityService.log(`Application status updated to ${status}`, 'STATUS_UPDATE', id, (req as any).user?.id);
  
  if(status === "ACCEPTED"){
    // update to next step 
    const workflow = await workflowService.getWorkflow();
    const steps = (workflow?.steps as any[]) || [];
    
    const currentStepIdx = steps.findIndex((step: any) => step.id === application.currentStepId);
    
    if (currentStepIdx !== -1 && currentStepIdx < steps.length - 1) {
      const nextStepId = steps[currentStepIdx + 1].id;
      await applicationService.updateApplicationCurrentStep(id, nextStepId);
    }
  }

  res.status(200).json({
    success: true,
    data: application
  });
};

export const updateNotes = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { notes } = req.body;
  const application = await applicationService.updateApplicationNotes(id, notes);
  res.status(200).json({
    success: true,
    data: application
  });
};

export const updateStep = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { currentStepId } = req.body;
  const application = await applicationService.updateApplicationStep(id, currentStepId);
  
  // Log activity
  await activityService.log(`Moved to workflow step: ${currentStepId}`, 'STEP_UPDATE', id, (req as any).user?.id);

  res.status(200).json({
    success: true,
    data: application
  });
};

export const deleteApplication = async (req: Request, res: Response) => {
  const { id } = req.params;
  await applicationService.deleteApplication(id);
  res.status(200).json({
    success: true,
    message: 'Application deleted successfully'
  });
};

export const getApplicationById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const application = await applicationService.getApplicationById(id);
  if (!application) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }
  res.status(200).json({
    success: true,
    data: application
  });
};
