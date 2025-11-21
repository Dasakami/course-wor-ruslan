import { useState, FormEvent } from 'react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';

export function Profile() {
  const { user, loadUser } = useAuthStore();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
  });

  const submit = async (e: FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
        await api.put('/api/auth/users/me', formData);
        await loadUser();
        setEditing(false);
        alert('Изменения сохранены');
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Не удалось обновить профиль');
      } finally {
        setLoading(false);
      }
  };

  return (
    <div className="max-w-3xl mx-auto mt-4">
      <div>
        <h1 className="text-4xl font-extrabold text-gray-900">Профиль</h1>
        <p className="text-gray-500 mt-2">
          Управление данными вашей учётной записи
        </p>
      </div>

      <div className="mt-10 bg-white border border-gray-300 rounded-xl p-10 shadow-sm">

        {/* Верхний блок */}
        <div className="mb-10">
          <div className="text-6xl font-black bg-gray-900 text-white w-24 h-24 flex items-center justify-center rounded-xl">
            {user?.full_name[0].toUpperCase()}
          </div>

          <div className="mt-6">
            <h2 className="text-2xl font-bold text-gray-900">{user?.full_name}</h2>
            <div className="text-gray-600 text-lg mt-1">{user?.email}</div>

            <div className="inline-block mt-4 px-4 py-1 bg-gray-900 text-white text-sm rounded-lg uppercase tracking-wide">
              {user?.role}
            </div>
          </div>

          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="mt-6 px-6 py-3 border border-gray-900 text-gray-900 text-sm rounded-lg hover:bg-gray-900 hover:text-white transition"
            >
              Редактировать
            </button>
          )}
        </div>

        {/* Форма */}
        {editing ? (
          <form onSubmit={submit} className="space-y-6">

            <div>
              <label className="block text-sm font-semibold mb-1">
                Полное имя
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Электронная почта
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-gray-900 focus:ring-0"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    full_name: user?.full_name || '',
                    email: user?.email || '',
                  });
                }}
                className="px-6 py-3 border border-gray-400 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                disabled={loading}
              >
                Отмена
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition"
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-gray-600 text-sm">
            Вы можете редактировать данные профиля, чтобы обновить отображаемую
            информацию.
          </div>
        )}
      </div>
    </div>
  );
}
