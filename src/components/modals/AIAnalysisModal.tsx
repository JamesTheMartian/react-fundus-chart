import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { analyzeChart } from '../../services/aiService';
import { Sparkles, X, Key, AlertCircle } from 'lucide-react';
// import './AIAnalysisModal.css'; // Removed for Tailwind migration

interface AIAnalysisModalProps {
    imageData: string;
    onClose: () => void;
}

const AVAILABLE_MODELS = [
    { id: 'openai/gpt-4o', name: 'GPT-4o (OpenAI)' },
    { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)' },
    { id: 'meta-llama/llama-3.2-90b-vision-instruct:free', name: 'Llama 3.2 90B Vision (Free)' },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
];

export const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({ imageData, onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [model, setModel] = useState(AVAILABLE_MODELS[0].id);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const storedKey = localStorage.getItem('openrouter_api_key');
        if (storedKey) {
            setApiKey(storedKey);
        }
    }, []);

    const handleAnalyze = async () => {
        if (!apiKey) {
            setError('Please enter your OpenRouter API Key');
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        // Save key
        localStorage.setItem('openrouter_api_key', apiKey);

        try {
            const response = await analyzeChart(imageData, apiKey, model);
            const content = response.choices[0]?.message?.content;
            if (content) {
                setResult(content);
            } else {
                setError('No analysis received from the model.');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during analysis.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                className="w-full max-w-2xl bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-800"
            >
                <div className="p-4 bg-gray-950 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Sparkles size={20} className="text-blue-400" /> AI Chart Analysis
                    </h2>
                    <button
                        className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-300">OpenRouter API Key</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="sk-or-..."
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-600"
                                />
                                <Key size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>
                            <p className="text-xs text-gray-500">
                                Your key is stored locally in your browser.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-300">Model</label>
                            <div className="relative">
                                <select
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    {AVAILABLE_MODELS.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 flex items-center gap-2 text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !apiKey}
                        className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 shadow-lg shadow-blue-900/20"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Sparkles size={18} />
                        )}
                        {loading ? 'Analyzing...' : 'Analyze Chart'}
                    </button>

                    {result && (
                        <div className="mt-6 pt-6 border-t border-gray-800">
                            <h3 className="text-lg font-semibold text-white mb-3">Analysis Result</h3>
                            <div className="bg-gray-950 p-4 rounded-xl text-gray-300 text-sm leading-relaxed whitespace-pre-wrap border border-gray-800">
                                {result}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};
