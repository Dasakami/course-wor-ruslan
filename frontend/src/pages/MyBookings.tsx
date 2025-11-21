import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Booking } from '../types';
import { BookOpen, Calendar, Clock, X, CheckCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const statusLabels: Record<string, string> = {
  pending: 'В ожидании',
  confirmed: 'Подтверждено',
  cancelled: 'Отменено',
  completed: 'Завершено',
};

const filterLabels: Record<string, string> = {
  all: 'Все',
  pending: 'В ожидании',
  confirmed: 'Подтверждённые',
  cancelled: 'Отменённые',
  completed: 'Завершённые',
};

const badgeClass: Record<string, string> = {
  confirmed: 'badge-confirmed',
  pending: 'badge-pending',
  cancelled: 'badge-cancelled',
  completed: 'badge-completed',
};

function BookingCard({ booking, onCancel }: { booking: Booking; onCancel: (id: string) => void }) {
  return (
    <div className="card border p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Преподаватель */}
          <div className="flex items-center mb-4">
            <div className="card-icon card-icon-blue w-12 h-12 mr-4 text-lg font-bold">
              {booking.teacher_name?.charAt(0).toUpperCase() || 'П'}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {booking.teacher_name || 'Преподаватель'}
              </h3>
              <span className={`badge mt-1 ${badgeClass[booking.status]}`}>
                {statusLabels[booking.status]}
              </span>
            </div>
          </div>

          {/* Дата и время */}
          {booking.start_time && booking.end_time && (
            <div className="space-y-2 ml-16">
              <div className="flex items-center text-gray-700">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{format(parseISO(booking.start_time), 'PPP')}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>
                  {format(parseISO(booking.start_time), 'p')} — {format(parseISO(booking.end_time), 'p')}
                </span>
              </div>
            </div>
          )}

          {/* Заметки */}
          {booking.notes && (
            <div className="ml-16 mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
              {booking.notes}
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        {booking.status === 'pending' || booking.status === 'confirmed' ? (
          <button
            onClick={() => onCancel(String(booking.id))}
            className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition"
          >
            <X className="w-4 h-4 mr-1" />
            Отменить
          </button>
        ) : booking.status === 'completed' ? (
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-5 h-5 mr-1" />
            <span className="text-sm font-medium">Завершено</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get<Booking[]>('/api/students/my-bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Не удалось получить бронирования:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Вы уверены, что хотите отменить это бронирование?')) return;

    try {
      await api.delete(`/api/bookings/${bookingId}`);
      setBookings((prev) => prev.filter((b) => String(b.id) !== bookingId));
      alert('Бронирование успешно отменено');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Не удалось отменить бронирование');
    }
  };

  const filteredBookings = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Мои бронирования</h1>
        <p className="text-gray-600 mt-1">Управляйте своими занятиями</p>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'pending', 'confirmed', 'cancelled', 'completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              filter === status ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {filterLabels[status]}
          </button>
        ))}
      </div>

      {/* Контент */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-md border border-gray-200">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Бронирований не найдено</p>
          <p className="text-gray-400 text-sm mt-1">
            {filter === 'all' ? 'Найдите преподавателя — начните первое занятие' : `Нет: ${filterLabels[filter].toLowerCase()}`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} onCancel={handleCancelBooking} />
          ))}
        </div>
      )}
    </div>
  );
}
