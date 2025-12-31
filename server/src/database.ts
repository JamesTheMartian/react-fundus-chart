// =================================================================
// Database Setup - SQLite with sql.js (pure JavaScript)
// =================================================================

import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Database file path
const DB_PATH = path.join(__dirname, '..', 'data', 'fundus.db');

// Database instance
let db: SqlJsDatabase;

export async function initDatabase(): Promise<SqlJsDatabase> {
    const SQL = await initSqlJs();

    // Try to load existing database
    if (fs.existsSync(DB_PATH)) {
        const buffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
        console.log('Loaded existing database from:', DB_PATH);
    } else {
        db = new SQL.Database();
        console.log('Created new database');
    }

    // Create tables
    db.run(`
        -- Users table
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Patients table
        CREATE TABLE IF NOT EXISTS patients (
            id TEXT PRIMARY KEY,
            mrn TEXT NOT NULL,
            name TEXT NOT NULL,
            date_of_birth TEXT,
            notes TEXT,
            user_id TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(mrn, user_id)
        );
        
        -- Charts table
        CREATE TABLE IF NOT EXISTS charts (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            eye_side TEXT NOT NULL CHECK(eye_side IN ('OD', 'OS')),
            elements TEXT NOT NULL DEFAULT '[]',
            patient_id TEXT,
            user_id TEXT NOT NULL,
            share_id TEXT UNIQUE,
            is_shared INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
        );
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_charts_user_id ON charts(user_id);
        CREATE INDEX IF NOT EXISTS idx_charts_patient_id ON charts(patient_id);
        CREATE INDEX IF NOT EXISTS idx_charts_share_id ON charts(share_id);
        CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
    `);

    // Seed demo user if not exists
    const demoUser = db.exec("SELECT id FROM users WHERE username = 'demo'");
    if (demoUser.length === 0 || demoUser[0].values.length === 0) {
        const hashedPassword = bcrypt.hashSync('demo', 10);
        db.run(
            `INSERT INTO users (id, username, password_hash, name) VALUES (?, ?, ?, ?)`,
            [uuidv4(), 'demo', hashedPassword, 'Demo User']
        );
        console.log('Created demo user (demo/demo)');
    }

    // Save database
    saveDatabase();

    console.log('Database initialized');
    return db;
}

export function getDatabase(): SqlJsDatabase {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return db;
}

export function saveDatabase(): void {
    console.log('[DB] saveDatabase() called');
    if (!db) {
        console.log('[DB] No database instance found in saveDatabase');
        return;
    }

    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // Save to file
    try {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
        if (true) {
            console.log(`[DB] Saved database to ${DB_PATH} (${buffer.length} bytes)`);
        }
    } catch (err) {
        console.error('[DB] Failed to save database:', err);
        console.error('[DB] Path was:', DB_PATH);
    }
}

// Helper function to run a query and get results as objects
export function queryAll<T>(sql: string, params: (string | number | null)[] = []): T[] {
    const stmt = db.prepare(sql);
    stmt.bind(params);

    const results: T[] = [];
    while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(row as T);
    }
    stmt.free();
    return results;
}

// Helper function to run a query and get single result
export function queryOne<T>(sql: string, params: (string | number | null)[] = []): T | undefined {
    const results = queryAll<T>(sql, params);
    return results[0];
}

// Helper to run insert/update/delete
export function execute(sql: string, params: (string | number | null)[] = []): void {
    console.log('[DB] Executing:', sql);
    db.run(sql, params);
    saveDatabase();
}

export default { initDatabase, getDatabase, saveDatabase, queryAll, queryOne, execute };
