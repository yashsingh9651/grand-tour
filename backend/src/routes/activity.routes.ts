import { Router } from 'express';
import { getActivities } from '../controllers/activity.controller';
import { requireAuth, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

const staffRoles = restrictTo('ADMIN', 'SUPER_ADMIN', 'HR', 'TEAM_MEMBER', 'TEAM', 'MARKETING');

router.get('/', requireAuth, staffRoles, getActivities);

export default router;
