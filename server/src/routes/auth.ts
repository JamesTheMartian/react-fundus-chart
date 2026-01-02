// =================================================================
// Auth Routes - Login, Register, Get Current User
// =================================================================

import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { queryOne, execute } from '../database';
import { generateToken, requireAuth, type AuthRequest } from '../middleware/auth';
import { logAudit, AuditAction } from '../utils/audit';

const router = Router();

interface UserRow {
    id: string;
    username: string;
    password_hash: string;
    name: string;
    created_at: string;
}

// =================================================================
// POST /api/auth/register - Register new user
// =================================================================
router.post('/register', (req, res: Response) => {
    const { username, password, name } = req.body;

    if (!username || !password || !name) {
        res.status(400).json({ error: 'Username, password, and name are required' });
        return;
    }

    if (username.length < 3) {
        res.status(400).json({ error: 'Username must be at least 3 characters' });
        return;
    }

    if (password.length < 4) {
        res.status(400).json({ error: 'Password must be at least 4 characters' });
        return;
    }

    // Check if username exists
    const existing = queryOne<UserRow>('SELECT id FROM users WHERE username = ?', [username]);
    if (existing) {
        res.status(409).json({ error: 'Username already exists' });
        return;
    }

    // Create user
    const id = uuidv4();
    const passwordHash = bcrypt.hashSync(password, 10);
    const createdAt = new Date().toISOString();

    execute(
        `INSERT INTO users (id, username, password_hash, name, created_at) VALUES (?, ?, ?, ?, ?)`,
        [id, username, passwordHash, name, createdAt]
    );

    // Log audit
    logAudit(id, AuditAction.USER_REGISTER, 'user', id);

    // Generate token
    const token = generateToken({ userId: id, username });

    res.status(201).json({
        user: { id, username, name, createdAt },
        token
    });
});

// =================================================================
// POST /api/auth/login - Login user
// =================================================================
router.post('/login', (req, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
    }

    // Find user
    const user = queryOne<UserRow>(
        `SELECT id, username, password_hash, name, created_at FROM users WHERE username = ?`,
        [username]
    );

    if (!user) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
    }

    // Check password
    if (!bcrypt.compareSync(password, user.password_hash)) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
    }

    // Log audit
    logAudit(user.id, AuditAction.USER_LOGIN, 'user', user.id);

    // Generate token
    const token = generateToken({ userId: user.id, username: user.username });

    res.json({
        user: {
            id: user.id,
            username: user.username,
            name: user.name,
            createdAt: user.created_at
        },
        token
    });
});

// =================================================================
// GET /api/auth/me - Get current user
// =================================================================
router.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
    const user = queryOne<UserRow>(
        `SELECT id, username, name, created_at FROM users WHERE id = ?`,
        [req.user!.userId]
    );

    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        createdAt: user.created_at
    });
});

// =================================================================
// POST /api/auth/logout
// =================================================================
router.post('/logout', requireAuth, (req: AuthRequest, res: Response) => {
    // Log audit
    logAudit(req.user!.userId, AuditAction.USER_LOGOUT, 'user', req.user!.userId);

    res.json({ message: 'Logged out successfully' });
});

export default router;
