import { Router } from 'express';
import * as InterviewController from '../controllers/interview.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Apply requireAuth to all routes
router.use(requireAuth);

// Availability (Admin only - though checking for ADMIN role would be better)
router.get('/availability', InterviewController.getAvailability);
router.post('/availability', InterviewController.updateAvailability);

// Slots
router.get('/my', InterviewController.getMy);
router.get('/slots/available', InterviewController.getAvailableSlots);
router.post('/slots/generate', InterviewController.generateSlots);
router.post('/slots/manual', InterviewController.addManualSlot);
router.post('/slots/book', InterviewController.bookSlot);

router.get('/slots/admin', InterviewController.getAdminSlots);
router.patch('/slots/:id/link', InterviewController.updateSlotLink);
router.delete('/slots/:id', InterviewController.deleteSlot);



export default router;
