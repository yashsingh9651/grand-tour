import { Router } from 'express';
import {
  uploadTravelDocument,
  publishTravelDocuments,
  getAllTravelDocuments,
  deleteTravelDocument,
  getMyTravelDocuments,
} from '../controllers/travel.controller';
import { requireAuth, restrictTo } from '../middlewares/auth.middleware';

const router = Router();
router.use(requireAuth);

// Student
router.get('/my', getMyTravelDocuments);

// Admin
router.get('/', restrictTo('ADMIN', 'SUPER_ADMIN'), getAllTravelDocuments);
router.post('/upload', restrictTo('ADMIN', 'SUPER_ADMIN'), uploadTravelDocument);
router.post('/publish', restrictTo('ADMIN', 'SUPER_ADMIN'), publishTravelDocuments);
router.delete('/:id', restrictTo('ADMIN', 'SUPER_ADMIN'), deleteTravelDocument);

export default router;
