import type { User, ApiResponse } from '../types';

// Follow service class for handling follow-related operations (client-side)
export class FollowService {
  /**
   * Helper method to get stored follows from localStorage
   */
  private static getStoredFollows(): { following: string[]; followers: string[] } {
    try {
      const stored = localStorage.getItem('userFollows');
      if (!stored) return { following: [], followers: [] };
      
      return JSON.parse(stored);
    } catch {
      return { following: [], followers: [] };
    }
  }

  /**
   * Helper method to store follows to localStorage
   */
  private static storeFollows(follows: { following: string[]; followers: string[] }): void {
    localStorage.setItem('userFollows', JSON.stringify(follows));
  }

  // Follow a user (client-side)
  static async followUser(userId: string): Promise<ApiResponse<{ isFollowing: boolean; followerCount: number }>> {
    try {
      console.log('✅ Client-side followUser:', userId);
      
      const follows = this.getStoredFollows();
      
      if (!follows.following.includes(userId)) {
        follows.following.push(userId);
        this.storeFollows(follows);
      }

      return {
        success: true,
        data: {
          isFollowing: true,
          followerCount: follows.followers.length + 1, // Demo count
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to follow user',
        },
      };
    }
  }

  // Unfollow a user (client-side)
  static async unfollowUser(userId: string): Promise<ApiResponse<{ isFollowing: boolean; followerCount: number }>> {
    try {
      console.log('✅ Client-side unfollowUser:', userId);
      
      const follows = this.getStoredFollows();
      follows.following = follows.following.filter(id => id !== userId);
      this.storeFollows(follows);

      return {
        success: true,
        data: {
          isFollowing: false,
          followerCount: Math.max(0, follows.followers.length - 1), // Demo count
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to unfollow user',
        },
      };
    }
  }

  // Get user's followers (client-side)
  static async getFollowers(userId: string, page: number = 1, limit: number = 20): Promise<ApiResponse<{ users: User[]; hasMore: boolean }>> {
    try {
      console.log('✅ Client-side getFollowers for:', userId);
      
      // Return demo followers
      const demoFollowers: User[] = [
        {
          id: 'demo-follower-1',
          username: 'follower1',
          email: 'follower1@example.com',
          bio: 'Demo follower',
          createdAt: new Date(),
          updatedAt: new Date(),
          followerCount: 5,
          followingCount: 10,
          postCount: 3,
        }
      ];

      return {
        success: true,
        data: {
          users: demoFollowers,
          hasMore: false,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to fetch followers',
        },
      };
    }
  }

  // Get users that a user is following (client-side)
  static async getFollowing(userId: string, page: number = 1, limit: number = 20): Promise<ApiResponse<{ users: User[]; hasMore: boolean }>> {
    try {
      console.log('✅ Client-side getFollowing for:', userId);
      
      const follows = this.getStoredFollows();
      
      // Convert following IDs to demo user objects
      const followingUsers: User[] = follows.following.map((id, index) => ({
        id,
        username: `user${index + 1}`,
        email: `user${index + 1}@example.com`,
        bio: 'Demo user you are following',
        createdAt: new Date(),
        updatedAt: new Date(),
        followerCount: Math.floor(Math.random() * 100),
        followingCount: Math.floor(Math.random() * 50),
        postCount: Math.floor(Math.random() * 20),
      }));

      return {
        success: true,
        data: {
          users: followingUsers,
          hasMore: false,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to fetch following',
        },
      };
    }
  }

  // Get follow statistics (client-side)
  static async getFollowStats(userId: string): Promise<ApiResponse<{ followerCount: number; followingCount: number }>> {
    try {
      console.log('✅ Client-side getFollowStats for:', userId);
      
      const follows = this.getStoredFollows();

      return {
        success: true,
        data: {
          followerCount: follows.followers.length,
          followingCount: follows.following.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to fetch follow stats',
        },
      };
    }
  }

  // Get suggested users to follow (client-side)
  static async getSuggestedUsers(limit: number = 10): Promise<ApiResponse<{ users: User[] }>> {
    try {
      console.log('✅ Client-side getSuggestedUsers, limit:', limit);
      
      // Return demo suggested users
      const suggestedUsers: User[] = [
        {
          id: 'suggested-1',
          username: 'mindful_writer',
          email: 'mindful@example.com',
          bio: 'Sharing thoughts on mindfulness and personal growth',
          createdAt: new Date(),
          updatedAt: new Date(),
          followerCount: 150,
          followingCount: 75,
          postCount: 42,
        },
        {
          id: 'suggested-2',
          username: 'reflection_daily',
          email: 'reflect@example.com',
          bio: 'Daily reflections and insights for better living',
          createdAt: new Date(),
          updatedAt: new Date(),
          followerCount: 89,
          followingCount: 120,
          postCount: 28,
        },
      ];

      return {
        success: true,
        data: {
          users: suggestedUsers.slice(0, limit),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to fetch suggested users',
        },
      };
    }
  }

  // Get mutual follows (client-side)
  static async getMutualFollows(userId: string, page: number = 1, limit: number = 20): Promise<ApiResponse<{ users: User[]; hasMore: boolean }>> {
    try {
      console.log('✅ Client-side getMutualFollows for:', userId);
      
      // Return empty for demo
      return {
        success: true,
        data: {
          users: [],
          hasMore: false,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to fetch mutual follows',
        },
      };
    }
  }

  // Get recent follow activity (client-side)
  static async getFollowActivity(page: number = 1, limit: number = 20): Promise<ApiResponse<{ activities: any[]; hasMore: boolean }>> {
    try {
      console.log('✅ Client-side getFollowActivity');
      
      // Return empty for demo
      return {
        success: true,
        data: {
          activities: [],
          hasMore: false,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to fetch follow activity',
        },
      };
    }
  }

  // Check if current user is following another user (client-side)
  static async getFollowStatus(userId: string): Promise<ApiResponse<{ isFollowing: boolean; isFollowedBy: boolean }>> {
    try {
      console.log('✅ Client-side getFollowStatus for:', userId);
      
      const follows = this.getStoredFollows();
      const isFollowing = follows.following.includes(userId);
      const isFollowedBy = follows.followers.includes(userId);

      return {
        success: true,
        data: {
          isFollowing,
          isFollowedBy,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to check follow status',
        },
      };
    }
  }
}