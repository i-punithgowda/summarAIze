import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
    origin: '*', // For development, restrict in production
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
app.use('/', routes);

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'SummarAIze Node.js Backend is running' });
});

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ detail: 'Not Found' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('Error:', err);
    res.status(500).json({ detail: err.message || 'Internal Server Error' });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 SummarAIze Node.js Backend is running on http://localhost:${PORT}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔑 Gemini API Key: ${process.env.GEMINI_API_KEY ? '✓ Configured' : '✗ Not Set'}`);
});

// Graceful shutdown handlers
const gracefulShutdown = () => {
    console.log('\n🛑 Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });

    // Force close after 5 seconds
    setTimeout(() => {
        console.error('⚠️  Forcing shutdown');
        process.exit(1);
    }, 5000);
};

// Handle process termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle ts-node-dev restart
process.once('SIGUSR2', () => {
    console.log('\n🔄 Restarting...');
    server.close(() => {
        process.kill(process.pid, 'SIGUSR2');
    });
});

export default app;

