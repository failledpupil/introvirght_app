// Utility functions for Introvirght

// Format date for display
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return d.toLocaleDateString();
  }
};

// Validation functions
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

export const isValidBio = (bio: string): boolean => {
  return bio.length <= 160; // Twitter-like bio limit
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Generate inspirational prompts for compose box
export const getInspirationPrompt = (): string => {
  const prompts = [
    "What's on your mind today?",
    "Share a moment of reflection...",
    "What are you grateful for?",
    "A thought worth sharing...",
    "What's bringing you peace today?",
    "Share your authentic self...",
    "What wisdom would you share?",
    "A gentle thought to offer...",
    "What's inspiring you right now?",
    "Share something meaningful..."
  ];
  
  return prompts[Math.floor(Math.random() * prompts.length)];
};

// Character count helper for posts
export const getCharacterCountColor = (count: number, limit: number = 500): string => {
  if (count < limit * 0.8) return 'text-stone-400';
  if (count < limit * 0.9) return 'text-sage-500';
  if (count < limit) return 'text-lavender-500';
  return 'text-red-400';
};

// Post content helpers
export const getPostExcerpt = (content: string, maxLength: number = 150): string => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength).trim() + '...';
};

// Format engagement counts (1.2k, 5.3M, etc.)
export const formatEngagementCount = (count: number): string => {
  if (count < 1000) return count.toString();
  if (count < 1000000) return (count / 1000).toFixed(1).replace('.0', '') + 'k';
  return (count / 1000000).toFixed(1).replace('.0', '') + 'M';
};

// Check if post content contains mentions (@username)
export const extractMentions = (content: string): string[] => {
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
};

// Check if post content contains hashtags (#hashtag)
export const extractHashtags = (content: string): string[] => {
  const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
  const hashtags = [];
  let match;
  
  while ((match = hashtagRegex.exec(content)) !== null) {
    hashtags.push(match[1]);
  }
  
  return hashtags;
};

// Format post content with clickable mentions and hashtags
export const formatPostContent = (content: string): string => {
  return content
    .replace(/@([a-zA-Z0-9_]+)/g, '<span class="text-sage-600 font-medium">@$1</span>')
    .replace(/#([a-zA-Z0-9_]+)/g, '<span class="text-lavender-600 font-medium">#$1</span>');
};

// Check if user can edit/delete post (is author and within time limit)
export const canEditPost = (post: { authorId: string; createdAt: Date }, currentUserId: string, editTimeLimit: number = 15 * 60 * 1000): boolean => {
  if (post.authorId !== currentUserId) return false;
  
  const timeSinceCreation = Date.now() - post.createdAt.getTime();
  return timeSinceCreation <= editTimeLimit;
};

// Generate post URL slug
export const generatePostSlug = (content: string, maxLength: number = 50): string => {
  return content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, maxLength)
    .replace(/-+$/, '');
};

// Debounce function for search
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};