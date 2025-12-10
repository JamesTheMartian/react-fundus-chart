import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// =================================================================
// Types
// =================================================================
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
}

// =================================================================
// Context
// =================================================================
const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// =================================================================
// Toast Item Component
// =================================================================
const toastConfig = {
    success: {
        icon: CheckCircle2,
        bgClass: 'bg-success-50 dark:bg-success-500/20 border-success-200 dark:border-success-500/30',
        iconClass: 'text-success-600 dark:text-success-400',
        textClass: 'text-success-800 dark:text-success-200',
    },
    error: {
        icon: XCircle,
        bgClass: 'bg-danger-50 dark:bg-danger-500/20 border-danger-200 dark:border-danger-500/30',
        iconClass: 'text-danger-600 dark:text-danger-400',
        textClass: 'text-danger-800 dark:text-danger-200',
    },
    warning: {
        icon: AlertTriangle,
        bgClass: 'bg-warning-50 dark:bg-warning-500/20 border-warning-200 dark:border-warning-500/30',
        iconClass: 'text-warning-600 dark:text-warning-400',
        textClass: 'text-warning-800 dark:text-warning-200',
    },
    info: {
        icon: Info,
        bgClass: 'bg-primary-50 dark:bg-primary-500/20 border-primary-200 dark:border-primary-500/30',
        iconClass: 'text-primary-600 dark:text-primary-400',
        textClass: 'text-primary-800 dark:text-primary-200',
    },
};

interface ToastItemProps {
    toast: Toast;
    onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
    const config = toastConfig[toast.type];
    const Icon = config.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm ${config.bgClass}`}
        >
            <Icon size={20} className={config.iconClass} />
            <span className={`text-sm font-medium flex-1 ${config.textClass}`}>{toast.message}</span>
            <button
                onClick={() => onDismiss(toast.id)}
                className={`p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${config.iconClass}`}
                aria-label="Dismiss notification"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
};

// =================================================================
// Toast Provider Component
// =================================================================
interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 4000) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const newToast: Toast = { id, message, type, duration };

        setToasts((prev) => [...prev, newToast]);

        // Auto-dismiss
        if (duration > 0) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, duration);
        }
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div
                className="fixed bottom-20 right-4 z-[9999] flex flex-col gap-2 pointer-events-none lg:bottom-6"
                aria-live="polite"
                aria-atomic="true"
            >
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => (
                        <div key={toast.id} className="pointer-events-auto">
                            <ToastItem toast={toast} onDismiss={dismissToast} />
                        </div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
