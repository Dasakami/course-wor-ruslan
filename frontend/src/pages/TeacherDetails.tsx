import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Teacher, AvailabilitySlot } from '../types';
import { useAuthStore } from '../store/authStore';
import { format, parseISO } from 'date-fns';

export function TeacherDetails() {
  const { teacherId } = useParams<{ teacherId: string }>();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingSlot, setBookingSlot] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teacherRes = await api.get<Teacher[]>('/api/teachers');
        const slotsRes = await api.get<AvailabilitySlot[]>(`/api/teachers/${teacherId}/availability`);
        const foundTeacher = teacherRes.data.find((t) => t.id === Number(teacherId));
        setTeacher(foundTeacher || null);
        setSlots(slotsRes.data.filter((slot) => !slot.is_booked));
      } catch (error) {
        console.error('Ошибка при получении данных преподавателя:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [teacherId]);

  const handleBooking = async (slotId: number) => {
    if (user?.role !== 'student') {
      alert('Только студенты могут бронировать занятия');
      return;
    }

    try {
      setBookingSlot(slotId);
      await api.post('/api/bookings', { availability_id: slotId, notes: '' });
      alert('Бронирование успешно создано! Ожидается подтверждение преподавателя.');
      navigate('/my-bookings');
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.detail || 'Не удалось создать бронирование');
    } finally {
      setBookingSlot(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="text-center py-12 text-gray-600">
        Преподаватель не найден
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <button
        onClick={() => navigate('/teachers')}
        className="text-gray-600 hover:text-gray-900"
      >
        &larr; Назад к списку преподавателей
      </button>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 flex items-center justify-center bg-gray-300 rounded-full font-bold text-3xl text-white">
            {teacher.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{teacher.full_name}</h1>
            {teacher.specialization && (
              <p className="text-gray-600">{teacher.specialization}</p>
            )}
            <p className="text-gray-700 mt-2">{teacher.bio}</p>
            <p className="text-gray-700 mt-1 text-sm">
              Рейтинг: {teacher.rating ? teacher.rating.toFixed(1) : 'Новый'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Доступные слоты
        </h2>

        {slots.length === 0 ? (
          <p className="text-gray-600 text-center py-8">На данный момент нет свободных слотов</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="border border-gray-300 rounded-lg p-4 hover:border-gray-500 transition cursor-pointer"
              >
                <p className="text-gray-700 font-medium mb-1">
                  {format(parseISO(slot.start_time), 'PPP')}
                </p>
                <p className="text-gray-600 mb-3">
                  {format(parseISO(slot.start_time), 'p')} - {format(parseISO(slot.end_time), 'p')}
                </p>
                <button
                  onClick={() => handleBooking(slot.id)}
                  disabled={bookingSlot === slot.id || user?.role !== 'student'}
                  className="w-full py-2 rounded-lg text-white bg-gray-700 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {bookingSlot === slot.id ? 'Бронирование...' : 'Забронировать'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
