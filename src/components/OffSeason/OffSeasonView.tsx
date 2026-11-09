import React from 'react';
import type { MarathonEvent, Sponsor } from '../../types/marathon';
import { 
  Trophy, Award, Users, Globe, ShieldCheck, 
  MapPin, Calendar, ArrowRight, Sparkles, Flame, Timer, HeartHandshake
} from 'lucide-react';
import { PaceCalculator } from '../Tools/PaceCalculator';

interface OffSeasonViewProps {
  completedEvents: MarathonEvent[];
  sponsors: Sponsor[];
  onOpenResults: () => void;
}

export const OffSeasonView: React.FC<OffSeasonViewProps> = ({
  completedEvents,
  onOpenResults
}) => {
  const scrollToCalculator = () => {
    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-24">
      {/* 1. HERO SECTION (OFF-SEASON / SERIES PRESENTATION) */}
      <section className="relative min-h-[580px] sm:min-h-[640px] flex items-center justify-center overflow-hidden bg-slate-950 pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Background Image with Dark Vignette */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1600&auto=format&fit=crop"
            alt="Aqtobe Marathon Series"
            className="w-full h-full object-cover opacity-35 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15),transparent_70%)]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          
          {/* Top Pill Status */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest backdrop-blur-md animate-pulse">
            <Flame className="w-4 h-4 text-red-500 fill-red-500" />
            Сезон забегов завершен • Готовимся к новым стартам
          </div>

          {/* Main Title */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-athletic text-white tracking-tight uppercase leading-none">
              AQTOBE INTERNATIONAL <span className="text-red-500">MARATHON</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
              Главное легкоатлетическое событие Западного Казахстана. Скоростные сертифицированные трассы AIMS, праздник спорта и тысячи бегунов со всего мира.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onOpenResults}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs uppercase tracking-wider hover:from-red-500 hover:to-rose-500 transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-red-600/30 cursor-pointer hover:scale-105"
            >
              <Trophy className="w-4 h-4 text-white" />
              Смотреть финишные протоколы сезона
            </button>

            <button
              onClick={scrollToCalculator}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Timer className="w-4 h-4 text-red-400" />
              Калькулятор темпа для тренировок
            </button>
          </div>

          {/* Key Facts Pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-8 border-t border-slate-800/80">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-black text-white font-athletic">4 500+</div>
              <div className="text-[11px] text-slate-400 font-semibold mt-0.5">Участников и финишеров</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-athletic">15 000 000 ₸</div>
              <div className="text-[11px] text-slate-400 font-semibold mt-0.5">Призовой фонд серии</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-black text-white font-athletic">45+ СТРАН</div>
              <div className="text-[11px] text-slate-400 font-semibold mt-0.5">География атлетов</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-black text-red-500 font-athletic">AIMS / WA</div>
              <div className="text-[11px] text-slate-400 font-semibold mt-0.5">Сертификация трассы</div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. COMPLETED RACES ARCHIVE SECTION (WITH PROTOCOL BUTTONS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-widest mb-1">
            <Trophy className="w-4 h-4 fill-red-600 text-red-600" />
            Официальные результаты серии
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-athletic text-slate-900">
            ЗАВЕРШЕННЫЕ СТАРТЫ СЕЗОНА
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Все забеги текущего сезона успешно финишировали. Вы можете посмотреть списки финишеров, отсечки времени и скачать электронные дипломы.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {completedEvents.map((ev) => (
            <div
              key={ev.id}
              className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={ev.bannerImage || 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1600&auto=format&fit=crop'}
                  alt={ev.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
                
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-slate-900/90 text-white border border-white/20 shadow-md">
                    Завершен
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 flex items-center gap-1 font-bold">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    {ev.city}
                  </span>
                  <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 flex items-center gap-1 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-slate-300" />
                    {ev.displayDate || ev.date}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-black font-athletic text-slate-900">
                    {ev.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                    {ev.description || ev.subtitle}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 font-semibold">
                    Дистанций: <b className="text-slate-900">{ev.distances?.length || 0}</b>
                  </div>
                  <button
                    onClick={onOpenResults}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-red-600/20 transition-all cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    Финишный протокол
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ABOUT AQTOBE MARATHON ADVANTAGES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="text-red-600 text-xs font-bold uppercase tracking-widest">
            Стандарты проведения
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-athletic text-slate-900">
            ПОЧЕМУ ВЫБИРАЮТ AQTOBE MARATHON
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Мы создаем международные беговые события высшего уровня с акцентом на безопасность, скорость и комфорт каждого атлета.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-4 shadow-sm hover:border-red-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black font-athletic text-slate-900">
              СЕРТИФИКАЦИЯ AIMS & WORLD ATHLETICS
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Трасса 42.195 км и 21.097 км измерена официальным калибратором AIMS. Ваши результаты признаются международным беговым сообществом и подходят для квалификации на мировые мэйджоры.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-4 shadow-sm hover:border-red-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <Timer className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black font-athletic text-slate-900">
              ЭЛЕКТРОННЫЙ ХРОНОМЕТРАЖ
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Высокоточные чиповые системы BibTag и ChronoTrack. Мгновенные отсечки на сплитах каждые 5-10 км, live-трансляция финишеров и автоматическая генерация электронных дипломов.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-4 shadow-sm hover:border-red-300 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black font-athletic text-slate-900">
              ЗАБОТА И ПОДДЕРЖКА НА ТРАССЕ
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Пункты питания и изотоника каждые 3 км, дежурные бригады скорой помощи, зоны освежения, профессиональные пейсмейкеры на целевые времена и праздничный концерт на финише.
            </p>
          </div>
        </div>
      </section>

      {/* 4. ATHLETE PACE CALCULATOR (ALWAYS ACTIVE) */}
      <div id="calculator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <PaceCalculator />
      </div>
    </div>
  );
};
