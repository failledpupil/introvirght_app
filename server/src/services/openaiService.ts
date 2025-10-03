import OpenAI from 'openai';

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIService {
  private static client: OpenAI | null = null;

  /**
   * Initialize OpenAI client
   */
  private static getClient(): OpenAI {
    if (!this.client) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required');
      }
      this.client = new OpenAI({ apiKey });
    }
    return this.client;
  }

  /**
   * Generate chat completion using OpenAI GPT
   */
  static async generateChatCompletion(
    messages: OpenAIMessage[],
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<OpenAIResponse> {
    try {
      const client = this.getClient();
      const model = options.model || process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

      const completion = await client.chat.completions.create({
        model,
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 500,
      });

      const choice = completion.choices[0];
      if (!choice?.message?.content) {
        throw new Error('No response content from OpenAI');
      }

      return {
        content: choice.message.content,
        usage: {
          prompt_tokens: completion.usage?.prompt_tokens || 0,
          completion_tokens: completion.usage?.completion_tokens || 0,
          total_tokens: completion.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  /**
   * Create system prompt for diary companion
   */
  static createDiaryCompanionSystemPrompt(
    userStats: any,
    relatedEntries: any[]
  ): string {
    const contextInfo = [];
    
    if (userStats.totalVectors > 0) {
      contextInfo.push(`The user has written ${userStats.totalVectors} diary entries.`);
      
      if (userStats.averageSentiment !== undefined) {
        const sentimentDesc = userStats.averageSentiment > 0.2 
          ? 'generally positive' 
          : userStats.averageSentiment < -0.2 
          ? 'often reflective of challenges' 
          : 'balanced between positive and challenging experiences';
        contextInfo.push(`Their overall emotional tone is ${sentimentDesc}.`);
      }

      if (userStats.topTopics && userStats.topTopics.length > 0) {
        contextInfo.push(`Common themes in their writing include: ${userStats.topTopics.slice(0, 3).join(', ')}.`);
      }

      if (Object.keys(userStats.moodDistribution || {}).length > 0) {
        const topMoods = Object.entries(userStats.moodDistribution)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 3)
          .map(([mood]) => mood);
        contextInfo.push(`They frequently express feeling ${topMoods.join(', ')}.`);
      }
    }

    let relatedContext = '';
    if (relatedEntries.length > 0) {
      relatedContext = `\n\nRelevant diary entries for context:\n${relatedEntries.map((entry, i) => 
        `${i + 1}. Date: ${entry.date}, Mood: ${entry.mood}\nContent: ${entry.content}`
      ).join('\n\n')}`;
    }

    return `You are a compassionate AI companion designed to help users reflect on their thoughts and emotions through their diary entries. You have access to their personal diary data to provide personalized, empathetic responses.

User Context:
${contextInfo.length > 0 ? contextInfo.join(' ') : 'This user is just starting their diary journey.'}

${relatedContext}

Guidelines:
- Be warm, empathetic, and supportive
- Reference their diary entries naturally when relevant
- Help them identify patterns and insights
- Encourage self-reflection and personal growth
- Respect their privacy and emotional state
- Ask thoughtful follow-up questions
- Provide gentle guidance without being prescriptive
- Acknowledge their feelings and experiences
- Keep responses conversational and personal (2-4 sentences typically)

Remember: You're not a therapist, but a supportive companion helping them process their thoughts and experiences through their own writing.`;
  }

  /**
   * Generate embedding using OpenAI (if available)
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      const client = this.getClient();
      
      const response = await client.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('OpenAI embedding error:', error);
      // Fallback to simple embedding if OpenAI fails
      throw error;
    }
  }
}