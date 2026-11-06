import React from 'react';
import { Distance } from '../../types/marathon';
import { Clock, Mountain, ArrowRight, Sparkles, Award, Lock } from 'lucide-react';

interface DistancesGridProps {
  distances: Distance[];
  eventStatus?: string;
  onSelectDistance: (distanceId: string) => void;
}

export const DistancesGrid: React.FC<DistancesGridProps> = ({
  distances,
  eventStatus = 'registration_open',
  onSelectDistance,
}) => {
  const isRegistrationAllowed = eventStatus === 'registration_open';

  return (
    <div className="w-full">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-widest mb-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-200">
          <Sparkles className="w-3.5 h-3.5" />
          Доступные дистанции & тарифы
        </div>
        <h2 className="text-3xl sm:text-5xl font-black font-bebas text-slate-900 tracking-tight">
          ВЫБЕРИ СВОЮ ДИСТАНЦИЮ И ЦЕЛЬ НА СЕЗОН
        </h2>
        <p className="text-sm sm:text-base text-slate-600 mt-2">
          Каждый финишер получает официальную литую медаль, электронный чиповый хронометраж и фирменный стартовый пакет
        </p>

        {!isRegistrationAllowed && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-xs">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {eventStatus === 'coming_soon' && 'Регистрация на данное событие еще не открыта. Ознакомьтесь с параметрами дистанций.'}
              {eventStatus === 'sold_out' && 'Все доступные слоты на данный забег исчерпаны.'}
              {eventStatus === 'completed' && 'Забег завершен. Регистрация закрыта.'}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {distances.map((dist) => {
          const isMarathon = dist.distanceKm >= 42;
          const slotsLeft = dist.slots - (dist.registeredCount || 0);
          const percentTaken = Math.round(((dist.registeredCount || 0) / dist.slots) * 100);
          const isSlotSoldOut = slotsLeft <= 0;
          const canRegister = isRegistrationAllowed && !isSlotSoldOut;

          return (
            <div
              key={dist.id}
              className={`relative bg-white rounded-3xl p-6 sm:p-7 border transition-all duration-300 flex flex-col justify-between hover:shadow-xl ${
                isMarathon
                  ? 'border-2 border-red-500 shadow-lg shadow-red-500/10'
                  : 'border-slate-200 hover:border-red-300 shadow-sm'
              } ${!canRegister ? 'opacity-90' : ''}`}
            >
              {/* Highlight Ribbon for 42K */}
              {isMarathon && (
                <div className="absolute -top-3.5 right-6 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Award className="w-3 h-3" /> КОРОЛЕВСКАЯ ДИСТАНЦИЯ AIMS
                </div>
              )}

              <div>
                {/* Distance Badge & Title */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-xs"
                    style={{ backgroundColor: dist.hexColor || '#dc2626' }}
                  >
                    {dist.tag}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    Старт: <b className="text-slate-900">{dist.startTime}</b>
                  </span>
                </div>

                <div className="text-4xl font-black font-bebas text-slate-900 tracking-wide mb-1">
                  {dist.name}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-6 py-2 border-y border-slate-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Лимит: {dist.timeLimit}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mountain className="w-3.5 h-3.5 text-slate-400" />
                    Набор: {dist.elevationGain}
                  </span>
                  <span>Возраст: {dist.minAge}+</span>
                </div>

                {/* Price Display */}
                <div className="mb-6">
                  <div className="text-xs text-slate-500 uppercase font-semibold">Стоимость слота</div>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 font-athletic flex items-baseline gap-1">
                    {dist.price.toLocaleString('ru-RU')}
                    <span className="text-lg font-bold text-red-600">₸</span>
                  </div>
                </div>

                {/* Slots Tracker */}
                <div className="mb-6 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-slate-600">Занято слотов:</span>
                    <span className="text-red-600 font-bold">{dist.registeredCount || 0} / {dist.slots} ({percentTaken}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-red-600"
                      style={{
                        width: `${percentTaken}%`,
                        backgroundColor: dist.hexColor || '#dc2626'
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 text-right mt-1.5">
                    {isSlotSoldOut ? 'Слоты исчерпаны' : `Осталось ${slotsLeft} слотов`}
                  </div>
                </div>

                {/* Age Categories on card */}
                {dist.ageCategories && dist.ageCategories.length > 0 && (
                  <div className="mb-6 pt-3 border-t border-slate-100">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Возрастные категории:</span>
                      <span className="text-red-600 font-mono text-[10px] font-bold">{dist.minAge}+ лет</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {dist.ageCategories.map(cat => (
                        <span
                          key={cat.id}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-700"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button respecting event status */}
              {canRegister ? (
                <button
                  onClick={() => onSelectDistance(dist.id)}
                  className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    isMarathon
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500 shadow-md shadow-red-600/25'
                      : 'bg-slate-900 text-white hover:bg-red-600 transition-colors'
                  }`}
                >
                  Выбрать {dist.name}
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="w-full py-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 text-center cursor-not-allowed">
                  <Lock className="w-3.5 h-3.5" />
                  {eventStatus === 'coming_soon' ? 'Скоро открытие' : isSlotSoldOut ? 'Слоты проданы' : 'Регистрация закрыта'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
