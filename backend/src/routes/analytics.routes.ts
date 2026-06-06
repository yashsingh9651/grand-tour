import { Router } from 'express';
import { getDashboardStats, getWorkflowStats } from '../controllers/analytics.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/dashboard', requireAuth, getDashboardStats);
router.get('/workflow', requireAuth, getWorkflowStats);

export default router;
