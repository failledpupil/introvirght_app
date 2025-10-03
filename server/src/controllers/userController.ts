import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { AuthUtils } from '../utils/auth';

export class UserController {
  /**
   * Get user profile by username
   */
  static async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const { username } = req.params;

      if (!username) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_USERNAME',
            message: 'Username is required',
          },
        });
        return;
      }

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
      console.error('Get user profile error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_PROFILE_FAILED',
          message: 'Failed to fetch user profile',
        },
      });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
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

      const { bio } = req.body;

      // Validate bio if provided
      if (bio !== undefined) {
        if (typeof bio !== 'string') {
          res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_BIO',
              message: 'Bio must be a string',
            },
          });
          return;
        }

        if (bio.length > 160) {
          res.status(400).json({
            success: false,
            error: {
              code: 'BIO_TOO_LONG',
              message: 'Bio must be no more than 160 characters',
            },
          });
          return;
        }
      }

      // Update user profile
      const updatedUser = await UserModel.update(req.user.id, {
        bio: bio?.trim() || undefined,
      });

      if (!updatedUser) {
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
      const stats = await UserModel.getUserStats(updatedUser.id);

      res.json({
        success: true,
        data: {
          ...updatedUser,
          ...stats,
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_PROFILE_FAILED',
          message: 'Failed to update profile',
        },
      });
    }
  }
}