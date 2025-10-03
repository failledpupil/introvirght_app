import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export const initializeDatabase = async (): Promise<Database> => {
  if (db) {
    return db;
  }

  try {
    // Open SQLite database
    db = await open({
      filename: path.join(__dirname, '../../introvirght.db'),
      driver: sqlite3.Database,
    });

    // TEMPORARY: Disable foreign keys for testing
    await db.exec('PRAGMA foreign_keys = OFF');

    // Create tables
    await createTables();

    console.log('✅ Database initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

const createTables = async (): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  // Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      bio TEXT,
      is_email_verified BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login_at DATETIME
    )
  `);

  // Posts table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      author_id TEXT NOT NULL,
      original_post_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (original_post_id) REFERENCES posts (id) ON DELETE CASCADE
    )
  `);

  // Follows table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS follows (
      id TEXT PRIMARY KEY,
      follower_id TEXT NOT NULL,
      following_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (follower_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (following_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(follower_id, following_id)
    )
  `);

  // Likes table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS likes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      post_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
      UNIQUE(user_id, post_id)
    )
  `);

  // Reposts table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS reposts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      post_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
      UNIQUE(user_id, post_id)
    )
  `);

  // Diary entries table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS diary_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT,
      content TEXT NOT NULL,
      mood TEXT NOT NULL,
      gratitude TEXT,
      highlights TEXT,
      goals TEXT,
      is_private BOOLEAN DEFAULT TRUE,
      vector_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Diary vectors table for AI/search functionality
  await db.exec(`
    CREATE TABLE IF NOT EXISTS diary_vectors (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      entry_id TEXT NOT NULL,
      content TEXT NOT NULL,
      embedding TEXT NOT NULL,
      metadata TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (entry_id) REFERENCES diary_entries (id) ON DELETE CASCADE
    )
  `);

  // Chat messages table for AI companion conversations
  await db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      context TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts (author_id);
    CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at);
    CREATE INDEX IF NOT EXISTS idx_posts_original_post_id ON posts (original_post_id);
    CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows (follower_id);
    CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows (following_id);
    CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes (user_id);
    CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes (post_id);
    CREATE INDEX IF NOT EXISTS idx_reposts_user_id ON reposts (user_id);
    CREATE INDEX IF NOT EXISTS idx_reposts_post_id ON reposts (post_id);
    CREATE INDEX IF NOT EXISTS idx_diary_entries_user_id ON diary_entries (user_id);
    CREATE INDEX IF NOT EXISTS idx_diary_entries_created_at ON diary_entries (created_at);
    CREATE INDEX IF NOT EXISTS idx_diary_entries_vector_id ON diary_entries (vector_id);
    CREATE INDEX IF NOT EXISTS idx_diary_vectors_user_id ON diary_vectors (user_id);
    CREATE INDEX IF NOT EXISTS idx_diary_vectors_entry_id ON diary_vectors (entry_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages (user_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages (created_at);
  `);

  console.log('✅ Database tables created successfully');
};

export const getDatabase = (): Database => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
};

export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.close();
    db = null;
    console.log('✅ Database connection closed');
  }
};