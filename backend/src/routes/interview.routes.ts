import { Router } from 'express';
import * as InterviewController from '../controllers/interview.controller';
import { requireAuth, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// Apply requireAuth to all routes
router.use(requireAuth);

const staffRoles = restrictTo('ADMIN', 'SUPER_ADMIN', 'HR', 'TEAM_MEMBER', 'TEAM', 'MARKETING');

// Availability (Admin only)
router.get('/availability', staffRoles, InterviewController.getAvailability);
router.post('/availability', staffRoles, InterviewController.updateAvailability);

// Slots
router.get('/my', InterviewController.getMy);
router.get('/slots/available', InterviewController.getAvailableSlots);
router.post('/slots/generate', staffRoles, InterviewController.generateSlots);
router.post('/slots/manual', staffRoles, InterviewController.addManualSlot);
router.post('/slots/book', InterviewController.bookSlot);

router.get('/slots/admin', staffRoles, InterviewController.getAdminSlots);
router.patch('/slots/:id/link', staffRoles, InterviewController.updateSlotLink);
router.delete('/slots/:id', staffRoles, InterviewController.deleteSlot);

// Admin: Approve / Reject interview
router.patch('/:id/status', staffRoles, InterviewController.updateInterviewStatus);

export default router;
