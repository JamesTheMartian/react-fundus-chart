// =================================================================
// Patients Routes - CRUD operations for patient records
// =================================================================

import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, execute } from '../database';
import { requireAuth, type AuthRequest } from '../middleware/auth';

const router = Router();

interface PatientRow {
    id: string;
    mrn: string;
    name: string;
    date_of_birth: string | null;
    notes: string | null;
    user_id: string;
    created_at: string;
    updated_at: string;
    chart_count?: number;
    last_visit?: string | null;
}

interface ChartSummaryRow {
    id: string;
    name: string;
    eye_side: string;
    is_shared: number;
    created_at: string;
    updated_at: string;
}

// =================================================================
// GET /api/patients - List user's patients
// =================================================================
router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
    const patients = queryAll<PatientRow>(`
        SELECT 
            p.id, p.mrn, p.name, p.date_of_birth, p.notes, p.created_at, p.updated_at,
            (SELECT COUNT(*) FROM charts WHERE patient_id = p.id) as chart_count,
            (SELECT MAX(updated_at) FROM charts WHERE patient_id = p.id) as last_visit
        FROM patients p
        WHERE p.user_id = ?
        ORDER BY p.updated_at DESC
    `, [req.user!.userId]);

    res.json(patients.map(p => ({
        id: p.id,
        mrn: p.mrn,
        name: p.name,
        dateOfBirth: p.date_of_birth,
        chartCount: p.chart_count || 0,
        lastVisit: p.last_visit,
        createdAt: p.created_at,
        updatedAt: p.updated_at
    })));
});

// =================================================================
// GET /api/patients/:id - Get single patient
// =================================================================
router.get('/:id', requireAuth, (req: AuthRequest, res: Response) => {
    const patient = queryOne<PatientRow>(
        `SELECT * FROM patients WHERE id = ? AND user_id = ?`,
        [req.params.id, req.user!.userId]
    );

    if (!patient) {
        res.status(404).json({ error: 'Patient not found' });
        return;
    }

    res.json({
        id: patient.id,
        mrn: patient.mrn,
        name: patient.name,
        dateOfBirth: patient.date_of_birth,
        notes: patient.notes,
        userId: patient.user_id,
        createdAt: patient.created_at,
        updatedAt: patient.updated_at
    });
});

// =================================================================
// POST /api/patients - Create patient
// =================================================================
router.post('/', requireAuth, (req: AuthRequest, res: Response) => {
    const { mrn, name, dateOfBirth, notes } = req.body;

    if (!mrn || !name) {
        res.status(400).json({ error: 'MRN and name are required' });
        return;
    }

    // Check for duplicate MRN
    const existing = queryOne<PatientRow>('SELECT id FROM patients WHERE mrn = ? AND user_id = ?', [mrn, req.user!.userId]);

    if (existing) {
        res.status(409).json({ error: 'A patient with this MRN already exists' });
        return;
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    execute(
        `INSERT INTO patients (id, mrn, name, date_of_birth, notes, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, mrn, name, dateOfBirth || null, notes || null, req.user!.userId, now, now]
    );

    res.status(201).json({
        id,
        mrn,
        name,
        dateOfBirth: dateOfBirth || null,
        notes: notes || null,
        userId: req.user!.userId,
        createdAt: now,
        updatedAt: now
    });
});

// =================================================================
// PUT /api/patients/:id - Update patient
// =================================================================
router.put('/:id', requireAuth, (req: AuthRequest, res: Response) => {
    const { mrn, name, dateOfBirth, notes } = req.body;

    if (!mrn || !name) {
        res.status(400).json({ error: 'MRN and name are required' });
        return;
    }

    const now = new Date().toISOString();

    const existing = queryOne<PatientRow>('SELECT id FROM patients WHERE id = ? AND user_id = ?', [req.params.id, req.user!.userId]);

    if (!existing) {
        res.status(404).json({ error: 'Patient not found' });
        return;
    }

    // Check for duplicate MRN (excluding current patient)
    const duplicate = queryOne<PatientRow>('SELECT id FROM patients WHERE mrn = ? AND user_id = ? AND id != ?', [mrn, req.user!.userId, req.params.id]);

    if (duplicate) {
        res.status(409).json({ error: 'A patient with this MRN already exists' });
        return;
    }

    execute(
        `UPDATE patients SET mrn = ?, name = ?, date_of_birth = ?, notes = ?, updated_at = ? WHERE id = ?`,
        [mrn, name, dateOfBirth || null, notes || null, now, req.params.id]
    );

    res.json({
        id: req.params.id,
        mrn,
        name,
        dateOfBirth: dateOfBirth || null,
        notes: notes || null,
        userId: req.user!.userId,
        updatedAt: now
    });
});

// =================================================================
// DELETE /api/patients/:id
// =================================================================
router.delete('/:id', requireAuth, (req: AuthRequest, res: Response) => {
    const existing = queryOne<PatientRow>('SELECT id FROM patients WHERE id = ? AND user_id = ?', [req.params.id, req.user!.userId]);

    if (!existing) {
        res.status(404).json({ error: 'Patient not found' });
        return;
    }

    execute('DELETE FROM patients WHERE id = ?', [req.params.id]);
    res.json({ message: 'Patient deleted' });
});

// =================================================================
// GET /api/patients/:id/charts - Get charts for patient
// =================================================================
router.get('/:id/charts', requireAuth, (req: AuthRequest, res: Response) => {
    const patient = queryOne<PatientRow>('SELECT id FROM patients WHERE id = ? AND user_id = ?', [req.params.id, req.user!.userId]);

    if (!patient) {
        res.status(404).json({ error: 'Patient not found' });
        return;
    }

    const charts = queryAll<ChartSummaryRow>(`
        SELECT id, name, eye_side, is_shared, created_at, updated_at
        FROM charts
        WHERE patient_id = ? AND user_id = ?
        ORDER BY created_at DESC
    `, [req.params.id, req.user!.userId]);

    res.json(charts.map(c => ({
        id: c.id,
        name: c.name,
        eyeSide: c.eye_side,
        isShared: Boolean(c.is_shared),
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        elementCount: 0
    })));
});

export default router;
