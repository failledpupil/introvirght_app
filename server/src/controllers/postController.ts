import { Request, Response } from 'express';
import { PostModel } from '../models/Post';
import { UserModel } from '../models/User';
import { 
  validatePostContent, 
  sanitizePostContent, 
  checkPostCreationLimit,
  validateSearchQuery 
} from '../utils/postValidation';

export interface CreatePostRequest {
  content: string;
}

export interface UpdatePostRequest {
  content: string;
}

export class PostController {
  /**
   * Create a new post
   */
  static async createPost(req: Request, res: Response): Promise<void> {
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

      const { content }: CreatePostRequest = req.body;

      // Validate content
      const validation = validatePostContent(content);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CONTENT',
            message: validation.errors[0],
            details: { errors: validation.errors },
          },
        });
        return;
      }

      // Check rate limiting
      const rateLimit = checkPostCreationLimit(req.user.id);
      if (!rateLimit.allowed) {
        const resetTimeMinutes = Math.ceil((rateLimit.resetTime - Date.now()) / 60000);
        res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Too many posts created. Please try again in ${resetTimeMinutes} minutes.`,
            details: {
              resetTime: rateLimit.resetTime,
            },
          },
        });
        return;
      }

      // Sanitize content
      const sanitizedContent = sanitizePostContent(content);

      // Create the post
      const post = await PostModel.create({
        content: sanitizedContent,
        authorId: req.user.id,
      });

      // Get the post with full details
      const fullPost = await PostModel.findById(post.id, req.user.id);

      res.status(201).json({
        success: true,
        data: fullPost,
      });
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_POST_FAILED',
          message: 'Failed to create post',
        },
      });
    }
  }

  /**
   * Get user's feed posts
   */
  static async getFeedPosts(req: Request, res: Response): Promise<void> {
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

      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const offset = parseInt(req.query.offset as string) || 0;

      const posts = await PostModel.getFeedPosts(req.user.id, limit + 1, offset);
      const hasMore = posts.length > limit;
      
      if (hasMore) {
        posts.pop(); // Remove the extra post used for hasMore check
      }

      res.json({
        success: true,
        data: {
          posts,
          hasMore,
        },
      });
    } catch (error) {
      console.error('Get feed posts error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_FEED_FAILED',
          message: 'Failed to fetch feed posts',
        },
      });
    }
  }

  /**
   * Get recent posts (public timeline)
   */
  static async getRecentPosts(req: Request, res: Response): Promise<void> {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const offset = parseInt(req.query.offset as string) || 0;
      const currentUserId = req.user?.id;

      const posts = await PostModel.getRecentPosts(currentUserId, limit + 1, offset);
      const hasMore = posts.length > limit;
      
      if (hasMore) {
        posts.pop(); // Remove the extra post used for hasMore check
      }

      res.json({
        success: true,
        data: {
          posts,
          hasMore,
        },
      });
    } catch (error) {
      console.error('Get recent posts error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_POSTS_FAILED',
          message: 'Failed to fetch posts',
        },
      });
    }
  }

  /**
   * Get posts by user
   */
  static async getUserPosts(req: Request, res: Response): Promise<void> {
    try {
      const { username } = req.params;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const offset = parseInt(req.query.offset as string) || 0;
      const currentUserId = req.user?.id;

      // Find user by username
      const user = await UserModel.findByUsername(username);
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

      const posts = await PostModel.findByAuthor(user.id, currentUserId, limit + 1, offset);
      const hasMore = posts.length > limit;
      
      if (hasMore) {
        posts.pop(); // Remove the extra post used for hasMore check
      }

      res.json({
        success: true,
        data: {
          posts,
          hasMore,
        },
      });
    } catch (error) {
      console.error('Get user posts error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_USER_POSTS_FAILED',
          message: 'Failed to fetch user posts',
        },
      });
    }
  }

  /**
   * Get single post
   */
  static async getPost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const currentUserId = req.user?.id;

      const post = await PostModel.findById(postId, currentUserId);
      if (!post) {
        res.status(404).json({
          success: false,
          error: {
            code: 'POST_NOT_FOUND',
            message: 'Post not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: post,
      });
    } catch (error) {
      console.error('Get post error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_POST_FAILED',
          message: 'Failed to fetch post',
        },
      });
    }
  }

  /**
   * Update post
   */
  static async updatePost(req: Request, res: Response): Promise<void> {
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

      const { postId } = req.params;
      const { content }: UpdatePostRequest = req.body;

      // Check if post exists and user owns it
      const existingPost = await PostModel.findById(postId);
      if (!existingPost) {
        res.status(404).json({
          success: false,
          error: {
            code: 'POST_NOT_FOUND',
            message: 'Post not found',
          },
        });
        return;
      }

      if (existingPost.authorId !== req.user.id) {
        res.status(403).json({
          success: false,
          error: {
            code: 'NOT_AUTHORIZED',
            message: 'You can only edit your own posts',
          },
        });
        return;
      }

      // Check if post is still editable (within 15 minutes)
      const timeSinceCreation = Date.now() - existingPost.createdAt.getTime();
      const editTimeLimit = 15 * 60 * 1000; // 15 minutes
      
      if (timeSinceCreation > editTimeLimit) {
        res.status(403).json({
          success: false,
          error: {
            code: 'EDIT_TIME_EXPIRED',
            message: 'Posts can only be edited within 15 minutes of creation',
          },
        });
        return;
      }

      // Validate content
      const validation = validatePostContent(content);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CONTENT',
            message: validation.errors[0],
            details: { errors: validation.errors },
          },
        });
        return;
      }

      // Sanitize content
      const sanitizedContent = sanitizePostContent(content);

      // Update the post
      const updatedPost = await PostModel.update(postId, {
        content: sanitizedContent,
      });

      res.json({
        success: true,
        data: updatedPost,
      });
    } catch (error) {
      console.error('Update post error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_POST_FAILED',
          message: 'Failed to update post',
        },
      });
    }
  }

  /**
   * Delete post
   */
  static async deletePost(req: Request, res: Response): Promise<void> {
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

      const { postId } = req.params;

      // Check if post exists and user owns it
      const existingPost = await PostModel.findById(postId);
      if (!existingPost) {
        res.status(404).json({
          success: false,
          error: {
            code: 'POST_NOT_FOUND',
            message: 'Post not found',
          },
        });
        return;
      }

      if (existingPost.authorId !== req.user.id) {
        res.status(403).json({
          success: false,
          error: {
            code: 'NOT_AUTHORIZED',
            message: 'You can only delete your own posts',
          },
        });
        return;
      }

      // Delete the post
      const deleted = await PostModel.delete(postId);
      if (!deleted) {
        res.status(500).json({
          success: false,
          error: {
            code: 'DELETE_FAILED',
            message: 'Failed to delete post',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          message: 'Post deleted successfully',
        },
      });
    } catch (error) {
      console.error('Delete post error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_POST_FAILED',
          message: 'Failed to delete post',
        },
      });
    }
  }

  /**
   * Like/unlike post
   */
  static async toggleLike(req: Request, res: Response): Promise<void> {
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

      const { postId } = req.params;

      // Check if post exists
      const post = await PostModel.findById(postId, req.user.id);
      if (!post) {
        res.status(404).json({
          success: false,
          error: {
            code: 'POST_NOT_FOUND',
            message: 'Post not found',
          },
        });
        return;
      }

      let liked: boolean;
      if (post.isLikedByCurrentUser) {
        // Unlike the post
        await PostModel.unlike(postId, req.user.id);
        liked = false;
      } else {
        // Like the post
        await PostModel.like(postId, req.user.id);
        liked = true;
      }

      // Get updated stats
      const stats = await PostModel.getStats(postId);

      res.json({
        success: true,
        data: {
          liked,
          likeCount: stats.likeCount,
        },
      });
    } catch (error) {
      console.error('Toggle like error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'LIKE_FAILED',
          message: 'Failed to like/unlike post',
        },
      });
    }
  }

  /**
   * Repost/unrepost
   */
  static async toggleRepost(req: Request, res: Response): Promise<void> {
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

      const { postId } = req.params;

      // Check if post exists
      const post = await PostModel.findById(postId, req.user.id);
      if (!post) {
        res.status(404).json({
          success: false,
          error: {
            code: 'POST_NOT_FOUND',
            message: 'Post not found',
          },
        });
        return;
      }

      // Prevent self-repost
      if (post.authorId === req.user.id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'CANNOT_REPOST_OWN',
            message: 'You cannot repost your own posts',
          },
        });
        return;
      }

      let reposted: boolean;
      if (post.isRepostedByCurrentUser) {
        // Remove repost
        await PostModel.unrepost(postId, req.user.id);
        reposted = false;
      } else {
        // Create repost
        await PostModel.repost(postId, req.user.id);
        reposted = true;
      }

      // Get updated stats
      const stats = await PostModel.getStats(postId);

      res.json({
        success: true,
        data: {
          reposted,
          repostCount: stats.repostCount,
        },
      });
    } catch (error) {
      console.error('Toggle repost error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'REPOST_FAILED',
          message: 'Failed to repost/unrepost',
        },
      });
    }
  }

  /**
   * Search posts
   */
  static async searchPosts(req: Request, res: Response): Promise<void> {
    try {
      const { q: query } = req.query;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const offset = parseInt(req.query.offset as string) || 0;
      const currentUserId = req.user?.id;

      // Validate search query
      const validation = validateSearchQuery(query as string);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_QUERY',
            message: validation.errors[0],
            details: { errors: validation.errors },
          },
        });
        return;
      }

      const trimmedQuery = (query as string).trim();
      if (trimmedQuery.length === 0) {
        res.json({
          success: true,
          data: {
            posts: [],
            hasMore: false,
          },
        });
        return;
      }

      const posts = await PostModel.search(trimmedQuery, currentUserId, limit + 1, offset);
      const hasMore = posts.length > limit;
      
      if (hasMore) {
        posts.pop(); // Remove the extra post used for hasMore check
      }

      res.json({
        success: true,
        data: {
          posts,
          hasMore,
        },
      });
    } catch (error) {
      console.error('Search posts error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SEARCH_FAILED',
          message: 'Failed to search posts',
        },
      });
    }
  }
}