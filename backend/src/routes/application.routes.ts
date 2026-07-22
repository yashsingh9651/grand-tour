import { Router } from 'express';
import { createApplication, updateApplication, getApplications, getMyApplication, updateStatus, updateNotes, updateStep, deleteApplication, getApplicationById, continueStudentStep } from '../controllers/application.controller';
import { requireAuth, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// Application Routes
router.use(requireAuth);

router.get('/my', getMyApplication);
router.get('/', restrictTo('ADMIN', 'SUPER_ADMIN', 'HR', 'TEAM_MEMBER', 'TEAM', 'MARKETING'), getApplications);
router.post('/continue-step', continueStudentStep);
router.get('/:id', restrictTo('ADMIN', 'SUPER_ADMIN', 'HR', 'TEAM_MEMBER', 'TEAM', 'MARKETING'), getApplicationById);
router.post('/', createApplication);
router.patch('/:id', updateApplication);
router.patch('/:id/status', restrictTo('ADMIN', 'SUPER_ADMIN', 'HR', 'TEAM_MEMBER', 'TEAM', 'MARKETING'), updateStatus);
router.patch('/:id/notes', restrictTo('ADMIN', 'SUPER_ADMIN', 'HR', 'TEAM_MEMBER', 'TEAM', 'MARKETING'), updateNotes);
router.patch('/:id/step', updateStep);
router.delete('/:id', restrictTo('ADMIN', 'SUPER_ADMIN'), deleteApplication);

export default router;

