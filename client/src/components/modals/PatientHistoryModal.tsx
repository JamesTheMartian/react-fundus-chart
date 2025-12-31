// =================================================================
// Patient History Modal - View charts for a specific patient
// =================================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User2, FileText, Eye, ArrowLeft } from 'lucide-react';
import { patients as patientsApi } from '../../api/client';
import type { PatientSummary, ChartSummary } from '../../api/types';

// =================================================================
// Types
// =================================================================

interface PatientHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: PatientSummary;
    onOpenChart: (chartId: string) => void;
    isDark: boolean;
}

// =================================================================
// Component
// =================================================================

export function PatientHistoryModal({
    isOpen,
    onClose,
    patient,
    onOpenChart,
    isDark,
}: PatientHistoryModalProps) {
    const [charts, setCharts] = useState<ChartSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load patient's charts
    useEffect(() => {
        if (isOpen && patient) {
            setIsLoading(true);
            patientsApi.getCharts(patient.id)
                .then(setCharts)
                .catch(console.error)
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, patient]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleOpenChart = (chartId: string) => {
        onOpenChart(chartId);
        onClose();
    };

    // Group charts by date
    const groupedCharts = charts.reduce((groups, chart) => {
        const date = new Date(chart.createdAt).toDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(chart);
        return groups;
    }, {} as Record<string, ChartSummary[]>);

    const sortedDates = Object.keys(groupedCharts).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4"
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
                            relative w-full max-w-xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col
                            ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}
                        `}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    onClick={onClose}
                                    className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Patients
                                </button>
                                <button
                                    onClick={onClose}
                                    className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${isDark ? 'bg-primary-500/20' : 'bg-primary-50'}`}>
                                    <User2 className="w-8 h-8 text-primary-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">{patient.name}</h2>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        MRN: {patient.mrn} • {patient.chartCount} chart{patient.chartCount !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Charts Timeline */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : charts.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                                    <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                                        No charts for this patient yet
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {sortedDates.map(date => (
                                        <div key={date}>
                                            <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {formatDate(date)}
                                            </h3>
                                            <div className="space-y-2">
                                                {groupedCharts[date].map(chart => (
                                                    <motion.button
                                                        key={chart.id}
                                                        onClick={() => handleOpenChart(chart.id)}
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
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h4 className="font-medium">{chart.name}</h4>
                                                                <div className={`flex items-center gap-3 mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                                    <span className="flex items-center gap-1">
                                                                        <Eye className="w-4 h-4" />
                                                                        {chart.eyeSide}
                                                                    </span>
                                                                    <span>{formatTime(chart.createdAt)}</span>
                                                                    <span>{chart.elementCount} elements</span>
                                                                </div>
                                                            </div>
                                                            <div className={`
                                                                px-3 py-1 rounded-lg text-sm font-medium
                                                                ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}
                                                            `}>
                                                                Open
                                                            </div>
                                                        </div>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default PatientHistoryModal;
