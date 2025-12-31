// =================================================================
// Express Server - Main Entry Point
// =================================================================

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

import { initDatabase } from './database';
import authRoutes from './routes/auth';
import chartsRoutes from './routes/charts';
import patientsRoutes from './routes/patients';

const app = express();
const port = process.env.PORT || 3000;

// =================================================================
// Middleware
// =================================================================

app.use(cors({
    origin: true, // Allow any origin (reflects the request origin)
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
    app.use((req, _res, next) => {
        console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
        next();
    });
}

// =================================================================
// Routes
// =================================================================

app.get('/', (_req, res) => {
    res.json({
        status: 'ok',
        message: 'Fundus Chart API Server',
        version: '1.0.0'
    });
});

app.get('/api/health', (_req, res) => {
    try {
        // Simple DB check
        const { getDatabase } = require('./database');
        getDatabase().exec('SELECT 1');
        res.json({ status: 'ok', database: 'connected' }); 
    } catch (err) {
        res.status(500).json({ status: 'error', database: 'disconnected', error: String(err) });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/charts', chartsRoutes);
app.use('/api/patients', patientsRoutes);

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// =================================================================
// Start Server
// =================================================================

async function start() {
    // Ensure data directory exists
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // Initialize database
    await initDatabase();

    app.listen(Number(port), '0.0.0.0', () => {
        console.log('='.repeat(50));
        console.log(`Fundus Chart API Server`);
        console.log(`Running at: http://localhost:${port}`);
        console.log(`API endpoints:`);
        console.log(`  POST /api/auth/login`);
        console.log(`  POST /api/auth/register`);
        console.log(`  GET  /api/auth/me`);
        console.log(`  GET  /api/charts`);
        console.log(`  POST /api/charts`);
        console.log(`  GET  /api/patients`);
        console.log(`  POST /api/patients`);
        console.log('='.repeat(50));
        console.log(`Demo user: demo / demo`);
        console.log('='.repeat(50));
    });
}

start().catch(console.error);

export default app;
