// client/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { API_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // ✨ UPDATED: Login function to handle new role system
 const login = useCallback((userData, jwtToken) => {
    // 1. Save user and token
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken); // ✅ Store real token

    setUser(userData);
    setToken(jwtToken);
    setIsAuthenticated(true);
}, []);


    const logout = useCallback(async () => {
        try {
            // Call logout endpoint to clear httpOnly cookie
            await fetch(`${API_URL}/api/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage and state
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
        }
    }, []);

    // ✨ UPDATED: Verify token on app load
    useEffect(() => {
        const verifyCurrentToken = async () => {
            const storedUser = localStorage.getItem('user');
            
            if (storedUser) {
                try {
                    // Verify token with backend
                    const res = await fetch(`${API_URL}/api/verify-token`, {
                        method: "GET",
                        credentials: "include",
                    });
                    
                    const data = await res.json();
                    
                    if (res.ok && data.user) {
                        // Update user data with latest from server
                        const userData = { ...JSON.parse(storedUser), ...data.user };
                        setUser(userData);
                        setIsAuthenticated(true);
                        localStorage.setItem('user', JSON.stringify(userData));
                    } else {
                        // Token invalid, clear everything
                        logout();
                    }
                } catch (error) {
                    console.error("Token verification failed:", error);
                    logout();
                }
            }
            setLoading(false);
        };

        verifyCurrentToken();
    }, [logout]);

    // ✨ NEW: Function to update user data (for profile updates)
    const updateUser = useCallback((newUserData) => {
        setUser(newUserData);
        localStorage.setItem('user', JSON.stringify(newUserData));
    }, []);

    // Provide the context values to children components
    return (
        <AuthContext.Provider value={{ 
            user, 
            token, 
            isAuthenticated, 
            loading, 
            login, 
            logout,
            updateUser // ✨ NEW: Add updateUser function
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Create a custom hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};