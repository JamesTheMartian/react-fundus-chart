import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Command } from 'lucide-react';

interface ShortcutItem {
    keys: string[];
    description: string;
    category: string;
}

const shortcuts: ShortcutItem[] = [
    // Drawing Tools
    { keys: ['1'], description: 'Select Tool', category: 'Tools' },
    { keys: ['2'], description: 'Pen Tool', category: 'Tools' },
    { keys: ['3'], description: 'Brush Tool', category: 'Tools' },
    { keys: ['4'], description: 'Pattern Tool', category: 'Tools' },
    { keys: ['5'], description: 'Fill Tool', category: 'Tools' },
    { keys: ['6'], description: 'Eraser Tool', category: 'Tools' },

    // Actions
    { keys: ['⌘', 'Z'], description: 'Undo', category: 'Actions' },
    { keys: ['⌘', '⇧', 'Z'], description: 'Redo', category: 'Actions' },
    { keys: ['⌘', 'S'], description: 'Download Image', category: 'Actions' },
    { keys: ['Delete'], description: 'Delete Selection', category: 'Actions' },

    // View
    { keys: ['V'], description: 'Toggle 3D View', category: 'View' },
    { keys: ['D'], description: 'Toggle Dark Mode', category: 'View' },
    { keys: ['?'], description: 'Show This Help', category: 'View' },
    { keys: ['Esc'], description: 'Close Window / Deselect', category: 'View' },
];

const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

const formatKey = (key: string): string => {
    if (!isMac) {
        return key.replace('⌘', 'Ctrl').replace('⇧', 'Shift');
    }
    return key;
};

interface KeyboardShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
    isOpen,
    onClose,
}) => {
    // Handle escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Prevent body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Group shortcuts by category
    const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
        if (!acc[shortcut.category]) {
            acc[shortcut.category] = [];
        }
        acc[shortcut.category].push(shortcut);
        return acc;
    }, {} as Record<string, ShortcutItem[]>);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden border border-gray-200 dark:border-gray-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                                    <Command size={20} className="text-primary-600 dark:text-primary-400" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                                    Keyboard Shortcuts
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                                aria-label="Close"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4 overflow-y-auto max-h-[60vh]">
                            {Object.entries(groupedShortcuts).map(([category, items]) => (
                                <div key={category} className="mb-6 last:mb-0">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                                        {category}
                                    </h3>
                                    <div className="space-y-2">
                                        {items.map((shortcut, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                            >
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    {shortcut.description}
                                                </span>
                                                <div className="flex gap-1">
                                                    {shortcut.keys.map((key, keyIndex) => (
                                                        <kbd
                                                            key={keyIndex}
                                                            className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md border border-gray-200 dark:border-gray-700 min-w-[24px] text-center"
                                                        >
                                                            {formatKey(key)}
                                                        </kbd>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px] font-medium">?</kbd> anytime to show this help
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
