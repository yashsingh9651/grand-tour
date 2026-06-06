import { Request, Response } from 'express';
import documentService from '../services/document.service';
import { DocumentStatus } from '@prisma/client';

export const getDocuments = async (req: Request, res: Response) => {
  const documents = await documentService.getAllDocuments();
  res.status(200).json({
    success: true,
    data: documents
  });
};

export const createDocument = async (req: Request, res: Response) => {
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
  await documentService.deleteDocument(id);
  res.status(200).json({
    success: true,
    message: 'Document deleted successfully'
  });
};
