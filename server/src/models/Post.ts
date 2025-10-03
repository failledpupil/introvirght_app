import { getDatabase } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import type { User } from './User';

export interface Post {
  id: string;
  content: string;
  authorId: string;
  author?: User;
  createdAt: Date;
  updatedAt: Date;
  likeCount: number;
  repostCount: number;
  isLikedByCurrentUser?: boolean;
  isRepostedByCurrentUser?: boolean;
  originalPost?: Post; // For reposts
}

export interface CreatePostData {
  content: string;
  authorId: string;
  originalPostId?: string; // For reposts
}

export interface UpdatePostData {
  content?: string;
}

export interface PostWithEngagement extends Post {
  isLikedByCurrentUser: boolean;
  isRepostedByCurrentUser: boolean;
}

export class PostModel {
  /**
   * Create a new post
   */
  static async create(postData: CreatePostData): Promise<Post> {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO posts (id, content, author_id, original_post_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, postData.content, postData.authorId, postData.originalPostId || null, now, now]
    );

    const post = await this.findById(id);
    if (!post) {
      throw new Error('Failed to create post');
    }

    return post;
  }

  /**
   * Find post by ID
   */
  static async findById(id: string, currentUserId?: string): Promise<Post | null> {
    const db = getDatabase();
    
    const query = `
      SELECT 
        p.id, p.content, p.author_id, p.original_post_id, p.created_at, p.updated_at,
        u.username, u.bio,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM reposts WHERE post_id = p.id) as repost_count
        ${currentUserId ? `, 
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked,
        (SELECT COUNT(*) FROM reposts WHERE post_id = p.id AND user_id = ?) as is_reposted` : ''}
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `;

    const params = currentUserId ? [currentUserId, currentUserId, id] : [id];
    const row = await db.get(query, params);

    return row ? this.mapRowToPost(row, currentUserId) : null;
  }

  /**
   * Get posts by author
   */
  static async findByAuthor(
    authorId: string, 
    currentUserId?: string,
    limit: number = 20, 
    offset: number = 0
  ): Promise<Post[]> {
    const db = getDatabase();
    
    const query = `
      SELECT 
        p.id, p.content, p.author_id, p.original_post_id, p.created_at, p.updated_at,
        u.username, u.bio,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM reposts WHERE post_id = p.id) as repost_count
        ${currentUserId ? `, 
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked,
        (SELECT COUNT(*) FROM reposts WHERE post_id = p.id AND user_id = ?) as is_reposted` : ''}
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.author_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const params = currentUserId 
      ? [currentUserId, currentUserId, authorId, limit, offset]
      : [authorId, limit, offset];
    
    const rows = await db.all(query, params);
    return rows.map(row => this.mapRowToPost(row, currentUserId));
  }

  /**
   * Get feed posts for a user (posts from followed users)
   */
  static async getFeedPosts(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Post[]> {
    const db = getDatabase();
    
    const query = `
      SELECT 
        p.id, p.content, p.author_id, p.original_post_id, p.created_at, p.updated_at,
        u.username, u.bio,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM reposts WHERE post_id = p.id) as repost_count,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked,
        (SELECT COUNT(*) FROM reposts WHERE post_id = p.id AND user_id = ?) as is_reposted
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.author_id IN (
        SELECT following_id FROM follows WHERE follower_id = ?
      ) OR p.author_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const rows = await db.all(query, [userId, userId, userId, userId, limit, offset]);
    return rows.map(row => this.mapRowToPost(row, userId));
  }

  /**
   * Get recent posts (public timeline)
   */
  static async getRecentPosts(
    currentUserId?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Post[]> {
    const db = getDatabase();
    
    const query = `
      SELECT 
        p.id, p.content, p.author_id, p.original_post_id, p.created_at, p.updated_at,
        u.username, u.bio,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM reposts WHERE post_id = p.id) as repost_count
        ${currentUserId ? `, 
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked,
        (SELECT COUNT(*) FROM reposts WHERE post_id = p.id AND user_id = ?) as is_reposted` : ''}
      FROM posts p
      JOIN users u ON p.author_id = u.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const params = currentUserId 
      ? [currentUserId, currentUserId, limit, offset]
      : [limit, offset];
    
    const rows = await db.all(query, params);
    return rows.map(row => this.mapRowToPost(row, currentUserId));
  }

  /**
   * Update a post
   */
  static async update(id: string, updates: UpdatePostData): Promise<Post | null> {
    const db = getDatabase();
    const now = new Date().toISOString();

    const setClause = [];
    const values = [];

    if (updates.content !== undefined) {
      setClause.push('content = ?');
      values.push(updates.content);
    }

    setClause.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await db.run(
      `UPDATE posts SET ${setClause.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  /**
   * Delete a post
   */
  static async delete(id: string): Promise<boolean> {
    const db = getDatabase();
    const result = await db.run('DELETE FROM posts WHERE id = ?', [id]);
    return (result.changes || 0) > 0;
  }

  /**
   * Like a post
   */
  static async like(postId: string, userId: string): Promise<boolean> {
    const db = getDatabase();
    const likeId = uuidv4();
    const now = new Date().toISOString();

    try {
      await db.run(
        'INSERT INTO likes (id, user_id, post_id, created_at) VALUES (?, ?, ?, ?)',
        [likeId, userId, postId, now]
      );
      return true;
    } catch (error) {
      // Handle duplicate like (user already liked this post)
      return false;
    }
  }

  /**
   * Unlike a post
   */
  static async unlike(postId: string, userId: string): Promise<boolean> {
    const db = getDatabase();
    const result = await db.run(
      'DELETE FROM likes WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    );
    return (result.changes || 0) > 0;
  }

  /**
   * Repost a post
   */
  static async repost(postId: string, userId: string): Promise<Post | null> {
    const db = getDatabase();
    const repostId = uuidv4();
    const now = new Date().toISOString();

    try {
      // Create repost entry
      await db.run(
        'INSERT INTO reposts (id, user_id, post_id, created_at) VALUES (?, ?, ?, ?)',
        [repostId, userId, postId, now]
      );

      // Create a new post entry for the repost
      const newPostId = uuidv4();
      await db.run(
        'INSERT INTO posts (id, content, author_id, original_post_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [newPostId, '', userId, postId, now, now]
      );

      return this.findById(newPostId, userId);
    } catch (error) {
      // Handle duplicate repost
      return null;
    }
  }

  /**
   * Remove repost
   */
  static async unrepost(postId: string, userId: string): Promise<boolean> {
    const db = getDatabase();
    
    // Remove from reposts table
    const repostResult = await db.run(
      'DELETE FROM reposts WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    );

    // Remove the repost post entry
    await db.run(
      'DELETE FROM posts WHERE author_id = ? AND original_post_id = ?',
      [userId, postId]
    );

    return (repostResult.changes || 0) > 0;
  }

  /**
   * Search posts by content
   */
  static async search(
    query: string,
    currentUserId?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Post[]> {
    const db = getDatabase();
    
    const searchQuery = `
      SELECT 
        p.id, p.content, p.author_id, p.original_post_id, p.created_at, p.updated_at,
        u.username, u.bio,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM reposts WHERE post_id = p.id) as repost_count
        ${currentUserId ? `, 
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked,
        (SELECT COUNT(*) FROM reposts WHERE post_id = p.id AND user_id = ?) as is_reposted` : ''}
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.content LIKE ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const params = currentUserId 
      ? [currentUserId, currentUserId, `%${query}%`, limit, offset]
      : [`%${query}%`, limit, offset];
    
    const rows = await db.all(searchQuery, params);
    return rows.map(row => this.mapRowToPost(row, currentUserId));
  }

  /**
   * Get post statistics
   */
  static async getStats(postId: string): Promise<{
    likeCount: number;
    repostCount: number;
  }> {
    const db = getDatabase();

    const [likeCount, repostCount] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM likes WHERE post_id = ?', [postId]),
      db.get('SELECT COUNT(*) as count FROM reposts WHERE post_id = ?', [postId]),
    ]);

    return {
      likeCount: likeCount?.count || 0,
      repostCount: repostCount?.count || 0,
    };
  }

  /**
   * Map database row to Post object
   */
  private static mapRowToPost(row: any, currentUserId?: string): Post {
    const post: Post = {
      id: row.id,
      content: row.content,
      authorId: row.author_id,
      author: {
        id: row.author_id,
        username: row.username,
        email: '', // Don't expose email in posts
        bio: row.bio,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      likeCount: row.like_count || 0,
      repostCount: row.repost_count || 0,
    };

    // Add engagement status if current user is provided
    if (currentUserId) {
      post.isLikedByCurrentUser = (row.is_liked || 0) > 0;
      post.isRepostedByCurrentUser = (row.is_reposted || 0) > 0;
    }

    // Handle reposts (original post reference)
    if (row.original_post_id) {
      // This would need to be populated separately for full repost data
      post.originalPost = {
        id: row.original_post_id,
        content: '',
        authorId: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        likeCount: 0,
        repostCount: 0,
      };
    }

    return post;
  }
}