import { Request, Response } from 'express';
import documentService from '../services/document.service';
import applicationService from '../services/application.service';
import { DocumentStatus } from '@prisma/client';

export const getDocuments = async (req: Request, res: Response) => {
  const documents = await documentService.getAllDocuments();
  res.status(200).json({
    success: true,
    data: documents
  });
};

export const createDocument = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const isStaff = ['ADMIN', 'SUPER_ADMIN', 'HR', 'TEAM_MEMBER', 'TEAM', 'MARKETING'].includes(user.role);

  if (!isStaff) {
    if (!req.body.applicationId) {
      res.status(400).json({ success: false, message: 'applicationId is required' });
      return;
    }
    // Verify ownership of application
    const app = await applicationService.getApplicationById(req.body.applicationId);
    if (!app || app.userId !== user.id) {
      res.status(403).json({ success: false, message: 'Forbidden: You do not own this application' });
      return;
    }
  }

  const document = await documentService.createDocument(req.body);
  res.status(201).json({
    success: true,
    data: document
  });
};

export const updateStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  const reviewedBy = (req as any).user?.id;
  
  const document = await documentService.updateDocumentStatus(
    id, 
    status as DocumentStatus, 
    remarks,
    reviewedBy
  );

  res.status(200).json({
    success: true,
    data: document
  });
};

export const deleteDocument = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;
  const isStaff = ['ADMIN', 'SUPER_ADMIN', 'HR', 'TEAM_MEMBER', 'TEAM', 'MARKETING'].includes(user.role);

  // Fetch document to check ownership
  const doc = await documentService.getDocumentById(id);
  if (!doc) {
    res.status(404).json({ success: false, message: 'Document not found' });
    return;
  }

  if (doc.application?.userId !== user.id && !isStaff) {
    res.status(403).json({ success: false, message: 'Forbidden: You do not own this document' });
    return;
  }

  await documentService.deleteDocument(id);
  res.status(200).json({
    success: true,
    message: 'Document deleted successfully'
  });
};
