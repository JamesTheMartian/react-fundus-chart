import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun, Zap, Keyboard, HelpCircle, Info, ExternalLink, Cpu } from 'lucide-react';

import { APP_CONFIG } from '../../utils/constants';
import type { GraphicsQuality } from '../../utils/types';

// Graphics quality labels and descriptions
const GRAPHICS_QUALITY_OPTIONS: { value: GraphicsQuality; label: string; description: string }[] = [
    { value: 'low', label: 'Low', description: 'Best performance' },
    { value: 'medium', label: 'Medium', description: 'Balanced' },
    { value: 'high', label: 'High', description: 'Best visuals' },
];

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    isDark: boolean;
    toggleDarkMode: () => void;
    isProMode: boolean;
    setIsProMode: (isPro: boolean) => void;
    onShowShortcuts: () => void;
    graphicsQuality: GraphicsQuality;
    setGraphicsQuality: (quality: GraphicsQuality) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    isDark,
    toggleDarkMode,
    isProMode,
    setIsProMode,
    onShowShortcuts,
    graphicsQuality,
    setGraphicsQuality,
}) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 max-h-[85vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{APP_CONFIG.name} Settings</h2>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">

                        {/* Appearance Section */}
                        <section className="space-y-3">
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Appearance</h3>
                            <div
                                onClick={toggleDarkMode}
                                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-orange-500/10 text-orange-500'}`}>
                                        {isDark ? <Moon size={18} /> : <Sun size={18} />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Dark Mode</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {isDark ? 'Dark theme enabled' : 'Light theme enabled'}
                                        </span>
                                    </div>
                                </div>
                                <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${isDark ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out ${isDark ? 'translate-x-4' : 'translate-x-0'}`} />
                                </div>
                            </div>
                        </section>

                        {/* Graphics Quality Section */}
                        <section className="space-y-3">
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">3D Graphics</h3>
                            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                                        <Cpu size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Graphics Quality</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Affects 3D view performance
                                        </span>
                                    </div>
                                </div>

                                {/* Quality Selector */}
                                <div className="flex gap-2 mt-2">
                                    {GRAPHICS_QUALITY_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setGraphicsQuality(option.value)}
                                            className={`flex-1 py-2 px-3 rounded-lg text-center transition-all duration-200 ${graphicsQuality === option.value
                                                ? 'bg-primary-600 text-white shadow-md'
                                                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                                                }`}
                                        >
                                            <div className="text-xs font-semibold">{option.label}</div>
                                            <div className={`text-[10px] ${graphicsQuality === option.value ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'}`}>
                                                {option.description}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Quality Description */}
                                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded-lg p-2">
                                    {graphicsQuality === 'low' && (
                                        <span>🔋 <strong>Low:</strong> Simple solid rendering. Ideal for older devices or battery saving.</span>
                                    )}
                                    {graphicsQuality === 'medium' && (
                                        <span>⚖️ <strong>Medium:</strong> Basic animations and effects. Good balance of quality and performance.</span>
                                    )}
                                    {graphicsQuality === 'high' && (
                                        <span>✨ <strong>High:</strong> Full liquid effects and animations. Best visual experience.</span>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Application Mode */}
                        <section className="space-y-3">
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Application Mode</h3>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                        <Zap size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Pro Features</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Enable advanced tools</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsProMode(!isProMode)}
                                    className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${isProMode ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${isProMode ? 'translate-x-4' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </section>

                        {/* Help & About */}
                        <section className="space-y-3">
                            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Help & About</h3>

                            <button
                                onClick={onShowShortcuts}
                                className="w-full flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                        <Keyboard size={18} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Keyboard Shortcuts</span>
                                </div>
                            </button>

                            <button
                                onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSfcqdmvqVsFLrVreXe2fJcR24GcSj954BA8edlgqzUXyFiT1g/viewform?usp=dialog', '_blank')}
                                className="w-full flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                        <HelpCircle size={18} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Send Feedback</span>
                                </div>
                                <ExternalLink size={14} className="text-gray-400" />
                            </button>
                        </section>

                        {/* Version Info */}
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-600">
                            <Info size={12} />
                            <span>{APP_CONFIG.name} v{APP_CONFIG.version}</span>
                        </div>

                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
