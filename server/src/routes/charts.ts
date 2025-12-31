// =================================================================
// Charts Routes - CRUD operations for fundus charts
// =================================================================

import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, execute } from '../database';
import { requireAuth, optionalAuth, type AuthRequest } from '../middleware/auth';

const router = Router();

interface ChartRow {
    id: string;
    name: string;
    eye_side: string;
    elements: string;
    patient_id: string | null;
    user_id: string;
    share_id: string | null;
    is_shared: number;
    created_at: string;
    updated_at: string;
    patient_name?: string | null;
    element_count?: number;
}

// =================================================================
// GET /api/charts - List user's charts
// =================================================================
router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
    const charts = queryAll<ChartRow>(`
        SELECT 
            c.id, c.name, c.eye_side, c.patient_id, c.is_shared, c.created_at, c.updated_at,
            p.name as patient_name
        FROM charts c
        LEFT JOIN patients p ON c.patient_id = p.id
        WHERE c.user_id = ?
        ORDER BY c.updated_at DESC
    `, [req.user!.userId]);

    res.json(charts.map(c => ({
        id: c.id,
        name: c.name,
        eyeSide: c.eye_side,
        patientId: c.patient_id,
        patientName: c.patient_name,
        isShared: Boolean(c.is_shared),
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        elementCount: 0
    })));
});

// =================================================================
// GET /api/charts/:id - Get single chart
// =================================================================
router.get('/:id', requireAuth, (req: AuthRequest, res: Response) => {
    const chart = queryOne<ChartRow>(
        `SELECT * FROM charts WHERE id = ? AND user_id = ?`,
        [req.params.id, req.user!.userId]
    );

    if (!chart) {
        res.status(404).json({ error: 'Chart not found' });
        return;
    }

    res.json({
        id: chart.id,
        name: chart.name,
        eyeSide: chart.eye_side,
        elements: JSON.parse(chart.elements || '[]'),
        patientId: chart.patient_id,
        userId: chart.user_id,
        shareId: chart.share_id,
        isShared: Boolean(chart.is_shared),
        createdAt: chart.created_at,
        updatedAt: chart.updated_at
    });
});

// =================================================================
// POST /api/charts - Create or update chart
// =================================================================
router.post('/', requireAuth, (req: AuthRequest, res: Response) => {
    const { id, name, eyeSide, elements, patientId } = req.body;

    if (!name || !eyeSide || !elements) {
        res.status(400).json({ error: 'Name, eyeSide, and elements are required' });
        return;
    }

    const now = new Date().toISOString();
    const elementsJson = JSON.stringify(elements);

    // Update existing chart
    if (id) {
        const existing = queryOne<ChartRow>('SELECT id FROM charts WHERE id = ? AND user_id = ?', [id, req.user!.userId]);

        if (existing) {
            execute(
                `UPDATE charts SET name = ?, eye_side = ?, elements = ?, patient_id = ?, updated_at = ? WHERE id = ?`,
                [name, eyeSide, elementsJson, patientId || null, now, id]
            );

            res.json({
                id,
                name,
                eyeSide,
                elements,
                patientId: patientId || null,
                userId: req.user!.userId,
                updatedAt: now
            });
            return;
        }
    }

    // Create new chart
    const newId = id || uuidv4();
    execute(
        `INSERT INTO charts (id, name, eye_side, elements, patient_id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [newId, name, eyeSide, elementsJson, patientId || null, req.user!.userId, now, now]
    );

    res.status(201).json({
        id: newId,
        name,
        eyeSide,
        elements,
        patientId: patientId || null,
        userId: req.user!.userId,
        isShared: false,
        createdAt: now,
        updatedAt: now
    });
});

// =================================================================
// DELETE /api/charts/:id
// =================================================================
router.delete('/:id', requireAuth, (req: AuthRequest, res: Response) => {
    const existing = queryOne<ChartRow>('SELECT id FROM charts WHERE id = ? AND user_id = ?', [req.params.id, req.user!.userId]);

    if (!existing) {
        res.status(404).json({ error: 'Chart not found' });
        return;
    }

    execute('DELETE FROM charts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Chart deleted' });
});

// =================================================================
// POST /api/charts/:id/share - Generate share link
// =================================================================
router.post('/:id/share', requireAuth, (req: AuthRequest, res: Response) => {
    const chart = queryOne<ChartRow>('SELECT id, share_id FROM charts WHERE id = ? AND user_id = ?', [req.params.id, req.user!.userId]);

    if (!chart) {
        res.status(404).json({ error: 'Chart not found' });
        return;
    }

    let shareId = chart.share_id;

    if (!shareId) {
        shareId = uuidv4().slice(0, 8);
        execute('UPDATE charts SET share_id = ?, is_shared = 1 WHERE id = ?', [shareId, chart.id]);
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.json({
        shareId,
        shareUrl: `${baseUrl}?share=${shareId}`
    });
});

// =================================================================
// GET /api/charts/shared/:shareId - Get shared chart
// =================================================================
router.get('/shared/:shareId', optionalAuth, (req: AuthRequest, res: Response) => {
    const chart = queryOne<ChartRow>(
        `SELECT * FROM charts WHERE share_id = ? AND is_shared = 1`,
        [req.params.shareId]
    );

    if (!chart) {
        res.status(404).json({ error: 'Shared chart not found' });
        return;
    }

    res.json({
        id: chart.id,
        name: chart.name,
        eyeSide: chart.eye_side,
        elements: JSON.parse(chart.elements || '[]'),
        isShared: true,
        createdAt: chart.created_at,
        updatedAt: chart.updated_at
    });
});

export default router;
