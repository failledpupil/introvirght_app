import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { FollowController } from '../controllers/followController';
import { authenticateToken, optionalAuth, sanitizeInput } from '../middleware/auth';

const router = Router();

/**
 * GET /api/users/:username
 * Get user profile by username
 */
router.get(
  '/:username',
  UserController.getUserProfile
);

/**
 * PUT /api/users/profile
 * Update current user's profile
 */
router.put(
  '/profile',
  authenticateToken,
  sanitizeInput(['bio']),
  UserController.updateProfile
);

/**
 * POST /api/users/:userId/follow
 * Follow a user
 */
router.post(
  '/:userId/follow',
  authenticateToken,
  FollowController.followUser
);

/**
 * DELETE /api/users/:userId/follow
 * Unfollow a user
 */
router.delete(
  '/:userId/follow',
  authenticateToken,
  FollowController.unfollowUser
);

/**
 * GET /api/users/:userId/followers
 * Get user's followers
 */
router.get(
  '/:userId/followers',
  optionalAuth,
  FollowController.getFollowers
);

/**
 * GET /api/users/:userId/following
 * Get users that user follows
 */
router.get(
  '/:userId/following',
  optionalAuth,
  FollowController.getFollowing
);

/**
 * GET /api/users/:userId/follow-stats
 * Get follow statistics
 */
router.get(
  '/:userId/follow-stats',
  optionalAuth,
  FollowController.getFollowStats
);

/**
 * GET /api/users/suggestions
 * Get suggested users to follow
 */
router.get(
  '/suggestions',
  authenticateToken,
  FollowController.getSuggestedUsers
);

export default router;