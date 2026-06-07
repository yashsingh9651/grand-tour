import { Router } from 'express';
import { uploadWorkPermit, getAllWorkPermits, getMyWorkPermit } from '../controllers/workpermit.controller';
import { requireAuth, restrictTo } from '../middlewares/auth.middleware';

const router = Router();
router.use(requireAuth);

router.get('/my', getMyWorkPermit);
router.get('/', restrictTo('ADMIN', 'SUPER_ADMIN'), getAllWorkPermits);
router.post('/upload', restrictTo('ADMIN', 'SUPER_ADMIN'), uploadWorkPermit);

export default router;
