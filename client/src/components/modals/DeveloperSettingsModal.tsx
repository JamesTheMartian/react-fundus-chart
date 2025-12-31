import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Server, Save, RotateCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { API_BASE_URL, USE_MOCK_API } from '../../api/config';

interface DeveloperSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    isDark: boolean;
}

export const DeveloperSettingsModal: React.FC<DeveloperSettingsModalProps> = ({
    isOpen,
    onClose,
}) => {
    // Local state for form values
    const [useMock, setUseMock] = useState(USE_MOCK_API);
    const [apiUrl, setApiUrl] = useState(API_BASE_URL);
    
    // Connection test state
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [testMessage, setTestMessage] = useState('');

    // Load initial values from config (which reflects localStorage or env)
    useEffect(() => {
        if (isOpen) {
            setUseMock(USE_MOCK_API);
            setApiUrl(API_BASE_URL);
            setTestStatus('idle');
            setTestMessage('');
        }
    }, [isOpen]);

    const handleTestConnection = async () => {
        if (useMock) {
            setTestStatus('success');
            setTestMessage('Mock API is always available (local)');
            return;
        }

        setTestStatus('testing');
        setTestMessage('Connecting...');

        try {
            // Remove /api from end if present to get root or construct health URL
            // API_BASE_URL usually includes /api e.g. http://localhost:3000/api
            // Health endpoint is usually /api/health
            
            // Normalize URL to remove trailing slash
            const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
            const healthUrl = `${baseUrl}/health`;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const res = await fetch(healthUrl, { 
                signal: controller.signal,
                headers: { 'Accept': 'application/json' }
            });
            
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                setTestStatus('success');
                setTestMessage(`Connected! Status: ${data.status}, DB: ${data.database}`);
            } else {
                throw new Error(`HTTP ${res.status}`);
            }
        } catch (err: any) {
            setTestStatus('error');
            setTestMessage(err.message === 'Failed to fetch' ? 'Connection refused (Is server running?)' : err.message);
        }
    };

    const handleSave = () => {
        // Save to localStorage
        localStorage.setItem('debug_use_mock_api', String(useMock));
        
        // Only save API URL if not using mock (or save anyway, doesn't hurt)
        localStorage.setItem('debug_api_base_url', apiUrl);

        // Force reload to apply changes (since config.ts is evaluated at load time)
        window.location.reload();
    };

    const handleClearOverrides = () => {
        localStorage.removeItem('debug_use_mock_api');
        localStorage.removeItem('debug_api_base_url');
        window.location.reload();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-500">
                                <Server size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Developer Settings</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Configure API connection (Debug)</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        
                        {/* Mock API Toggle */}
                        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Use Mock API</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Simulate backend in browser (No server required)
                                </p>
                            </div>
                            <button
                                onClick={() => setUseMock(!useMock)}
                                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                                    useMock ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                                    useMock ? 'translate-x-6' : 'translate-x-0'
                                }`} />
                            </button>
                        </div>

                        {/* API URL Input */}
                        <div className={`space-y-3 transition-opacity ${useMock ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Server API URL
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={apiUrl}
                                    onChange={(e) => setApiUrl(e.target.value)}
                                    placeholder="http://localhost:3000/api"
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-shadow"
                                />
                            </div>
                            <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                <InfoIcon size={12} />
                                Must include protocol (http/https) and path (e.g. /api)
                            </p>
                        </div>

                        {/* Test Connection Result */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                {testStatus === 'idle' && <div className="w-2 h-2 rounded-full bg-gray-400" />}
                                {testStatus === 'testing' && <RotateCw size={16} className="animate-spin text-primary-500" />}
                                {testStatus === 'success' && <CheckCircle2 size={16} className="text-success-500" />}
                                {testStatus === 'error' && <XCircle size={16} className="text-danger-500" />}
                                
                                <span className={`text-sm font-medium ${
                                    testStatus === 'success' ? 'text-success-700 dark:text-success-400' :
                                    testStatus === 'error' ? 'text-danger-700 dark:text-danger-400' :
                                    'text-gray-600 dark:text-gray-300'
                                }`}>
                                    {testMessage || 'Ready to test'}
                                </span>
                             </div>
                             
                             <button
                                onClick={handleTestConnection}
                                disabled={useMock}
                                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors disabled:opacity-50"
                            >
                                Test
                            </button>
                        </div>

                        {/* Warnings */}
                        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 flex gap-3">
                            <AlertTriangle size={16} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800 dark:text-amber-200">
                                Saving will reload the application to apply new configuration. Ensure server supports CORS for your origin.
                            </p>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="p-6 pt-0 flex gap-3">
                         <button
                            onClick={handleClearOverrides}
                            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                        >
                            Reset to Defaults
                        </button>
                        <div className="flex-1" />
                        <button
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm hover:shadow transition-all active:scale-95"
                        >
                            <Save size={16} />
                            Save & Reload
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

// Helper component
const InfoIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);
