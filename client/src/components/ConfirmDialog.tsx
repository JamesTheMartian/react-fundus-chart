import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'default';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
}) => {
    const confirmButtonRef = useRef<HTMLButtonElement>(null);
    const cancelButtonRef = useRef<HTMLButtonElement>(null);

    // Handle keyboard events
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                onConfirm();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        // Focus cancel button on open for safety
        cancelButtonRef.current?.focus();

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose, onConfirm]);

    // Prevent body scroll when open
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

    const variantStyles = {
        danger: {
            icon: Trash2,
            iconBg: 'bg-danger-100 dark:bg-danger-500/20',
            iconColor: 'text-danger-600 dark:text-danger-400',
            confirmBtn: 'bg-danger-600 hover:bg-danger-700 focus:ring-danger-500',
        },
        warning: {
            icon: AlertTriangle,
            iconBg: 'bg-warning-100 dark:bg-warning-500/20',
            iconColor: 'text-warning-600 dark:text-warning-400',
            confirmBtn: 'bg-warning-600 hover:bg-warning-700 focus:ring-warning-500',
        },
        default: {
            icon: AlertTriangle,
            iconBg: 'bg-primary-100 dark:bg-primary-500/20',
            iconColor: 'text-primary-600 dark:text-primary-400',
            confirmBtn: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500',
        },
    };

    const styles = variantStyles[variant];
    const Icon = styles.icon;

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
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="confirm-dialog-title"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-gray-200 dark:border-gray-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center mx-auto mb-4`}>
                            <Icon size={24} className={styles.iconColor} />
                        </div>

                        {/* Content */}
                        <h2
                            id="confirm-dialog-title"
                            className="text-lg font-semibold text-gray-900 dark:text-gray-50 text-center mb-2"
                        >
                            {title}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                            {message}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                ref={cancelButtonRef}
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                            >
                                {cancelText}
                            </button>
                            <button
                                ref={confirmButtonRef}
                                onClick={onConfirm}
                                className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${styles.confirmBtn}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
