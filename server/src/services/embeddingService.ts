import OpenAI from 'openai';

interface EmbeddingResult {
  embedding: number[];
  tokens: number;
  success: boolean;
  error?: string;
}

interface BatchEmbeddingResult {
  embeddings: number[][];
  totalTokens: number;
  success: boolean;
  errors: string[];
}

class EmbeddingService {
  private openai: OpenAI | null = null;
  private model: string = 'text-embedding-3-small';
  private maxTokens: number = 8191; // Max tokens for text-embedding-3-small
  private batchSize: number = 100; // OpenAI batch limit

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ OpenAI API key not configured. Embedding features will be disabled.');
      return;
    }

    this.openai = new OpenAI({ apiKey });
    console.log('✅ OpenAI embedding service initialized');
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    try {
      if (!this.openai) {
        return {
          embedding: [],
          tokens: 0,
          success: false,
          error: 'OpenAI not configured'
        };
      }

      // Preprocess text
      const cleanText = this.preprocessText(text);
      
      if (cleanText.length === 0) {
        return {
          embedding: [],
          tokens: 0,
          success: false,
          error: 'Empty text after preprocessing'
        };
      }

      const response = await this.openai.embeddings.create({
        model: this.model,
        input: cleanText,
        encoding_format: 'float'
      });

      const embedding = response.data[0].embedding;
      const tokens = response.usage.total_tokens;

      console.log(`✅ Generated embedding: ${embedding.length} dimensions, ${tokens} tokens`);
      
      return {
        embedding,
        tokens,
        success: true
      };
    } catch (error: any) {
      console.error('Failed to generate embedding:', error);
      return {
        embedding: [],
        tokens: 0,
        success: false,
        error: error.message || 'Unknown error'
      };
    }
  }

  /**
   * Generate embedding for search queries
   */
  async generateQueryEmbedding(query: string): Promise<EmbeddingResult> {
    // Add query-specific preprocessing if needed
    const enhancedQuery = this.preprocessQuery(query);
    return this.generateEmbedding(enhancedQuery);
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same dimensions');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    return Math.max(0, Math.min(1, similarity)); // Clamp between 0 and 1
  }

  /**
   * Preprocess text for embedding generation
   */
  private preprocessText(text: string): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    // Clean and normalize text
    let cleaned = text
      .trim()
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[\r\n]+/g, ' ') // Replace line breaks with spaces
      .substring(0, 8000); // Limit length to stay under token limit

    return cleaned;
  }

  /**
   * Preprocess search queries
   */
  private preprocessQuery(query: string): string {
    if (!query || typeof query !== 'string') {
      return '';
    }

    // Query-specific preprocessing
    let processed = query
      .trim()
      .toLowerCase()
      .replace(/[?!.]+$/, '') // Remove trailing punctuation
      .replace(/^(find|show|search|get)\s+/i, '') // Remove common search prefixes
      .substring(0, 1000); // Limit query length

    return processed;
  }

  /**
   * Extract key phrases from text for metadata
   */
  extractKeyPhrases(text: string): string[] {
    if (!text || typeof text !== 'string') {
      return [];
    }

    // Simple key phrase extraction (can be enhanced with NLP libraries)
    const words = text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));

    // Get word frequency
    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Return top frequent words as key phrases
    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Simple stop word check
   */
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
      'above', 'below', 'between', 'among', 'this', 'that', 'these', 'those', 'i',
      'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
      'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
      'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
      'what', 'which', 'who', 'whom', 'whose', 'this', 'that', 'these', 'those', 'am',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having',
      'do', 'does', 'did', 'doing', 'will', 'would', 'could', 'should', 'may', 'might',
      'must', 'can', 'shall'
    ]);
    
    return stopWords.has(word.toLowerCase());
  }

  /**
   * Get service status
   */
  getStatus(): { configured: boolean; model: string; maxTokens: number } {
    return {
      configured: !!this.openai,
      model: this.model,
      maxTokens: this.maxTokens
    };
  }
}

// Singleton instance
export const embeddingService = new EmbeddingService();
export default embeddingService;