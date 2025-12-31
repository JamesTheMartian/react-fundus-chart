// =================================================================
// Share Modal - Generate and share chart links
// =================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Link, Copy, Check, ExternalLink } from 'lucide-react';
import { charts as chartsApi } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

// =================================================================
// Types
// =================================================================

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    chartId: string | null;
    chartName: string;
    isDark: boolean;
}

// =================================================================
// Component
// =================================================================

export function ShareModal({
    isOpen,
    onClose,
    chartId,
    chartName,
    isDark,
}: ShareModalProps) {
    const { isAuthenticated } = useAuth();
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateLink = async () => {
        if (!chartId) {
            setError('Please save the chart first before sharing');
            return;
        }

        setIsGenerating(true);
        setError('');

        try {
            const response = await chartsApi.createShareLink(chartId);
            setShareUrl(response.shareUrl);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate share link');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = async () => {
        if (!shareUrl) return;

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleOpenLink = () => {
        if (shareUrl) {
            window.open(shareUrl, '_blank');
        }
    };

    // Reset state when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setShareUrl(null);
            setCopied(false);
            setError('');
        }
    }, [isOpen]);

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
                            <Share2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <h2 className="text-xl font-bold mb-2">Sign in to Share</h2>
                            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Please sign in to share your charts.
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
                                    <Share2 className="w-5 h-5 text-primary-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Share Chart</h2>
                                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {chartName || 'Untitled Chart'}
                                    </p>
                                </div>
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

                        {/* Content */}
                        {!shareUrl ? (
                            <div className="text-center py-6">
                                <Link className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                                <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Generate a shareable link to this chart. Anyone with the link can view it.
                                </p>
                                <button
                                    onClick={handleGenerateLink}
                                    disabled={isGenerating || !chartId}
                                    className={`
                                        w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                                        font-medium transition-all duration-200
                                        bg-primary-500 hover:bg-primary-600 text-white
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                    `}
                                >
                                    {isGenerating ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Link className="w-5 h-5" />
                                            Generate Share Link
                                        </>
                                    )}
                                </button>
                                {!chartId && (
                                    <p className={`mt-3 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        Save the chart first to generate a share link.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Share Link */}
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Share Link
                                    </label>
                                    <div className={`
                                        flex items-center gap-2 p-3 rounded-xl border
                                        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}
                                    `}>
                                        <input
                                            type="text"
                                            value={shareUrl}
                                            readOnly
                                            className={`
                                                flex-1 bg-transparent border-none outline-none text-sm
                                                ${isDark ? 'text-gray-300' : 'text-gray-600'}
                                            `}
                                        />
                                        <button
                                            onClick={handleCopy}
                                            className={`
                                                p-2 rounded-lg transition-colors
                                                ${copied
                                                    ? 'bg-success-500/20 text-success-500'
                                                    : isDark
                                                        ? 'hover:bg-gray-700 text-gray-400'
                                                        : 'hover:bg-gray-200 text-gray-500'
                                                }
                                            `}
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleCopy}
                                        className={`
                                            flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                                            font-medium transition-all duration-200
                                            ${copied
                                                ? 'bg-success-500 text-white'
                                                : 'bg-primary-500 hover:bg-primary-600 text-white'
                                            }
                                        `}
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-5 h-5" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-5 h-5" />
                                                Copy Link
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleOpenLink}
                                        className={`
                                            flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                                            font-medium transition-colors
                                            ${isDark
                                                ? 'bg-gray-800 hover:bg-gray-700'
                                                : 'bg-gray-100 hover:bg-gray-200'
                                            }
                                        `}
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Info */}
                                <p className={`text-sm text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Anyone with this link can view this chart
                                </p>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default ShareModal;
