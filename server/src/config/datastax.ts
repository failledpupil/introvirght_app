import { DataAPIClient } from '@datastax/astra-db-ts';

export interface DataStaxConfig {
  endpoint: string;
  token: string;
  keyspace: string;
  collection: string;
}

export interface VectorEntry {
  _id: string;
  userId: string;
  entryId: string;
  content: string;
  $vector: number[];
  metadata: {
    mood: string;
    tags: string[];
    createdAt: string;
    wordCount: number;
    sentiment?: number;
  };
}

class DataStaxService {
  private client: DataAPIClient | null = null;
  private db: any = null;
  private collection: any = null;
  private config: DataStaxConfig;

  constructor() {
    this.config = {
      endpoint: process.env.DATASTAX_ENDPOINT || '',
      token: process.env.DATASTAX_TOKEN || '',
      keyspace: process.env.DATASTAX_KEYSPACE || 'diary_vectors',
      collection: process.env.DATASTAX_COLLECTION || 'diary_embeddings'
    };
  }

  async initialize(): Promise<void> {
    try {
      if (!this.config.endpoint || !this.config.token) {
        throw new Error('DataStax configuration missing. Please set DATASTAX_ENDPOINT and DATASTAX_TOKEN environment variables.');
      }

      console.log('🔄 Initializing DataStax connection...');
      
      this.client = new DataAPIClient(this.config.token);
      this.db = this.client.db(this.config.endpoint);
      
      // Create collection if it doesn't exist
      try {
        this.collection = await this.db.createCollection(this.config.collection, {
          vector: {
            dimension: 1536, // OpenAI text-embedding-3-small dimension
            metric: 'cosine'
          }
        });
        console.log(`✅ Created DataStax collection: ${this.config.collection}`);
      } catch (error: any) {
        if (error.message?.includes('already exists')) {
          this.collection = this.db.collection(this.config.collection);
          console.log(`✅ Connected to existing DataStax collection: ${this.config.collection}`);
        } else {
          throw error;
        }
      }

      console.log('✅ DataStax initialized successfully');
    } catch (error) {
      console.error('❌ DataStax initialization failed:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      if (!this.collection) {
        await this.initialize();
      }

      // Simple test query
      await this.collection.findOne({}, { projection: { _id: 1 } });
      
      return {
        status: 'ok',
        message: 'DataStax connection healthy'
      };
    } catch (error) {
      console.error('DataStax health check failed:', error);
      return {
        status: 'error',
        message: `DataStax connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async storeEmbedding(
    entryId: string,
    userId: string,
    content: string,
    embedding: number[],
    metadata: VectorEntry['metadata']
  ): Promise<void> {
    try {
      if (!this.collection) {
        await this.initialize();
      }

      const vectorEntry: VectorEntry = {
        _id: entryId,
        userId,
        entryId,
        content,
        $vector: embedding,
        metadata
      };

      await this.collection.insertOne(vectorEntry);
      console.log(`✅ Stored embedding for entry: ${entryId}`);
    } catch (error) {
      console.error(`❌ Failed to store embedding for entry ${entryId}:`, error);
      throw error;
    }
  }

  async searchSimilar(
    queryEmbedding: number[],
    userId: string,
    limit: number = 5,
    threshold: number = 0.7
  ): Promise<Array<{ entry: VectorEntry; similarity: number }>> {
    try {
      if (!this.collection) {
        await this.initialize();
      }

      const results = await this.collection.find(
        { userId },
        {
          vector: queryEmbedding,
          limit,
          includeSimilarity: true
        }
      );

      return results
        .filter((result: any) => result.$similarity >= threshold)
        .map((result: any) => ({
          entry: result,
          similarity: result.$similarity
        }));
    } catch (error) {
      console.error('❌ Vector search failed:', error);
      throw error;
    }
  }

  async deleteEmbedding(entryId: string): Promise<void> {
    try {
      if (!this.collection) {
        await this.initialize();
      }

      await this.collection.deleteOne({ _id: entryId });
      console.log(`✅ Deleted embedding for entry: ${entryId}`);
    } catch (error) {
      console.error(`❌ Failed to delete embedding for entry ${entryId}:`, error);
      throw error;
    }
  }

  async getUserEntries(userId: string, limit: number = 100): Promise<VectorEntry[]> {
    try {
      if (!this.collection) {
        await this.initialize();
      }

      const results = await this.collection.find(
        { userId },
        { limit, sort: { 'metadata.createdAt': -1 } }
      );

      return results;
    } catch (error) {
      console.error(`❌ Failed to get user entries for ${userId}:`, error);
      throw error;
    }
  }

  isConfigured(): boolean {
    return !!(this.config.endpoint && this.config.token);
  }
}

// Export singleton instance
export const dataStaxService = new DataStaxService();