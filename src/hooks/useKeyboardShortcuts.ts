import { useEffect, useCallback, useRef } from 'react';
import type { ToolType } from '../utils/types';

interface UseKeyboardShortcutsOptions {
    onUndo: () => void;
    onRedo: () => void;
    onClear: () => void;
    onDownload: () => void;
    on3DView: () => void;
    onDelete: () => void;
    onDeselect: () => void;
    onShowShortcuts: () => void;
    onToggleDarkMode: () => void;
    setActiveTool: (tool: ToolType) => void;
    disabled?: boolean;
}

const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

export const useKeyboardShortcuts = ({
    onUndo,
    onRedo,
    onClear,
    onDownload,
    on3DView,
    onDelete,
    onDeselect,
    onShowShortcuts,
    onToggleDarkMode,
    setActiveTool,
    disabled = false,
}: UseKeyboardShortcutsOptions) => {
    // Use refs to avoid stale closures
    const optionsRef = useRef({
        onUndo,
        onRedo,
        onClear,
        onDownload,
        on3DView,
        onDelete,
        onDeselect,
        onShowShortcuts,
        onToggleDarkMode,
        setActiveTool,
    });

    // Update refs on each render
    useEffect(() => {
        optionsRef.current = {
            onUndo,
            onRedo,
            onClear,
            onDownload,
            on3DView,
            onDelete,
            onDeselect,
            onShowShortcuts,
            onToggleDarkMode,
            setActiveTool,
        };
    });

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Don't trigger shortcuts if typing in an input
        const target = e.target as HTMLElement;
        if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.contentEditable === 'true'
        ) {
            return;
        }

        const {
            onUndo,
            onRedo,
            onClear,
            onDownload,
            on3DView,
            onDelete,
            onDeselect,
            onShowShortcuts,
            onToggleDarkMode,
            setActiveTool,
        } = optionsRef.current;

        const modKey = isMac ? e.metaKey : e.ctrlKey;

        // Undo: Cmd/Ctrl + Z
        if (modKey && !e.shiftKey && e.key === 'z') {
            e.preventDefault();
            onUndo();
            return;
        }

        // Redo: Cmd/Ctrl + Shift + Z
        if (modKey && e.shiftKey && e.key === 'z') {
            e.preventDefault();
            onRedo();
            return;
        }

        // Download: Cmd/Ctrl + S
        if (modKey && e.key === 's') {
            e.preventDefault();
            onDownload();
            return;
        }

        // Clear: Cmd/Ctrl + Backspace
        if (modKey && e.key === 'Backspace') {
            e.preventDefault();
            onClear();
            return;
        }

        // Without modifier keys
        if (!modKey && !e.altKey) {
            switch (e.key) {
                // Tool shortcuts
                case '1':
                    e.preventDefault();
                    setActiveTool('select');
                    break;
                case '2':
                    e.preventDefault();
                    setActiveTool('pen');
                    break;
                case '3':
                    e.preventDefault();
                    setActiveTool('brush');
                    break;
                case '`':
                    e.preventDefault();
                    on3DView();
                    break;
                case '4':
                    e.preventDefault();
                    setActiveTool('pattern');
                    break;
                case '5':
                    e.preventDefault();
                    setActiveTool('fill');
                    break;
                case '6':
                    e.preventDefault();
                    setActiveTool('eraser');
                    break;

                // Actions
                case 'Delete':
                case 'Backspace':
                    if (!modKey) {
                        e.preventDefault();
                        onDelete();
                    }
                    break;

                case 'Escape':
                    e.preventDefault();
                    onDeselect();
                    break;

                case '?':
                    e.preventDefault();
                    onShowShortcuts();
                    break;

                case 'd':
                case 'D':
                    e.preventDefault();
                    onToggleDarkMode();
                    break;
            }
        }
    }, []);

    useEffect(() => {
        if (disabled) return;

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [disabled, handleKeyDown]);
};
