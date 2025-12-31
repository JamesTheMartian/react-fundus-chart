// =================================================================
// User Menu - Auth controls and user dropdown
// =================================================================

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, LogOut, FileText, Users, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// =================================================================
// Types
// =================================================================

interface UserMenuProps {
    onLoginClick: () => void;
    onChartsClick: () => void;
    onPatientsClick: () => void;
    onSettingsClick?: () => void;
    isDark: boolean;
    compact?: boolean;
}

// =================================================================
// Component
// =================================================================

export function UserMenu({
    onLoginClick,
    onChartsClick,
    onPatientsClick,
    onSettingsClick,
    isDark,
    compact = false,
}: UserMenuProps) {
    const { user, isAuthenticated, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!isAuthenticated) {
        return (
            <button
                onClick={onLoginClick}
                className={`
                    flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all
                    ${isDark
                        ? 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30'
                        : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                    }
                `}
            >
                <LogIn className="w-4 h-4" />
                {!compact && <span>Sign In</span>}
            </button>
        );
    }

    const menuItems = [
        { icon: FileText, label: 'My Charts', onClick: onChartsClick },
        { icon: Users, label: 'Patients', onClick: onPatientsClick },
        ...(onSettingsClick ? [{ icon: Settings, label: 'Settings', onClick: onSettingsClick }] : []),
    ];

    return (
        <div ref={menuRef} className="relative w-full">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl transition-all left-0
                    ${isDark
                        ? 'hover:bg-gray-800'
                        : 'hover:bg-gray-100'
                    }
                `}
            >
                <div className="flex items-center gap-2">
                    {/*User Name Icon*/}
                    <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        bg-gradient-to-br from-primary-400 to-primary-600 text-white font-semibold text-sm
                    `}>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    {!compact && (
                        <div className="text-left">
                            <div className="text-sm font-medium">{user?.name || 'User'}</div>
                            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                @{user?.username}
                            </div>
                        </div>
                    )}
                </div>
                {!compact && (
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={`
                            absolute left-0 top-full mt-2 w-full rounded-xl shadow-xl border z-50
                            ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
                        `}
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                    >
                        {/* User Info */}
                        <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                            <div className="font-medium">{user?.name}</div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                @{user?.username}
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                            {menuItems.map(({ icon: Icon, label, onClick }) => (
                                <button
                                    key={label}
                                    onClick={() => { onClick(); setIsOpen(false); }}
                                    className={`
                                        w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                                        ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}
                                    `}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Logout */}
                        <div className={`py-1 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                            <button
                                onClick={() => { logout(); setIsOpen(false); }}
                                className={`
                                    w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                                    text-danger-500 ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}
                                `}
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default UserMenu;
