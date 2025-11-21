import { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Главная' },
    { path: '/teachers', label: 'Преподаватели' },
    ...(user?.role === 'student' ? [{ path: '/my-bookings', label: 'Мои бронирования' }] : []),
    ...(user?.role === 'teacher'
      ? [
          { path: '/teacher/availability', label: 'Расписание' },
          { path: '/teacher/bookings', label: 'Записи' },
        ]
      : []),
    { path: '/profile', label: 'Профиль' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Навигация */}
      <nav className="bg-white border-b border-gray-300">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-2xl font-bold text-gray-800">
            Система Бронирования
          </Link>

          {/* Десктоп */}
          <div className="hidden md:flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive(item.path) ? 'bg-gray-200 text-gray-900' : 'text-gray-700 hover:bg-gray-300'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-red-600 rounded-md text-sm hover:bg-red-100 transition"
            >
              Выйти
            </button>
          </div>

          {/* Мобильное меню */}
          <button
            className="md:hidden px-2 py-1 border rounded"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? 'Закрыть' : 'Меню'}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-300">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 text-gray-700 text-sm font-medium transition ${
                  isActive(item.path) ? 'bg-gray-200 text-gray-900' : 'hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => {
                handleLogout();
                setMobileOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-red-600 text-sm font-medium hover:bg-red-100 transition"
            >
              Выйти
            </button>
          </div>
        )}
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>

      {/* Плавающий блок пользователя */}
      {user && (
        <div className="fixed bottom-6 right-6 bg-white border border-gray-300 px-4 py-2 rounded-full text-sm text-gray-700">
          {user.full_name} ({user.role === 'teacher' ? 'Преподаватель' : 'Студент'})
        </div>
      )}
    </div>
  );
}
