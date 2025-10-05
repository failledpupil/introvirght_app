import type { Post, CreatePostData, UpdatePostData, ApiResponse } from '../types';

// Post service class for handling post-related operations (client-side)
export class PostService {
  /**
   * Helper method to get stored posts from localStorage
   */
  private static getStoredPosts(): Post[] {
    try {
      const stored = localStorage.getItem('socialPosts');
      if (!stored) return this.getDefaultPosts();
      
      const posts = JSON.parse(stored);
      return posts.map((post: any) => ({
        ...post,
        createdAt: new Date(post.createdAt),
        updatedAt: new Date(post.updatedAt),
      }));
    } catch {
      return this.getDefaultPosts();
    }
  }

  /**
   * Get default demo posts
   */
  private static getDefaultPosts(): Post[] {
    return [
      {
        id: 'demo-post-1',
        content: 'Welcome to Introvirght! This is a mindful social platform where you can share your thoughts and connect with others on a journey of self-discovery. 🌱',
        author: {
          id: 'demo-user-system',
          username: 'introvirght',
          email: 'hello@introvirght.com'
        },
        likeCount: 5,
        repostCount: 2,
        isLikedByCurrentUser: false,
        isRepostedByCurrentUser: false,
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000),
      }
    ];
  }

  // Create a new post
  static async createPost(postData: CreatePostData): Promise<ApiResponse<Post>> {
    try {
      console.log('✅ Client-side createPost:', postData);
      
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const existingPosts = this.getStoredPosts();
      
      const newPost: Post = {
        id: 'post-' + Date.now(),
        content: postData.content,
        author: {
          id: currentUser.id || 'demo-user',
          username: currentUser.username || 'user',
          email: currentUser.email || 'user@example.com'
        },
        likeCount: 0,
        repostCount: 0,
        isLikedByCurrentUser: false,
        isRepostedByCurrentUser: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const updatedPosts = [newPost, ...existingPosts];
      localStorage.setItem('socialPosts', JSON.stringify(updatedPosts));

      return {
        success: true,
        data: newPost,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to create post',
        },
      };
    }
  }

  // Get user's feed posts
  static async getFeedPosts(page: number = 1, limit: number = 20): Promise<ApiResponse<{ posts: Post[]; hasMore: boolean }>> {
    try {
      console.log('✅ Client-side getFeedPosts, page:', page, 'limit:', limit);
      
      const allPosts = this.getStoredPosts();
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPosts = allPosts.slice(startIndex, endIndex);

      return {
        success: true,
        data: {
          posts: paginatedPosts,
          hasMore: endIndex < allPosts.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to fetch feed posts',
        },
      };
    }
  }

  // Get recent posts (public timeline)
  static async getRecentPosts(page: number = 1, limit: number = 20): Promise<ApiResponse<{ posts: Post[]; hasMore: boolean }>> {
    return this.getFeedPosts(page, limit); // Same as feed for client-side
  }

  // Get posts by user
  static async getUserPosts(username: string, page: number = 1, limit: number = 20): Promise<ApiResponse<{ posts: Post[]; hasMore: boolean }>> {
    try {
      console.log('✅ Client-side getUserPosts for:', username);
      
      const allPosts = this.getStoredPosts();
      const userPosts = allPosts.filter(post => post.author.username === username);
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPosts = userPosts.slice(startIndex, endIndex);

      return {
        success: true,
        data: {
          posts: paginatedPosts,
          hasMore: endIndex < userPosts.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to fetch user posts',
        },
      };
    }
  }

  // Get single post
  static async getPost(postId: string): Promise<ApiResponse<Post>> {
    try {
      console.log('✅ Client-side getPost:', postId);
      
      const posts = this.getStoredPosts();
      const post = posts.find(p => p.id === postId);
      
      if (!post) {
        return {
          success: false,
          error: {
            code: 'POST_NOT_FOUND',
            message: 'Post not found',
          },
        };
      }

      return {
        success: true,
        data: post,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to fetch post',
        },
      };
    }
  }

  // Update post
  static async updatePost(postId: string, updates: UpdatePostData): Promise<ApiResponse<Post>> {
    try {
      console.log('✅ Client-side updatePost:', postId, updates);
      
      const posts = this.getStoredPosts();
      const postIndex = posts.findIndex(p => p.id === postId);
      
      if (postIndex === -1) {
        return {
          success: false,
          error: {
            code: 'POST_NOT_FOUND',
            message: 'Post not found',
          },
        };
      }

      const updatedPost = {
        ...posts[postIndex],
        ...updates,
        updatedAt: new Date(),
      };
      
      posts[postIndex] = updatedPost;
      localStorage.setItem('socialPosts', JSON.stringify(posts));

      return {
        success: true,
        data: updatedPost,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to update post',
        },
      };
    }
  }

  // Delete post
  static async deletePost(postId: string): Promise<ApiResponse<void>> {
    try {
      console.log('✅ Client-side deletePost:', postId);
      
      const posts = this.getStoredPosts();
      const filteredPosts = posts.filter(p => p.id !== postId);
      
      localStorage.setItem('socialPosts', JSON.stringify(filteredPosts));

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to delete post',
        },
      };
    }
  }

  // Like post
  static async likePost(postId: string): Promise<ApiResponse<{ liked: boolean; likeCount: number }>> {
    try {
      console.log('✅ Client-side likePost:', postId);
      
      const posts = this.getStoredPosts();
      const postIndex = posts.findIndex(p => p.id === postId);
      
      if (postIndex === -1) {
        return {
          success: false,
          error: {
            code: 'POST_NOT_FOUND',
            message: 'Post not found',
          },
        };
      }

      const post = posts[postIndex];
      const wasLiked = post.isLikedByCurrentUser;
      
      post.isLikedByCurrentUser = !wasLiked;
      post.likeCount += wasLiked ? -1 : 1;
      
      localStorage.setItem('socialPosts', JSON.stringify(posts));

      return {
        success: true,
        data: {
          liked: post.isLikedByCurrentUser,
          likeCount: post.likeCount,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to like post',
        },
      };
    }
  }

  // Repost
  static async repost(postId: string): Promise<ApiResponse<{ reposted: boolean; repostCount: number }>> {
    try {
      console.log('✅ Client-side repost:', postId);
      
      const posts = this.getStoredPosts();
      const postIndex = posts.findIndex(p => p.id === postId);
      
      if (postIndex === -1) {
        return {
          success: false,
          error: {
            code: 'POST_NOT_FOUND',
            message: 'Post not found',
          },
        };
      }

      const post = posts[postIndex];
      const wasReposted = post.isRepostedByCurrentUser;
      
      post.isRepostedByCurrentUser = !wasReposted;
      post.repostCount += wasReposted ? -1 : 1;
      
      localStorage.setItem('socialPosts', JSON.stringify(posts));

      return {
        success: true,
        data: {
          reposted: post.isRepostedByCurrentUser,
          repostCount: post.repostCount,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to repost',
        },
      };
    }
  }

  // Search posts
  static async searchPosts(query: string, page: number = 1, limit: number = 20): Promise<ApiResponse<{ posts: Post[]; hasMore: boolean }>> {
    try {
      console.log('✅ Client-side searchPosts:', query);
      
      const allPosts = this.getStoredPosts();
      const searchTerm = query.toLowerCase();
      
      const matchingPosts = allPosts.filter(post => 
        post.content.toLowerCase().includes(searchTerm) ||
        post.author.username.toLowerCase().includes(searchTerm)
      );
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPosts = matchingPosts.slice(startIndex, endIndex);

      return {
        success: true,
        data: {
          posts: paginatedPosts,
          hasMore: endIndex < matchingPosts.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'STORAGE_ERROR',
          message: 'Unable to search posts',
        },
      };
    }
  }
}