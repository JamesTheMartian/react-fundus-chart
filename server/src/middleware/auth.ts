// =================================================================
// JWT Authentication Middleware
// =================================================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Secret key (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'fundus-chart-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
    userId: string;
    username: string;
}

export interface AuthRequest extends Request {
    user?: JWTPayload;
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
        return null;
    }
}

// Authentication middleware - requires valid token
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix
    const payload = verifyToken(token);

    if (!payload) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
    }

    req.user = payload;
    next();
}

// Optional auth middleware - extracts user if token present, but doesn't require it
export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        const payload = verifyToken(token);
        if (payload) {
            req.user = payload;
        }
    }

    next();
}

export default { generateToken, verifyToken, requireAuth, optionalAuth };
