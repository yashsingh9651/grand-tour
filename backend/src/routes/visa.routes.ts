import { Router } from 'express';
import {
  createVisaSlot,
  uploadVisaDocument,
  getAllVisaSlots,
  deleteVisaSlot,
  getAvailableVisaSlots,
  bookVisaSlot,
  getMyVisaSlot,
  approveVisaSlot,
  rejectVisaSlot,
} from '../controllers/visa.controller';
import { requireAuth, restrictTo } from '../middlewares/auth.middleware';

const router = Router();
router.use(requireAuth);

// Student routes
router.get('/my', getMyVisaSlot);
router.get('/available', getAvailableVisaSlots);
router.post('/book', bookVisaSlot);

// Admin routes
router.get('/', restrictTo('ADMIN', 'SUPER_ADMIN'), getAllVisaSlots);
router.post('/', restrictTo('ADMIN', 'SUPER_ADMIN'), createVisaSlot);
router.post('/document', restrictTo('ADMIN', 'SUPER_ADMIN'), uploadVisaDocument);
router.post('/:id/approve', restrictTo('ADMIN', 'SUPER_ADMIN'), approveVisaSlot);
router.post('/:id/reject', restrictTo('ADMIN', 'SUPER_ADMIN'), rejectVisaSlot);
router.delete('/:id', restrictTo('ADMIN', 'SUPER_ADMIN'), deleteVisaSlot);

export default router;
