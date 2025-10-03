import { Request, Response } from 'express';
import { FollowModel } from '../models/Follow';
import { UserModel } from '../models/User';

export class FollowController {
  /**
   * Follow a user
   */
  static async followUser(req: Request, res: Response): Promise<void> {
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

      const { userId } = req.params;

      // Check if target user exists
      const targetUser = await UserModel.findById(userId);
      if (!targetUser) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
        return;
      }

      // Prevent self-follow
      if (req.user.id === userId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'CANNOT_FOLLOW_SELF',
            message: 'You cannot follow yourself',
          },
        });
        return;
      }

      // Check if already following
      const existingFollow = await FollowModel.findRelationship(req.user.id, userId);
      if (existingFollow) {
        res.status(409).json({
          success: false,
          error: {
            code: 'ALREADY_FOLLOWING',
            message: 'You are already following this user',
          },
        });
        return;
      }

      // Create follow relationship
      await FollowModel.create(req.user.id, userId);

      // Get updated stats
      const stats = await FollowModel.getFollowStats(userId, req.user.id);

      res.status(201).json({
        success: true,
        data: {
          following: true,
          followerCount: stats.followerCount,
        },
      });
    } catch (error) {
      console.error('Follow user error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FOLLOW_FAILED',
          message: 'Failed to follow user',
        },
      });
    }
  }

  /**
   * Unfollow a user
   */
  static async unfollowUser(req: Request, res: Response): Promise<void> {
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

      const { userId } = req.params;

      // Check if target user exists
      const targetUser = await UserModel.findById(userId);
      if (!targetUser) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        });
        return;
      }

      // Check if currently following
      const existingFollow = await FollowModel.findRelationship(req.user.id, userId);
      if (!existingFollow) {
        res.status(409).json({
          success: false,
          error: {
            code: 'NOT_FOLLOWING',
            message: 'You are not following this user',
          },
        });
        return;
      }

      // Remove follow relationship
      await FollowModel.delete(req.user.id, userId);

      // Get updated stats
      const stats = await FollowModel.getFollowStats(userId, req.user.id);

      res.json({
        success: true,
        data: {
          following: false,
          followerCount: stats.followerCount,
        },
      });
    } catch (error) {
      console.error('Unfollow user error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UNFOLLOW_FAILED',
          message: 'Failed to unfollow user',
        },
      });
    }
  }

  /**
   * Get user's followers
   */
  static async getFollowers(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const offset = parseInt(req.query.offset as string) || 0;

      // Check if user exists
      const user = await UserModel.findById(userId);
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

      const followers = await FollowModel.getFollowers(userId, limit + 1, offset);
      const hasMore = followers.length > limit;
      
      if (hasMore) {
        followers.pop();
      }

      res.json({
        success: true,
        data: {
          followers,
          hasMore,
        },
      });
    } catch (error) {
      console.error('Get followers error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_FOLLOWERS_FAILED',
          message: 'Failed to fetch followers',
        },
      });
    }
  }

  /**
   * Get users that a user is following
   */
  static async getFollowing(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
      const offset = parseInt(req.query.offset as string) || 0;

      // Check if user exists
      const user = await UserModel.findById(userId);
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

      const following = await FollowModel.getFollowing(userId, limit + 1, offset);
      const hasMore = following.length > limit;
      
      if (hasMore) {
        following.pop();
      }

      res.json({
        success: true,
        data: {
          following,
          hasMore,
        },
      });
    } catch (error) {
      console.error('Get following error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_FOLLOWING_FAILED',
          message: 'Failed to fetch following',
        },
      });
    }
  }

  /**
   * Get follow statistics
   */
  static async getFollowStats(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const currentUserId = req.user?.id;

      // Check if user exists
      const user = await UserModel.findById(userId);
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

      const stats = await FollowModel.getFollowStats(userId, currentUserId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Get follow stats error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_STATS_FAILED',
          message: 'Failed to fetch follow stats',
        },
      });
    }
  }

  /**
   * Get suggested users to follow
   */
  static async getSuggestedUsers(req: Request, res: Response): Promise<void> {
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

      const limit = Math.min(parseInt(req.query.limit as string) || 10, 20);
      const users = await FollowModel.getSuggestedFollows(req.user.id, limit);

      res.json({
        success: true,
        data: {
          users,
        },
      });
    } catch (error) {
      console.error('Get suggested users error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_SUGGESTIONS_FAILED',
          message: 'Failed to fetch suggested users',
        },
      });
    }
  }
}