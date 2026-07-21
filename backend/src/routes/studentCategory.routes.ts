import { Router } from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/studentCategory.controller';
import { requireAuth, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// GET all categories (any authenticated user — needed for dropdowns)
router.get('/', getAllCategories);
// GET single category
router.get('/:id', getCategoryById);
// POST create (admin)
router.post('/', restrictTo('ADMIN', 'SUPER_ADMIN', 'HR', 'TEAM_MEMBER', 'TEAM', 'MARKETING'), createCategory);
// PATCH update (admin)
router.patch('/:id', restrictTo('ADMIN', 'SUPER_ADMIN', 'HR', 'TEAM_MEMBER', 'TEAM', 'MARKETING'), updateCategory);
// DELETE remove (admin)
router.delete('/:id', restrictTo('ADMIN', 'SUPER_ADMIN', 'HR', 'TEAM_MEMBER', 'TEAM', 'MARKETING'), deleteCategory);

export default router;
