// =================================================================
// useAutoSave Hook - Automatic saving with debounce
// =================================================================

import { useEffect, useRef, useCallback, useState } from 'react';
import { charts, guestStorage, auth } from '../api/client';
import type { FundusElement, EyeSide } from '../utils/types';
import type { AutoSaveState } from '../api/types';

// =================================================================
// Types
// =================================================================

interface UseAutoSaveOptions {
    elements: FundusElement[];
    eyeSide: EyeSide;
    chartId: string | null;
    chartName: string;
    patientId?: string;
    debounceMs?: number;
    enabled?: boolean;
}

interface UseAutoSaveReturn {
    status: AutoSaveState['status'];
    lastSaved: string | null;
    error: string | null;
    save: () => Promise<void>;
    chartId: string | null;
}

// =================================================================
// Hook
// =================================================================

export function useAutoSave({
    elements,
    eyeSide,
    chartId: initialChartId,
    chartName,
    patientId,
    debounceMs = 2000,
    enabled = true,
}: UseAutoSaveOptions): UseAutoSaveReturn {
    const [status, setStatus] = useState<AutoSaveState['status']>('idle');
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentChartId, setCurrentChartId] = useState<string | null>(initialChartId);

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastElementsRef = useRef<string>('');
    const isSavingRef = useRef(false);

    // Update chart ID when prop changes
    useEffect(() => {
        setCurrentChartId(initialChartId);
    }, [initialChartId]);

    const save = useCallback(async () => {
        if (isSavingRef.current) return;

        const isAuthenticated = auth.isAuthenticated();

        try {
            isSavingRef.current = true;
            setStatus('saving');
            setError(null);

            if (isAuthenticated) {
                // Save to backend for authenticated users
                const savedChart = await charts.save({
                    id: currentChartId || undefined,
                    name: chartName || 'Untitled Chart',
                    eyeSide,
                    elements,
                    patientId,
                });
                setCurrentChartId(savedChart.id);
            } else {
                // Save to localStorage for guests
                guestStorage.saveChart(elements, eyeSide);
            }

            setStatus('saved');
            setLastSaved(new Date().toISOString());
        } catch (err) {
            console.error('Auto-save failed:', err);
            setStatus('error');
            setError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            isSavingRef.current = false;
        }
    }, [elements, eyeSide, currentChartId, chartName, patientId]);

    // Debounced auto-save on element changes
    useEffect(() => {
        if (!enabled) return;

        const elementsString = JSON.stringify(elements);

        // Skip if elements haven't actually changed
        if (elementsString === lastElementsRef.current) return;
        lastElementsRef.current = elementsString;

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Don't auto-save empty charts
        if (elements.length === 0) {
            setStatus('idle');
            return;
        }

        // Set new timeout
        timeoutRef.current = setTimeout(() => {
            save();
        }, debounceMs);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [elements, debounceMs, enabled, save]);

    return {
        status,
        lastSaved,
        error,
        save,
        chartId: currentChartId,
    };
}

// =================================================================
// Load Guest Chart Utility
// =================================================================

export function loadGuestChart(): { elements: FundusElement[]; eyeSide: string } | null {
    return guestStorage.getChart();
}

export function clearGuestChart(): void {
    guestStorage.clearChart();
}
