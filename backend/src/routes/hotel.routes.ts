import { Router } from 'express';
import { 
  getHotels, 
  createHotel, 
  updateHotel, 
  deleteHotel, 
  getCandidatesAtHotelStep, 
  assignHotel, 
  getMyAssignment 
} from '../controllers/hotel.controller';
import { requireAuth, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// Student routes
router.get('/my-assignment', requireAuth, getMyAssignment);

// Admin routes
router.get('/', requireAuth, restrictTo('ADMIN', 'SUPER_ADMIN'), getHotels);
router.post('/', requireAuth, restrictTo('ADMIN', 'SUPER_ADMIN'), createHotel);
router.put('/:id', requireAuth, restrictTo('ADMIN', 'SUPER_ADMIN'), updateHotel);
router.delete('/:id', requireAuth, restrictTo('ADMIN', 'SUPER_ADMIN'), deleteHotel);
router.get('/candidates', requireAuth, restrictTo('ADMIN', 'SUPER_ADMIN'), getCandidatesAtHotelStep);
router.post('/assign', requireAuth, restrictTo('ADMIN', 'SUPER_ADMIN'), assignHotel);

export default router;
