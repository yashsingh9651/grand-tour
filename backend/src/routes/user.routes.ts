import { Router } from 'express';
import { getUsers, updateUserRole, deleteUser, createUser, toggleUserStatus } from '../controllers/user.controller';
import { requireAuth, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// User Routes - Only accessible by ADMIN
router.use(requireAuth);
router.use(restrictTo('ADMIN'));

router.get('/', getUsers);
router.post('/', createUser);
router.patch('/:id/role', updateUserRole);
router.patch('/:id/toggle-status', toggleUserStatus);
router.delete('/:id', deleteUser);

export default router;
