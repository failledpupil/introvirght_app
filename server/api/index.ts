import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
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
    return res.status(200).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: 'demo-user-' + Date.now(),
        username: req.body?.username || 'demo-user',
        email: req.body?.email || 'demo@example.com'
      },
      token: 'demo-jwt-token-' + Date.now()
    });
  }

  if (req.url === '/api/auth/login' && req.method === 'POST') {
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: 'demo-user-123',
        username: req.body?.username || 'demo-user',
        email: req.body?.email || 'demo@example.com'
      },
      token: 'demo-jwt-token-' + Date.now()
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
}