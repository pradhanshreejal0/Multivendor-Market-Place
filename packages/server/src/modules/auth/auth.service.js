import jwt from 'jsonwebtoken';
import { User } from './user.model.js';
import { ConflictError, UnauthorizedError, BadRequestError } from '../../utils/errors.js';

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

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
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
}
