import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Booking } from '../types';
import { BookOpen, Calendar, Clock, Check, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export function TeacherBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get<Booking[]>('/api/bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Не удалось получить брони:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = (bookingId: string, status: Booking['status']) => {
    setBookings(bookings.map(b => (String(b.id) === bookingId ? { ...b, status } : b)));
  };

  const handleConfirm = async (bookingId: string) => {
    try {
      await api.put(`/api/bookings/${bookingId}/confirm`);
      updateBookingStatus(bookingId, 'confirmed');
      alert('Бронь успешно подтверждена');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Не удалось подтвердить бронь');
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Вы уверены, что хотите отменить эту бронь?')) return;
    try {
      await api.delete(`/api/bookings/${bookingId}`);
      updateBookingStatus(bookingId, 'cancelled');
      alert('Бронь успешно отменена');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Не удалось отменить бронь');
    }
  };

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const statusLabel = (status: Booking['status']) =>
    status === 'pending'
      ? 'В ожидании'
      : status === 'confirmed'
      ? 'Подтверждено'
      : status === 'cancelled'
      ? 'Отменено'
      : 'Завершено';

  const statusClasses = (status: Booking['status']) =>
    status === 'pending'
      ? 'bg-yellow-100 text-yellow-700'
      : status === 'confirmed'
      ? 'bg-green-100 text-green-700'
      : status === 'cancelled'
      ? 'bg-red-100 text-red-700'
      : 'bg-gray-100 text-gray-700';

  return (
    <div>
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Брони студентов</h1>
        <p className="text-gray-600 mt-2">Управление запросами на запись от студентов</p>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'pending', 'confirmed', 'cancelled', 'completed'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {status === 'all' ? 'Все' : statusLabel(status)}
          </button>
        ))}
      </div>

      {/* Контент */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Брони не найдены</p>
          <p className="text-gray-400 text-sm mt-2">
            {filter === 'all'
              ? 'Студенты будут записываться на ваши занятия'
              : `Нет броней со статусом "${statusLabel(filter)}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold mr-4">
                      {booking.student_name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{booking.student_name || 'Студент'}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${statusClasses(booking.status)}`}>
                        {statusLabel(booking.status)}
                      </span>
                    </div>
                  </div>

                  {/* Время */}
                  {booking.start_time && booking.end_time && (
                    <div className="space-y-2 ml-16">
                      <div className="flex items-center text-gray-700">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{format(parseISO(booking.start_time), 'PPP')}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>
                          {format(parseISO(booking.start_time), 'p')} - {format(parseISO(booking.end_time), 'p')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Заметки */}
                  {booking.notes && (
                    <div className="ml-16 mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{booking.notes}</p>
                    </div>
                  )}
                </div>

                {/* Действия для ожидания */}
                {booking.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConfirm(String(booking.id))}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <Check className="w-4 h-4 mr-1" /> Подтвердить
                    </button>
                    <button
                      onClick={() => handleCancel(String(booking.id))}
                      className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <X className="w-4 h-4 mr-1" /> Отменить
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
