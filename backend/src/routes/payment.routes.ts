import { Router } from 'express';
import { submitPayment, getPayments, approvePayment } from '../controllers/payment.controller';
import { requireAuth, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/submit', submitPayment);
router.get('/', restrictTo('ADMIN', 'SUPER_ADMIN'), getPayments);
router.patch('/:id/status', restrictTo('ADMIN', 'SUPER_ADMIN'), approvePayment);

export default router;
