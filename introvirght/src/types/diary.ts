// Diary types for frontend

export const MoodType = {
  HAPPY: 'happy',
  CALM: 'calm',
  REFLECTIVE: 'reflective',
  GRATEFUL: 'grateful',
  ANXIOUS: 'anxious',
  SAD: 'sad',
  EXCITED: 'excited',
  PEACEFUL: 'peaceful'
} as const;

export type MoodType = typeof MoodType[keyof typeof MoodType];

export interface DiaryEntry {
  id: string;
  userId: string;
  title?: string;
  content: string;
  mood: MoodType;
  gratitude?: string;
  highlights?: string;
  goals?: string;
  isPrivate: boolean;
  vectorId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDiaryEntryData {
  title?: string;
  content: string;
  mood: MoodType;
  gratitude?: string;
  highlights?: string;
  goals?: string;
}

export interface UpdateDiaryEntryData {
  title?: string;
  content?: string;
  mood?: MoodType;
  gratitude?: string;
  highlights?: string;
  goals?: string;
}

export interface MoodOption {
  value: MoodType;
  label: string;
  color: string;
  icon: string;
}

export interface DiaryEntriesResponse {
  entries: DiaryEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface MoodStats {
  moodStats: Record<MoodType, number>;
  totalEntries: number;
}