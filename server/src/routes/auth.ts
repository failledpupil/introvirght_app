import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import {
  authenticateToken,
  rateLimitAuth,
  validateRequiredFields,
  sanitizeInput
} from '../middleware/auth';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  // rateLimitAuth(5, 15 * 60 * 1000), // Temporarily disabled for testing
  validateRequiredFields(['username', 'email', 'password']),
  sanitizeInput(['username', 'email', 'bio']),
  AuthController.register
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  // rateLimitAuth(5, 15 * 60 * 1000), // Temporarily disabled for testing
  validateRequiredFields(['email', 'password']),
  sanitizeInput(['email']),
  AuthController.login
);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get(
  '/me',
  authenticateToken,
  AuthController.getCurrentUser
);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post(
  '/logout',
  AuthController.logout
);

/**
 * GET /api/auth/check-username
 * Check username availability
 */
router.get(
  '/check-username',
  // rateLimitAuth(20, 5 * 60 * 1000), // Temporarily disabled for testing
  AuthController.checkUsername
);

export default router;