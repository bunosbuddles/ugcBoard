// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

// Create context
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load admin on mount
  useEffect(() => {
    const loadAdmin = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        // If no token, not authenticated
        if (!token) {
          setIsAuthenticated(false);
          setAdmin(null);
          setLoading(false);
          return;
        }
        
        // Set axios default headers
        axios.defaults.headers.common['x-auth-token'] = token;
        
        // Get current admin
        const res = await axios.get(`${API_URL}/api/auth/me`);
        
        setAdmin(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Error loading admin:', err);
        localStorage.removeItem('token');
        setAdmin(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    loadAdmin();
  }, []);

  // Login
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password
      });
      
      const { token } = res.data;
      
      // Save token to local storage
      localStorage.setItem('token', token);
      
      // Set axios default headers
      axios.defaults.headers.common['x-auth-token'] = token;
      
      // Get admin data
      const adminRes = await axios.get(`${API_URL}/api/auth/me`);
      
      setAdmin(adminRes.data);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'An error occurred during login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    // Remove token from local storage
    localStorage.removeItem('token');
    
    // Remove axios default headers
    delete axios.defaults.headers.common['x-auth-token'];
    
    // Reset state
    setAdmin(null);
    setIsAuthenticated(false);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    admin,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
