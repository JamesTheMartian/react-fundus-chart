import React, { useState, useEffect } from 'react';
import { analyzeChart } from '../services/aiService';
import { Sparkles, X, Key, AlertCircle } from 'lucide-react';
import './AIAnalysisModal.css';

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
        <div className="ai-modal-overlay">
            <div className="ai-modal-content">
                <div className="ai-header">
                    <h2><Sparkles size={20} className="text-blue-400" /> AI Chart Analysis</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="ai-body">
                    <div className="api-key-section">
                        <label className="text-sm font-medium text-gray-300">OpenRouter API Key</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="sk-or-..."
                                className="api-key-input"
                            />
                            <Key size={16} className="absolute right-3 top-3 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500">
                            Your key is stored locally in your browser.
                        </p>
                    </div>

                    <div className="mb-4">
                        <label className="text-sm font-medium text-gray-300 block mb-2">Model</label>
                        <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="model-select"
                        >
                            {AVAILABLE_MODELS.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                    </div>

                    {error && (
                        <div className="error-msg">
                            <AlertCircle size={16} className="inline mr-2" />
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !apiKey}
                        className="analyze-btn"
                    >
                        {loading ? <div className="loading-spinner" /> : <Sparkles size={18} />}
                        {loading ? 'Analyzing...' : 'Analyze Chart'}
                    </button>

                    {result && (
                        <div className="result-section">
                            <h3 className="text-lg font-semibold mb-2">Analysis Result</h3>
                            <div className="result-content">
                                {result}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
