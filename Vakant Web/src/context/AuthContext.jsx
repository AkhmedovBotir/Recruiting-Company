import { createContext, useContext, useState, useEffect } from 'react';
import { getToken, removeToken, setToken as saveToken, getUser, setUser as saveUser, removeUser } from '../utils/helpers';
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
              const userData = { ...response.data.candidate, authenticated: true };
              saveUser(userData);
              setUser(userData);
              console.log('✅ Telegram authentication successful', response.data.isNewUser ? '(New user)' : '(Existing user)');
            } else {
              console.warn('⚠️ Telegram authentication unsuccessful:', response.message);
              // Fallback: check for existing token and user data
              const token = getToken();
              const savedUser = getUser();
              if (token && savedUser) {
                setUser(savedUser);
              } else if (token) {
                // Try to fetch user data from server
                try {
                  const userResponse = await api.getCurrentUser();
                  if (userResponse.success && userResponse.data) {
                    const userData = { ...userResponse.data, authenticated: true };
                    saveUser(userData);
                    setUser(userData);
                  } else {
                    setUser({ authenticated: true });
                  }
                } catch (error) {
                  console.warn('⚠️ Could not fetch user data from server:', error);
                  setUser({ authenticated: true });
                }
              }
            }
          } else {
            console.warn('⚠️ Telegram Web App detected but no initData available');
            // Fallback: check for existing token and user data
            const token = getToken();
            const savedUser = getUser();
            if (token && savedUser) {
              setUser(savedUser);
            } else if (token) {
              // Try to fetch user data from server
              try {
                const userResponse = await api.getCurrentUser();
                if (userResponse.success && userResponse.data) {
                  const userData = { ...userResponse.data, authenticated: true };
                  saveUser(userData);
                  setUser(userData);
                } else {
                  setUser({ authenticated: true });
                }
              } catch (error) {
                console.warn('⚠️ Could not fetch user data from server:', error);
                setUser({ authenticated: true });
              }
            }
          }
        } catch (error) {
          console.error('❌ Telegram authentication failed:', error);
          // Fallback: check for existing token and user data
          const token = getToken();
          const savedUser = getUser();
          if (token && savedUser) {
            setUser(savedUser);
          } else if (token) {
            // Try to fetch user data from server
            try {
              const userResponse = await api.getCurrentUser();
              if (userResponse.success && userResponse.data) {
                const userData = { ...userResponse.data, authenticated: true };
                saveUser(userData);
                setUser(userData);
              } else {
                setUser({ authenticated: true });
              }
            } catch (err) {
              console.warn('⚠️ Could not fetch user data from server:', err);
              setUser({ authenticated: true });
            }
          }
          // If no token, user can still login via phone number
        }
      } else {
        // Regular web - check existing token and user data
        const token = getToken();
        const savedUser = getUser();
        if (token && savedUser) {
          setUser(savedUser);
        } else if (token) {
          // Try to fetch user data from server if token exists but no saved user
          try {
            const response = await api.getCurrentUser();
            if (response.success && response.data) {
              const userData = { ...response.data, authenticated: true };
              saveUser(userData);
              setUser(userData);
            } else {
              setUser({ authenticated: true });
            }
          } catch (error) {
            console.warn('⚠️ Could not fetch user data from server:', error);
            setUser({ authenticated: true });
          }
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token, candidate) => {
    saveToken(token);
    const userData = { ...candidate, authenticated: true };
    saveUser(userData);
    setUser(userData);
  };

  const logout = () => {
    removeToken();
    removeUser();
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

