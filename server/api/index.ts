import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initializeDatabase } from '../src/config/database';
import authRoutes from '../src/routes/auth';
import userRoutes from '../src/routes/users';
import postRoutes from '../src/routes/posts';
import diaryRoutes from '../src/routes/diary';
import chatRoutes from '../src/routes/chat';

// Load environment variables
dotenv.config();

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Production frontend URLs
const PRODUCTION_URLS = [
    'https://introvirght.vercel.app',
    'https://introvirght-frontend.vercel.app',
    'https://introvirght-app-git-main-failledpupils-projects.vercel.app',
    'https://introvirght-app.vercel.app',
    'https://introvirght-app-p8es.vercel.app',
    'https://your-custom-domain.com'
];

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
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
}

// Initialize database once
let dbInitialized = false;
const initDB = async () => {
    if (!dbInitialized) {
        try {
            await initializeDatabase();
            dbInitialized = true;
            console.log('✅ Database initialized for serverless function');
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            throw error;
        }
    }
};

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        await initDB();
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Database connection failed'
        });
    }
});

// API routes with database initialization
app.use('/api/auth', async (req, res, next) => {
    await initDB();
    next();
}, authRoutes);

app.use('/api/users', async (req, res, next) => {
    await initDB();
    next();
}, userRoutes);

app.use('/api/posts', async (req, res, next) => {
    await initDB();
    next();
}, postRoutes);

app.use('/api/diary', async (req, res, next) => {
    await initDB();
    next();
}, diaryRoutes);

app.use('/api/chat', async (req, res, next) => {
    await initDB();
    next();
}, chatRoutes);

// 404 handler
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

export default app;