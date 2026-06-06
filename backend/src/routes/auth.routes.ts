import { Router } from 'express';
import { register, login, getMe, googleLogin, sendOtp, verifyOtp, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate, registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator';

const router = Router();

// Auth Routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/google', googleLogin);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.get('/me', requireAuth, getMe);

export default router;
