import { Router } from 'express';
import { register, login, getMe, googleLogin, sendOtp, verifyOtp, forgotPassword, resetPassword, changePassword } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate, registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/auth.validator';
import { rateLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

const authRateLimiter = rateLimiter(10, 60 * 1000); // 10 requests per minute
const otpRateLimiter = rateLimiter(5, 60 * 1000);    // 5 requests per minute

// Auth Routes
router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/google', authRateLimiter, googleLogin);
router.post('/send-otp', otpRateLimiter, sendOtp);
router.post('/verify-otp', authRateLimiter, verifyOtp);
router.post('/forgot-password', otpRateLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), resetPassword);
router.post('/change-password', requireAuth, changePassword);
router.get('/me', requireAuth, getMe);

export default router;
