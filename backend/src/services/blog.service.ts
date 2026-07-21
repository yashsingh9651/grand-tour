import { prisma } from '../config/db';

class BlogService {
  async getAll() {
    return await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    return await prisma.blogPost.findUnique({ where: { id } });
  }

  async getBySlug(slug: string) {
    return await prisma.blogPost.findUnique({ where: { slug } });
  }

  async create(data: {
    title: string;
    slug?: string;
    summary: string;
    content: string;
    coverImage?: string;
    category?: string;
    readTime?: number;
    published?: boolean;
  }) {
    const slug = data.slug || this.slugify(data.title);
    
    // Check if slug is unique, append timestamp if duplicate
    const existing = await prisma.blogPost.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    return await prisma.blogPost.create({
      data: {
        ...data,
        slug: finalSlug,
      },
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      slug?: string;
      summary?: string;
      content?: string;
      coverImage?: string;
      category?: string;
      readTime?: number;
      published?: boolean;
    }
  ) {
    const updateData = { ...data };
    if (data.title && !data.slug) {
      const baseSlug = this.slugify(data.title);
      const existing = await prisma.blogPost.findFirst({
        where: {
          slug: baseSlug,
          NOT: { id }
        }
      });
      updateData.slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;
    }
    return await prisma.blogPost.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    return await prisma.blogPost.delete({ where: { id } });
  }

  private slugify(text: string) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-'); // Replace multiple - with single -
  }
}

export default new BlogService();
