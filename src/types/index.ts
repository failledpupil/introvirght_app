// Type definitions based on our design document

export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
  followerCount: number;
  followingCount: number;
  postCount: number;
}

export interface Post {
  id: string;
  content: string;
  authorId: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
  likeCount: number;
  repostCount: number;
  isLikedByCurrentUser?: boolean;
  isRepostedByCurrentUser?: boolean;
  originalPost?: Post; // For reposts
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}