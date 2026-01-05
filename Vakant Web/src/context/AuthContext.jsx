import { createContext, useContext, useState, useEffect } from 'react';
import { getToken, removeToken, setToken as saveToken } from '../utils/helpers';
import { isTelegramWebApp, getTelegramInitData, initializeTelegramWebApp } from '../utils/telegram';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      // Check if Telegram Web App
      const isTg = isTelegramWebApp();
      setIsTelegram(isTg);

      if (isTg) {
        // Initialize Telegram Web App
        initializeTelegramWebApp();

        // Try to authenticate with Telegram
        try {
          const initData = getTelegramInitData();
          if (initData) {
            console.log('🔐 Telegram Web App detected, authenticating...');
            const response = await api.authenticateWebApp(initData);
            if (response.success) {
              saveToken(response.data.token);
              setUser({ ...response.data.candidate, authenticated: true });
              console.log('✅ Telegram authentication successful', response.data.isNewUser ? '(New user)' : '(Existing user)');
            } else {
              console.warn('⚠️ Telegram authentication unsuccessful:', response.message);
              // Fallback: check for existing token
              const token = getToken();
              if (token) {
                setUser({ authenticated: true });
              }
            }
          } else {
            console.warn('⚠️ Telegram Web App detected but no initData available');
            // Fallback: check for existing token
            const token = getToken();
            if (token) {
              setUser({ authenticated: true });
            }
          }
        } catch (error) {
          console.error('❌ Telegram authentication failed:', error);
          // Fallback: check for existing token and allow web login
          const token = getToken();
          if (token) {
            setUser({ authenticated: true });
          }
          // If no token, user can still login via phone number
        }
      } else {
        // Regular web - check existing token
        const token = getToken();
        if (token) {
          setUser({ authenticated: true });
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token, candidate) => {
    saveToken(token);
    setUser({ ...candidate, authenticated: true });
  };

  const logout = () => {
    removeToken();
    setUser(null);
    
    // If Telegram Web App, close it
    if (isTelegram && window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.close();
    }
  };

  const isAuthenticated = () => {
    return !!user && user.authenticated && !!getToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: isAuthenticated(),
        isTelegram,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

