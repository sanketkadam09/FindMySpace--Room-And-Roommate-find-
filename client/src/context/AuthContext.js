// client/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { API_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Login
  const login = useCallback((userData, jwtToken) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);

    setUser(userData);
    setToken(jwtToken);
    setIsAuthenticated(true);
  }, []);

  // ✅ Logout
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    }
  }, []);

  // ✅ Verify token on app load
  useEffect(() => {
    const verifyToken = async () => {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');

      if (storedUser && storedToken) {
        try {
          const res = await fetch(`${API_URL}/api/verify-token`, {
            method: 'GET',
            credentials: 'include',
            headers: { Authorization: `Bearer ${storedToken}` },
          });

          const data = await res.json();

          if (res.ok && data.user) {
            const updatedUser = { ...JSON.parse(storedUser), ...data.user };
            setUser(updatedUser);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          } else {
            logout();
          }
        } catch (err) {
          console.error('Token verification failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [logout]);

  // ✅ Update user info
  const updateUser = useCallback((newUserData) => {
    setUser(newUserData);
    localStorage.setItem('user', JSON.stringify(newUserData));
  }, []);

  // ✅ Helper for API calls with token
  const authFetch = useCallback(async (url, options = {}) => {
    const headers = {
      ...options.headers,
      Authorization: token ? `Bearer ${token}` : undefined,
      'Content-Type': 'application/json',
    };
    const res = await fetch(url, { ...options, headers, credentials: 'include' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout, updateUser, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
