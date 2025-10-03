import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../config/database';

export enum MoodType {
    HAPPY = 'happy',
    CALM = 'calm',
    REFLECTIVE = 'reflective',
    GRATEFUL = 'grateful',
    ANXIOUS = 'anxious',
    SAD = 'sad',
    EXCITED = 'excited',
    PEACEFUL = 'peaceful'
}

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
    userId: string;
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

export class DiaryEntryModel {
    /**
     * Create a new diary entry
     */
    static async create(data: CreateDiaryEntryData): Promise<DiaryEntry> {
        console.log('DiaryEntry.create called with data:', data);
        const db = getDatabase();
        const id = uuidv4();
        const now = new Date();

        console.log('Attempting to insert diary entry with ID:', id);
        
        try {
            await db.run(
                `INSERT INTO diary_entries (
            id, user_id, title, content, mood, gratitude, highlights, goals, is_private, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    id,
                    data.userId,
                    data.title || null,
                    data.content,
                    data.mood,
                    data.gratitude || null,
                    data.highlights || null,
                    data.goals || null,
                    true, // Always private for diary entries
                    now.toISOString(),
                    now.toISOString()
                ]
            );
            console.log('Database insert successful for ID:', id);
        } catch (dbError) {
            console.error('Database insert failed:', dbError);
            throw dbError;
        }

        const entry = await this.findById(id);
        if (!entry) {
            throw new Error('Failed to create diary entry');
        }

        return entry;
    }

    /**
     * Find diary entry by ID (with user ownership check)
     */
    static async findById(id: string, userId?: string): Promise<DiaryEntry | null> {
        const db = getDatabase();
        let query = `
      SELECT id, user_id, title, content, mood, gratitude, highlights, goals, 
             is_private, vector_id, created_at, updated_at
      FROM diary_entries 
      WHERE id = ?
    `;
        const params = [id];

        // If userId is provided, ensure user can only access their own entries
        if (userId) {
            query += ' AND user_id = ?';
            params.push(userId);
        }

        const row = await db.get(query, params);

        if (!row) {
            return null;
        }

        return this.mapRowToDiaryEntry(row);
    }

    /**
     * Find all diary entries for a user
     */
    static async findByUserId(
        userId: string,
        options: {
            limit?: number;
            offset?: number;
            orderBy?: 'created_at' | 'updated_at';
            order?: 'ASC' | 'DESC';
        } = {}
    ): Promise<DiaryEntry[]> {
        const db = getDatabase();
        const {
            limit = 20,
            offset = 0,
            orderBy = 'created_at',
            order = 'DESC'
        } = options;

        const rows = await db.all(
            `SELECT id, user_id, title, content, mood, gratitude, highlights, goals, 
              is_private, vector_id, created_at, updated_at
       FROM diary_entries 
       WHERE user_id = ? 
       ORDER BY ${orderBy} ${order}
       LIMIT ? OFFSET ?`,
            [userId, limit, offset]
        );

        return rows.map(row => this.mapRowToDiaryEntry(row));
    }

    /**
     * Update diary entry
     */
    static async update(id: string, userId: string, data: UpdateDiaryEntryData): Promise<DiaryEntry | null> {
        const db = getDatabase();
        const now = new Date();

        // Build dynamic update query
        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (data.title !== undefined) {
            updateFields.push('title = ?');
            updateValues.push(data.title || null);
        }
        if (data.content !== undefined) {
            updateFields.push('content = ?');
            updateValues.push(data.content);
        }
        if (data.mood !== undefined) {
            updateFields.push('mood = ?');
            updateValues.push(data.mood);
        }
        if (data.gratitude !== undefined) {
            updateFields.push('gratitude = ?');
            updateValues.push(data.gratitude || null);
        }
        if (data.highlights !== undefined) {
            updateFields.push('highlights = ?');
            updateValues.push(data.highlights || null);
        }
        if (data.goals !== undefined) {
            updateFields.push('goals = ?');
            updateValues.push(data.goals || null);
        }

        if (updateFields.length === 0) {
            // No fields to update, return existing entry
            return this.findById(id, userId);
        }

        updateFields.push('updated_at = ?');
        updateValues.push(now.toISOString());

        // Add WHERE conditions
        updateValues.push(id, userId);

        const result = await db.run(
            `UPDATE diary_entries SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
            updateValues
        );

        if (!result.changes || result.changes === 0) {
            return null; // Entry not found or user doesn't own it
        }

        return this.findById(id, userId);
    }

    /**
     * Delete diary entry
     */
    static async delete(id: string, userId: string): Promise<boolean> {
        const db = getDatabase();

        const result = await db.run(
            'DELETE FROM diary_entries WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        return Boolean(result.changes && result.changes > 0);
    }

    /**
     * Get diary entry count for user
     */
    static async getCountByUserId(userId: string): Promise<number> {
        const db = getDatabase();

        const row = await db.get(
            'SELECT COUNT(*) as count FROM diary_entries WHERE user_id = ?',
            [userId]
        );

        return row?.count || 0;
    }

    /**
     * Get mood statistics for user
     */
    static async getMoodStats(userId: string): Promise<Record<MoodType, number>> {
        const db = getDatabase();

        const rows = await db.all(
            'SELECT mood, COUNT(*) as count FROM diary_entries WHERE user_id = ? GROUP BY mood',
            [userId]
        );

        const stats: Record<MoodType, number> = {
            [MoodType.HAPPY]: 0,
            [MoodType.CALM]: 0,
            [MoodType.REFLECTIVE]: 0,
            [MoodType.GRATEFUL]: 0,
            [MoodType.ANXIOUS]: 0,
            [MoodType.SAD]: 0,
            [MoodType.EXCITED]: 0,
            [MoodType.PEACEFUL]: 0,
        };

        rows.forEach(row => {
            if (Object.values(MoodType).includes(row.mood as MoodType)) {
                stats[row.mood as MoodType] = row.count;
            }
        });

        return stats;
    }

    /**
     * Update vector ID for diary entry
     */
    static async updateVectorId(id: string, userId: string, vectorId: string): Promise<boolean> {
        const db = getDatabase();

        const result = await db.run(
            'UPDATE diary_entries SET vector_id = ?, updated_at = ? WHERE id = ? AND user_id = ?',
            [vectorId, new Date().toISOString(), id, userId]
        );

        return Boolean(result.changes && result.changes > 0);
    }

    /**
     * Map database row to DiaryEntry object
     */
    private static mapRowToDiaryEntry(row: any): DiaryEntry {
        return {
            id: row.id,
            userId: row.user_id,
            title: row.title,
            content: row.content,
            mood: row.mood as MoodType,
            gratitude: row.gratitude,
            highlights: row.highlights,
            goals: row.goals,
            isPrivate: Boolean(row.is_private),
            vectorId: row.vector_id,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
        };
    }

    /**
     * Validate mood type
     */
    static isValidMood(mood: string): mood is MoodType {
        return Object.values(MoodType).includes(mood as MoodType);
    }

    /**
     * Validate diary entry data
     */
    static validateCreateData(data: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!data.userId || typeof data.userId !== 'string') {
            errors.push('User ID is required');
        }

        if (!data.content || typeof data.content !== 'string' || data.content.trim().length === 0) {
            errors.push('Content is required and cannot be empty');
        }

        if (data.content && data.content.length > 10000) {
            errors.push('Content must be no more than 10,000 characters');
        }

        if (!data.mood || !this.isValidMood(data.mood)) {
            errors.push('Valid mood is required');
        }

        if (data.title && (typeof data.title !== 'string' || data.title.length > 200)) {
            errors.push('Title must be a string with maximum 200 characters');
        }

        if (data.gratitude && (typeof data.gratitude !== 'string' || data.gratitude.length > 1000)) {
            errors.push('Gratitude must be a string with maximum 1,000 characters');
        }

        if (data.highlights && (typeof data.highlights !== 'string' || data.highlights.length > 1000)) {
            errors.push('Highlights must be a string with maximum 1,000 characters');
        }

        if (data.goals && (typeof data.goals !== 'string' || data.goals.length > 1000)) {
            errors.push('Goals must be a string with maximum 1,000 characters');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate update data
     */
    static validateUpdateData(data: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (data.content !== undefined) {
            if (typeof data.content !== 'string' || data.content.trim().length === 0) {
                errors.push('Content cannot be empty');
            }
            if (data.content && data.content.length > 10000) {
                errors.push('Content must be no more than 10,000 characters');
            }
        }

        if (data.mood !== undefined && !this.isValidMood(data.mood)) {
            errors.push('Invalid mood type');
        }

        if (data.title !== undefined && data.title !== null && (typeof data.title !== 'string' || data.title.length > 200)) {
            errors.push('Title must be a string with maximum 200 characters');
        }

        if (data.gratitude !== undefined && data.gratitude !== null && (typeof data.gratitude !== 'string' || data.gratitude.length > 1000)) {
            errors.push('Gratitude must be a string with maximum 1,000 characters');
        }

        if (data.highlights !== undefined && data.highlights !== null && (typeof data.highlights !== 'string' || data.highlights.length > 1000)) {
            errors.push('Highlights must be a string with maximum 1,000 characters');
        }

        if (data.goals !== undefined && data.goals !== null && (typeof data.goals !== 'string' || data.goals.length > 1000)) {
            errors.push('Goals must be a string with maximum 1,000 characters');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}