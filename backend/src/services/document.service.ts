import { prisma } from '../config/db';
import { DocumentStatus } from '@prisma/client';

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
    return await prisma.document.create({
      data
    });
  }

  async updateDocumentStatus(id: string, status: DocumentStatus, remarks?: string, reviewedBy?: string) {
    return await prisma.document.update({
      where: { id },
      data: {
        status,
        remarks,
        reviewedBy,
        reviewedAt: new Date()
      }
    });
  }

  async deleteDocument(id: string) {
    return await prisma.document.delete({
      where: { id }
    });
  }
}

export default new DocumentService();
