import { Router } from 'express';
import { getDashboardStats, getWorkflowStats } from '../controllers/analytics.controller';
import { requireAuth, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

const staffRoles = restrictTo('ADMIN', 'SUPER_ADMIN', 'HR', 'TEAM_MEMBER', 'TEAM', 'MARKETING');

router.get('/dashboard', requireAuth, staffRoles, getDashboardStats);
router.get('/workflow', requireAuth, staffRoles, getWorkflowStats);

export default router;
