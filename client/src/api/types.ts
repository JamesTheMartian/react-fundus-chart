// =================================================================
// API Types - Shared data models for frontend and backend
// =================================================================

import type { FundusElement, EyeSide } from '../utils/types';

// =================================================================
// User & Authentication
// =================================================================

export interface User {
    id: string;
    username: string;
    name: string;
    createdAt: string;
}

export interface AuthCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface RegisterData {
    username: string;
    password: string;
    name: string;
}

// =================================================================
// Charts
// =================================================================

export interface Chart {
    id: string;
    name: string;
    eyeSide: EyeSide;
    elements: FundusElement[];
    patientId?: string;
    userId: string;
    shareId?: string;
    isShared: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ChartSummary {
    id: string;
    name: string;
    eyeSide: EyeSide;
    patientId?: string;
    patientName?: string;
    createdAt: string;
    updatedAt: string;
    elementCount: number;
}

export interface CreateChartData {
    name: string;
    eyeSide: EyeSide;
    elements: FundusElement[];
    patientId?: string;
}

export interface UpdateChartData {
    name?: string;
    eyeSide?: EyeSide;
    elements?: FundusElement[];
    patientId?: string;
}

export interface ShareLinkResponse {
    shareId: string;
    shareUrl: string;
}

// =================================================================
// Patients
// =================================================================

export interface Patient {
    id: string;
    mrn: string; // Medical Record Number
    name: string;
    dateOfBirth?: string;
    notes?: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface PatientSummary {
    id: string;
    mrn: string;
    name: string;
    dateOfBirth?: string;
    chartCount: number;
    lastVisit?: string;
}

export interface CreatePatientData {
    mrn: string;
    name: string;
    dateOfBirth?: string;
    notes?: string;
}

export interface UpdatePatientData {
    mrn?: string;
    name?: string;
    dateOfBirth?: string;
    notes?: string;
}

// =================================================================
// API Response Wrappers
// =================================================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}

// =================================================================
// Auto-save
// =================================================================

export interface AutoSaveState {
    status: 'idle' | 'saving' | 'saved' | 'error';
    lastSaved?: string;
    error?: string;
}
