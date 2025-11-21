import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import { Booking } from '../types';
import { Calendar, Users, BookOpen, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export function Dashboard() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get<Booking[]>('/api/bookings');
        setBookings(response.data);
      } catch (error) {
        console.error('Не удалось получить бронирования:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const upcoming = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const completed = bookings.filter(b => b.status === 'completed');

  const statusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Подтверждено';
      case 'pending': return 'В ожидании';
      case 'cancelled': return 'Отменено';
      default: return 'Завершено';
    }
  };

  const cards = [
    { label: 'Предстоящие занятия', value: upcoming.length, icon: Calendar, color: 'blue' },
    { label: 'Завершённые занятия', value: completed.length, icon: BookOpen, color: 'green' },
    { label: 'Ваша роль', value: user?.role === 'teacher' ? 'Преподаватель' : 'Студент', icon: Users, color: 'orange' },
    { label: 'Всего бронирований', value: bookings.length, icon: TrendingUp, color: 'purple' },
  ];

  const colorClasses = (color: string) => ({
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    orange: 'bg-orange-500 text-white',
    purple: 'bg-purple-500 text-white',
  }[color] || 'bg-gray-500 text-white');

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Привет, {user?.full_name}!</h1>
        <p className="text-gray-500 mt-1">Обзор вашей активности</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="p-4 bg-white rounded-lg shadow flex flex-col items-start space-y-2">
              <div className={`p-2 rounded ${colorClasses(card.color)}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-xl font-semibold">{card.value}</p>
              <p className="text-gray-500 text-sm">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Последняя активность</h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-gray-400 space-y-2">
            <Calendar className="w-12 h-12 text-gray-300" />
            <p>Пока нет бронирований</p>
            <p className="text-sm">
              {user?.role === 'student'
                ? 'Найдите преподавателя и забронируйте занятие'
                : 'Студенты смогут бронировать занятия с вами'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {bookings.slice(0, 5).map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition"
              >
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      b.status === 'confirmed' ? 'bg-green-500'
                        : b.status === 'pending' ? 'bg-yellow-400'
                        : b.status === 'cancelled' ? 'bg-red-500'
                        : 'bg-gray-400'
                    }`}
                  />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">
                      {user?.role === 'student' ? `С ${b.teacher_name}` : `Со студентом ${b.student_name}`}
                    </p>
                    <p>{b.start_time ? format(new Date(b.start_time), 'PPp') : 'Время не указано'}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-700">{statusLabel(b.status)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
