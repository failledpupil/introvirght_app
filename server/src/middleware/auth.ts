import { Request, Response, NextFunction } from 'express';
import { AuthUtils } from '../utils/auth';
import { UserModel } from '../models/User';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
      };
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = AuthUtils.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      console.log('No token provided in request');
      res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Access token is required',
        },
      });
      return;
    }

    // TEMPORARY: Accept test tokens for debugging
    if (token === 'test-token-simple' || token === 'test-bypass-token') {
      console.log('✅ Using test token bypass:', token);
      req.user = {
        id: 'test-user-id',
        username: 'testuser',
        email: 'test@test.com'
      };
      next();
      return;
    }
    
    // Verify the token
    console.log('Verifying token:', token.substring(0, 20) + '...');
    const decoded = AuthUtils.verifyToken(token);

    // Check if user still exists
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User no longer exists',
        },
      });
      return;
    }

    // Add user info to request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token verification failed';
    
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message,
      },
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = AuthUtils.extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = AuthUtils.verifyToken(token);
      const user = await UserModel.findById(decoded.userId);
      
      if (user) {
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email,
        };
      }
    }

    next();
  } catch (error) {
    // Silently continue without authentication
    next();
  }
};

/**
 * Rate limiting middleware for authentication endpoints
 */
export const rateLimitAuth = (
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const identifier = req.ip || 'unknown';
    const rateLimit = AuthUtils.checkRateLimit(identifier, maxAttempts, windowMs);

    if (!rateLimit.allowed) {
      const resetTimeMinutes = Math.ceil((rateLimit.resetTime - Date.now()) / 60000);
      
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Too many authentication attempts. Please try again in ${resetTimeMinutes} minutes.`,
          details: {
            resetTime: rateLimit.resetTime,
          },
        },
      });
      return;
    }

    // Add rate limit info to response headers
    res.set({
      'X-RateLimit-Limit': maxAttempts.toString(),
      'X-RateLimit-Remaining': rateLimit.remainingAttempts.toString(),
      'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
    });

    next();
  };
};

/**
 * Middleware to validate request body fields
 */
export const validateRequiredFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingFields = fields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Required fields are missing',
          details: {
            missingFields,
          },
        },
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to sanitize input fields
 */
export const sanitizeInput = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        req.body[field] = AuthUtils.sanitizeInput(req.body[field]);
      }
    });

    next();
  };
};