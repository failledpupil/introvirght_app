import { dataStaxService, VectorEntry, SemanticSearchResult } from '../config/datastax';
import { embeddingService } from './embeddingService';
import { DiaryEntry } from '../models/DiaryEntry';

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
      const success = await dataStaxService.storeEmbedding(
        entryId,
        userId,
        content,
        embeddingResult.embedding,
        {
          ...metadata,
          tags: [...(metadata.tags || []), ...keyPhrases.slice(0, 5)], // Add key phrases as tags
          wordCount: content.split(' ').length
        }
      );

      if (success) {
        console.log(`✅ Stored vector for entry ${entryId} (${embeddingResult.tokens} tokens)`);
      }

      return success;
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
      return results;
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
      const allEntries = await dataStaxService.searchSimilar(
        [], // Empty vector - we'll use a different approach
        userId,
        100,
        0
      );
      
      const targetEntry = allEntries.find(entry => entry.entryId === entryId);
      
      if (!targetEntry) {
        console.log(`Entry ${entryId} not found in vector store`);
        return [];
      }

      // Search for similar entries using the target entry's vector
      const relatedEntries = await dataStaxService.searchSimilar(
        targetEntry.$vector,
        userId,
        limit + 1, // +1 because the target entry will be included
        0.6
      );

      // Filter out the target entry itself
      const filtered = relatedEntries.filter(entry => entry.entryId !== entryId);
      
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
      
      const success = await dataStaxService.deleteEmbedding(entryId);
      
      if (success) {
        console.log(`✅ Deleted vector for entry ${entryId}`);
      }
      
      return success;
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
      
      const insights = await dataStaxService.getInsights(userId, timeRange);
      
      if (insights) {
        console.log(`✅ Generated insights: ${insights.totalEntries} entries analyzed`);
      }
      
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
      datastax: datastaxHealth,
      openai: openaiStatus.configured,
      overall: datastaxHealth && openaiStatus.configured
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