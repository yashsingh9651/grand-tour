import { prisma } from '../config/db';

class StudentCategoryService {
  async getAll() {
    return await prisma.studentCategory.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async getById(id: string) {
    return await prisma.studentCategory.findUnique({ where: { id } });
  }

  async create(data: { name: string; description?: string; color?: string; pricing?: any[] }) {
    return await prisma.studentCategory.create({ data });
  }

  async update(id: string, data: { name?: string; description?: string; color?: string; pricing?: any[]; isActive?: boolean }) {
    return await prisma.studentCategory.update({ where: { id }, data });
  }

  async remove(id: string) {
    return await prisma.studentCategory.delete({ where: { id } });
  }
}

export default new StudentCategoryService();
