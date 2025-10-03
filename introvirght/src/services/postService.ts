import type { Post, CreatePostData, UpdatePostData, ApiResponse } from '../types';

// API base URL - points to our backend server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Post service class for handling post-related API calls
export class PostService {
  // Create a new post
  static async createPost(postData: CreatePostData): Promise<ApiResponse<Post>> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'CREATE_POST_FAILED', message: 'Failed to create post' },
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

  // Get user's feed posts
  static async getFeedPosts(page: number = 1, limit: number = 20): Promise<ApiResponse<{ posts: Post[]; hasMore: boolean }>> {
    try {
      const token = localStorage.getItem('authToken');
      

      
      const offset = (page - 1) * limit;
      
      const response = await fetch(`${API_BASE_URL}/posts/feed?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'FETCH_FEED_FAILED', message: 'Failed to fetch feed' },
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

  // Get recent posts (public timeline)
  static async getRecentPosts(page: number = 1, limit: number = 20): Promise<ApiResponse<{ posts: Post[]; hasMore: boolean }>> {
    try {
      const token = localStorage.getItem('authToken');
      

      
      const offset = (page - 1) * limit;
      
      const response = await fetch(`${API_BASE_URL}/posts/recent?limit=${limit}&offset=${offset}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'FETCH_POSTS_FAILED', message: 'Failed to fetch posts' },
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

  // Get posts by user
  static async getUserPosts(username: string, page: number = 1, limit: number = 20): Promise<ApiResponse<{ posts: Post[]; hasMore: boolean }>> {
    try {
      const token = localStorage.getItem('authToken');
      const offset = (page - 1) * limit;
      
      const response = await fetch(`${API_BASE_URL}/posts/user/${username}?limit=${limit}&offset=${offset}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'FETCH_USER_POSTS_FAILED', message: 'Failed to fetch user posts' },
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

  // Get single post
  static async getPost(postId: string): Promise<ApiResponse<Post>> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'FETCH_POST_FAILED', message: 'Failed to fetch post' },
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

  // Update post
  static async updatePost(postId: string, updates: UpdatePostData): Promise<ApiResponse<Post>> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'UPDATE_POST_FAILED', message: 'Failed to update post' },
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

  // Delete post
  static async deletePost(postId: string): Promise<ApiResponse<void>> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'DELETE_POST_FAILED', message: 'Failed to delete post' },
        };
      }

      return {
        success: true,
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

  // Like post
  static async likePost(postId: string): Promise<ApiResponse<{ liked: boolean; likeCount: number }>> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'LIKE_POST_FAILED', message: 'Failed to like post' },
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

  // Repost
  static async repost(postId: string): Promise<ApiResponse<{ reposted: boolean; repostCount: number }>> {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/repost`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'REPOST_FAILED', message: 'Failed to repost' },
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

  // Search posts
  static async searchPosts(query: string, page: number = 1, limit: number = 20): Promise<ApiResponse<{ posts: Post[]; hasMore: boolean }>> {
    try {
      const token = localStorage.getItem('authToken');
      const offset = (page - 1) * limit;
      
      const response = await fetch(`${API_BASE_URL}/posts/search?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`,
        } : {},
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || { code: 'SEARCH_POSTS_FAILED', message: 'Failed to search posts' },
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