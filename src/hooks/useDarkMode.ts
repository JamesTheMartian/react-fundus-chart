import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface UseDarkModeReturn {
    theme: Theme;
    isDark: boolean;
    setTheme: (theme: Theme) => void;
    toggleDarkMode: () => void;
}

const STORAGE_KEY = 'fundus-chart-theme';

export const useDarkMode = (): UseDarkModeReturn => {
    const [theme, setThemeState] = useState<Theme>(() => {
        // Check localStorage first
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
            if (stored && ['light', 'dark', 'system'].includes(stored)) {
                return stored;
            }
        }
        return 'system';
    });

    const [isDark, setIsDark] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            if (theme === 'system') {
                return window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
            return theme === 'dark';
        }
        return false;
    });

    // Update the actual dark class on document
    useEffect(() => {
        const root = document.documentElement;

        const updateDarkClass = (dark: boolean) => {
            if (dark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
            setIsDark(dark);
        };

        if (theme === 'system') {
            // Listen for system preference changes
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            updateDarkClass(mediaQuery.matches);

            const handler = (e: MediaQueryListEvent) => {
                updateDarkClass(e.matches);
            };

            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        } else {
            updateDarkClass(theme === 'dark');
        }
    }, [theme]);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(STORAGE_KEY, newTheme);
    }, []);

    const toggleDarkMode = useCallback(() => {
        // Toggle between light and dark explicitly (not system)
        const newTheme = isDark ? 'light' : 'dark';
        setTheme(newTheme);
    }, [isDark, setTheme]);

    return {
        theme,
        isDark,
        setTheme,
        toggleDarkMode,
    };
};
