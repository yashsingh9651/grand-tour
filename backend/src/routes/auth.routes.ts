import { Router } from 'express';
import { register, login, getMe, googleLogin, sendOtp, verifyOtp } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate, registerSchema, loginSchema } from '../validators/auth.validator';

const router = Router();

// Auth Routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/google', googleLogin);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', requireAuth, getMe);

export default router;
