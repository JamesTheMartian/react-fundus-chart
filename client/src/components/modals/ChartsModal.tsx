// =================================================================
// Charts Modal - Browse and manage saved charts
// =================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Trash2, Calendar, Eye, Search, Plus } from 'lucide-react';
import { charts as chartsApi } from '../../api/client';
import type { ChartSummary } from '../../api/types';
import { useAuth } from '../../contexts/AuthContext';

// =================================================================
// Types
// =================================================================

interface ChartsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenChart: (chartId: string) => void;
    onNewChart: () => void;
    isDark: boolean;
}

// =================================================================
// Component
// =================================================================

export function ChartsModal({
    isOpen,
    onClose,
    onOpenChart,
    onNewChart,
    isDark,
}: ChartsModalProps) {
    const { isAuthenticated } = useAuth();
    const [charts, setCharts] = useState<ChartSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Load charts when modal opens
    useEffect(() => {
        if (isOpen && isAuthenticated) {
            setIsLoading(true);
            chartsApi.list()
                .then(setCharts)
                .catch(console.error)
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, isAuthenticated]);

    const handleDelete = async (chartId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this chart?')) return;

        setDeletingId(chartId);
        try {
            await chartsApi.delete(chartId);
            setCharts(prev => prev.filter(c => c.id !== chartId));
        } catch (error) {
            console.error('Failed to delete chart:', error);
        } finally {
            setDeletingId(null);
        }
    };

    const handleOpenChart = (chartId: string) => {
        onOpenChart(chartId);
        onClose();
    };

    const filteredCharts = charts.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.patientName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, {
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
                            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <h2 className="text-xl font-bold mb-2">Sign in to View Charts</h2>
                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Please sign in to access your saved charts.
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
                                    <FileText className="w-5 h-5 text-primary-500" />
                                </div>
                                <h2 className="text-xl font-bold">My Charts</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { onNewChart(); onClose(); }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    New Chart
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
                                    placeholder="Search charts..."
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

                        {/* Charts List */}
                        <div className="flex-1 overflow-y-auto px-6 pb-6">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : filteredCharts.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                                    <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                                        {searchQuery ? 'No charts match your search' : 'No charts saved yet'}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {filteredCharts.map(chart => (
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
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold truncate">{chart.name}</h3>
                                                    <div className={`flex flex-wrap items-center gap-3 mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        <span className="flex items-center gap-1">
                                                            <Eye className="w-4 h-4" />
                                                            {chart.eyeSide}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-4 h-4" />
                                                            {formatDate(chart.updatedAt)}
                                                        </span>
                                                        {chart.patientName && (
                                                            <span className="flex items-center gap-1">
                                                                <span className="px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-500 text-xs">
                                                                    {chart.patientName}
                                                                </span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                        {chart.elementCount} elements
                                                    </span>
                                                    <button
                                                        onClick={(e) => handleDelete(chart.id, e)}
                                                        disabled={deletingId === chart.id}
                                                        className={`
                                                            p-2 rounded-lg transition-colors
                                                            ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}
                                                            text-gray-400 hover:text-danger-500
                                                        `}
                                                    >
                                                        {deletingId === chart.id ? (
                                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                        )}
                                                    </button>
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
    );
}

export default ChartsModal;
