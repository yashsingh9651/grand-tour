import { Router } from 'express';
import { getPermissions, updatePermission } from '../controllers/permission.controller';
import { requireAuth, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', requireAuth, getPermissions);
router.put('/:role', requireAuth, restrictTo('SUPER_ADMIN'), updatePermission);

export default router;
