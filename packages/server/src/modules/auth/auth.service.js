import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from './user.model.js';
import { ConflictError, UnauthorizedError, BadRequestError } from '../../utils/errors.js';
import { sendEmail } from '../../utils/mailer.js';

export class AuthService {
  static generateAccessToken(user) {
    const secret = process.env.JWT_ACCESS_SECRET || 'access_secret_key_change_in_production';
    const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    return jwt.sign(
      {
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      secret,
      { expiresIn }
    );
  }

  static generateRefreshToken(user) {
    const secret = process.env.JWT_REFRESH_SECRET || 'refresh_secret_key_change_in_production';
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    return jwt.sign(
      {
        sub: user._id.toString(),
      },
      secret,
      { expiresIn }
    );
  }

  static async register(userData) {
    const { email, password, role, profile } = userData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const user = await User.create({
      email,
      password,
      role,
      profile,
    });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    // Send welcome email
    await sendEmail({
      to: user.email,
      subject: 'Welcome to ZenithBazaar!',
      html: `<h2>Welcome, ${profile.firstName}!</h2><p>Your account has been successfully created on ZenithBazaar. Start exploring products and managing your orders today.</p>`,
      text: `Welcome, ${profile.firstName}! Your account has been successfully created on ZenithBazaar.`,
    });

    return {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isVerified: user.isVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  static async login(credentials) {
    const { email, password } = credentials;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check account lockout
    if (user.isLocked) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      throw new UnauthorizedError(`Account is temporarily locked due to multiple failed login attempts. Try again in ${remainingTime} minutes.`);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
      }
      await user.save();
      throw new UnauthorizedError('Invalid email or password');
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0 || user.lockUntil) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isVerified: user.isVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refreshTokens(incomingRefreshToken) {
    if (!incomingRefreshToken) {
      throw new UnauthorizedError('Refresh token is required');
    }

    const secret = process.env.JWT_REFRESH_SECRET || 'refresh_secret_key_change_in_production';
    let decoded;
    try {
      decoded = jwt.verify(incomingRefreshToken, secret);
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.sub).select('+refreshToken');
    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new UnauthorizedError('Refresh token is invalid or has been revoked');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    return {
      accessToken,
      refreshToken,
    };
  }

  static async logout(userId) {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
    return true;
  }

  static async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      // Return success silently for security to prevent email enumeration
      return { message: 'If the email exists, a password reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${email}`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request - ZenithBazaar',
      html: `<h2>Password Reset</h2><p>You requested a password reset. Click the link below to reset your password (valid for 30 minutes):</p><a href="${resetUrl}">${resetUrl}</a><p>If you didn't request this, please ignore this email.</p>`,
      text: `Password Reset Request: ${resetUrl}`,
    });

    return { message: 'If the email exists, a password reset link has been sent.' };
  }

  static async resetPassword(email, token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      email,
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      throw new BadRequestError('Invalid or expired password reset token');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Password Successfully Reset - ZenithBazaar',
      html: `<h2>Password Reset Successful</h2><p>Your ZenithBazaar account password has been successfully reset.</p>`,
      text: `Your ZenithBazaar account password has been successfully reset.`,
    });

    return { message: 'Password reset successful' };
  }
}
