// =================================================================
// Patients List Modal - Browse and manage patients
// =================================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User2, Search, Plus, Trash2, Edit2, FileText, Calendar, ChevronRight } from 'lucide-react';
import { patients as patientsApi } from '../../api/client';
import type { PatientSummary, Patient } from '../../api/types';
import { useAuth } from '../../contexts/AuthContext';
import { PatientModal } from './PatientModal';
import PatientHistoryModal from './PatientHistoryModal';

// =================================================================
// Types
// =================================================================

interface PatientsListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPatient?: (patient: PatientSummary) => void;
    onOpenChart?: (chartId: string) => void;
    isDark: boolean;
    selectionMode?: boolean;
}

// =================================================================
// Component
// =================================================================

export function PatientsListModal({
    isOpen,
    onClose,
    onSelectPatient,
    onOpenChart,
    isDark,
    selectionMode = false,
}: PatientsListModalProps) {
    const { isAuthenticated } = useAuth();
    const [patients, setPatients] = useState<PatientSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Sub-modals
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedPatientForHistory, setSelectedPatientForHistory] = useState<PatientSummary | null>(null);

    // Load patients
    useEffect(() => {
        if (isOpen && isAuthenticated) {
            loadPatients();
        }
    }, [isOpen, isAuthenticated]);

    const loadPatients = async () => {
        setIsLoading(true);
        try {
            const data = await patientsApi.list();
            setPatients(data);
        } catch (error) {
            console.error('Failed to load patients:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (patientId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this patient? Their charts will not be deleted.')) return;

        setDeletingId(patientId);
        try {
            await patientsApi.delete(patientId);
            setPatients(prev => prev.filter(p => p.id !== patientId));
        } catch (error) {
            console.error('Failed to delete patient:', error);
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = async (patientId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const patient = await patientsApi.get(patientId);
            if (patient) {
                setEditingPatient(patient);
                setShowPatientModal(true);
            }
        } catch (error) {
            console.error('Failed to load patient:', error);
        }
    };

    const handlePatientClick = (patient: PatientSummary) => {
        if (selectionMode && onSelectPatient) {
            onSelectPatient(patient);
            onClose();
        } else {
            setSelectedPatientForHistory(patient);
            setShowHistoryModal(true);
        }
    };

    const handlePatientSaved = (_patient: Patient) => {
        loadPatients(); // Reload list
        setEditingPatient(null);
    };

    const handleNewPatient = () => {
        setEditingPatient(null);
        setShowPatientModal(true);
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.mrn.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (!isAuthenticated) {
        return (
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
                        <motion.div
                            className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 text-center
                                ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <User2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <h2 className="text-xl font-bold mb-2">Sign in to View Patients</h2>
                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Please sign in to access patient records.
                            </p>
                            <button
                                onClick={onClose}
                                className="mt-4 px-6 py-2 rounded-xl bg-primary-500 text-white font-medium"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

    return (
        <>
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
                                relative w-full max-w-2xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col
                                ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}
                            `}
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${isDark ? 'bg-primary-500/20' : 'bg-primary-50'}`}>
                                        <User2 className="w-5 h-5 text-primary-500" />
                                    </div>
                                    <h2 className="text-xl font-bold">
                                        {selectionMode ? 'Select Patient' : 'Patients'}
                                    </h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleNewPatient}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        New Patient
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="px-6 py-4">
                                <div className="relative">
                                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Search by name or MRN..."
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

                            {/* Patients List */}
                            <div className="flex-1 overflow-y-auto px-6 pb-6">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : filteredPatients.length === 0 ? (
                                    <div className="text-center py-12">
                                        <User2 className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                                        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                                            {searchQuery ? 'No patients match your search' : 'No patients yet'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {filteredPatients.map(patient => (
                                            <motion.button
                                                key={patient.id}
                                                onClick={() => handlePatientClick(patient)}
                                                className={`
                                                    w-full text-left p-4 rounded-xl border transition-all
                                                    ${isDark
                                                        ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-800 hover:border-gray-600'
                                                        : 'bg-gray-50 border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-md'
                                                    }
                                                `}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-semibold truncate">{patient.name}</h3>
                                                            <span className={`
                                                                px-2 py-0.5 rounded-full text-xs font-medium
                                                                ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}
                                                            `}>
                                                                {patient.mrn}
                                                            </span>
                                                        </div>
                                                        <div className={`flex flex-wrap items-center gap-3 mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                            {patient.dateOfBirth && (
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-4 h-4" />
                                                                    DOB: {formatDate(patient.dateOfBirth)}
                                                                </span>
                                                            )}
                                                            <span className="flex items-center gap-1">
                                                                <FileText className="w-4 h-4" />
                                                                {patient.chartCount} chart{patient.chartCount !== 1 ? 's' : ''}
                                                            </span>
                                                            {patient.lastVisit && (
                                                                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                                    Last: {formatDate(patient.lastVisit)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={(e) => handleEdit(patient.id, e)}
                                                            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDelete(patient.id, e)}
                                                            disabled={deletingId === patient.id}
                                                            className={`p-2 rounded-lg transition-colors text-gray-400 hover:text-danger-500 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                                                        >
                                                            {deletingId === patient.id ? (
                                                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                        {!selectionMode && (
                                                            <ChevronRight className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Patient Create/Edit Modal */}
            <PatientModal
                isOpen={showPatientModal}
                onClose={() => { setShowPatientModal(false); setEditingPatient(null); }}
                onSaved={handlePatientSaved}
                isDark={isDark}
                editPatient={editingPatient}
            />

            {/* Patient History Modal */}
            {selectedPatientForHistory && (
                <PatientHistoryModal
                    isOpen={showHistoryModal}
                    onClose={() => { setShowHistoryModal(false); setSelectedPatientForHistory(null); }}
                    patient={selectedPatientForHistory}
                    onOpenChart={(chartId: string) => {
                        onClose();
                        onOpenChart?.(chartId);
                    }}
                    isDark={isDark}
                />
            )}
        </>
    );
}

export default PatientsListModal;
