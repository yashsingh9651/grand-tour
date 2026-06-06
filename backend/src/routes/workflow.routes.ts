import { Router } from 'express';
import { getWorkflow, updateWorkflow } from '../controllers/workflow.controller';
import { requireAuth, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// Publicly readable by authenticated users, but only editable by ADMIN
router.use(requireAuth);

router.get('/', getWorkflow);
router.put('/', restrictTo('ADMIN'), updateWorkflow);

export default router;
