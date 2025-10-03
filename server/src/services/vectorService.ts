import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';

export interface DiaryVector {
  id: string;
  userId: string;
  entryId: string;
  content: string;
  embedding: number[];
  metadata: {
    date: string;
    mood: string;
    topics: string[];
    sentiment: number;
    wordCount: number;
  };
  createdAt: Date;
}

export interface EmbeddingResponse {
  embedding: number[];
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export class VectorService {
  /**
   * Generate embedding for text content
   * Uses simple hash-based embedding for now (OpenAI integration available but disabled for stability)
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    // Use simple hash-based embedding for reliability
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(384).fill(0); // 384-dimensional embedding

    // Simple hash-based embedding for demo purposes
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      for (let j = 0; j < word.length; j++) {
        const charCode = word.charCodeAt(j);
        const index = (charCode + i + j) % 384;
        embedding[index] += Math.sin(charCode * 0.1) * 0.1;
      }
    }

    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
  }

  /**
   * Extract topics from text content
   */
  static extractTopics(text: string): string[] {
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
      'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself',
      'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this',
      'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'will', 'would', 'should',
      'could', 'can', 'may', 'might', 'must', 'shall', 'today', 'yesterday', 'tomorrow'
    ]);

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word));

    // Count word frequency
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Return top 5 most frequent words as topics
    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * Calculate sentiment score (-1 to 1)
   */
  static calculateSentiment(text: string): number {
    const positiveWords = [
      'happy', 'joy', 'love', 'wonderful', 'amazing', 'great', 'good', 'excellent',
      'fantastic', 'beautiful', 'peaceful', 'calm', 'grateful', 'thankful', 'blessed',
      'excited', 'hopeful', 'optimistic', 'confident', 'proud', 'satisfied', 'content'
    ];

    const negativeWords = [
      'sad', 'angry', 'hate', 'terrible', 'awful', 'bad', 'horrible', 'disgusting',
      'depressed', 'anxious', 'worried', 'stressed', 'frustrated', 'disappointed',
      'lonely', 'scared', 'afraid', 'nervous', 'upset', 'annoyed', 'irritated'
    ];

    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });

    const totalSentimentWords = positiveCount + negativeCount;
    if (totalSentimentWords === 0) return 0;

    return (positiveCount - negativeCount) / totalSentimentWords;
  }

  /**
   * Store diary entry in vector database
   */
  static async storeVector(
    userId: string,
    entryId: string,
    content: string,
    mood: string,
    date: Date
  ): Promise<string> {
    const db = getDatabase();
    const vectorId = uuidv4();

    // Generate embedding
    const embedding = await this.generateEmbedding(content);

    // Extract metadata
    const topics = this.extractTopics(content);
    const sentiment = this.calculateSentiment(content);
    const wordCount = content.split(/\s+/).length;

    const metadata = {
      date: date.toISOString(),
      mood,
      topics,
      sentiment,
      wordCount
    };

    // Store in vectors table
    await db.run(
      `INSERT INTO diary_vectors (
        id, user_id, entry_id, content, embedding, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        vectorId,
        userId,
        entryId,
        content,
        JSON.stringify(embedding),
        JSON.stringify(metadata),
        new Date().toISOString()
      ]
    );

    return vectorId;
  }

  /**
   * Update vector when diary entry is modified
   */
  static async updateVector(
    vectorId: string,
    content: string,
    mood: string,
    date: Date
  ): Promise<void> {
    const db = getDatabase();

    // Generate new embedding
    const embedding = await this.generateEmbedding(content);

    // Extract new metadata
    const topics = this.extractTopics(content);
    const sentiment = this.calculateSentiment(content);
    const wordCount = content.split(/\s+/).length;

    const metadata = {
      date: date.toISOString(),
      mood,
      topics,
      sentiment,
      wordCount
    };

    await db.run(
      `UPDATE diary_vectors 
       SET content = ?, embedding = ?, metadata = ?, updated_at = ?
       WHERE id = ?`,
      [
        content,
        JSON.stringify(embedding),
        JSON.stringify(metadata),
        new Date().toISOString(),
        vectorId
      ]
    );
  }

  /**
   * Delete vector when diary entry is deleted
   */
  static async deleteVector(vectorId: string): Promise<void> {
    const db = getDatabase();
    await db.run('DELETE FROM diary_vectors WHERE id = ?', [vectorId]);
  }

  /**
   * Search similar diary entries using cosine similarity
   */
  static async searchSimilar(
    userId: string,
    queryText: string,
    limit: number = 5
  ): Promise<DiaryVector[]> {
    const db = getDatabase();

    // Generate embedding for query
    const queryEmbedding = await this.generateEmbedding(queryText);

    // Get all vectors for user
    const rows = await db.all(
      `SELECT id, user_id, entry_id, content, embedding, metadata, created_at
       FROM diary_vectors 
       WHERE user_id = ?`,
      [userId]
    );

    // Calculate cosine similarity for each vector
    const similarities = rows.map(row => {
      const embedding = JSON.parse(row.embedding);
      const similarity = this.cosineSimilarity(queryEmbedding, embedding);

      return {
        ...row,
        similarity,
        embedding,
        metadata: JSON.parse(row.metadata),
        createdAt: new Date(row.created_at)
      };
    });

    // Sort by similarity and return top results
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(({ similarity, ...vector }) => vector);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  /**
   * Get user's vector statistics
   */
  static async getUserVectorStats(userId: string): Promise<{
    totalVectors: number;
    averageSentiment: number;
    topTopics: string[];
    moodDistribution: Record<string, number>;
  }> {
    const db = getDatabase();

    const rows = await db.all(
      'SELECT metadata FROM diary_vectors WHERE user_id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return {
        totalVectors: 0,
        averageSentiment: 0,
        topTopics: [],
        moodDistribution: {}
      };
    }

    const allMetadata = rows.map(row => JSON.parse(row.metadata));

    // Calculate average sentiment
    const averageSentiment = allMetadata.reduce((sum, meta) => sum + meta.sentiment, 0) / allMetadata.length;

    // Count all topics
    const topicCount: Record<string, number> = {};
    allMetadata.forEach(meta => {
      meta.topics.forEach((topic: string) => {
        topicCount[topic] = (topicCount[topic] || 0) + 1;
      });
    });

    // Get top 10 topics
    const topTopics = Object.entries(topicCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([topic]) => topic);

    // Count mood distribution
    const moodDistribution: Record<string, number> = {};
    allMetadata.forEach(meta => {
      moodDistribution[meta.mood] = (moodDistribution[meta.mood] || 0) + 1;
    });

    return {
      totalVectors: rows.length,
      averageSentiment,
      topTopics,
      moodDistribution
    };
  }
}