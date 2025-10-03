# Personal Diary Feature Design

## Overview

The Personal Diary feature integrates seamlessly into the existing Introvirght platform, adding a private journaling space that maintains the platform's mindful and calming aesthetic. The feature will be implemented as a new section accessible through navigation, with its own dedicated components and database schema.

## Architecture

### Frontend Architecture
- **DiaryPage Component**: Main diary interface with entry list and navigation
- **DiaryEntry Component**: Individual diary entry display and editing
- **DiaryComposer Component**: Template-based entry creation form
- **DiaryService**: API communication layer for diary operations
- **Diary Types**: TypeScript interfaces for diary data structures

### Backend Architecture
- **Diary Model**: Database model for diary entries with privacy controls
- **Diary Controller**: API endpoints for CRUD operations on diary entries
- **Diary Routes**: Express routes with authentication middleware
- **Privacy Middleware**: Ensures diary entries remain private to the owner

## Components and Interfaces

### Frontend Components

#### DiaryPage Component
```typescript
interface DiaryPageProps {
  className?: string;
}

interface DiaryPageState {
  entries: DiaryEntry[];
  loading: boolean;
  selectedEntry?: DiaryEntry;
  showComposer: boolean;
}
```

**Features:**
- Entry list with pagination
- Search/filter by date or mood
- New entry creation button
- Calming, journal-like styling with paper texture
- Responsive design for mobile and desktop

#### DiaryComposer Component
```typescript
interface DiaryComposerProps {
  entry?: DiaryEntry; // For editing existing entries
  onSave: (entry: DiaryEntry) => void;
  onCancel: () => void;
}

interface DiaryTemplate {
  date: Date;
  mood: MoodType;
  title?: string;
  gratitude?: string;
  reflection: string;
  goals?: string;
  highlights?: string;
}
```

**Template Sections:**
- **Date & Time**: Auto-populated, editable
- **Mood Selection**: Visual mood picker with colors
- **Title**: Optional entry title
- **Gratitude**: "What am I grateful for today?"
- **Reflection**: Main content area with rich text
- **Daily Highlights**: "What were the best parts of today?"
- **Tomorrow's Goals**: "What do I want to focus on tomorrow?"

#### DiaryEntry Component
```typescript
interface DiaryEntryProps {
  entry: DiaryEntry;
  onEdit: (entry: DiaryEntry) => void;
  onDelete: (entryId: string) => void;
  isPreview?: boolean;
}
```

**Features:**
- Full entry display with formatted sections
- Edit/delete controls for owner
- Mood indicator with color coding
- Elegant typography and spacing
- Print-friendly styling

### Backend Models

#### Diary Entry Model
```typescript
interface DiaryEntry {
  id: string;
  userId: string;
  title?: string;
  content: string;
  mood: MoodType;
  gratitude?: string;
  highlights?: string;
  goals?: string;
  isPrivate: boolean; // Always true for diary entries
  createdAt: Date;
  updatedAt: Date;
}

enum MoodType {
  HAPPY = 'happy',
  CALM = 'calm',
  REFLECTIVE = 'reflective',
  GRATEFUL = 'grateful',
  ANXIOUS = 'anxious',
  SAD = 'sad',
  EXCITED = 'excited',
  PEACEFUL = 'peaceful'
}
```

## Data Models

### Database Schema

#### Primary Database - diary_entries Table
```sql
CREATE TABLE diary_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT NOT NULL,
  gratitude TEXT,
  highlights TEXT,
  goals TEXT,
  is_private BOOLEAN DEFAULT TRUE,
  vector_id TEXT, -- Reference to vector database entry
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_diary_entries_user_id ON diary_entries (user_id);
CREATE INDEX idx_diary_entries_created_at ON diary_entries (created_at);
CREATE INDEX idx_diary_entries_vector_id ON diary_entries (vector_id);
```

#### Vector Database Integration
**Purpose**: Store diary content as embeddings for AI chatbot training and semantic search

**Vector Storage Structure**:
```typescript
interface DiaryVector {
  id: string;
  userId: string;
  entryId: string;
  content: string; // Full diary entry content
  embedding: number[]; // Vector embedding of the content
  metadata: {
    date: string;
    mood: MoodType;
    topics: string[]; // Extracted topics/themes
    sentiment: number; // Sentiment score
    wordCount: number;
  };
  createdAt: Date;
}
```

**Vector Database Choice**: 
- **Pinecone** or **Weaviate** for cloud-hosted solution
- **Chroma** or **FAISS** for self-hosted solution
- Embeddings generated using **OpenAI text-embedding-ada-002** or **Sentence Transformers**

### API Endpoints

#### Diary Routes (`/api/diary`)
- `GET /api/diary` - Get user's diary entries (paginated)
- `POST /api/diary` - Create new diary entry (auto-generates vector embedding)
- `GET /api/diary/:id` - Get specific diary entry (owner only)
- `PUT /api/diary/:id` - Update diary entry (regenerates vector embedding)
- `DELETE /api/diary/:id` - Delete diary entry (removes from vector DB)
- `GET /api/diary/moods` - Get mood statistics for user
- `GET /api/diary/search` - Semantic search through user's diary entries
- `GET /api/diary/insights` - AI-generated insights from diary patterns

#### AI Chatbot Routes (`/api/diary/chat`)
- `POST /api/diary/chat` - Chat with AI trained on user's diary data
- `GET /api/diary/chat/history` - Get chat conversation history
- `DELETE /api/diary/chat/history` - Clear chat history
- `POST /api/diary/chat/retrain` - Trigger retraining of user's AI model

## Error Handling

### Frontend Error Handling
- **Network Errors**: Graceful fallback with retry options
- **Validation Errors**: Real-time form validation with helpful messages
- **Authentication Errors**: Redirect to login if session expires
- **Not Found Errors**: Friendly messages for missing entries

### Backend Error Handling
- **Authorization Errors**: Ensure users can only access their own diary entries
- **Validation Errors**: Comprehensive input validation with detailed error messages
- **Database Errors**: Proper error logging and user-friendly responses
- **Rate Limiting**: Prevent abuse of diary creation endpoints

## Testing Strategy

### Frontend Testing
- **Component Tests**: Test diary components in isolation
- **Integration Tests**: Test diary workflow end-to-end
- **Accessibility Tests**: Ensure diary interface is accessible
- **Responsive Tests**: Verify mobile and desktop layouts

### Backend Testing
- **Unit Tests**: Test diary model and controller logic
- **API Tests**: Test all diary endpoints with various scenarios
- **Security Tests**: Verify privacy controls and authorization
- **Performance Tests**: Test with large numbers of diary entries

## User Experience Design

### Visual Design
- **Color Palette**: Warm, earthy tones (sage, cream, soft browns)
- **Typography**: Serif fonts for diary content, sans-serif for UI
- **Layout**: Clean, spacious design with plenty of whitespace
- **Icons**: Gentle, hand-drawn style mood indicators

### Interaction Design
- **Smooth Transitions**: Gentle animations between states
- **Auto-save**: Periodic saving of draft content
- **Keyboard Shortcuts**: Quick access to common actions
- **Mobile Gestures**: Swipe to navigate between entries

### Accessibility
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Keyboard Navigation**: Full functionality without mouse
- **Color Contrast**: WCAG AA compliant color combinations
- **Font Scaling**: Responsive to user font size preferences

## Integration Points

### Navigation Integration
- Add "My Diary" link to main navigation when authenticated
- Add "AI Companion" or "Chat with My Thoughts" section
- Include diary entry count in user profile statistics
- Optional: Add quick diary access from compose area

### Existing Feature Integration
- **Search**: Semantic search through diary entries using vector similarity
- **Export**: Allow users to export their diary entries and chat history
- **Backup**: Include diary entries and vector data in account data export
- **AI Insights**: Generate personalized insights and patterns from diary data

### AI Chatbot Integration
- **Personal AI Companion**: Chatbot trained exclusively on user's diary entries
- **Contextual Responses**: AI references specific diary entries in conversations
- **Mood-Aware Interactions**: AI adapts responses based on user's mood patterns
- **Privacy-First**: AI model is user-specific and never shares data between users

## Privacy and Security

### Data Protection
- **Encryption**: Encrypt diary content at rest
- **Access Control**: Strict user-based access controls
- **Audit Logging**: Log access to diary entries for security
- **Data Retention**: User-controlled data retention policies

### Privacy Controls
- **Visibility**: Diary entries never appear in public feeds
- **Sharing**: No sharing options for diary entries
- **Search**: Diary content excluded from platform-wide search
- **Analytics**: Diary usage excluded from public metrics
##
 AI Chatbot Architecture

### Vector Database Processing
**Embedding Generation**:
1. When user creates/updates diary entry
2. Extract text content (title + content + gratitude + highlights + goals)
3. Generate embedding using text-embedding model
4. Store in vector database with user-specific namespace
5. Update metadata with topics, sentiment, and themes

**Semantic Search**:
1. Convert user query to embedding
2. Search user's vector namespace for similar entries
3. Return relevant diary entries as context
4. Use for chatbot responses and insights

### AI Model Architecture
**Option 1: RAG (Retrieval-Augmented Generation)**
- Use base LLM (GPT-3.5/4, Claude, or Llama)
- Retrieve relevant diary entries using vector search
- Inject diary context into prompts
- Generate personalized responses

**Option 2: Fine-tuned Model**
- Fine-tune smaller model on user's diary data
- More personalized but requires more data
- Higher privacy (model weights contain user data)

### Chatbot Features
**Conversation Types**:
- **Reflection Partner**: "Tell me about your thoughts on [topic]"
- **Pattern Recognition**: "I notice you often feel anxious on Mondays..."
- **Goal Tracking**: "How are you progressing on the goals you set?"
- **Mood Support**: "You seem stressed lately, let's talk about it"
- **Memory Recall**: "Remember when you wrote about [specific event]?"

**Privacy Controls**:
- User-specific vector namespaces (complete data isolation)
- Option to exclude sensitive entries from AI training
- Local processing option for maximum privacy
- Clear data deletion when user deletes account

### Implementation Considerations
**Vector Database Setup**:
```typescript
// Vector namespace per user
const vectorNamespace = `user_${userId}_diary`;

// Embedding generation
const embedding = await generateEmbedding(diaryContent);

// Store with metadata
await vectorDB.upsert({
  namespace: vectorNamespace,
  vectors: [{
    id: entryId,
    values: embedding,
    metadata: {
      userId,
      date: entry.createdAt,
      mood: entry.mood,
      topics: extractedTopics,
      sentiment: sentimentScore
    }
  }]
});
```

**AI Prompt Engineering**:
```typescript
const systemPrompt = `
You are a personal AI companion trained on this user's diary entries. 
You have deep knowledge of their thoughts, feelings, and experiences.
Be empathetic, supportive, and reference specific diary entries when relevant.
Maintain privacy - never mention other users or share this user's information.
`;

const contextPrompt = `
Recent diary entries:
${relevantEntries.map(entry => `
Date: ${entry.date}
Mood: ${entry.mood}
Content: ${entry.content}
`).join('\n')}

User question: ${userMessage}
`;
```