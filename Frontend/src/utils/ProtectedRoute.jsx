import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './authUtils';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

export default ProtectedRoute; 