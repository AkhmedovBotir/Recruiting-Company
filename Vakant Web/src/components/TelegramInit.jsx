import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isTelegramWebApp, initializeTelegramWebApp } from '../utils/telegram';
import Loading from './Loading';

// Component to handle Telegram Web App initialization
const TelegramInit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, isTelegram } = useAuth();

  useEffect(() => {
    if (isTelegramWebApp()) {
      const tg = initializeTelegramWebApp();
      if (tg) {
        // Set theme colors if available
        if (tg.colorScheme === 'dark') {
          document.documentElement.classList.add('dark');
        }

        // Handle back button
        tg.BackButton.onClick(() => {
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate('/');
          }
        });
      }
    }
  }, [navigate, isTelegram]);

  // Update back button visibility on route change
  useEffect(() => {
    if (isTelegramWebApp()) {
      const tg = window.Telegram.WebApp;
      if (tg && tg.BackButton) {
        // Don't show back button on login page in Telegram
        if (location.pathname !== '/' && location.pathname !== '/login') {
          tg.BackButton.show();
        } else {
          tg.BackButton.hide();
        }
      }
    }
  }, [location.pathname]);

  // Don't render anything, loading is handled in LoginPage
  return null;
};

export default TelegramInit;

