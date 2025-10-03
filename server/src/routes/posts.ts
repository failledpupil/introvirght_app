import { Router } from 'express';
import { PostController } from '../controllers/postController';
import { 
  authenticateToken, 
  optionalAuth, 
  validateRequiredFields, 
  sanitizeInput 
} from '../middleware/auth';

const router = Router();

/**
 * POST /api/posts
 * Create a new post
 */
router.post(
  '/',
  authenticateToken,
  validateRequiredFields(['content']),
  sanitizeInput(['content']),
  PostController.createPost
);

/**
 * GET /api/posts/feed
 * Get user's personalized feed
 */
router.get(
  '/feed',
  authenticateToken,
  PostController.getFeedPosts
);

/**
 * GET /api/posts/recent
 * Get recent posts (public timeline)
 */
router.get(
  '/recent',
  optionalAuth,
  PostController.getRecentPosts
);

/**
 * GET /api/posts/user/:username
 * Get posts by specific user
 */
router.get(
  '/user/:username',
  optionalAuth,
  PostController.getUserPosts
);

/**
 * GET /api/posts/search
 * Search posts by content
 */
router.get(
  '/search',
  optionalAuth,
  PostController.searchPosts
);

/**
 * GET /api/posts/:postId
 * Get single post by ID
 */
router.get(
  '/:postId',
  optionalAuth,
  PostController.getPost
);

/**
 * PUT /api/posts/:postId
 * Update post (within 15 minutes of creation)
 */
router.put(
  '/:postId',
  authenticateToken,
  validateRequiredFields(['content']),
  sanitizeInput(['content']),
  PostController.updatePost
);

/**
 * DELETE /api/posts/:postId
 * Delete post
 */
router.delete(
  '/:postId',
  authenticateToken,
  PostController.deletePost
);

/**
 * POST /api/posts/:postId/like
 * Like/unlike a post
 */
router.post(
  '/:postId/like',
  authenticateToken,
  PostController.toggleLike
);

/**
 * POST /api/posts/:postId/repost
 * Repost/unrepost a post
 */
router.post(
  '/:postId/repost',
  authenticateToken,
  PostController.toggleRepost
);

export default router;