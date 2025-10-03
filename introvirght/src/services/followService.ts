import type { User, FollowWithUser, FollowStats, ApiResponse } from '../types';

// API base URL - points to our backend server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Follow service class for handling follow-related API calls
export class FollowService {
  // Follow a user
  static async followUser(userId: string): Promise<ApiResponse<{ following: boolean; followerCount: number }>> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'FOLLOW_FAILED', message: 'Failed to follow user' },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server',
        },
      };
    }
  }

  // Unfollow a user
  static async unfollowUser(userId: string): Promise<ApiResponse<{ following: boolean; followerCount: number }>> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}/follow`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'UNFOLLOW_FAILED', message: 'Failed to unfollow user' },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server',
        },
      };
    }
  }

  // Get user's followers
  static async getFollowers(userId: string, page: number = 1, limit: number = 20): Promise<ApiResponse<{ followers: FollowWithUser[]; hasMore: boolean }>> {
    try {
      const token = localStorage.getItem('authToken');
      const offset = (page - 1) * limit;
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}/followers?limit=${limit}&offset=${offset}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'FETCH_FOLLOWERS_FAILED', message: 'Failed to fetch followers' },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server',
        },
      };
    }
  }

  // Get users that a user is following
  static async getFollowing(userId: string, page: number = 1, limit: number = 20): Promise<ApiResponse<{ following: FollowWithUser[]; hasMore: boolean }>> {
    try {
      const token = localStorage.getItem('authToken');
      const offset = (page - 1) * limit;
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}/following?limit=${limit}&offset=${offset}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'FETCH_FOLLOWING_FAILED', message: 'Failed to fetch following' },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server',
        },
      };
    }
  }

  // Get follow statistics for a user
  static async getFollowStats(userId: string): Promise<ApiResponse<FollowStats>> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}/follow-stats`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'FETCH_STATS_FAILED', message: 'Failed to fetch follow stats' },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server',
        },
      };
    }
  }

  // Get suggested users to follow
  static async getSuggestedUsers(limit: number = 10): Promise<ApiResponse<{ users: User[] }>> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/users/suggestions?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'FETCH_SUGGESTIONS_FAILED', message: 'Failed to fetch suggestions' },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server',
        },
      };
    }
  }

  // Get mutual follows
  static async getMutualFollows(userId: string, page: number = 1, limit: number = 20): Promise<ApiResponse<{ mutualFollows: FollowWithUser[]; hasMore: boolean }>> {
    try {
      const token = localStorage.getItem('authToken');
      const offset = (page - 1) * limit;
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}/mutual-follows?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'FETCH_MUTUAL_FAILED', message: 'Failed to fetch mutual follows' },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server',
        },
      };
    }
  }

  // Get follow activity (recent follows from network)
  static async getFollowActivity(page: number = 1, limit: number = 20): Promise<ApiResponse<{ activity: FollowWithUser[]; hasMore: boolean }>> {
    try {
      const token = localStorage.getItem('authToken');
      const offset = (page - 1) * limit;
      
      const response = await fetch(`${API_BASE_URL}/users/follow-activity?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'FETCH_ACTIVITY_FAILED', message: 'Failed to fetch follow activity' },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server',
        },
      };
    }
  }

  // Check if current user follows a specific user
  static async checkFollowStatus(userId: string): Promise<ApiResponse<{ isFollowing: boolean; isFollowedBy: boolean }>> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}/follow-status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'CHECK_STATUS_FAILED', message: 'Failed to check follow status' },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server',
        },
      };
    }
  }
}