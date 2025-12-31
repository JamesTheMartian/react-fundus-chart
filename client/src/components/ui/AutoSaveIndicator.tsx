// =================================================================
// Auto Save Indicator - Shows save status in UI
// =================================================================

import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Check, Loader2, AlertCircle } from 'lucide-react';
import type { AutoSaveState } from '../../api/types';

// =================================================================
// Types
// =================================================================

interface AutoSaveIndicatorProps {
    status: AutoSaveState['status'];
    lastSaved: string | null;
    isDark: boolean;
    compact?: boolean;
}

// =================================================================
// Component
// =================================================================

export function AutoSaveIndicator({
    status,
    lastSaved,
    isDark,
    compact = false,
}: AutoSaveIndicatorProps) {
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);

        if (diffSecs < 5) return 'just now';
        if (diffSecs < 60) return `${diffSecs}s ago`;
        if (diffMins < 60) return `${diffMins}m ago`;
        return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusConfig = () => {
        switch (status) {
            case 'saving':
                return {
                    icon: Loader2,
                    text: 'Saving...',
                    className: 'text-primary-500',
                    animate: true,
                };
            case 'saved':
                return {
                    icon: Check,
                    text: lastSaved ? `Saved ${formatTime(lastSaved)}` : 'Saved',
                    className: 'text-success-500',
                    animate: false,
                };
            case 'error':
                return {
                    icon: AlertCircle,
                    text: 'Save failed',
                    className: 'text-danger-500',
                    animate: false,
                };
            default:
                return {
                    icon: Cloud,
                    text: 'Auto-save enabled',
                    className: isDark ? 'text-gray-500' : 'text-gray-400',
                    animate: false,
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={status}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className={`flex items-center gap-1.5 text-sm ${config.className}`}
            >
                <Icon className={`w-4 h-4 ${config.animate ? 'animate-spin' : ''}`} />
                {!compact && <span>{config.text}</span>}
            </motion.div>
        </AnimatePresence>
    );
}

export default AutoSaveIndicator;
