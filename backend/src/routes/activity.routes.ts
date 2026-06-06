import { Router } from 'express';
import { getActivities } from '../controllers/activity.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', requireAuth, getActivities);

export default router;
