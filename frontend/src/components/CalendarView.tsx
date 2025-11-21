import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';

interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

interface CalendarViewProps {
  events?: CalendarEvent[];
  onDateClick?: (date: Date) => void;
}

export function CalendarView({ events = [], onDateClick }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfMonth = monthStart.getDay();
  const emptyDays = Array(firstDayOfMonth).fill(null);

  const getEventsForDay = (day: Date) =>
    events.filter((event) => isSameDay(event.date, day));

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const statusClasses = (status?: CalendarEvent['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'completed':
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Заголовок и навигация */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="flex gap-2">
          <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-lg transition" aria-label="Previous month">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition" aria-label="Next month">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Заголовки дней недели */}
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}

        {/* Пустые дни */}
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}

        {/* Дни месяца */}
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isToday = isSameDay(day, new Date());
          const inMonth = isSameMonth(day, currentMonth);

          return (
            <div
              key={day.toString()}
              onClick={() => inMonth && onDateClick?.(day)}
              className={`aspect-square border border-gray-200 rounded-lg p-2 cursor-pointer hover:bg-gray-50 transition
                ${!inMonth ? 'opacity-50 cursor-not-allowed' : ''}
                ${isToday ? 'bg-blue-50 border-blue-300' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-800'}`}>
                {format(day, 'd')}
              </div>

              {/* События */}
              {dayEvents.length > 0 && (
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div key={event.id} className={`text-xs px-1 py-0.5 rounded truncate ${statusClasses(event.status)}`}>
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
