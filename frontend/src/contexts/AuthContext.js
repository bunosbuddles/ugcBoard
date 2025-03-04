// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

// Create context
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if token exists and get user data on initial load
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (token) {
        // Set token in axios headers
        axios.defaults.headers.common['x-auth-token'] = token;
        
        try {
          // Get current user data
          const res = await axios.get(`${API_URL}/api/auth/me`);
          setCurrentUser(res.data);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Auth error:', err);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['x-auth-token'];
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login user
  const login = async (username, password) => {
    try {
      setError('');
      
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password
      });

      // Save token and user data
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['x-auth-token'] = res.data.token;

      // Get full user data
      const userRes = await axios.get(`${API_URL}/api/auth/me`);
      setCurrentUser(userRes.data);
      setIsAuthenticated(true);
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'An error occurred during login'
      );
      return false;
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setError('');
      
      const res = await axios.post(`${API_URL}/api/auth/register`, userData);

      // Save token and user data
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      
      // Get full user data
      const userRes = await axios.get(`${API_URL}/api/auth/me`);
      setCurrentUser(userRes.data);
      setIsAuthenticated(true);
      
      return true;
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'An error occurred during registration'
      );
      return false;
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setError('');
      
      const res = await axios.put(`${API_URL}/api/auth/profile`, profileData);
      setCurrentUser(res.data);
      
      return { success: true, data: res.data };
    } catch (err) {
      console.error('Profile update error:', err);
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'An error occurred updating your profile'
      );
      return { success: false, error: err.response?.data?.message || 'Update failed' };
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      setError('');
      
      await axios.put(`${API_URL}/api/auth/password`, passwordData);
      
      return { success: true };
    } catch (err) {
      console.error('Password change error:', err);
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : 'An error occurred changing your password'
      );
      return { success: false, error: err.response?.data?.message || 'Password change failed' };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Clear error message
  const clearError = () => {
    setError('');
  };

  // Value to be provided by context
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    updateProfile,
    changePassword,
    logout,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};