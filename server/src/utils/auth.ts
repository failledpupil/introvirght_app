import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
}

export class AuthUtils {
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  /**
   * Compare a password with its hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate a JWT token for a user
   */
  static generateToken(user: User): string {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'introvirght-api',
      audience: 'introvirght-client',
    } as jwt.SignOptions);
  }

  /**
   * Verify and decode a JWT token
   */
  static verifyToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'introvirght-api',
        audience: 'introvirght-client',
      }) as JwtPayload;

      return decoded;
    } catch (error) {
      console.error('Token verification error:', error);
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Generate a secure random string for various purposes
   */
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      errors.push('Password must be no more than 128 characters long');
    }

    if (!/[a-zA-Z]/.test(password)) {
      errors.push('Password must contain at least one letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Validate username format
   */
  static validateUsername(username: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }

    if (username.length > 20) {
      errors.push('Username must be no more than 20 characters long');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, and underscores');
    }

    // Check for reserved usernames
    const reservedUsernames = [
      'admin', 'root', 'api', 'www', 'mail', 'support', 'help', 
      'about', 'privacy', 'terms', 'contact', 'blog', 'news'
    ];
    
    if (reservedUsernames.includes(username.toLowerCase())) {
      errors.push('This username is not available');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitize user input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove < and > characters
      .trim(); // Remove leading/trailing whitespace
  }

  /**
   * Rate limiting helper - simple in-memory store
   */
  private static rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  static checkRateLimit(
    identifier: string, 
    maxAttempts: number = 5, 
    windowMs: number = 15 * 60 * 1000 // 15 minutes
  ): { allowed: boolean; remainingAttempts: number; resetTime: number } {
    const now = Date.now();
    const record = this.rateLimitStore.get(identifier);

    if (!record || now > record.resetTime) {
      // First attempt or window has reset
      const resetTime = now + windowMs;
      this.rateLimitStore.set(identifier, { count: 1, resetTime });
      return { allowed: true, remainingAttempts: maxAttempts - 1, resetTime };
    }

    if (record.count >= maxAttempts) {
      // Rate limit exceeded
      return { allowed: false, remainingAttempts: 0, resetTime: record.resetTime };
    }

    // Increment count
    record.count++;
    this.rateLimitStore.set(identifier, record);
    
    return { 
      allowed: true, 
      remainingAttempts: maxAttempts - record.count, 
      resetTime: record.resetTime 
    };
  }

  /**
   * Clear rate limit for an identifier (useful after successful login)
   */
  static clearRateLimit(identifier: string): void {
    this.rateLimitStore.delete(identifier);
  }
}