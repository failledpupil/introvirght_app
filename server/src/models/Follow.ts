import { getDatabase } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import type { User } from './User';

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface FollowWithUser extends Follow {
  follower?: User;
  following?: User;
}

export interface FollowStats {
  followerCount: number;
  followingCount: number;
  isFollowing?: boolean;
  isFollowedBy?: boolean;
}

export class FollowModel {
  /**
   * Create a follow relationship
   */
  static async create(followerId: string, followingId: string): Promise<Follow> {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    // Prevent self-follow
    if (followerId === followingId) {
      throw new Error('Users cannot follow themselves');
    }

    // Check if relationship already exists
    const existing = await this.findRelationship(followerId, followingId);
    if (existing) {
      throw new Error('Follow relationship already exists');
    }

    await db.run(
      `INSERT INTO follows (id, follower_id, following_id, created_at)
       VALUES (?, ?, ?, ?)`,
      [id, followerId, followingId, now]
    );

    const follow = await this.findById(id);
    if (!follow) {
      throw new Error('Failed to create follow relationship');
    }

    return follow;
  }

  /**
   * Find follow relationship by ID
   */
  static async findById(id: string): Promise<Follow | null> {
    const db = getDatabase();
    const row = await db.get(
      `SELECT id, follower_id, following_id, created_at
       FROM follows WHERE id = ?`,
      [id]
    );

    return row ? this.mapRowToFollow(row) : null;
  }

  /**
   * Find specific follow relationship
   */
  static async findRelationship(followerId: string, followingId: string): Promise<Follow | null> {
    const db = getDatabase();
    const row = await db.get(
      `SELECT id, follower_id, following_id, created_at
       FROM follows WHERE follower_id = ? AND following_id = ?`,
      [followerId, followingId]
    );

    return row ? this.mapRowToFollow(row) : null;
  }

  /**
   * Delete follow relationship
   */
  static async delete(followerId: string, followingId: string): Promise<boolean> {
    const db = getDatabase();
    const result = await db.run(
      'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );
    return (result.changes || 0) > 0;
  }

  /**
   * Get followers of a user
   */
  static async getFollowers(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<FollowWithUser[]> {
    const db = getDatabase();
    
    const query = `
      SELECT 
        f.id, f.follower_id, f.following_id, f.created_at,
        u.username, u.bio
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = ?
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const rows = await db.all(query, [userId, limit, offset]);
    return rows.map(row => this.mapRowToFollowWithUser(row, 'follower'));
  }

  /**
   * Get users that a user is following
   */
  static async getFollowing(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<FollowWithUser[]> {
    const db = getDatabase();
    
    const query = `
      SELECT 
        f.id, f.follower_id, f.following_id, f.created_at,
        u.username, u.bio
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ?
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const rows = await db.all(query, [userId, limit, offset]);
    return rows.map(row => this.mapRowToFollowWithUser(row, 'following'));
  }

  /**
   * Get follow statistics for a user
   */
  static async getFollowStats(userId: string, currentUserId?: string): Promise<FollowStats> {
    const db = getDatabase();

    const [followerCount, followingCount] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM follows WHERE following_id = ?', [userId]),
      db.get('SELECT COUNT(*) as count FROM follows WHERE follower_id = ?', [userId]),
    ]);

    const stats: FollowStats = {
      followerCount: followerCount?.count || 0,
      followingCount: followingCount?.count || 0,
    };

    // Add relationship status if current user is provided
    if (currentUserId && currentUserId !== userId) {
      const [isFollowing, isFollowedBy] = await Promise.all([
        db.get('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?', [currentUserId, userId]),
        db.get('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?', [userId, currentUserId]),
      ]);

      stats.isFollowing = !!isFollowing;
      stats.isFollowedBy = !!isFollowedBy;
    }

    return stats;
  }

  /**
   * Get mutual follows (users that both follow each other)
   */
  static async getMutualFollows(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<FollowWithUser[]> {
    const db = getDatabase();
    
    const query = `
      SELECT 
        f1.id, f1.follower_id, f1.following_id, f1.created_at,
        u.username, u.bio
      FROM follows f1
      JOIN follows f2 ON f1.follower_id = f2.following_id AND f1.following_id = f2.follower_id
      JOIN users u ON f1.following_id = u.id
      WHERE f1.follower_id = ?
      ORDER BY f1.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const rows = await db.all(query, [userId, limit, offset]);
    return rows.map(row => this.mapRowToFollowWithUser(row, 'following'));
  }

  /**
   * Get suggested users to follow (users with mutual connections)
   */
  static async getSuggestedFollows(
    userId: string,
    limit: number = 10
  ): Promise<User[]> {
    const db = getDatabase();
    
    // Find users followed by people the current user follows
    // but exclude users already followed and the current user
    const query = `
      SELECT DISTINCT 
        u.id, u.username, u.bio, u.created_at, u.updated_at,
        COUNT(f2.follower_id) as mutual_connections
      FROM users u
      JOIN follows f1 ON u.id = f1.following_id
      JOIN follows f2 ON f1.follower_id = f2.following_id
      WHERE f2.follower_id = ?
        AND u.id != ?
        AND u.id NOT IN (
          SELECT following_id FROM follows WHERE follower_id = ?
        )
      GROUP BY u.id, u.username, u.bio, u.created_at, u.updated_at
      ORDER BY mutual_connections DESC, u.created_at DESC
      LIMIT ?
    `;

    const rows = await db.all(query, [userId, userId, userId, limit]);
    return rows.map(row => ({
      id: row.id,
      username: row.username,
      email: '', // Don't expose email
      bio: row.bio,
      isEmailVerified: false,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  /**
   * Check if user A follows user B
   */
  static async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const db = getDatabase();
    const row = await db.get(
      'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );
    return !!row;
  }

  /**
   * Get follow activity (recent follows for a user's network)
   */
  static async getFollowActivity(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<FollowWithUser[]> {
    const db = getDatabase();
    
    // Get recent follows from users that the current user follows
    const query = `
      SELECT 
        f1.id, f1.follower_id, f1.following_id, f1.created_at,
        u1.username as follower_username, u1.bio as follower_bio,
        u2.username as following_username, u2.bio as following_bio
      FROM follows f1
      JOIN users u1 ON f1.follower_id = u1.id
      JOIN users u2 ON f1.following_id = u2.id
      WHERE f1.follower_id IN (
        SELECT following_id FROM follows WHERE follower_id = ?
      )
      ORDER BY f1.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const rows = await db.all(query, [userId, limit, offset]);
    return rows.map(row => ({
      id: row.id,
      followerId: row.follower_id,
      followingId: row.following_id,
      createdAt: new Date(row.created_at),
      follower: {
        id: row.follower_id,
        username: row.follower_username,
        email: '',
        bio: row.follower_bio,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      following: {
        id: row.following_id,
        username: row.following_username,
        email: '',
        bio: row.following_bio,
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }));
  }

  /**
   * Map database row to Follow object
   */
  private static mapRowToFollow(row: any): Follow {
    return {
      id: row.id,
      followerId: row.follower_id,
      followingId: row.following_id,
      createdAt: new Date(row.created_at),
    };
  }

  /**
   * Map database row to FollowWithUser object
   */
  private static mapRowToFollowWithUser(row: any, userType: 'follower' | 'following'): FollowWithUser {
    const follow = this.mapRowToFollow(row);
    
    const user: User = {
      id: userType === 'follower' ? row.follower_id : row.following_id,
      username: row.username,
      email: '', // Don't expose email
      bio: row.bio,
      isEmailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      ...follow,
      [userType]: user,
    };
  }
}