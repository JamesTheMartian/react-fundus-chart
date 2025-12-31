// =================================================================
// Auth Context - Global authentication state management
// =================================================================

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { auth } from '../api/client';
import type { User, AuthCredentials, RegisterData } from '../api/types';

// =================================================================
// Types
// =================================================================

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: AuthCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

// =================================================================
// Context
// =================================================================

const AuthContext = createContext<AuthContextType | null>(null);

// =================================================================
// Provider
// =================================================================

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user on mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await auth.getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                console.error('Failed to load user:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        loadUser();
    }, []);

    const login = useCallback(async (credentials: AuthCredentials) => {
        const response = await auth.login(credentials);
        setUser(response.user);
    }, []);

    const register = useCallback(async (data: RegisterData) => {
        const response = await auth.register(data);
        setUser(response.user);
    }, []);

    const logout = useCallback(() => {
        auth.logout();
        setUser(null);
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const currentUser = await auth.getCurrentUser();
            setUser(currentUser);
        } catch {
            setUser(null);
        }
    }, []);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// =================================================================
// Hook
// =================================================================

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// =================================================================
// Utility Hook - Check if demo mode
// =================================================================

export function useIsDemo(): boolean {
    const { user } = useAuth();
    return user?.username === 'demo';
}
