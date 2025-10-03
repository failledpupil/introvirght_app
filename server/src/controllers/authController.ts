import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { AuthUtils } from '../utils/auth';

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  bio?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, bio }: RegisterRequest = req.body;

      // Validate input
      const emailValid = AuthUtils.validateEmail(email);
      if (!emailValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_EMAIL',
            message: 'Please provide a valid email address',
          },
        });
        return;
      }

      const usernameValidation = AuthUtils.validateUsername(username);
      if (!usernameValidation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_USERNAME',
            message: usernameValidation.errors[0],
            details: { errors: usernameValidation.errors },
          },
        });
        return;
      }

      const passwordValidation = AuthUtils.validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_PASSWORD',
            message: passwordValidation.errors[0],
            details: { errors: passwordValidation.errors },
          },
        });
        return;
      }

      // Check if user already exists
      const [existingEmail, existingUsername] = await Promise.all([
        UserModel.checkEmailExists(email),
        UserModel.checkUsernameExists(username),
      ]);

      if (existingEmail) {
        res.status(409).json({
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'An account with this email already exists',
          },
        });
        return;
      }

      if (existingUsername) {
        res.status(409).json({
          success: false,
          error: {
            code: 'USERNAME_EXISTS',
            message: 'This username is already taken',
          },
        });
        return;
      }

      // Hash password and create user
      const passwordHash = await AuthUtils.hashPassword(password);
      const user = await UserModel.create({
        username,
        email,
        passwordHash,
        bio: bio?.trim() || undefined,
      });

      // Generate token
      const token = AuthUtils.generateToken(user);

      // Get user stats
      const stats = await UserModel.getUserStats(user.id);

      // Clear rate limit on successful registration
      AuthUtils.clearRateLimit(req.ip || 'unknown');

      res.status(201).json({
        success: true,
        data: {
          user: {
            ...user,
            ...stats,
          },
          token,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message: 'Registration failed. Please try again.',
        },
      });
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body;

      // Validate input
      if (!AuthUtils.validateEmail(email)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_EMAIL',
            message: 'Please provide a valid email address',
          },
        });
        return;
      }

      // Find user by email
      const userWithPassword = await UserModel.findByEmail(email);
      if (!userWithPassword) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        });
        return;
      }

      // Verify password
      const passwordValid = await AuthUtils.comparePassword(password, userWithPassword.passwordHash);
      if (!passwordValid) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        });
        return;
      }

      // Update last login time
      const user = await UserModel.update(userWithPassword.id, {
        lastLoginAt: new Date(),
      });

      if (!user) {
        throw new Error('Failed to update user login time');
      }

      // Generate token
      const token = AuthUtils.generateToken(user);

      // Get user stats
      const stats = await UserModel.getUserStats(user.id);

      // Clear rate limit on successful login
      AuthUtils.clearRateLimit(req.ip || 'unknown');

      res.json({
        success: true,
        data: {
          user: {
            ...user,
            ...stats,
          },
          token,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message: 'Login failed. Please try again.',
        },
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'User not authenticated',
          },
        });
        return;
      }

      const user = await UserModel.findById(req.user.id);
      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
        return;
      }

      // Get user stats
      const stats = await UserModel.getUserStats(user.id);

      res.json({
        success: true,
        data: {
          ...user,
          ...stats,
        },
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_USER_FAILED',
          message: 'Failed to fetch user profile',
        },
      });
    }
  }

  /**
   * Logout user (client-side token invalidation)
   */
  static async logout(req: Request, res: Response): Promise<void> {
    // In a JWT-based system, logout is typically handled client-side
    // by removing the token. We could implement a token blacklist here
    // if needed for enhanced security.
    
    res.json({
      success: true,
      data: {
        message: 'Logged out successfully',
      },
    });
  }

  /**
   * Check username availability
   */
  static async checkUsername(req: Request, res: Response): Promise<void> {
    try {
      const { username } = req.query;

      if (!username || typeof username !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_USERNAME',
            message: 'Username is required',
          },
        });
        return;
      }

      const usernameValidation = AuthUtils.validateUsername(username);
      if (!usernameValidation.isValid) {
        res.json({
          success: true,
          data: {
            available: false,
            reason: usernameValidation.errors[0],
          },
        });
        return;
      }

      const exists = await UserModel.checkUsernameExists(username);
      
      res.json({
        success: true,
        data: {
          available: !exists,
          reason: exists ? 'Username is already taken' : undefined,
        },
      });
    } catch (error) {
      console.error('Check username error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CHECK_USERNAME_FAILED',
          message: 'Failed to check username availability',
        },
      });
    }
  }
}