/**
 * Authentication Context
 * Provides global authentication state and methods
 */

import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService.js';
import { getToken, removeToken } from '../utils/token.js';

const AuthContext = createContext(null);

/**
 * AuthProvider component
 * Provides authentication state to the app
 */
export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load current admin on mount
   */
  useEffect(() => {
    const loadAdmin = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getCurrentAdmin();
        if (response.success) {
          setAdmin(response.data.admin);
        }
      } catch (err) {
        setError(err.message);
        removeToken();
      } finally {
        setLoading(false);
      }
    };

    loadAdmin();
  }, []);

  /**
   * Login function
   * @param {string} username - Admin username
   * @param {string} password - Admin password
   * @returns {Promise<boolean>} Success status
   */
  const login = async (username, password) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authService.login(username, password);

      if (response.success && response.data.token) {
        setAdmin(response.data.admin);
        setLoading(false);
        return true;
      }

      setLoading(false);
      return false;
    } catch (err) {
      setError(err.message || err.errors?.[0]?.msg || 'Login failed');
      setLoading(false);
      return false;
    }
  };

  /**
   * Logout function
   */
  const logout = () => {
    authService.logout();
    setAdmin(null);
    setError(null);
  };

  const value = {
    admin,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!admin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 * @returns {object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
