// Helper to get local storage value safely
const getDebugValue = (key: string) => typeof window !== 'undefined' ? localStorage.getItem(key) : null;

// Debug overrides
const debugUseMock = getDebugValue('debug_use_mock_api');
const debugApiUrl = getDebugValue('debug_api_base_url');

// Default to mock API (true) unless explicitly set to 'false'
// If debug override exists, use it (true/false strings)
export const USE_MOCK_API = debugUseMock !== null 
    ? debugUseMock === 'true' 
    : (import.meta.env.VITE_USE_MOCK_API !== 'false');

// Backend server URL (only used when USE_MOCK_API is false)
export const API_BASE_URL = debugApiUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
