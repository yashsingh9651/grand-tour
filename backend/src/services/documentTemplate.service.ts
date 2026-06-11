import { prisma } from '../config/db';

class DocumentTemplateService {
  async getAll() {
    return await prisma.documentTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async getById(id: string) {
    return await prisma.documentTemplate.findUnique({
      where: { id }
    });
  }

  async create(data: {
    name: string;
    description?: string;
    fileUrl: string;
    fileName: string;
    variables: string[];
    category?: string;
  }) {
    return await prisma.documentTemplate.create({ data });
  }

  async update(id: string, data: {
    name?: string;
    description?: string;
    fileUrl?: string;
    fileName?: string;
    variables?: string[];
    category?: string;
  }) {
    return await prisma.documentTemplate.update({
      where: { id },
      data
    });
  }

  async delete(id: string) {
    return await prisma.documentTemplate.delete({
      where: { id }
    });
  }
}

export default new DocumentTemplateService();
