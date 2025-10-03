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

  // Simple API endpoints for testing
  if (req.url?.startsWith('/api/')) {
    return res.status(200).json({
      success: true,
      message: 'API is working',
      endpoint: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
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