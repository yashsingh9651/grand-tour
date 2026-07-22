import { prisma } from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import emailService from './email.service';
import crypto from 'crypto';

// Generate JWT Token
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "7d"
  });
};

const generateSecureOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashOtp = (otp: string) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

class AuthService {
  async registerUser(userData: any) {
    const { email, password, firstName, lastName, profileImage, role } = userData;

    // Check if user already exists
    const userExists = await prisma.user.findUnique({
      where: { email }
    });

    if (userExists) {
      const error: any = new Error('User already exists');
      error.statusCode = 400;
      throw error;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP
    const otp = generateSecureOtp();
    const hashedOtp = hashOtp(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60000); // 10 minutes

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        profileImage: profileImage || null,
        password: hashedPassword,
        role: 'STUDENT',
        isVerified: false,
        otp: hashedOtp,
        otpExpiry
      }
    });

    // Send OTP asynchronously
    emailService.sendOtpEmail(email, otp).catch(console.error);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      role: user.role,
      token: generateToken(user.id)
    };
  }

  async loginUser(credentials: any) {
    const { email, password } = credentials;

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (user && user.isActive === false) {
      const error: any = new Error('Your account has been disabled. Please contact support.');
      error.statusCode = 403;
      throw error;
    }

    // Check password
    if (user?.password && await bcrypt.compare(password, user.password)) {
      if (!user.isVerified) {
        const error: any = new Error('Please verify your email first');
        error.statusCode = 403;
        throw error;
      }
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        role: user.role,
        token: generateToken(user.id)
      };
    } else {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }
  }

  async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        role: true,
        createdAt: true,
        isActive: true
      }
    });

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (user.isActive === false) {
      const error: any = new Error('Your account is disabled');
      error.statusCode = 403;
      throw error;
    }

    return user;
  }

  async googleLoginUser(userData: any) {
    const { email, firstName, lastName, profileImage } = userData;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      const error: any = new Error('Invalid or missing Google authentication credentials.');
      error.statusCode = 400;
      throw error;
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (user && user.isActive === false) {
      const error: any = new Error('Your account has been disabled. Please contact support.');
      error.statusCode = 403;
      throw error;
    }

    if (!user) {
      // Create user without password with strict STUDENT role
      user = await prisma.user.create({
        data: {
          firstName: firstName || 'User',
          lastName: lastName || '',
          profileImage: profileImage || null,
          email: email.toLowerCase().trim(),
          role: 'STUDENT',
          isVerified: true,
          isActive: true,
        }
      });
    } else if (profileImage && !user.profileImage) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { profileImage }
      });
    }


    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      role: user.role,
      token: generateToken(user.id)
    };
  }

  async sendOtp(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (user.isActive === false) {
      const error: any = new Error('Your account has been disabled. Please contact support.');
      error.statusCode = 403;
      throw error;
    }

    const otp = generateSecureOtp();
    const hashedOtp = hashOtp(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60000);

    await prisma.user.update({
      where: { email },
      data: { otp: hashedOtp, otpExpiry }
    });

    await emailService.sendOtpEmail(email, otp);
    return { success: true, message: 'OTP sent successfully' };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (user.isActive === false) {
      const error: any = new Error('Your account has been disabled. Please contact support.');
      error.statusCode = 403;
      throw error;
    }

    const hashedInput = hashOtp(otp);
    if (!user.otp || user.otp !== hashedInput) {
      const error: any = new Error('Invalid OTP');
      error.statusCode = 401;
      throw error;
    }

    if (user.otpExpiry && new Date() > user.otpExpiry) {
      const error: any = new Error('OTP has expired');
      error.statusCode = 401;
      throw error;
    }

    const wasVerified = user.isVerified;

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        otp: null,
        otpExpiry: null
      }
    });

    if (!wasVerified && updatedUser.role === 'STUDENT') {
      const portalUrl = process.env.PORTAL_URL || 'http://localhost:3000/login';
      emailService.sendEmail(updatedUser.email, 'WELCOME_PORTAL', {
        'First Name': updatedUser.firstName || 'Student',
        'portalUrl': portalUrl
      }).catch((err) => console.error('Failed to send WELCOME_PORTAL email:', err));

      emailService.sendEmail(updatedUser.email, 'PROFILE_BUILD', {
        'First Name': updatedUser.firstName || 'Student',
        'portalUrl': portalUrl
      }).catch((err) => console.error('Failed to send PROFILE_BUILD email:', err));
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      profileImage: updatedUser.profileImage,
      role: updatedUser.role,
      token: generateToken(updatedUser.id)
    };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return generic success to prevent email enumeration
      return { success: true, message: 'If this email is registered, a password reset code has been sent.' };
    }

    if (user.isActive === false) {
      const error: any = new Error('Your account has been disabled. Please contact support.');
      error.statusCode = 403;
      throw error;
    }

    const otp = generateSecureOtp();
    const hashedOtp = hashOtp(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60000); // 10 minutes

    await prisma.user.update({
      where: { email },
      data: { otp: hashedOtp, otpExpiry }
    });

    await emailService.sendPasswordResetEmail(email, otp);
    return { success: true, message: 'If this email is registered, a password reset code has been sent.' };
  }

  async resetPassword(data: any) {
    const { email, otp, newPassword } = data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const hashedInput = hashOtp(otp);
    if (!user.otp || user.otp !== hashedInput) {
      const error: any = new Error('Invalid OTP');
      error.statusCode = 401;
      throw error;
    }

    if (user.otpExpiry && new Date() > user.otpExpiry) {
      const error: any = new Error('OTP has expired');
      error.statusCode = 401;
      throw error;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiry: null,
        isVerified: true
      }
    });

    return { success: true, message: 'Password has been reset successfully' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      const error: any = new Error('Incorrect current password');
      error.statusCode = 400;
      throw error;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return { success: true, message: 'Password has been changed successfully' };
  }
}

export default new AuthService();
