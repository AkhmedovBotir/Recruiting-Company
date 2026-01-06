import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { VacancyIcon, ApplicationIcon, MaterialIcon, StarIcon, UserIcon } from './Icons';

const BottomNav = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { path: '/vacancies', Icon: VacancyIcon, label: 'Vakansiyalar' },
    { path: '/applications', Icon: ApplicationIcon, label: 'Arizalarim' },
    { path: '/materials', Icon: MaterialIcon, label: 'Tayyorlov' },
    { path: '/saved-vacancies', Icon: StarIcon, label: 'Saqlangan' },
    { path: '/profile', Icon: UserIcon, label: 'Profil' },
  ];

  const isActive = (path) => {
    if (path === '/vacancies') {
      return location.pathname === '/vacancies' || location.pathname.startsWith('/vacancies/');
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg md:hidden">
      <div className="flex items-center justify-around px-1 py-2 safe-area-bottom">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.Icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center px-2 py-2 rounded-lg transition-all flex-1 min-w-0 ${
                active
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className={`mb-1 ${active ? 'transform scale-110' : ''} transition-transform`}>
                <Icon className="w-6 h-6" filled={active && item.path === '/saved-vacancies'} />
              </div>
              <span className={`text-xs font-medium truncate w-full text-center ${active ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

