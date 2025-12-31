// =================================================================
// Mock Data Store - In-memory storage for mock API
// =================================================================

import type { User, Chart, Patient, ChartSummary, PatientSummary } from './types';
import type { FundusElement } from '../utils/types';

// Storage keys
const STORAGE_KEYS = {
    USERS: 'mock_users',
    CHARTS: 'mock_charts',
    PATIENTS: 'mock_patients',
    CURRENT_USER: 'mock_current_user',
    AUTH_TOKEN: 'mock_auth_token',
} as const;

// =================================================================
// Demo Data
// =================================================================

const DEMO_USER: User = {
    id: 'demo-user-1',
    username: 'demo',
    name: 'Demo User',
    createdAt: new Date().toISOString(),
};

// =================================================================
// LocalStorage Helpers
// =================================================================

function getFromStorage<T>(key: string, defaultValue: T): T {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function setToStorage<T>(key: string, value: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }
}

// =================================================================
// Mock Store Class
// =================================================================

class MockStore {
    // Initialize with demo user
    private users: Map<string, User & { password: string }> = new Map();

    constructor() {
        // Load from localStorage or initialize with demo user
        this.loadFromStorage();

        // Ensure demo user exists
        if (!this.users.has('demo')) {
            this.users.set('demo', { ...DEMO_USER, password: 'demo' });
            this.saveUsers();
        }
    }

    private loadFromStorage() {
        const storedUsers = getFromStorage<Array<User & { password: string }>>(STORAGE_KEYS.USERS, []);
        storedUsers.forEach(u => this.users.set(u.username, u));
    }

    private saveUsers() {
        setToStorage(STORAGE_KEYS.USERS, Array.from(this.users.values()));
    }

    // -----------------------------------------------------------------
    // Auth
    // -----------------------------------------------------------------

    async login(username: string, password: string): Promise<{ user: User; token: string } | null> {
        await this.simulateDelay();
        const user = this.users.get(username);
        if (user && user.password === password) {
            const token = `mock-token-${user.id}-${Date.now()}`;
            const { password: _, ...userWithoutPassword } = user;
            setToStorage(STORAGE_KEYS.CURRENT_USER, userWithoutPassword);
            setToStorage(STORAGE_KEYS.AUTH_TOKEN, token);
            return { user: userWithoutPassword, token };
        }
        return null;
    }

    async register(username: string, password: string, name: string): Promise<{ user: User; token: string } | null> {
        await this.simulateDelay();
        if (this.users.has(username)) {
            return null; // Username taken
        }
        const newUser: User & { password: string } = {
            id: `user-${Date.now()}`,
            username,
            password,
            name,
            createdAt: new Date().toISOString(),
        };
        this.users.set(username, newUser);
        this.saveUsers();

        const token = `mock-token-${newUser.id}-${Date.now()}`;
        const { password: _, ...userWithoutPassword } = newUser;
        setToStorage(STORAGE_KEYS.CURRENT_USER, userWithoutPassword);
        setToStorage(STORAGE_KEYS.AUTH_TOKEN, token);
        return { user: userWithoutPassword, token };
    }

    async getCurrentUser(): Promise<User | null> {
        const token = getFromStorage<string | null>(STORAGE_KEYS.AUTH_TOKEN, null);
        if (!token) return null;
        return getFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    }

    logout(): void {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }

    getToken(): string | null {
        return getFromStorage<string | null>(STORAGE_KEYS.AUTH_TOKEN, null);
    }

    // -----------------------------------------------------------------
    // Charts
    // -----------------------------------------------------------------

    private getChartsKey(userId: string): string {
        return `${STORAGE_KEYS.CHARTS}_${userId}`;
    }

    async getCharts(userId: string): Promise<ChartSummary[]> {
        await this.simulateDelay();
        const charts = getFromStorage<Chart[]>(this.getChartsKey(userId), []);
        const patients = await this.getPatients(userId);
        const patientMap = new Map(patients.map(p => [p.id, p.name]));

        return charts.map(c => ({
            id: c.id,
            name: c.name,
            eyeSide: c.eyeSide,
            patientId: c.patientId,
            patientName: c.patientId ? patientMap.get(c.patientId) : undefined,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            elementCount: c.elements.length,
        }));
    }

    async getChart(userId: string, chartId: string): Promise<Chart | null> {
        await this.simulateDelay();
        const charts = getFromStorage<Chart[]>(this.getChartsKey(userId), []);
        return charts.find(c => c.id === chartId) || null;
    }

    async saveChart(userId: string, chart: Omit<Chart, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Chart> {
        await this.simulateDelay();
        const charts = getFromStorage<Chart[]>(this.getChartsKey(userId), []);

        const now = new Date().toISOString();
        let savedChart: Chart;

        if (chart.id) {
            // Update existing
            const index = charts.findIndex(c => c.id === chart.id);
            if (index >= 0) {
                savedChart = {
                    ...charts[index],
                    ...chart,
                    updatedAt: now,
                };
                charts[index] = savedChart;
            } else {
                // ID provided but not found, create new
                savedChart = {
                    ...chart,
                    id: chart.id,
                    userId,
                    isShared: chart.isShared ?? false,
                    createdAt: now,
                    updatedAt: now,
                };
                charts.push(savedChart);
            }
        } else {
            // Create new
            savedChart = {
                ...chart,
                id: `chart-${Date.now()}`,
                userId,
                isShared: false,
                createdAt: now,
                updatedAt: now,
            };
            charts.push(savedChart);
        }

        setToStorage(this.getChartsKey(userId), charts);
        return savedChart;
    }

    async deleteChart(userId: string, chartId: string): Promise<boolean> {
        await this.simulateDelay();
        const charts = getFromStorage<Chart[]>(this.getChartsKey(userId), []);
        const filtered = charts.filter(c => c.id !== chartId);
        if (filtered.length === charts.length) return false;
        setToStorage(this.getChartsKey(userId), filtered);
        return true;
    }

    async createShareLink(userId: string, chartId: string): Promise<string | null> {
        await this.simulateDelay();
        const charts = getFromStorage<Chart[]>(this.getChartsKey(userId), []);
        const chart = charts.find(c => c.id === chartId);
        if (!chart) return null;

        const shareId = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        chart.shareId = shareId;
        chart.isShared = true;
        setToStorage(this.getChartsKey(userId), charts);

        // Store share mapping
        const shareMap = getFromStorage<Record<string, { userId: string; chartId: string }>>('mock_shares', {});
        shareMap[shareId] = { userId, chartId };
        setToStorage('mock_shares', shareMap);

        return shareId;
    }

    async getChartByShareId(shareId: string): Promise<Chart | null> {
        await this.simulateDelay();
        const shareMap = getFromStorage<Record<string, { userId: string; chartId: string }>>('mock_shares', {});
        const mapping = shareMap[shareId];
        if (!mapping) return null;
        return this.getChart(mapping.userId, mapping.chartId);
    }

    // -----------------------------------------------------------------
    // Patients
    // -----------------------------------------------------------------

    private getPatientsKey(userId: string): string {
        return `${STORAGE_KEYS.PATIENTS}_${userId}`;
    }

    async getPatients(userId: string): Promise<PatientSummary[]> {
        await this.simulateDelay();
        const patients = getFromStorage<Patient[]>(this.getPatientsKey(userId), []);
        const charts = getFromStorage<Chart[]>(this.getChartsKey(userId), []);

        return patients.map(p => {
            const patientCharts = charts.filter(c => c.patientId === p.id);
            const lastChart = patientCharts.sort((a, b) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            )[0];

            return {
                id: p.id,
                mrn: p.mrn,
                name: p.name,
                dateOfBirth: p.dateOfBirth,
                chartCount: patientCharts.length,
                lastVisit: lastChart?.updatedAt,
            };
        });
    }

    async getPatient(userId: string, patientId: string): Promise<Patient | null> {
        await this.simulateDelay();
        const patients = getFromStorage<Patient[]>(this.getPatientsKey(userId), []);
        return patients.find(p => p.id === patientId) || null;
    }

    async createPatient(userId: string, data: { mrn: string; name: string; dateOfBirth?: string; notes?: string }): Promise<Patient> {
        await this.simulateDelay();
        const patients = getFromStorage<Patient[]>(this.getPatientsKey(userId), []);

        const now = new Date().toISOString();
        const newPatient: Patient = {
            id: `patient-${Date.now()}`,
            userId,
            mrn: data.mrn,
            name: data.name,
            dateOfBirth: data.dateOfBirth,
            notes: data.notes,
            createdAt: now,
            updatedAt: now,
        };

        patients.push(newPatient);
        setToStorage(this.getPatientsKey(userId), patients);
        return newPatient;
    }

    async updatePatient(userId: string, patientId: string, data: Partial<{ mrn: string; name: string; dateOfBirth?: string; notes?: string }>): Promise<Patient | null> {
        await this.simulateDelay();
        const patients = getFromStorage<Patient[]>(this.getPatientsKey(userId), []);
        const index = patients.findIndex(p => p.id === patientId);
        if (index < 0) return null;

        patients[index] = {
            ...patients[index],
            ...data,
            updatedAt: new Date().toISOString(),
        };
        setToStorage(this.getPatientsKey(userId), patients);
        return patients[index];
    }

    async deletePatient(userId: string, patientId: string): Promise<boolean> {
        await this.simulateDelay();
        const patients = getFromStorage<Patient[]>(this.getPatientsKey(userId), []);
        const filtered = patients.filter(p => p.id !== patientId);
        if (filtered.length === patients.length) return false;
        setToStorage(this.getPatientsKey(userId), filtered);
        return true;
    }

    async getPatientCharts(userId: string, patientId: string): Promise<ChartSummary[]> {
        await this.simulateDelay();
        const charts = getFromStorage<Chart[]>(this.getChartsKey(userId), []);
        const patient = await this.getPatient(userId, patientId);

        return charts
            .filter(c => c.patientId === patientId)
            .map(c => ({
                id: c.id,
                name: c.name,
                eyeSide: c.eyeSide,
                patientId: c.patientId,
                patientName: patient?.name,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
                elementCount: c.elements.length,
            }));
    }

    // -----------------------------------------------------------------
    // Guest Auto-Save (no auth required)
    // -----------------------------------------------------------------

    saveGuestChart(elements: FundusElement[], eyeSide: string): void {
        setToStorage('guest_chart', { elements, eyeSide, savedAt: new Date().toISOString() });
    }

    getGuestChart(): { elements: FundusElement[]; eyeSide: string; savedAt: string } | null {
        return getFromStorage<{ elements: FundusElement[]; eyeSide: string; savedAt: string } | null>('guest_chart', null);
    }

    clearGuestChart(): void {
        localStorage.removeItem('guest_chart');
    }

    // -----------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------

    private async simulateDelay(): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    }
}

// Export singleton instance
export const mockStore = new MockStore();
