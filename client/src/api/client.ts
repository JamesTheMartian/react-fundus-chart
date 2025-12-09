import { USE_MOCK_API, API_BASE_URL } from './config';

// Define your types here
export interface User {
    id: string;
    name: string;
}

// Mock data
const MOCK_USER: User = {
    id: '1',
    name: 'Mock User',
};

// Real API call
const getUserFromApi = async (): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/user`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

// Mock API call
const getUserFromMock = async (): Promise<User> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_USER), 500);
    });
};

// Exported function that switches based on config
export const getUser = async (): Promise<User> => {
    if (USE_MOCK_API) {
        console.log('Using Mock API');
        return getUserFromMock();
    }
    return getUserFromApi();
};
