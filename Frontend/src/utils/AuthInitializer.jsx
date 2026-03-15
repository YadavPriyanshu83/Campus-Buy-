import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setAuthenticated, setToken } from './userSlice';

const AuthInitializer = ({ children }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        // Initialize authentication state from localStorage
        const token = localStorage.getItem('token');
        if (token) {
            dispatch(setToken(token));
            dispatch(setAuthenticated(true));
        }
    }, [dispatch]);

    return children;
};

export default AuthInitializer; 