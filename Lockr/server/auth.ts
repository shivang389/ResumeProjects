import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { storage } from './storage';
import { sendOTPEmail } from './email';
import type { LoginData, OTPVerification } from '@shared/schema';

const SALT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 3;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

export class AuthService {
  async registerUser(email: string, password: string, firstName?: string, lastName?: string) {
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await storage.createUser({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    await storage.logSecurityEvent({
      userId: user.id,
      email: user.email,
      action: 'USER_REGISTRATION',
      details: 'New user registered',
      success: true,
    });

    return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };
  }

  async initiateLogin(loginData: LoginData, ipAddress?: string, userAgent?: string) {
    const { email, password } = loginData;

    const user = await storage.getUserByEmail(email);
    if (!user) {
      await storage.logSecurityEvent({
        email,
        action: 'LOGIN_ATTEMPT',
        details: 'User not found',
        ipAddress,
        userAgent,
        success: false,
      });
      throw new Error('Invalid credentials');
    }

    // Check if user is locked
    if (user.isLocked) {
      const lockoutExpiry = new Date(user.lastFailedAttempt!.getTime() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
      if (new Date() < lockoutExpiry) {
        await storage.logSecurityEvent({
          userId: user.id,
          email,
          action: 'LOGIN_ATTEMPT',
          details: 'Account locked',
          ipAddress,
          userAgent,
          success: false,
        });
        throw new Error('Account is locked due to too many failed attempts');
      } else {
        // Unlock expired lockout
        await storage.unlockUser(email);
      }
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const newFailedAttempts = (user.failedAttempts || 0) + 1;
      await storage.updateFailedAttempts(email, newFailedAttempts);

      if (newFailedAttempts >= MAX_LOGIN_ATTEMPTS) {
        await storage.lockUser(email);
      }

      await storage.logSecurityEvent({
        userId: user.id,
        email,
        action: 'LOGIN_ATTEMPT',
        details: `Invalid password - attempt ${newFailedAttempts}`,
        ipAddress,
        userAgent,
        success: false,
      });

      throw new Error('Invalid credentials');
    }

    // Generate and send OTP
    const otpCode = this.generateOTPCode();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await storage.createOTP(email, otpCode, expiresAt);
    await sendOTPEmail(email, otpCode);

    await storage.logSecurityEvent({
      userId: user.id,
      email,
      action: 'OTP_SENT',
      details: 'OTP sent to email',
      ipAddress,
      userAgent,
      success: true,
    });

    return { message: 'OTP sent to your email', email };
  }

  async verifyOTP(otpData: OTPVerification, ipAddress?: string, userAgent?: string) {
    const { email, code } = otpData;

    // Clean up expired OTPs
    await storage.cleanupExpiredOTPs();

    const user = await storage.getUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const otp = await storage.getValidOTP(email, code);
    if (!otp) {
      await storage.logSecurityEvent({
        userId: user.id,
        email,
        action: 'OTP_VERIFICATION',
        details: 'Invalid or expired OTP',
        ipAddress,
        userAgent,
        success: false,
      });
      throw new Error('Invalid or expired OTP');
    }

    // Check OTP attempt limit
    if (otp.attempts >= MAX_OTP_ATTEMPTS) {
      await storage.logSecurityEvent({
        userId: user.id,
        email,
        action: 'OTP_VERIFICATION',
        details: 'Maximum OTP attempts exceeded',
        ipAddress,
        userAgent,
        success: false,
      });
      throw new Error('Maximum OTP attempts exceeded');
    }

    // Mark OTP as used and reset failed attempts
    await storage.markOTPAsUsed(otp.id);
    await storage.updateUser(user.id, {
      failedAttempts: 0,
      lastFailedAttempt: null,
      lastLogin: new Date(),
    });

    await storage.logSecurityEvent({
      userId: user.id,
      email,
      action: 'LOGIN_SUCCESS',
      details: 'Successful OTP verification',
      ipAddress,
      userAgent,
      success: true,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        lastLogin: user.lastLogin,
      },
    };
  }

  async resendOTP(email: string, ipAddress?: string, userAgent?: string) {
    const user = await storage.getUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const otpCode = this.generateOTPCode();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await storage.createOTP(email, otpCode, expiresAt);
    await sendOTPEmail(email, otpCode);

    await storage.logSecurityEvent({
      userId: user.id,
      email,
      action: 'OTP_RESENT',
      details: 'OTP resent to email',
      ipAddress,
      userAgent,
      success: true,
    });

    return { message: 'New OTP sent to your email' };
  }

  private generateOTPCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  async getUserProfile(userId: number) {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      lastLogin: user.lastLogin,
    };
  }
}

export const authService = new AuthService();
