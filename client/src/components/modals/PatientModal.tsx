// =================================================================
// Patient Modal - Create or Edit Patient
// =================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User2, Hash, Calendar, FileText, Save } from 'lucide-react';
import { patients as patientsApi } from '../../api/client';
import type { Patient, CreatePatientData } from '../../api/types';

// =================================================================
// Types
// =================================================================

interface PatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: (patient: Patient) => void;
    isDark: boolean;
    editPatient?: Patient | null;
}

// =================================================================
// Component
// =================================================================

export function PatientModal({
    isOpen,
    onClose,
    onSaved,
    isDark,
    editPatient,
}: PatientModalProps) {
    const [mrn, setMrn] = useState('');
    const [name, setName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const isEditing = !!editPatient;

    // Populate form when editing
    useEffect(() => {
        if (isOpen) {
            if (editPatient) {
                setMrn(editPatient.mrn);
                setName(editPatient.name);
                setDateOfBirth(editPatient.dateOfBirth || '');
                setNotes(editPatient.notes || '');
            } else {
                setMrn('');
                setName('');
                setDateOfBirth('');
                setNotes('');
            }
            setError('');
        }
    }, [isOpen, editPatient]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!mrn.trim()) {
            setError('MRN is required');
            return;
        }
        if (!name.trim()) {
            setError('Name is required');
            return;
        }

        setIsSaving(true);
        setError('');

        try {
            const data: CreatePatientData = {
                mrn: mrn.trim(),
                name: name.trim(),
                dateOfBirth: dateOfBirth || undefined,
                notes: notes.trim() || undefined,
            };

            let patient: Patient;
            if (isEditing && editPatient) {
                patient = await patientsApi.update(editPatient.id, data);
            } else {
                patient = await patientsApi.create(data);
            }

            onSaved(patient);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save patient');
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
                                <div className={`p-2 rounded-xl ${isDark ? 'bg-primary-500/20' : 'bg-primary-50'}`}>
                                    <User2 className="w-5 h-5 text-primary-500" />
                                </div>
                                <h2 className="text-xl font-bold">
                                    {isEditing ? 'Edit Patient' : 'New Patient'}
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
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
                            {/* MRN */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Medical Record Number (MRN) *
                                </label>
                                <div className="relative">
                                    <Hash className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                    <input
                                        type="text"
                                        value={mrn}
                                        onChange={e => setMrn(e.target.value)}
                                        placeholder="e.g., MRN-001234"
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

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Patient Name *
                                </label>
                                <div className="relative">
                                    <User2 className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Full name"
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

                            {/* Date of Birth */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Date of Birth
                                </label>
                                <div className="relative">
                                    <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                    <input
                                        type="date"
                                        value={dateOfBirth}
                                        onChange={e => setDateOfBirth(e.target.value)}
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

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Notes
                                </label>
                                <div className="relative">
                                    <FileText className={`absolute left-3 top-3 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                    <textarea
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        placeholder="Additional notes..."
                                        rows={3}
                                        className={`
                                            w-full pl-10 pr-4 py-3 rounded-xl border transition-colors resize-none
                                            ${isDark
                                                ? 'bg-gray-800 border-gray-700 focus:border-primary-500'
                                                : 'bg-gray-50 border-gray-200 focus:border-primary-500'
                                            }
                                            focus:outline-none focus:ring-2 focus:ring-primary-500/20
                                        `}
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className={`
                                        flex-1 py-3 px-4 rounded-xl font-medium transition-colors
                                        ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}
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
                                            {isEditing ? 'Update' : 'Create'}
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

export default PatientModal;
