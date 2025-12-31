// =================================================================
// API Client - Unified interface for mock and real API
// =================================================================

import { USE_MOCK_API, API_BASE_URL } from './config';
import { mockStore } from './mockStore';
import type {
    User,
    AuthCredentials,
    AuthResponse,
    RegisterData,
    Chart,
    ChartSummary,
    CreateChartData,
    ShareLinkResponse,
    Patient,
    PatientSummary,
    CreatePatientData,
    UpdatePatientData,
} from './types';
import type { FundusElement } from '../utils/types';

// =================================================================
// HTTP Helpers
// =================================================================

async function fetchWithAuth<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = localStorage.getItem('auth_token');

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
}

// =================================================================
// Auth API
// =================================================================

export const auth = {
    async login(credentials: AuthCredentials): Promise<AuthResponse> {
        if (USE_MOCK_API) {
            const result = await mockStore.login(credentials.username, credentials.password);
            if (!result) {
                throw new Error('Invalid username or password');
            }
            return result;
        }

        const response = await fetchWithAuth<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        localStorage.setItem('auth_token', response.token);
        return response;
    },

    async register(data: RegisterData): Promise<AuthResponse> {
        if (USE_MOCK_API) {
            const result = await mockStore.register(data.username, data.password, data.name);
            if (!result) {
                throw new Error('Username already taken');
            }
            return result;
        }

        const response = await fetchWithAuth<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        localStorage.setItem('auth_token', response.token);
        return response;
    },

    async getCurrentUser(): Promise<User | null> {
        if (USE_MOCK_API) {
            return mockStore.getCurrentUser();
        }

        try {
            return await fetchWithAuth<User>('/auth/me');
        } catch {
            return null;
        }
    },

    logout(): void {
        if (USE_MOCK_API) {
            mockStore.logout();
        }
        localStorage.removeItem('auth_token');
    },

    getToken(): string | null {
        if (USE_MOCK_API) {
            return mockStore.getToken();
        }
        return localStorage.getItem('auth_token');
    },

    isAuthenticated(): boolean {
        return !!this.getToken();
    },
};

// =================================================================
// Charts API
// =================================================================

export const charts = {
    async list(): Promise<ChartSummary[]> {
        if (USE_MOCK_API) {
            const user = await mockStore.getCurrentUser();
            if (!user) return [];
            return mockStore.getCharts(user.id);
        }
        return fetchWithAuth<ChartSummary[]>('/charts');
    },

    async get(id: string): Promise<Chart | null> {
        if (USE_MOCK_API) {
            const user = await mockStore.getCurrentUser();
            if (!user) return null;
            return mockStore.getChart(user.id, id);
        }
        try {
            return await fetchWithAuth<Chart>(`/charts/${id}`);
        } catch {
            return null;
        }
    },

    async save(data: CreateChartData & { id?: string }): Promise<Chart> {
        if (USE_MOCK_API) {
            const user = await mockStore.getCurrentUser();
            if (!user) throw new Error('Not authenticated');
            return mockStore.saveChart(user.id, {
                ...data,
                isShared: false,
            });
        }

        if (data.id) {
            return fetchWithAuth<Chart>(`/charts/${data.id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
        }
        return fetchWithAuth<Chart>('/charts', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async delete(id: string): Promise<void> {
        if (USE_MOCK_API) {
            const user = await mockStore.getCurrentUser();
            if (!user) throw new Error('Not authenticated');
            await mockStore.deleteChart(user.id, id);
            return;
        }
        await fetchWithAuth<void>(`/charts/${id}`, { method: 'DELETE' });
    },

    async createShareLink(chartId: string): Promise<ShareLinkResponse> {
        if (USE_MOCK_API) {
            const user = await mockStore.getCurrentUser();
            if (!user) throw new Error('Not authenticated');
            const shareId = await mockStore.createShareLink(user.id, chartId);
            if (!shareId) throw new Error('Chart not found');
            const shareUrl = `${window.location.origin}${window.location.pathname}?share=${shareId}`;
            return { shareId, shareUrl };
        }
        return fetchWithAuth<ShareLinkResponse>(`/charts/${chartId}/share`, {
            method: 'POST',
        });
    },

    async getByShareId(shareId: string): Promise<Chart | null> {
        if (USE_MOCK_API) {
            return mockStore.getChartByShareId(shareId);
        }
        try {
            return await fetchWithAuth<Chart>(`/shared/${shareId}`);
        } catch {
            return null;
        }
    },
};

// =================================================================
// Patients API
// =================================================================

export const patients = {
    async list(): Promise<PatientSummary[]> {
        if (USE_MOCK_API) {
            const user = await mockStore.getCurrentUser();
            if (!user) return [];
            return mockStore.getPatients(user.id);
        }
        return fetchWithAuth<PatientSummary[]>('/patients');
    },

    async get(id: string): Promise<Patient | null> {
        if (USE_MOCK_API) {
            const user = await mockStore.getCurrentUser();
            if (!user) return null;
            return mockStore.getPatient(user.id, id);
        }
        try {
            return await fetchWithAuth<Patient>(`/patients/${id}`);
        } catch {
            return null;
        }
    },

    async create(data: CreatePatientData): Promise<Patient> {
        if (USE_MOCK_API) {
            const user = await mockStore.getCurrentUser();
            if (!user) throw new Error('Not authenticated');
            return mockStore.createPatient(user.id, data);
        }
        return fetchWithAuth<Patient>('/patients', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    async update(id: string, data: UpdatePatientData): Promise<Patient> {
        if (USE_MOCK_API) {
            const user = await mockStore.getCurrentUser();
            if (!user) throw new Error('Not authenticated');
            const result = await mockStore.updatePatient(user.id, id, data);
            if (!result) throw new Error('Patient not found');
            return result;
        }
        return fetchWithAuth<Patient>(`/patients/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    async delete(id: string): Promise<void> {
        if (USE_MOCK_API) {
            const user = await mockStore.getCurrentUser();
            if (!user) throw new Error('Not authenticated');
            await mockStore.deletePatient(user.id, id);
            return;
        }
        await fetchWithAuth<void>(`/patients/${id}`, { method: 'DELETE' });
    },

    async getCharts(patientId: string): Promise<ChartSummary[]> {
        if (USE_MOCK_API) {
            const user = await mockStore.getCurrentUser();
            if (!user) return [];
            return mockStore.getPatientCharts(user.id, patientId);
        }
        return fetchWithAuth<ChartSummary[]>(`/patients/${patientId}/charts`);
    },
};

// =================================================================
// Guest/Auto-Save API (works without auth)
// =================================================================

export const guestStorage = {
    saveChart(elements: FundusElement[], eyeSide: string): void {
        mockStore.saveGuestChart(elements, eyeSide);
    },

    getChart(): { elements: FundusElement[]; eyeSide: string; savedAt: string } | null {
        return mockStore.getGuestChart();
    },

    clearChart(): void {
        mockStore.clearGuestChart();
    },
};

// =================================================================
// Legacy export (backward compatibility)
// =================================================================

export interface User_Legacy {
    id: string;
    name: string;
}

export const getUser = async (): Promise<User_Legacy> => {
    const user = await auth.getCurrentUser();
    if (user) {
        return { id: user.id, name: user.name };
    }
    return { id: 'guest', name: 'Guest' };
};
