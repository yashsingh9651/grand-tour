import { Router } from 'express';
import { requireAuth, restrictTo } from '../middlewares/auth.middleware';
import {
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog
} from '../controllers/blog.controller';

const router = Router();

// Public routes
router.get('/', getAllBlogs);
router.get('/:id', getBlogById);
router.get('/slug/:slug', getBlogBySlug);

// Admin-only routes
router.post('/', requireAuth, restrictTo('ADMIN', 'SUPER_ADMIN'), createBlog);
router.put('/:id', requireAuth, restrictTo('ADMIN', 'SUPER_ADMIN'), updateBlog);
router.delete('/:id', requireAuth, restrictTo('ADMIN', 'SUPER_ADMIN'), deleteBlog);

export default router;
