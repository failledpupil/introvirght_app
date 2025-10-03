// Post validation utilities for the backend

export interface PostValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate post content
 */
export const validatePostContent = (content: string): PostValidationResult => {
  const errors: string[] = [];

  if (!content) {
    errors.push('Post content is required');
    return { isValid: false, errors };
  }

  if (typeof content !== 'string') {
    errors.push('Post content must be a string');
    return { isValid: false, errors };
  }

  const trimmedContent = content.trim();
  
  if (trimmedContent.length === 0) {
    errors.push('Post cannot be empty');
  }

  if (trimmedContent.length > 500) {
    errors.push('Post must be no more than 500 characters');
  }

  // Check for potentially harmful content
  if (containsSpam(trimmedContent)) {
    errors.push('Post content appears to be spam');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Check if content contains spam patterns
 */
const containsSpam = (content: string): boolean => {
  const spamPatterns = [
    // Excessive repetition
    /(.)\1{10,}/i, // Same character repeated 10+ times
    /(\b\w+\b)\s*\1\s*\1/i, // Same word repeated 3+ times
    
    // Excessive caps
    /[A-Z]{20,}/, // 20+ consecutive capital letters
    
    // Common spam phrases (case insensitive)
    /\b(buy now|click here|free money|get rich quick|limited time|act now)\b/i,
  ];

  return spamPatterns.some(pattern => pattern.test(content));
};

/**
 * Sanitize post content
 */
export const sanitizePostContent = (content: string): string => {
  return content
    .trim()
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove potential XSS characters
    .replace(/[<>]/g, '')
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
};

/**
 * Extract mentions from post content
 */
export const extractMentions = (content: string): string[] => {
  const mentionRegex = /@([a-zA-Z0-9_]{3,20})/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    const username = match[1];
    if (!mentions.includes(username)) {
      mentions.push(username);
    }
  }

  return mentions;
};

/**
 * Extract hashtags from post content
 */
export const extractHashtags = (content: string): string[] => {
  const hashtagRegex = /#([a-zA-Z0-9_]{1,50})/g;
  const hashtags: string[] = [];
  let match;

  while ((match = hashtagRegex.exec(content)) !== null) {
    const hashtag = match[1].toLowerCase();
    if (!hashtags.includes(hashtag)) {
      hashtags.push(hashtag);
    }
  }

  return hashtags;
};

/**
 * Check if user can edit post (within time limit)
 */
export const canEditPost = (createdAt: Date, editTimeLimit: number = 15 * 60 * 1000): boolean => {
  const timeSinceCreation = Date.now() - createdAt.getTime();
  return timeSinceCreation <= editTimeLimit;
};

/**
 * Validate search query
 */
export const validateSearchQuery = (query: string): PostValidationResult => {
  const errors: string[] = [];

  if (!query || typeof query !== 'string') {
    errors.push('Search query is required');
    return { isValid: false, errors };
  }

  const trimmedQuery = query.trim();
  
  if (trimmedQuery.length === 0) {
    errors.push('Search query cannot be empty');
  }

  if (trimmedQuery.length > 100) {
    errors.push('Search query must be no more than 100 characters');
  }

  // Prevent SQL injection attempts
  if (containsSqlInjection(trimmedQuery)) {
    errors.push('Invalid search query');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Check for potential SQL injection patterns
 */
const containsSqlInjection = (query: string): boolean => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(--|\/\*|\*\/)/,
    /(\bOR\b.*=.*\bOR\b)/i,
    /(\bAND\b.*=.*\bAND\b)/i,
  ];

  return sqlPatterns.some(pattern => pattern.test(query));
};

/**
 * Rate limiting for post creation
 */
const postCreationLimits = new Map<string, { count: number; resetTime: number }>();

export const checkPostCreationLimit = (
  userId: string,
  maxPosts: number = 10,
  windowMs: number = 60 * 60 * 1000 // 1 hour
): { allowed: boolean; remainingPosts: number; resetTime: number } => {
  const now = Date.now();
  const record = postCreationLimits.get(userId);

  if (!record || now > record.resetTime) {
    // First post or window has reset
    const resetTime = now + windowMs;
    postCreationLimits.set(userId, { count: 1, resetTime });
    return { allowed: true, remainingPosts: maxPosts - 1, resetTime };
  }

  if (record.count >= maxPosts) {
    // Rate limit exceeded
    return { allowed: false, remainingPosts: 0, resetTime: record.resetTime };
  }

  // Increment count
  record.count++;
  postCreationLimits.set(userId, record);
  
  return { 
    allowed: true, 
    remainingPosts: maxPosts - record.count, 
    resetTime: record.resetTime 
  };
};