import React, { useState } from 'react';
import { ScheduleDay } from '../../types/marathon';
import { Calendar, Clock, MapPin, Flag, Award, ShoppingBag, Users } from 'lucide-react';

interface RaceScheduleProps {
  schedule: ScheduleDay[];
}

export const RaceSchedule: React.FC<RaceScheduleProps> = ({ schedule }) => {
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  if (!schedule || schedule.length === 0) return null;

  const currentDay = schedule[activeDayIndex] || schedule[0];

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'start':
        return { label: 'СТАРТ ЗАБЕГА', bg: 'bg-red-50 text-red-600 border-red-200', icon: Flag };
      case 'expo':
        return { label: 'ЭКСПО & ВЫДАЧА', bg: 'bg-blue-50 text-blue-600 border-blue-200', icon: ShoppingBag };
      case 'award':
        return { label: 'ЦЕРЕМОНИЯ', bg: 'bg-amber-50 text-amber-600 border-amber-200', icon: Award };
      default:
        return { label: 'СОБЫТИЕ', bg: 'bg-slate-100 text-slate-700 border-slate-200', icon: Users };
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-widest mb-1">
            <Calendar className="w-3.5 h-3.5" />
            Программа марафонского уикенда
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold font-athletic text-slate-900">
            РАСПИСАНИЕ СОБЫТИЙ
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Тайминг Экспо, паста-пати, стартовых волн и церемонии награждения
          </p>
        </div>

        {/* Day Tabs */}
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {schedule.map((day, idx) => (
            <button
              key={day.date}
              onClick={() => setActiveDayIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeDayIndex === idx
                  ? 'bg-white text-red-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {day.dayName.split('—')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline items for chosen day */}
      <div className="space-y-3">
        <div className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>{currentDay.dayName}</span>
          <span className="text-xs text-slate-400">{currentDay.date}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {currentDay.items.map((item, idx) => {
            const badge = getCategoryBadge(item.category);
            const Icon = badge.icon;
            const isHighlight = item.category === 'start';

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all ${
                  isHighlight
                    ? 'bg-red-50/50 border-red-200 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-600">
                    <Clock className="w-3.5 h-3.5" />
                    {item.time}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1 ${badge.bg}`}>
                    <Icon className="w-3 h-3" />
                    {badge.label}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-2">{item.title}</h4>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
