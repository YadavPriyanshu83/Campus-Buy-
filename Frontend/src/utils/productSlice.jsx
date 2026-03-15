import { createSlice } from '@reduxjs/toolkit';

const productSlice = createSlice({
    name: 'product',
    initialState: {
        // Product Form Data
        productForm: {
            title: '',
            description: '',
            category: '',
            condition: '',
            price: '',
            negotiable: false,
            images: []
        },
        
        // Product Upload State
        uploadLoading: false,
        uploadError: null,
        
        // Product Details
        selectedProduct: null,
        
        // My Products
        myProducts: []
    },
    reducers: {
        // Form Actions
        updateProductForm: (state, action) => {
            state.productForm = { ...state.productForm, ...action.payload };
        },
        resetProductForm: (state) => {
            state.productForm = {
                title: '',
                description: '',
                category: '',
                condition: '',
                price: '',
                negotiable: false,
                images: []
            };
        },
        
        // Upload Actions
        setUploadLoading: (state, action) => {
            state.uploadLoading = action.payload;
        },
        setUploadError: (state, action) => {
            state.uploadError = action.payload;
        },
        
        // Product Actions
        setSelectedProduct: (state, action) => {
            state.selectedProduct = action.payload;
        },
        setMyProducts: (state, action) => {
            state.myProducts = action.payload;
        },
        addMyProduct: (state, action) => {
            state.myProducts.unshift(action.payload);
        },
        updateMyProduct: (state, action) => {
            const index = state.myProducts.findIndex(p => p._id === action.payload._id);
            if (index !== -1) {
                state.myProducts[index] = action.payload;
            }
        },
        removeMyProduct: (state, action) => {
            state.myProducts = state.myProducts.filter(p => p._id !== action.payload);
        }
    },
});

export const {
    updateProductForm,
    resetProductForm,
    setUploadLoading,
    setUploadError,
    setSelectedProduct,
    setMyProducts,
    addMyProduct,
    updateMyProduct,
    removeMyProduct
} = productSlice.actions;

export default productSlice.reducer; 