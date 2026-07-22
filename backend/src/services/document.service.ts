import { prisma } from '../config/db';
import { DocumentStatus } from '@prisma/client';
import notificationService from './notification.service';

class DocumentService {
  async getAllDocuments() {
    return await prisma.document.findMany({
      where: {
        type: {
          notIn: ['UNSIGNED_CONTRACT', 'CONTRACT_EXTRA_1', 'CONTRACT_EXTRA_2', 'CONTRACT_EXTRA_3']
        }
      },
      include: {
        application: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getDocumentById(id: string) {
    return await prisma.document.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            user: true
          }
        }
      }
    });
  }

  async createDocument(data: any) {
    let doc;
    const existing = await prisma.document.findFirst({
      where: {
        applicationId: data.applicationId,
        type: data.type,
      }
    });

    if (existing) {
      doc = await prisma.document.update({
        where: { id: existing.id },
        data: {
          name: data.name,
          url: data.url,
          fileName: data.fileName,
          size: data.size,
          status: 'PENDING',
          remarks: null,
          reviewedBy: null,
          reviewedAt: null,
          updatedAt: new Date(),
        }
      });
    } else {
      doc = await prisma.document.create({ data });
    }

    // Notify admin about the new document upload
    try {
      const fullDoc = await prisma.document.findUnique({
        where: { id: doc.id },
        include: {
          application: {
            include: {
              user: { select: { firstName: true, lastName: true } }
            }
          }
        }
      });
      if (fullDoc?.application?.user) {
        const studentName = `${fullDoc.application.user.firstName} ${fullDoc.application.user.lastName}`.trim();
        const docTypeLabel = (fullDoc.type || 'document').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        await notificationService.notifyAdmin(
          `📄 Document Uploaded: ${docTypeLabel}`,
          `${studentName} has uploaded their "${docTypeLabel}" document and it is awaiting your review.`,
          'WARNING',
          {
            applicationId: fullDoc.applicationId,
            stepKey: 'document-upload',
            studentName,
            documentType: fullDoc.type,
            documentId: fullDoc.id,
          }
        );
      }
    } catch { /* non-critical */ }

    return doc;
  }


  async updateDocumentStatus(id: string, status: DocumentStatus, remarks?: string, reviewedBy?: string) {
    const doc = await prisma.document.update({
      where: { id },
      data: {
        status,
        remarks,
        reviewedBy,
        reviewedAt: new Date()
      },
      include: {
        application: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } }
        }
      }
    });

    // Notify the student of the decision
    try {
      if (doc.application?.user?.id) {
        const docTypeLabel = (doc.type || 'document').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
        const statusLabel = status === 'APPROVED' ? 'approved ✅' : status === 'REJECTED' ? 'rejected ❌' : 'flagged for revision ⚠️';
        await notificationService.notify(
          doc.application.user.id,
          `Document ${status === 'APPROVED' ? 'Approved' : status === 'REJECTED' ? 'Rejected' : 'Needs Revision'}`,
          `Your "${docTypeLabel}" document has been ${statusLabel}.${remarks ? ` Remarks: ${remarks}` : ''}`,
          status === 'APPROVED' ? 'SUCCESS' : status === 'REJECTED' ? 'ERROR' : 'WARNING',
          { applicationId: doc.applicationId, stepKey: 'document-upload', documentType: doc.type }
        );
      }
    } catch { /* non-critical */ }

    return doc;
  }

  async deleteDocument(id: string) {
    return await prisma.document.delete({
      where: { id }
    });
  }
}

export default new DocumentService();
