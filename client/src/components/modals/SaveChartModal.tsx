// =================================================================
// Save Chart Modal - Name and save current chart
// =================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User2, FileText } from 'lucide-react';
import { patients as patientsApi } from '../../api/client';
import type { PatientSummary } from '../../api/types';
import { useAuth } from '../../contexts/AuthContext';

// =================================================================
// Types
// =================================================================

interface SaveChartModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, patientId?: string) => Promise<void>;
    isDark: boolean;
    initialName?: string;
    initialPatientId?: string;
}

// =================================================================
// Component
// =================================================================

export function SaveChartModal({
    isOpen,
    onClose,
    onSave,
    isDark,
    initialName = '',
    initialPatientId,
}: SaveChartModalProps) {
    const { isAuthenticated } = useAuth();
    const [name, setName] = useState(initialName);
    const [patientId, setPatientId] = useState<string | undefined>(initialPatientId);
    const [patients, setPatients] = useState<PatientSummary[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    // Load patients when modal opens
    useEffect(() => {
        if (isOpen && isAuthenticated) {
            setIsLoading(true);
            patientsApi.list()
                .then(setPatients)
                .catch(console.error)
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, isAuthenticated]);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setName(initialName || `Chart ${new Date().toLocaleDateString()}`);
            setPatientId(initialPatientId);
            setError('');
        }
    }, [isOpen, initialName, initialPatientId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Please enter a chart name');
            return;
        }

        setIsSaving(true);
        setError('');

        try {
            await onSave(name.trim(), patientId);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save chart');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className={`
                            relative w-full max-w-md rounded-2xl shadow-2xl p-6
                            ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}
                        `}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`
                                    p-2 rounded-xl
                                    ${isDark ? 'bg-primary-500/20' : 'bg-primary-50'}
                                `}>
                                    <Save className="w-5 h-5 text-primary-500" />
                                </div>
                                <h2 className="text-xl font-bold">Save Chart</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className={`
                                    p-2 rounded-lg transition-colors
                                    ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
                                `}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-600 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Chart Name */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Chart Name
                                </label>
                                <div className="relative">
                                    <FileText className={`
                                        absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5
                                        ${isDark ? 'text-gray-400' : 'text-gray-500'}
                                    `} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Enter chart name"
                                        autoFocus
                                        className={`
                                            w-full pl-10 pr-4 py-3 rounded-xl border transition-colors
                                            ${isDark
                                                ? 'bg-gray-800 border-gray-700 focus:border-primary-500'
                                                : 'bg-gray-50 border-gray-200 focus:border-primary-500'
                                            }
                                            focus:outline-none focus:ring-2 focus:ring-primary-500/20
                                        `}
                                    />
                                </div>
                            </div>

                            {/* Patient Selection (if authenticated) */}
                            {isAuthenticated && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Link to Patient (Optional)
                                    </label>
                                    <div className="relative">
                                        <User2 className={`
                                            absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5
                                            ${isDark ? 'text-gray-400' : 'text-gray-500'}
                                        `} />
                                        <select
                                            value={patientId || ''}
                                            onChange={e => setPatientId(e.target.value || undefined)}
                                            disabled={isLoading}
                                            className={`
                                                w-full pl-10 pr-4 py-3 rounded-xl border transition-colors appearance-none
                                                ${isDark
                                                    ? 'bg-gray-800 border-gray-700 focus:border-primary-500'
                                                    : 'bg-gray-50 border-gray-200 focus:border-primary-500'
                                                }
                                                focus:outline-none focus:ring-2 focus:ring-primary-500/20
                                                disabled:opacity-50
                                            `}
                                        >
                                            <option value="">No patient selected</option>
                                            {patients.map(p => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name} ({p.mrn})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {patients.length === 0 && !isLoading && (
                                        <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            No patients yet. Create one from the Patients menu.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className={`
                                        flex-1 py-3 px-4 rounded-xl font-medium transition-colors
                                        ${isDark
                                            ? 'bg-gray-800 hover:bg-gray-700'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                        }
                                    `}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className={`
                                        flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                                        font-medium transition-all duration-200
                                        bg-primary-500 hover:bg-primary-600 text-white
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                    `}
                                >
                                    {isSaving ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Save
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default SaveChartModal;
