import { useSelector } from 'react-redux';

// Function to get the latest auth token
export const getAuthToken = () => {
    // First try to get token from localStorage
    const token = localStorage.getItem('token');
    
    // Check if token is valid format
    if (token && typeof token === 'string' && token.length > 20) {
        return token;
    } else {
        return null;
    }
};

// Selectors for easy access to Redux state
export const useAuth = () => {
    const { isAuthenticated, token: reduxToken, user } = useSelector(store => store.user);
    const token = reduxToken || localStorage.getItem('token');
    return { isAuthenticated, token, user, getAuthToken };
};

export const useUserProfile = () => {
    const { profile } = useSelector(store => store.user);
    return profile;
};

export const useAppState = () => {
    const { products, loading, error, currentPage } = useSelector(store => store.app);
    return { products, loading, error, currentPage };
};

export const useFormData = () => {
    const { loginForm, registerForm, otpData } = useSelector(store => store.user);
    return { loginForm, registerForm, otpData };
};

export const useProductState = () => {
    const { productForm, uploadLoading, uploadError, myProducts } = useSelector(store => store.product);
    return { productForm, uploadLoading, uploadError, myProducts };
};

// Authentication helpers
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
};

// Enhanced auth check that also validates token
export const validateAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/validate`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.ok;
    } catch (error) {
        console.error('Auth validation failed:', error);
        return false;
    }
};

export const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// API helpers
export const API_BASE_URL = 'http://localhost:5000/api';

// Test API connectivity
export const testAPI = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/product/all`);
        console.log('API test response:', response.status);
        return response.ok;
    } catch (error) {
        console.error('API test failed:', error);
        return false;
    }
};

export const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = getAuthHeaders();
    
    const config = {
        ...options,
        headers: {
            ...headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
};