// Core data models for Introvirght

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

// Extended user interface for authentication state
export interface AuthUser extends User {
  isEmailVerified: boolean;
  lastLoginAt?: Date;
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

// Post creation and update types
export interface CreatePostData {
  content: string;
}

export interface UpdatePostData {
  content: string;
}

// Post engagement types
export interface PostEngagement {
  isLiked: boolean;
  isReposted: boolean;
  likeCount: number;
  repostCount: number;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

// Follow relationship with user data
export interface FollowWithUser extends Follow {
  follower?: User;
  following?: User;
}

// Follow statistics and relationship status
export interface FollowStats {
  followerCount: number;
  followingCount: number;
  isFollowing?: boolean;
  isFollowedBy?: boolean;
}

// Follow/unfollow request data
export interface FollowActionData {
  userId: string;
}

export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
}

// Authentication types
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  bio?: string;
}

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Form state types
export interface LoginFormState extends LoginCredentials {
  isSubmitting: boolean;
  errors: ValidationError[];
}

export interface RegisterFormState extends RegisterData {
  isSubmitting: boolean;
  errors: ValidationError[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Search types
export interface SearchResults {
  users: User[];
  posts: Post[];
}

// Feed types
export interface FeedResponse {
  posts: Post[];
  hasMore: boolean;
  nextCursor?: string;
}

// Re-export diary types
export * from './diary';
// Re-export api types
export * from './api';