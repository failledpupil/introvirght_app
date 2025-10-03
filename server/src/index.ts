import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import postRoutes from './routes/posts';
import diaryRoutes from './routes/diary';
import chatRoutes from './routes/chat';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Production frontend URLs
const PRODUCTION_URLS = [
    'https://introvirght.vercel.app',
    'https://introvirght-frontend.vercel.app',
    'https://introvirght-app-git-main-failledpupils-projects.vercel.app',
    'https://introvirght-app.vercel.app',
    'https://your-custom-domain.com'
];

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - Allow all localhost ports in development
const corsOrigins = process.env.NODE_ENV === 'production' 
    ? [...PRODUCTION_URLS, FRONTEND_URL]
    : [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', /^http:\/\/localhost:\d+$/];

app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/chat', chatRoutes);

// 404 handler - must be after all other routes
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'Endpoint not found',
        },
    });
});

// Global error handler
app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', error);

    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: process.env.NODE_ENV === 'production'
                ? 'An internal server error occurred'
                : error.message,
        },
    });
});

// Initialize database and start server
const startServer = async () => {
    try {
        console.log('🔄 Starting server initialization...');
        console.log(`📍 PORT: ${PORT}`);
        console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
        
        // Initialize database
        console.log('🔄 Initializing database...');
        await initializeDatabase();
        console.log('✅ Database initialized successfully');

        // Initialize DataStax (optional - will warn if not configured)
        console.log('🔄 Initializing DataStax vector store...');
        try {
            const { dataStaxService } = await import('./config/datastax');
            if (dataStaxService.isConfigured()) {
                await dataStaxService.initialize();
                console.log('✅ DataStax vector store initialized successfully');
            } else {
                console.log('⚠️ DataStax not configured - vector features will be disabled');
                console.log('   Set DATASTAX_ENDPOINT and DATASTAX_TOKEN to enable vector search');
            }
        } catch (error) {
            console.log('⚠️ DataStax initialization failed - vector features will be disabled');
            console.log('   Error:', error instanceof Error ? error.message : 'Unknown error');
        }

        // Start server
        console.log('🔄 Starting HTTP server...');
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📱 Frontend URL: ${FRONTEND_URL}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
            console.log('✅ Server startup complete - Fresh deployment!');
        });

        server.on('error', (error: any) => {
            console.error('❌ Server error:', error);
            process.exit(1);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Start the server
startServer();