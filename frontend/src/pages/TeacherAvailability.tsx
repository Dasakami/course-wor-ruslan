import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { AvailabilitySlot } from '../types';
import { Plus, Calendar, Clock, Trash2, Edit2, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export function TeacherAvailability() {
  const { user } = useAuthStore();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [formData, setFormData] = useState({ start_time: '', end_time: '' });

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await api.get<AvailabilitySlot[]>(`/api/teachers/${user?.id}/availability`);
      setSlots(response.data);
    } catch (error) {
      console.error('Ошибка при получении слотов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSlot) {
        await api.put(`/api/teachers/availability/${editingSlot.id}`, formData);
        alert('Слот успешно обновлён');
      } else {
        await api.post(`/api/teachers/${user?.id}/availability`, formData);
        alert('Слот успешно создан');
      }
      closeModal();
      fetchSlots();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Не удалось сохранить слот');
    }
  };

  const handleDelete = async (slotId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот слот?')) return;
    try {
      await api.delete(`/api/teachers/availability/${slotId}`);
      setSlots(slots.filter(s => String(s.id) !== slotId));
      alert('Слот успешно удалён');
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Не удалось удалить слот');
    }
  };

  const openModal = (slot?: AvailabilitySlot) => {
    if (slot) {
      setEditingSlot(slot);
      setFormData({
        start_time: slot.start_time.slice(0, 16),
        end_time: slot.end_time.slice(0, 16),
      });
    } else {
      setEditingSlot(null);
      setFormData({ start_time: '', end_time: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSlot(null);
    setFormData({ start_time: '', end_time: '' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Моё расписание</h1>
          <p className="text-gray-600 mt-2">Управляйте своим графиком занятий</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5 mr-2" /> Добавить слот
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Пока нет слотов доступности</p>
          <p className="text-gray-400 text-sm mt-2">Создайте первый слот, чтобы начать принимать бронирования</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slots.map(slot => (
            <div
              key={slot.id}
              className={`bg-white rounded-xl shadow-sm border p-6 ${
                slot.is_booked ? 'border-green-300 bg-green-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="font-medium">{format(parseISO(slot.start_time), 'PPP')}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{format(parseISO(slot.start_time), 'p')} – {format(parseISO(slot.end_time), 'p')}</span>
                  </div>
                </div>
                {slot.is_booked && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Забронировано</span>}
              </div>

              {!slot.is_booked && (
                <div className="flex gap-2">
                  <button onClick={() => openModal(slot)} className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                    <Edit2 className="w-4 h-4 mr-1" /> Изменить
                  </button>
                  <button onClick={() => handleDelete(String(slot.id))} className="flex-1 flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
                    <Trash2 className="w-4 h-4 mr-1" /> Удалить
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{editingSlot ? 'Редактировать слот' : 'Добавить слот'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-2">Время начала</label>
                <input
                  id="start_time"
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-2">Время окончания</label>
                <input
                  id="end_time"
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition">Отмена</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">{editingSlot ? 'Обновить' : 'Создать'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
