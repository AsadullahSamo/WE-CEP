import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { authAPI, agriculturalAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in on component mount
    const token = localStorage.getItem('token');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await api.get('/auth/verify-token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Token verification error:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', { username, password });
      const data = response.data;
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return true;
      } else {
        setError(data.message);
        return false;
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during login');
      return false;
    }
  };

  const register = async (username, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/signup', { username, password });
      const data = response.data;
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        
        // After successful registration, trigger data generation
        try {
          await agriculturalAPI.getAllData(true); // true flag forces refresh/generation
        } catch (dataError) {
          console.error('Error generating initial data:', dataError);
          // Don't fail registration if data generation fails
        }
        
        return true;
      } else {
        setError(data.message);
        return false;
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during registration');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const deleteAccount = async () => {
    try {
      setError(null);
      const response = await api.delete('/auth/delete-account');
      if (response.data.success) {
        localStorage.removeItem('token');
        setUser(null);
        return true;
      } else {
        setError(response.data.message);
        return false;
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred while deleting account');
      return false;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    deleteAccount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};