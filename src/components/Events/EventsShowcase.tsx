import React from 'react';
import { MarathonEvent } from '../../types/marathon';
import { Calendar, MapPin, Trophy, ArrowRight, CheckCircle2, Sparkles, Flame } from 'lucide-react';

interface EventsShowcaseProps {
  events: MarathonEvent[];
  activeEventId: string;
  onSelectEvent: (eventId: string) => void;
  onOpenRegistration: (eventId: string) => void;
}

export const EventsShowcase: React.FC<EventsShowcaseProps> = ({
  events,
  activeEventId,
  onSelectEvent,
  onOpenRegistration,
}) => {
  // Hide completed / past events from public view
  const visibleEvents = events.filter(ev => ev.status !== 'completed');

  if (visibleEvents.length === 0) {
    return null;
  }

  return (
    <section id="events-showcase" className="scroll-mt-24 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-widest mb-1">
            <Flame className="w-4 h-4 fill-red-600 text-red-600" />
            Календарь забегов и марафонов
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-athletic text-slate-900">
            МЕРОПРИЯТИЯ СЕЗОНА
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Выберите интересующее вас событие для просмотра карты трассы, дистанций, расписания и списка участников
          </p>
        </div>

        <div className="text-xs text-slate-600 bg-white border border-slate-200 px-4 py-2 rounded-full flex items-center gap-2 self-start sm:self-auto shadow-xs">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
          Всего событий в серии: <b className="text-slate-900">{visibleEvents.length}</b>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleEvents.map((ev) => {
          const isActive = ev.id === activeEventId;
          const totalRegistered = ev.distances.reduce((sum, d) => sum + (d.registeredCount || 0), 0);
          const totalSlots = ev.totalSlots || 4500;
          const percent = Math.min(100, Math.round((totalRegistered / totalSlots) * 100));

          const statusBadge = 
            ev.status === 'registration_open' ? { label: 'Регистрация открыта', bg: 'bg-red-600 text-white font-black' } :
            ev.status === 'coming_soon' ? { label: 'Скоро открытие', bg: 'bg-amber-500 text-white font-bold' } :
            ev.status === 'sold_out' ? { label: 'Все слоты проданы', bg: 'bg-slate-700 text-white font-bold' } :
            { label: 'Завершен', bg: 'bg-slate-200 text-slate-600 font-medium' };

          return (
            <div
              key={ev.id}
              className={`group relative bg-white border-2 rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl ${
                isActive
                  ? 'border-red-600 ring-2 ring-red-100'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Event Image Banner */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={ev.bannerImage || 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1600&auto=format&fit=crop'}
                  alt={ev.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-xl text-[10px] uppercase tracking-wider shadow-md ${statusBadge.bg}`}>
                    {statusBadge.label}
                  </span>

                  {isActive && (
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-white/95 text-red-600 border border-red-200 flex items-center gap-1 shadow-md">
                      <CheckCircle2 className="w-3 h-3 text-red-600" /> Активное событие
                    </span>
                  )}
                </div>

                {/* City & Prize Pool */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-white/20 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    {ev.city}
                  </span>
                  {ev.prizePool && (
                    <span className="text-xs font-black text-amber-300 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-white/20 flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      {ev.prizePool}
                    </span>
                  )}
                </div>
              </div>

              {/* Event Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {ev.displayDate}
                  </div>

                  <h3 className="text-xl font-bold font-athletic text-slate-900 group-hover:text-red-600 transition-colors leading-tight">
                    {ev.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {ev.description || ev.subtitle}
                  </p>
                </div>

                {/* Distances Chips */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Доступные дистанции:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ev.distances.map(d => (
                      <span
                        key={d.id}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.hexColor || '#dc2626' }} />
                        {d.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quota Progress */}
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                    <span>Заполнено: <b className="text-slate-900">{totalRegistered}</b> / {totalSlots}</span>
                    <span className="text-red-600 font-bold">{percent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-600 to-rose-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectEvent(ev.id);
                      setTimeout(() => {
                        document.getElementById('distances')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {isActive ? (
                      <>Выбранный забег</>
                    ) : (
                      <>Выбрать забег <ArrowRight className="w-3.5 h-3.5" /></>
                    )}
                  </button>

                  {ev.status === 'registration_open' && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectEvent(ev.id);
                        onOpenRegistration(ev.id);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-1 shadow-md shadow-red-600/20 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-white" />
                      Участвовать
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
