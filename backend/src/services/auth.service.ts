import { prisma } from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import emailService from './email.service';

// Generate JWT Token
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "7d"
  });
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
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60000); // 10 minutes

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        profileImage: profileImage || null,
        password: hashedPassword,
        role: (role as Role) || 'STUDENT',
        isVerified: false,
        otp,
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
        createdAt: true
      }
    });

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  async googleLoginUser(userData: any) {
    const { email, firstName, lastName, profileImage } = userData;

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Create user without password (Google already verifies the email)
      user = await prisma.user.create({
        data: {
          firstName: firstName || 'User',
          lastName: lastName || '',
          profileImage: profileImage || null,
          email,
          role: 'STUDENT',
          isVerified: true,
        }
      });
    } else if (profileImage && !user.profileImage) {
      // Opt: update the user with image if missing
      user = await prisma.user.update({
        where: { email },
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

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60000);

    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiry }
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

    if (!user.otp || user.otp !== otp) {
      const error: any = new Error('Invalid OTP');
      error.statusCode = 401;
      throw error;
    }

    if (user.otpExpiry && new Date() > user.otpExpiry) {
      const error: any = new Error('OTP has expired');
      error.statusCode = 401;
      throw error;
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        otp: null,
        otpExpiry: null
      }
    });

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
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60000); // 10 minutes

    await prisma.user.update({
      where: { email },
      data: { otp, otpExpiry }
    });

    await emailService.sendPasswordResetEmail(email, otp);
    return { success: true, message: 'Password reset OTP sent successfully' };
  }

  async resetPassword(data: any) {
    const { email, otp, newPassword } = data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (!user.otp || user.otp !== otp) {
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
}

export default new AuthService();
