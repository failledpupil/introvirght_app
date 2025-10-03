import { getDatabase } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface UserWithPassword extends User {
  passwordHash: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  passwordHash: string;
  bio?: string;
}

export interface UpdateUserData {
  bio?: string;
  lastLoginAt?: Date;
}

export class UserModel {
  static async create(userData: CreateUserData): Promise<User> {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO users (id, username, email, password_hash, bio, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, userData.username, userData.email, userData.passwordHash, userData.bio || null, now, now]
    );

    const user = await this.findById(id);
    if (!user) {
      throw new Error('Failed to create user');
    }

    return user;
  }

  static async findById(id: string): Promise<User | null> {
    const db = getDatabase();
    const row = await db.get(
      `SELECT id, username, email, bio, is_email_verified, created_at, updated_at, last_login_at
       FROM users WHERE id = ?`,
      [id]
    );

    return row ? this.mapRowToUser(row) : null;
  }

  static async findByEmail(email: string): Promise<UserWithPassword | null> {
    const db = getDatabase();
    const row = await db.get(
      `SELECT id, username, email, password_hash, bio, is_email_verified, created_at, updated_at, last_login_at
       FROM users WHERE email = ?`,
      [email]
    );

    return row ? this.mapRowToUserWithPassword(row) : null;
  }

  static async findByUsername(username: string): Promise<User | null> {
    const db = getDatabase();
    const row = await db.get(
      `SELECT id, username, email, bio, is_email_verified, created_at, updated_at, last_login_at
       FROM users WHERE username = ?`,
      [username]
    );

    return row ? this.mapRowToUser(row) : null;
  }

  static async update(id: string, updates: UpdateUserData): Promise<User | null> {
    const db = getDatabase();
    const now = new Date().toISOString();

    const setClause = [];
    const values = [];

    if (updates.bio !== undefined) {
      setClause.push('bio = ?');
      values.push(updates.bio);
    }

    if (updates.lastLoginAt) {
      setClause.push('last_login_at = ?');
      values.push(updates.lastLoginAt.toISOString());
    }

    setClause.push('updated_at = ?');
    values.push(now);
    values.push(id);

    await db.run(
      `UPDATE users SET ${setClause.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const db = getDatabase();
    const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
    return (result.changes || 0) > 0;
  }

  static async checkUsernameExists(username: string): Promise<boolean> {
    const db = getDatabase();
    const row = await db.get('SELECT 1 FROM users WHERE username = ?', [username]);
    return !!row;
  }

  static async checkEmailExists(email: string): Promise<boolean> {
    const db = getDatabase();
    const row = await db.get('SELECT 1 FROM users WHERE email = ?', [email]);
    return !!row;
  }

  static async getUserStats(userId: string): Promise<{
    followerCount: number;
    followingCount: number;
    postCount: number;
  }> {
    const db = getDatabase();

    const [followerCount, followingCount, postCount] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM follows WHERE following_id = ?', [userId]),
      db.get('SELECT COUNT(*) as count FROM follows WHERE follower_id = ?', [userId]),
      db.get('SELECT COUNT(*) as count FROM posts WHERE author_id = ?', [userId]),
    ]);

    return {
      followerCount: followerCount?.count || 0,
      followingCount: followingCount?.count || 0,
      postCount: postCount?.count || 0,
    };
  }

  static async getUserWithStats(userId: string, currentUserId?: string): Promise<User & {
    followerCount: number;
    followingCount: number;
    postCount: number;
    isFollowing?: boolean;
    isFollowedBy?: boolean;
  } | null> {
    const user = await this.findById(userId);
    if (!user) return null;

    const stats = await this.getUserStats(userId);
    
    let relationshipStatus = {};
    if (currentUserId && currentUserId !== userId) {
      const db = getDatabase();
      const [isFollowing, isFollowedBy] = await Promise.all([
        db.get('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?', [currentUserId, userId]),
        db.get('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?', [userId, currentUserId]),
      ]);

      relationshipStatus = {
        isFollowing: !!isFollowing,
        isFollowedBy: !!isFollowedBy,
      };
    }

    return {
      ...user,
      ...stats,
      ...relationshipStatus,
    };
  }

  private static mapRowToUser(row: any): User {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      bio: row.bio,
      isEmailVerified: !!row.is_email_verified,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
    };
  }

  private static mapRowToUserWithPassword(row: any): UserWithPassword {
    return {
      ...this.mapRowToUser(row),
      passwordHash: row.password_hash,
    };
  }
}