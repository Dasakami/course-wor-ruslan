import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Teacher } from '../types';

export function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await api.get<Teacher[]>('/api/teachers');
        setTeachers(response.data);
      } catch (error) {
        console.error('Не удалось загрузить учителей:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Учителя</h1>
        <p className="text-gray-600 mt-1">
          Выберите преподавателя, с которым хотите работать
        </p>
      </header>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
        </div>
      ) : teachers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-700 text-lg">Нет доступных учителей</p>
          <p className="text-gray-400 mt-2 text-sm">Попробуйте позже</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              onClick={() => navigate(`/teachers/${teacher.id}`)}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
            >
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 flex items-center justify-center bg-gray-300 rounded-full text-white font-bold text-lg">
                  {teacher.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <h2 className="text-gray-900 font-semibold">{teacher.full_name}</h2>
                  {teacher.specialization && (
                    <p className="text-gray-500 text-sm">{teacher.specialization}</p>
                  )}
                </div>
              </div>

              {teacher.bio && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">{teacher.bio}</p>
              )}

              <div className="flex justify-between items-center text-sm text-gray-700 border-t border-gray-100 pt-2">
                <span>
                  Рейтинг: {teacher.rating ? teacher.rating.toFixed(1) : 'Новый'}
                </span>
                <span className="text-blue-600 hover:underline cursor-pointer">
                  Расписание
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
