// =================================================================
// Login Modal - Authentication UI
// =================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, LogIn, UserPlus, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// =================================================================
// Types
// =================================================================

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    isDark: boolean;
}

type AuthMode = 'login' | 'register';

// =================================================================
// Component
// =================================================================

export function LoginModal({ isOpen, onClose, isDark }: LoginModalProps) {
    const { login, register } = useAuth();
    const [mode, setMode] = useState<AuthMode>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (mode === 'login') {
                await login({ username, password });
            } else {
                if (!name.trim()) {
                    throw new Error('Name is required');
                }
                await register({ username, password, name });
            }
            onClose();
            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setError('');
        setIsLoading(true);
        try {
            await login({ username: 'demo', password: 'demo' });
            onClose();
            resetForm();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Demo login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setUsername('');
        setPassword('');
        setName('');
        setError('');
        setMode('login');
    };

    const toggleMode = () => {
        setMode(m => m === 'login' ? 'register' : 'login');
        setError('');
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
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
                            <h2 className="text-2xl font-bold">
                                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <button
                                onClick={onClose}
                                className={`
                                    p-2 rounded-lg transition-colors
                                    ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
                                `}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Demo Login Button */}
                        <button
                            onClick={handleDemoLogin}
                            disabled={isLoading}
                            className={`
                                w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                                font-medium transition-all duration-200 mb-4
                                bg-gradient-to-r from-primary-500 to-primary-600
                                hover:from-primary-600 hover:to-primary-700
                                text-white shadow-lg shadow-primary-500/25
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        >
                            <Zap className="w-5 h-5" />
                            Quick Demo Login
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-4">
                            <div className={`flex-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                or continue with
                            </span>
                            <div className={`flex-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 p-3 rounded-lg bg-danger-500/10 border border-danger-500/20 text-danger-600"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name (Register only) */}
                            <AnimatePresence>
                                {mode === 'register' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <label className="block text-sm font-medium mb-1">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <User className={`
                                                absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5
                                                ${isDark ? 'text-gray-400' : 'text-gray-500'}
                                            `} />
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                placeholder="Dr. John Doe"
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
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Username
                                </label>
                                <div className="relative">
                                    <User className={`
                                        absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5
                                        ${isDark ? 'text-gray-400' : 'text-gray-500'}
                                    `} />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        placeholder="username"
                                        required
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

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className={`
                                        absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5
                                        ${isDark ? 'text-gray-400' : 'text-gray-500'}
                                    `} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
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

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`
                                    w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                                    font-medium transition-all duration-200
                                    ${isDark
                                        ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                                        : 'bg-gray-100 hover:bg-gray-200'
                                    }
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : mode === 'login' ? (
                                    <>
                                        <LogIn className="w-5 h-5" />
                                        Sign In
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-5 h-5" />
                                        Create Account
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Toggle Mode */}
                        <div className="mt-6 text-center">
                            <button
                                onClick={toggleMode}
                                className={`
                                    text-sm transition-colors
                                    ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}
                                `}
                            >
                                {mode === 'login'
                                    ? "Don't have an account? Sign up"
                                    : 'Already have an account? Sign in'
                                }
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default LoginModal;
