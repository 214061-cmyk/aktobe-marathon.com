import React, { useState, useEffect } from 'react';
import { MarathonEvent } from '../../types/marathon';
import { 
  Flame, Calendar, MapPin, Trophy, Users, Globe2, 
  ArrowRight, ShieldCheck, Sparkles, Navigation, Play, Image as ImageIcon
} from 'lucide-react';

interface HeroSectionProps {
  event: MarathonEvent;
  onRegisterClick: () => void;
  onExploreMapClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  event,
  onRegisterClick,
  onExploreMapClick
}) => {
  // Live Countdown to Race Day
  const targetDate = new Date(event.date).getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Runner media showcase (Photos and Video)
  const [activeMediaTab, setActiveMediaTab] = useState<'video' | 'photos'>('photos');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const runnerPhotos = [
    {
      url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1400&auto=format&fit=crop',
      title: 'Массовый старт 4 500+ атлетов',
      caption: 'Энергия центральной площади Актобе'
    },
    {
      url: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1400&auto=format&fit=crop',
      title: 'Борьба за секунды и личные рекорды',
      caption: 'Сертифицированная трасса мирового стандарта'
    },
    {
      url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=1400&auto=format&fit=crop',
      title: 'Эмоции финишеров на дистанции 42.2 км',
      caption: 'Каждый участник — победитель'
    },
    {
      url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=1400&auto=format&fit=crop',
      title: 'Международные элитные бегуны',
      caption: 'Участники из более чем 45 стран'
    }
  ];

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = Math.max(0, targetDate - now);

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // Auto-rotate runner photos every 4 seconds
  useEffect(() => {
    if (activeMediaTab !== 'photos') return;
    const photoTimer = setInterval(() => {
      setActivePhotoIndex(prev => (prev + 1) % runnerPhotos.length);
    }, 4500);
    return () => clearInterval(photoTimer);
  }, [activeMediaTab, runnerPhotos.length]);

  // Compute total registered and total slots
  const totalRegistered = event.distances.reduce((sum, d) => sum + (d.registeredCount || 0), 0);
  const totalSlots = event.totalSlots || 4500;
  const slotPercentage = Math.min(100, Math.round((totalRegistered / totalSlots) * 100));

  return (
    <div className="relative w-full min-h-[85vh] lg:min-h-[92vh] flex flex-col justify-center items-center text-center px-4 pt-28 pb-16 overflow-hidden bg-gradient-to-b from-slate-100 via-white to-slate-50">
      
      {/* Background Graphic Effects & Speed lines */}
      <div className="absolute inset-0 bg-speed-lines pointer-events-none opacity-60" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-red-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 -right-40 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-black uppercase tracking-widest shadow-xs">
            <Flame className="w-3.5 h-3.5 fill-red-600 text-red-600" />
            Официальный старт сезона 2026
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
            Сертификация AIMS & World Athletics
          </div>
        </div>

        {/* Brand Event Title */}
        <div className="mb-4">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-bebas text-slate-900 tracking-tight leading-[0.98]">
            AQTOBE INTERNATIONAL MARATHON
          </h1>
          <p className="text-xs sm:text-sm text-red-600 font-bold uppercase tracking-widest mt-1">
            ГЛАВНЫЙ МЕЖДУНАРОДНЫЙ ЗАБЕГ ЗАПАДНОГО КАЗАХСТАНА
          </p>
        </div>

        {/* RUNNER MEDIA SHOWCASE (Replaces old text slogan) */}
        <div className="w-full max-w-4xl mb-6 relative">
          
          {/* Media Switcher Tabs */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <button
              onClick={() => setActiveMediaTab('photos')}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMediaTab === 'photos'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:text-red-600'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" /> Фото бегунов
            </button>
            <button
              onClick={() => setActiveMediaTab('video')}
              className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeMediaTab === 'video'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:text-red-600'
              }`}
            >
              <Play className="w-3.5 h-3.5" /> Видео забега
            </button>
          </div>

          {/* Media Container Frame */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-red-100 shadow-xl shadow-red-600/10 aspect-[16/9] sm:aspect-[21/9] max-h-[380px] bg-slate-900 group">
            
            {activeMediaTab === 'photos' ? (
              <>
                <img
                  src={runnerPhotos[activePhotoIndex].url}
                  alt={runnerPhotos[activePhotoIndex].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-red-950/40 via-transparent to-red-950/40" />

                {/* Photo Caption Overlay */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-left text-white flex items-end justify-between">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-red-600 text-[10px] font-black uppercase tracking-wider mb-1.5">
                      AQTOBE RUNNERS
                    </span>
                    <h3 className="text-lg sm:text-2xl font-black font-bebas tracking-wide drop-shadow-md">
                      {runnerPhotos[activePhotoIndex].title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-200 font-medium">
                      {runnerPhotos[activePhotoIndex].caption}
                    </p>
                  </div>

                  {/* Thumbnail Dots */}
                  <div className="flex items-center gap-1.5 shrink-0 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/20">
                    {runnerPhotos.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActivePhotoIndex(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                          activePhotoIndex === idx ? 'bg-red-500 w-6' : 'bg-white/60 hover:bg-white'
                        }`}
                        title={`Фото ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="relative w-full h-full">
                {/* Runner video stream with fallback poster */}
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1400&auto=format&fit=crop"
                  className="w-full h-full object-cover"
                >
                  <source
                    src="https://assets.mixkit.co/videos/preview/mixkit-marathon-runners-crossing-a-bridge-41584-large.mp4"
                    type="video/mp4"
                  />
                  Ваш браузер не поддерживает видео.
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />
                <div className="absolute bottom-4 left-4 text-left text-white pointer-events-none">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-red-600 text-[10px] font-black uppercase tracking-wider mb-1">
                    LIVE ВИДЕО
                  </span>
                  <div className="text-sm sm:text-base font-bold drop-shadow">
                    Атмосфера забегов и вдохновение перед стартом
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Event Key Info Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-slate-700 mb-6 bg-white shadow-md shadow-slate-200/50 px-6 py-3 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-600" />
            <span className="font-bold text-slate-900">{event.displayDate}</span>
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300" />
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-600" />
            <span className="font-bold text-slate-900">{event.city} • {event.location}</span>
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-slate-300" />
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Призовой фонд: <b className="text-slate-900 font-bold">{event.prizePool}</b></span>
          </div>
        </div>

        {/* Live Countdown Timer (Red & White Palette) */}
        <div className="mb-6">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">
            ДО ВЫСТРЕЛА СТАРТОВОГО ПИСТОЛЕТА ОСТАЛОСЬ:
          </div>
          <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto">
            <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 text-center shadow-sm">
              <div className="text-3xl sm:text-4xl font-black font-bebas text-slate-900">
                {timeLeft.days}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase">Дней</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 text-center shadow-sm">
              <div className="text-3xl sm:text-4xl font-black font-bebas text-slate-900">
                {timeLeft.hours.toString().padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase">Часов</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 text-center shadow-sm">
              <div className="text-3xl sm:text-4xl font-black font-bebas text-slate-900">
                {timeLeft.minutes.toString().padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase">Минут</div>
            </div>
            <div className="bg-red-50 border border-red-300 rounded-2xl p-3 sm:p-4 text-center shadow-md shadow-red-500/10">
              <div className="text-3xl sm:text-4xl font-black font-bebas text-red-600 animate-pulse">
                {timeLeft.seconds.toString().padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs text-red-600 font-bold uppercase">Секунд</div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mb-6">
          <button
            onClick={onRegisterClick}
            className="w-full sm:w-auto flex-1 px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white font-black text-sm uppercase tracking-wider hover:from-red-500 hover:to-rose-500 transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-red-600/25 cursor-pointer hover:scale-105"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            Зарегистрироваться на забег
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreMapClick}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-sm tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Navigation className="w-4 h-4 text-red-600" />
            Смотреть трассу
          </button>
        </div>

        {/* Live Slot Capacity Progress */}
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>Регистрация слотов:</span>
            <span className="text-red-600 font-bold">
              {totalRegistered} из {totalSlots} ({slotPercentage}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-red-600 to-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${slotPercentage}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 text-center mt-1.5">
            Осталось {totalSlots - totalRegistered} мест • Регистрация закроется при исчерпании лимита
          </div>
        </div>

      </div>

      {/* Bottom HUD Metrics Banner */}
      <div className="relative z-10 w-full max-w-6xl mx-auto mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-left">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-red-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-4 h-4 text-red-600" /> Дистанции
          </div>
          <div className="text-2xl sm:text-3xl font-black font-bebas text-slate-900">42.2K / 21.1K / 10K</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Включая 5K Fun Run и 3K Kids</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-amber-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Trophy className="w-4 h-4 text-amber-500" /> Призовой фонд
          </div>
          <div className="text-2xl sm:text-3xl font-black font-bebas text-slate-900">15 000 000 ₸</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Награды в абсолюте и категориях</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-rose-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Users className="w-4 h-4 text-rose-500" /> Участники
          </div>
          <div className="text-2xl sm:text-3xl font-black font-bebas text-slate-900">4 500+ АТЛЕТОВ</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Лимит участников соревнований</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <div className="text-slate-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Globe2 className="w-4 h-4 text-red-600" /> География
          </div>
          <div className="text-2xl sm:text-3xl font-black font-bebas text-slate-900">45+ СТРАН МИРА</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Международный статус старта</div>
        </div>
      </div>

    </div>
  );
};
