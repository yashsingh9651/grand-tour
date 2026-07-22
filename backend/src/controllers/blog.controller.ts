import { Request, Response } from 'express';
import blogService from '../services/blog.service';

export const getAllBlogs = async (req: Request, res: Response) => {
  let blogs = await blogService.getAll();
  
  if (blogs.length === 0) {
    // Seed default posts
    await blogService.create({
      title: 'The Complete Roadmap to Your First Internship in France',
      slug: 'complete-roadmap-first-internship-france',
      summary: 'From choosing the right program to landing in Paris — every step, document, and insider tip you need to turn a dream into a boarding pass.',
      content: 'Landing your first hospitality internship in France is a dream for many students. In this comprehensive guide, we walk you through the entire process, including educational requirements, obtaining the "convention de stage" contract, visa guidelines, and adapting to the French hospitality work culture...',
      coverImage: '/blog_featured.png',
      category: 'GUIDES',
      readTime: 12,
      published: true
    });

    await blogService.create({
      title: 'A Day in the Life: Interning at a 5-Star Hotel in Nice',
      slug: 'day-in-the-life-nice',
      summary: 'Follow Rohan\'s journey as an culinary arts intern on the French Riviera, balancing early shifts, exquisite plating, and coastal life.',
      content: 'Rohan\'s daily routine starts at 6:30 AM at the prestigious coastal hotel. In this article, Rohan shares the challenges and triumphs of working alongside Michelin-starred culinary professionals, learning French kitchen terminology, and spending weekends exploring the beautiful Mediterranean beaches...',
      coverImage: '/partner_trust_3.png',
      category: 'STORIES',
      readTime: 8,
      published: true
    });

    await blogService.create({
      title: 'Essential French Phrases for Hospitality Professionals',
      slug: 'essential-french-phrases-hospitality',
      summary: 'Master these crucial French terms and polite phrases to confidently greet guests, take orders, and work alongside local hotel staff.',
      content: 'Speaking the local language, even basic greetings and vocabulary, shows respect and helps you integrate faster into the team. Here are key phrases for front-of-house service, kitchen communication, and general guest interactions...',
      coverImage: '/partner_trust_2.png',
      category: 'INSIGHTS',
      readTime: 5,
      published: true
    });

    blogs = await blogService.getAll();
  }
  
  res.status(200).json({ success: true, data: blogs });
};

export const getBlogById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;
  const isStaff = user && ['ADMIN', 'SUPER_ADMIN', 'HR', 'TEAM_MEMBER', 'TEAM', 'MARKETING'].includes(user.role);

  const blog = await blogService.getById(id);
  if (!blog || (!blog.published && !isStaff)) {
    res.status(404).json({ success: false, error: 'Blog post not found' });
    return;
  }
  res.status(200).json({ success: true, data: blog });
};

export const getBlogBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const user = (req as any).user;
  const isStaff = user && ['ADMIN', 'SUPER_ADMIN', 'HR', 'TEAM_MEMBER', 'TEAM', 'MARKETING'].includes(user.role);

  const blog = await blogService.getBySlug(slug);
  if (!blog || (!blog.published && !isStaff)) {
    res.status(404).json({ success: false, error: 'Blog post not found' });
    return;
  }
  res.status(200).json({ success: true, data: blog });
};


export const createBlog = async (req: Request, res: Response) => {
  const { title, slug, summary, content, coverImage, category, readTime, published } = req.body;
  if (!title || !summary || !content) {
    res.status(400).json({ success: false, error: 'Title, summary, and content are required' });
    return;
  }
  const blog = await blogService.create({
    title,
    slug,
    summary,
    content,
    coverImage,
    category,
    readTime: readTime ? parseInt(readTime) : undefined,
    published
  });
  res.status(201).json({ success: true, data: blog });
};

export const updateBlog = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, slug, summary, content, coverImage, category, readTime, published } = req.body;
  const blog = await blogService.update(id, {
    title,
    slug,
    summary,
    content,
    coverImage,
    category,
    readTime: readTime ? parseInt(readTime) : undefined,
    published
  });
  res.status(200).json({ success: true, data: blog });
};

export const deleteBlog = async (req: Request, res: Response) => {
  const { id } = req.params;
  await blogService.remove(id);
  res.status(200).json({ success: true, message: 'Blog post deleted successfully' });
};
