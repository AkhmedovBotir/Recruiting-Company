import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import Loading from '../components/Loading';

const ProfilePage = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return 'U';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8 md:py-10 lg:py-12 max-w-4xl">
          <Loading />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8 md:py-10 lg:py-12 max-w-4xl">
          <Alert message="Profil ma'lumotlari topilmadi. Iltimos, qaytadan kiring." type="error" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8 md:py-10 lg:py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6 md:p-8"
        >
          {/* Avatar */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-blue-600 text-white rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-4">
              {getInitials()}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user?.firstName || ''} {user?.lastName || ''}
            </h2>
            {user?.phone && (
              <p className="text-gray-600 mt-2">{user.phone}</p>
            )}
          </div>

          {/* User Info */}
          <div className="space-y-4 mb-8">
            {user?.firstName && (
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Ism</span>
                <span className="font-semibold text-gray-900">{user.firstName}</span>
              </div>
            )}
            {user?.lastName && (
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Familiya</span>
                <span className="font-semibold text-gray-900">{user.lastName}</span>
              </div>
            )}
            {user?.phone && (
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Telefon</span>
                <span className="font-semibold text-gray-900">{user.phone}</span>
              </div>
            )}
            {user?.email && (
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Email</span>
                <span className="font-semibold text-gray-900">{user.email}</span>
              </div>
            )}
          </div>
          

          {/* Actions */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Chiqish
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;

