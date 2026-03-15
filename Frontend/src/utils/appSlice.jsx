import { createSlice } from '@reduxjs/toolkit';

const appSlice = createSlice({
    name: 'app',
    initialState: {
        // Products Data
        products: [],
        loading: false,
        error: null,
        
        // General App State
        currentPage: 'home',
        notifications: [],
        
        // Search and Filter
        searchQuery: '',
        filters: {
            category: 'all',
            priceRange: 'all',
            negotiable: 'all'
        }
    },
    reducers: {
        // Products Actions
        setProducts: (state, action) => {
            state.products = action.payload;
            state.loading = false;
            state.error = null;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        addProduct: (state, action) => {
            state.products.unshift(action.payload);
        },
        updateProduct: (state, action) => {
            const index = state.products.findIndex(p => p._id === action.payload._id);
            if (index !== -1) {
                state.products[index] = action.payload;
            }
        },
        removeProduct: (state, action) => {
            state.products = state.products.filter(p => p._id !== action.payload);
        },
        
        // Navigation Actions
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
        
        // Notification Actions
        addNotification: (state, action) => {
            state.notifications.push(action.payload);
        },
        removeNotification: (state, action) => {
            state.notifications = state.notifications.filter(n => n.id !== action.payload);
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },
        
        // Search and Filter Actions
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetFilters: (state) => {
            state.filters = {
                category: 'all',
                priceRange: 'all',
                negotiable: 'all'
            };
        }
    },
});

export const {
    setProducts,
    setLoading,
    setError,
    addProduct,
    updateProduct,
    removeProduct,
    setCurrentPage,
    addNotification,
    removeNotification,
    clearNotifications,
    setSearchQuery,
    setFilters,
    resetFilters
} = appSlice.actions;

export default appSlice.reducer; 