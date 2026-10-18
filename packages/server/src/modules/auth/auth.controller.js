import { AuthService } from './auth.service.js';
import { registerSchema, loginSchema } from '@marketplace/shared';
import { ValidationError } from '../../utils/errors.js';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export class AuthController {
  static async register(req, res, next) {
    try {
      const result = registerSchema.safeParse(req.body);
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        throw new ValidationError('Validation failed', errors);
      }

      const { user, accessToken, refreshToken } = await AuthService.register(result.data);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        status: 'success',
        data: {
          user,
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        throw new ValidationError('Validation failed', errors);
      }

      const { user, accessToken, refreshToken } = await AuthService.login(result.data);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        status: 'success',
        data: {
          user,
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req, res, next) {
    try {
      const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

      const { accessToken, refreshToken } = await AuthService.refreshTokens(incomingRefreshToken);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        status: 'success',
        data: {
          accessToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      if (req.user) {
        await AuthService.logout(req.user._id);
      }

      res.clearCookie('refreshToken');

      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req, res, next) {
    try {
      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: req.user._id,
            email: req.user.email,
            role: req.user.role,
            profile: req.user.profile,
            isVerified: req.user.isVerified,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      const result = forgotPasswordSchema.safeParse(req.body);
      if (!result.success) {
        throw new ValidationError('Validation failed', result.error.errors);
      }

      const response = await AuthService.forgotPassword(result.data.email);
      res.status(200).json({ status: 'success', ...response });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const result = resetPasswordSchema.safeParse(req.body);
      if (!result.success) {
        throw new ValidationError('Validation failed', result.error.errors);
      }

      const { email, token, newPassword } = result.data;
      const response = await AuthService.resetPassword(email, token, newPassword);
      res.status(200).json({ status: 'success', ...response });
    } catch (error) {
      next(error);
    }
  }
}
