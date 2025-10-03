# Introvirght Server

Backend API for the Introvirght social platform.

## Features

- **Authentication**: JWT-based authentication with secure password hashing
- **User Management**: User registration, login, profile management
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive validation and sanitization
- **Database**: SQLite for development (easily configurable for PostgreSQL)
- **Security**: Helmet, CORS, input sanitization, and more

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/check-username` - Check username availability

### Users
- `GET /api/users/:username` - Get user profile by username
- `PUT /api/users/profile` - Update current user's profile

### Posts
- `POST /api/posts` - Create a new post
- `GET /api/posts/feed` - Get user's personalized feed
- `GET /api/posts/recent` - Get recent posts (public timeline)
- `GET /api/posts/user/:username` - Get posts by specific user
- `GET /api/posts/search` - Search posts by content
- `GET /api/posts/:postId` - Get single post by ID
- `PUT /api/posts/:postId` - Update post (within 15 minutes)
- `DELETE /api/posts/:postId` - Delete post
- `POST /api/posts/:postId/like` - Like/unlike a post
- `POST /api/posts/:postId/repost` - Repost/unrepost a post

### Diary
- `POST /api/diary` - Create a new diary entry
- `GET /api/diary` - Get user's diary entries
- `GET /api/diary/:entryId` - Get specific diary entry
- `PUT /api/diary/:entryId` - Update diary entry
- `DELETE /api/diary/:entryId` - Delete diary entry
- `GET /api/diary/moods` - Get mood statistics
- `GET /api/diary/mood-types` - Get available mood types
- `GET /api/diary/search` - Semantic search through diary entries
- `GET /api/diary/insights` - Get AI-generated insights

### Chat (AI Companion)
- `POST /api/chat/message` - Send message to AI companion
- `GET /api/chat/history` - Get conversation history
- `DELETE /api/chat/history` - Clear conversation history
- `GET /api/chat/stats` - Get conversation statistics

### Health Check
- `GET /health` - Server health status

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment file:
   ```bash
   cp .env.example .env
   ```

3. Update environment variables in `.env` as needed

4. Start development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   npm start
   ```

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - Token expiration time (default: 7d)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)
- `BCRYPT_ROUNDS` - Bcrypt hashing rounds (default: 12)
- `OPENAI_API_KEY` - OpenAI API key for AI companion (optional)
- `OPENAI_MODEL` - OpenAI model to use (default: gpt-3.5-turbo)

### OpenAI Integration

The AI companion feature uses OpenAI's ChatGPT API to provide intelligent, personalized responses based on user diary entries. See `OPENAI_SETUP.md` for detailed setup instructions.

**Note:** The OpenAI API key is optional. If not provided, the application will fall back to rule-based responses.

## Database Schema

### Users Table
- `id` - Unique identifier
- `username` - Unique username (3-20 chars, alphanumeric + underscore)
- `email` - Unique email address
- `password_hash` - Bcrypt hashed password
- `bio` - Optional bio (max 160 chars)
- `is_email_verified` - Email verification status
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp
- `last_login_at` - Last login timestamp

## Security Features

- **Password Hashing**: Bcrypt with configurable rounds
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: Comprehensive validation and sanitization
- **CORS**: Configured for frontend integration
- **Helmet**: Security headers
- **Reserved Usernames**: Protection against system conflicts

## Error Handling

All API responses follow a consistent format:

```json
{
  "success": boolean,
  "data": any, // Present on success
  "error": {   // Present on error
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": any // Optional additional details
  }
}
```