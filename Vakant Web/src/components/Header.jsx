import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const { isAuthenticated, logout, user, isTelegram } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    // If Telegram Web App, don't navigate to login (it will close the app)
    if (!isTelegram) {
      navigate('/login');
    }
    setShowProfileMenu(false);
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return 'U';
  };

  const isActive = (path) => {
    if (path === '/vacancies') {
      return location.pathname === '/vacancies' || location.pathname.startsWith('/vacancies/');
    }
    if (path === '/interviews') {
      return location.pathname === '/interviews' || location.pathname.startsWith('/interviews/');
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold text-blue-600"
            >
              Vakant
            </motion.div>
          </Link>

          <div className="flex items-center space-x-2 md:space-x-4 lg:space-x-6">
            <Link
              to="/vacancies"
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors text-sm md:text-base font-medium ${
                isActive('/vacancies')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <span>Vakansiyalar</span>
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/applications"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors text-sm md:text-base font-medium ${
                    isActive('/applications')
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="hidden md:inline">Mening arizalarim</span>
                  <span className="md:hidden">Arizalar</span>
                </Link>
                
                <Link
                  to="/materials"
                  className={`px-3 py-2 rounded-lg transition-colors text-sm md:text-base font-medium ${
                    isActive('/materials')
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  Tayyorlov
                </Link>
                
                <Link
                  to="/saved-vacancies"
                  className={`px-3 py-2 rounded-lg transition-colors text-sm md:text-base font-medium ${
                    isActive('/saved-vacancies')
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  Saqlangan
                </Link>
                
                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {getInitials()}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{user?.phone}</p>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="text-sm font-medium text-gray-900">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{user?.phone}</p>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setShowProfileMenu(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Profil
                        </Link>
                        <Link
                          to="/applications"
                          onClick={() => setShowProfileMenu(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Mening arizalarim
                        </Link>
                        <Link
                          to="/materials"
                          onClick={() => setShowProfileMenu(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Tayyorlov
                        </Link>
                        <Link
                          to="/saved-vacancies"
                          onClick={() => setShowProfileMenu(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Saqlangan vakansiyalar
                        </Link>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Chiqish
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              // Show login button if not authenticated (works for both regular web and Telegram Web App)
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base font-medium"
              >
                Kirish
              </Link>
            )}
          </div>
        </div>
      </nav>
      
      {/* Click outside to close menu */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;

