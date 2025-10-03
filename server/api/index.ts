import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

  // Root path - welcome message
  if (req.url === '/') {
    return res.status(200).json({
      success: true,
      message: 'Introvirght API is running',
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/health',
        api: '/api/*'
      }
    });
  }

  // Health check endpoint
  if (req.url === '/health' || req.url === '/api/health') {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      message: 'Vercel serverless function is working'
    });
  }

    // Authentication endpoints
    if (req.url === '/api/auth/register' && req.method === 'POST') {
      const body = req.body || {};
      console.log('Registration request:', { body, url: req.url, method: req.method });
      
      return res.status(200).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: 'demo-user-' + Date.now(),
            username: body.username || 'demo-user',
            email: body.email || 'demo@example.com',
            bio: body.bio || ''
          },
          token: 'demo-jwt-token-' + Date.now()
        }
      });
    }

    if (req.url === '/api/auth/login' && req.method === 'POST') {
      const body = req.body || {};
      console.log('Login request:', { body, url: req.url, method: req.method });
      
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: 'demo-user-123',
            username: body.username || 'demo-user',
            email: body.email || 'demo@example.com',
            bio: ''
          },
          token: 'demo-jwt-token-' + Date.now()
        }
      });
    }

    // Diary endpoints
    if (req.url === '/api/diary' && req.method === 'GET') {
      console.log('Diary GET request');
      
      // Return demo diary entries
      return res.status(200).json({
        success: true,
        data: {
          entries: [
            {
              id: 'entry-1',
              title: 'Welcome to Your Diary',
              content: 'This is your first diary entry! Start documenting your thoughts, feelings, and experiences in this private space designed for reflection and growth.',
              mood: 'reflective',
              gratitude: 'Grateful for this new journey of self-discovery',
              highlights: 'Setting up my personal diary space',
              goals: 'Write regularly and reflect mindfully',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            hasMore: false
          }
        }
      });
    }

    if (req.url === '/api/diary' && req.method === 'POST') {
      const body = req.body || {};
      console.log('Diary POST request:', body);
      
      // Create new diary entry
      const newEntry = {
        id: 'entry-' + Date.now(),
        title: body.title || '',
        content: body.content || '',
        mood: body.mood || 'reflective',
        gratitude: body.gratitude || '',
        highlights: body.highlights || '',
        goals: body.goals || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return res.status(201).json({
        success: true,
        message: 'Diary entry created successfully',
        data: newEntry
      });
    }

    // Posts endpoints
    if (req.url === '/api/posts' && req.method === 'GET') {
      console.log('Posts GET request');
      
      return res.status(200).json({
        success: true,
        data: {
          posts: [
            {
              id: 'post-1',
              content: 'Welcome to Introvirght! This is a demo post to show how the platform works.',
              author: {
                id: 'demo-user-123',
                username: 'demo-user',
                email: 'demo@example.com'
              },
              likeCount: 0,
              repostCount: 0,
              isLikedByCurrentUser: false,
              isRepostedByCurrentUser: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            hasMore: false
          }
        }
      });
    }

    if (req.url === '/api/posts' && req.method === 'POST') {
      const body = req.body || {};
      console.log('Posts POST request:', body);
      
      const newPost = {
        id: 'post-' + Date.now(),
        content: body.content || '',
        author: {
          id: 'demo-user-123',
          username: 'demo-user',
          email: 'demo@example.com'
        },
        likeCount: 0,
        repostCount: 0,
        isLikedByCurrentUser: false,
        isRepostedByCurrentUser: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: newPost
      });
    }

  // Simple API endpoints for testing
  if (req.url?.startsWith('/api/')) {
    return res.status(200).json({
      success: true,
      message: 'API endpoint working',
      endpoint: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
      note: 'This is a demo API - data is not persisted'
    });
  }

    // Default response
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Endpoint not found',
        url: req.url
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred processing your request'
      }
    });
  }
}