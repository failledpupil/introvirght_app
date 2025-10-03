import { dataStaxService, VectorEntry } from '../config/datastax';
import embeddingService from './embeddingService';

export interface DiaryContext {
  relevantEntries: VectorEntry[];
  similarityScores: number[];
  themes: string[];
  timeRange: { start: Date; end: Date };
}

export interface VectorSearchOptions {
  userId: string;
  limit?: number;
  threshold?: number;
  timeRange?: { start: Date; end: Date };
  tags?: string[];
  mood?: string;
}

export class VectorService {
  /**
   * Store diary entry as vector embedding
   */
  async storeEntryVector(
    entryId: string,
    userId: string,
    content: string,
    metadata: {
      title?: string;
      mood?: string;
      tags?: string[];
      sentiment?: number;
    } = {}
  ): Promise<boolean> {
    try {
      console.log(`🔄 Generating embedding for entry ${entryId}`);
      
      // Generate embedding for the content
      const embeddingResult = await embeddingService.generateEmbedding(content);
      
      if (!embeddingResult.success) {
        console.error(`Failed to generate embedding: ${embeddingResult.error}`);
        return false;
      }

      // Extract key phrases for enhanced metadata
      const keyPhrases = embeddingService.extractKeyPhrases(content);
      
      // Store in DataStax
      await dataStaxService.storeEmbedding(
        entryId,
        userId,
        content,
        embeddingResult.embedding,
        {
          mood: metadata.mood || 'neutral',
          tags: [...(metadata.tags || []), ...keyPhrases.slice(0, 5)], // Add key phrases as tags
          createdAt: new Date().toISOString(),
          wordCount: content.split(' ').length,
          sentiment: metadata.sentiment
        }
      );

      console.log(`✅ Stored vector for entry ${entryId} (${embeddingResult.tokens} tokens)`);
      return true;
    } catch (error) {
      console.error('Error storing entry vector:', error);
      return false;
    }
  }

  /**
   * Search for semantically similar diary entries
   */
  async searchSimilarEntries(
    query: string,
    options: VectorSearchOptions
  ): Promise<VectorEntry[]> {
    try {
      console.log(`🔍 Searching for entries similar to: "${query.substring(0, 50)}..."`);
      
      // Generate embedding for the search query
      const queryEmbedding = await embeddingService.generateQueryEmbedding(query);
      
      if (!queryEmbedding.success) {
        console.error(`Failed to generate query embedding: ${queryEmbedding.error}`);
        return [];
      }

      // Search for similar entries
      const results = await dataStaxService.searchSimilar(
        queryEmbedding.embedding,
        options.userId,
        options.limit || 5,
        options.threshold || 0.7
      );

      console.log(`✅ Found ${results.length} similar entries`);
      return results.map(result => result.entry);
    } catch (error) {
      console.error('Error searching similar entries:', error);
      return [];
    }
  }

  /**
   * Get diary context for AI companion
   */
  async getDiaryContext(
    userMessage: string,
    userId: string,
    limit: number = 3
  ): Promise<DiaryContext> {
    try {
      console.log(`🤖 Getting diary context for AI companion`);
      
      // Search for relevant entries
      const relevantEntries = await this.searchSimilarEntries(userMessage, {
        userId,
        limit,
        threshold: 0.6 // Lower threshold for AI context
      });

      // Extract themes from relevant entries
      const themes = this.extractThemes(relevantEntries);
      
      // Calculate time range
      const timeRange = this.calculateTimeRange(relevantEntries);
      
      // Get similarity scores
      const similarityScores = relevantEntries.map((entry: any) => entry.similarity || 0);

      const context: DiaryContext = {
        relevantEntries,
        similarityScores,
        themes,
        timeRange
      };

      console.log(`✅ Generated context: ${relevantEntries.length} entries, ${themes.length} themes`);
      return context;
    } catch (error) {
      console.error('Error getting diary context:', error);
      return {
        relevantEntries: [],
        similarityScores: [],
        themes: [],
        timeRange: { start: new Date(), end: new Date() }
      };
    }
  }

  /**
   * Find related entries for a specific diary entry
   */
  async getRelatedEntries(
    entryId: string,
    userId: string,
    limit: number = 3
  ): Promise<VectorEntry[]> {
    try {
      // First, get the entry content to search for similar ones
      // This would typically come from your diary service
      // For now, we'll search based on the entry ID in the vector store
      
      console.log(`🔗 Finding related entries for ${entryId}`);
      
      // Get all user entries and find the target entry
      const allEntries = await dataStaxService.getUserEntries(userId, 100);
      
      const targetEntry = allEntries.find(entry => entry.entryId === entryId);
      
      if (!targetEntry) {
        console.log(`Entry ${entryId} not found in vector store`);
        return [];
      }

      // Search for similar entries using the target entry's vector
      const relatedResults = await dataStaxService.searchSimilar(
        targetEntry.$vector,
        userId,
        limit + 1, // +1 because the target entry will be included
        0.6
      );

      // Filter out the target entry itself and extract entries
      const filtered = relatedResults
        .map(result => result.entry)
        .filter(entry => entry.entryId !== entryId);
      
      console.log(`✅ Found ${filtered.length} related entries`);
      return filtered.slice(0, limit);
    } catch (error) {
      console.error('Error getting related entries:', error);
      return [];
    }
  }

  /**
   * Delete vector for a diary entry
   */
  async deleteEntryVector(entryId: string): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting vector for entry ${entryId}`);
      
      await dataStaxService.deleteEmbedding(entryId);
      console.log(`✅ Deleted vector for entry ${entryId}`);
      return true;
    } catch (error) {
      console.error('Error deleting entry vector:', error);
      return false;
    }
  }

  /**
   * Get user insights from vector data
   */
  async getUserInsights(
    userId: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<any> {
    try {
      console.log(`📊 Generating insights for user ${userId}`);
      
      // Get all user entries
      const entries = await dataStaxService.getUserEntries(userId);
      
      if (entries.length === 0) {
        return {
          totalEntries: 0,
          averageWordCount: 0,
          commonTags: [],
          moodDistribution: {},
          timeRange: timeRange || { start: new Date(), end: new Date() }
        };
      }

      // Calculate insights
      const totalEntries = entries.length;
      const averageWordCount = entries.reduce((sum, entry) => sum + (entry.metadata?.wordCount || 0), 0) / totalEntries;
      
      // Extract common tags
      const allTags: string[] = [];
      entries.forEach(entry => {
        if (entry.metadata?.tags) {
          allTags.push(...entry.metadata.tags);
        }
      });
      
      const tagCounts: { [key: string]: number } = {};
      allTags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
      
      const commonTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([tag]) => tag);

      // Calculate mood distribution
      const moodDistribution: { [mood: string]: number } = {};
      entries.forEach(entry => {
        const mood = entry.metadata?.mood || 'unknown';
        moodDistribution[mood] = (moodDistribution[mood] || 0) + 1;
      });

      const insights = {
        totalEntries,
        averageWordCount,
        commonTags,
        moodDistribution,
        timeRange: timeRange || { start: new Date(), end: new Date() }
      };
      
      console.log(`✅ Generated insights: ${totalEntries} entries analyzed`);
      return insights;
    } catch (error) {
      console.error('Error getting user insights:', error);
      return null;
    }
  }

  /**
   * Health check for vector services
   */
  async healthCheck(): Promise<{
    datastax: boolean;
    openai: boolean;
    overall: boolean;
  }> {
    const datastaxHealth = await dataStaxService.healthCheck();
    const openaiStatus = embeddingService.getStatus();
    
    return {
      datastax: datastaxHealth.status === 'ok',
      openai: openaiStatus.configured,
      overall: datastaxHealth.status === 'ok' && openaiStatus.configured
    };
  }

  /**
   * Extract themes from entries
   */
  private extractThemes(entries: VectorEntry[]): string[] {
    const allTags: string[] = [];
    
    entries.forEach(entry => {
      if (entry.metadata?.tags) {
        allTags.push(...entry.metadata.tags);
      }
    });

    // Count tag frequency
    const tagCounts: { [key: string]: number } = {};
    allTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });

    // Return top themes
    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);
  }

  /**
   * Calculate time range from entries
   */
  private calculateTimeRange(entries: VectorEntry[]): { start: Date; end: Date } {
    if (entries.length === 0) {
      const now = new Date();
      return { start: now, end: now };
    }

    const dates = entries
      .map(entry => new Date(entry.metadata?.createdAt || new Date()))
      .sort((a, b) => a.getTime() - b.getTime());

    return {
      start: dates[0],
      end: dates[dates.length - 1]
    };
  }
}

// Singleton instance
export const vectorService = new VectorService();
export default vectorService;