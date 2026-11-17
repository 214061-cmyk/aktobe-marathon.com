import React, { useState, useEffect } from 'react';
import { MarathonEvent } from '../../types/marathon';
import { Calendar, MapPin, Trophy, Play, Image as ImageIcon, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  event: MarathonEvent;
  onRegisterClick: () => void;
  onExploreMapClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  event
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
  const [isPaused, setIsPaused] = useState(false);

  const runnerPhotos = [
    {
      url: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1600&auto=format&fit=crop',
      title: 'Грандиозный старт 4 500+ атлетов',
      caption: 'Энергия сотен единомышленников на широких проспектах Актобе'
    },
    {
      url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=1600&auto=format&fit=crop',
      title: 'Эмоции финиша и личные рекорды',
      caption: 'Слёзы радости, улыбки и победа над собой на финишной прямой'
    },
    {
      url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=1600&auto=format&fit=crop',
      title: 'Официальная литая медаль финишера',
      caption: 'Тяжёлая памятная медаль и эксклюзивный стартовый пакет каждому'
    },
    {
      url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1600&auto=format&fit=crop',
      title: 'Спортивный праздник для всей семьи',
      caption: 'Отдельные старты для детей от 3 лет, скандинавская ходьба и элита'
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

  // Auto-rotate runner photos every 5 seconds (pausing on hover)
  useEffect(() => {
    if (activeMediaTab !== 'photos' || isPaused) return;
    const photoTimer = setInterval(() => {
      setActivePhotoIndex(prev => (prev + 1) % runnerPhotos.length);
    }, 5000);
    return () => clearInterval(photoTimer);
  }, [activeMediaTab, isPaused, runnerPhotos.length]);

  return (
    <div className="relative w-full min-h-[75vh] flex flex-col justify-center items-center text-center px-4 pt-28 pb-12 bg-transparent">
      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Brand Event Title */}
        <div className="mb-4">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-bebas text-slate-900 tracking-tight leading-[0.98]">
            AQTOBE INTERNATIONAL MARATHON
          </h1>
          <p className="text-xs sm:text-sm text-red-600 font-bold uppercase tracking-widest mt-1">
            ГЛАВНЫЙ МЕЖДУНАРОДНЫЙ ЗАБЕГ ЗАПАДНОГО КАЗАХСТАНА
          </p>
        </div>

        {/* RUNNER MEDIA SHOWCASE */}
        <div 
          className="w-full max-w-4xl mb-6 relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          
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
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                />

                {/* Left/Right Quick Slide Switchers */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIndex(prev => (prev - 1 + runnerPhotos.length) % runnerPhotos.length);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/75 backdrop-blur-md text-white border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-lg z-20"
                  title="Предыдущее фото"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIndex(prev => (prev + 1) % runnerPhotos.length);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/75 backdrop-blur-md text-white border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer shadow-lg z-20"
                  title="Следующее фото"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                {/* Photo Caption Overlay */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-left text-white flex items-end justify-between z-10">
                  <div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600 text-[10px] font-black uppercase tracking-wider mb-1.5 shadow-sm">
                      <Sparkles className="w-2.5 h-2.5" /> AQTOBE RUNNERS
                    </span>
                    <h3 className="text-lg sm:text-2xl font-black font-bebas tracking-wide drop-shadow-md">
                      {runnerPhotos[activePhotoIndex].title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-200 font-medium drop-shadow">
                      {runnerPhotos[activePhotoIndex].caption}
                    </p>
                  </div>

                  {/* Thumbnail Dots */}
                  <div className="flex items-center gap-1.5 shrink-0 bg-black/50 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/20">
                    {runnerPhotos.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActivePhotoIndex(idx)}
                        className={`h-2.5 rounded-full transition-all cursor-pointer ${
                          activePhotoIndex === idx ? 'bg-red-500 w-6' : 'bg-white/60 hover:bg-white w-2.5'
                        }`}
                        title={`Фото ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="relative w-full h-full">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1600&auto=format&fit=crop"
                  className="w-full h-full object-cover"
                >
                  <source
                    src="https://assets.mixkit.co/videos/preview/mixkit-marathon-runners-crossing-a-bridge-41584-large.mp4"
                    type="video/mp4"
                  />
                  Ваш браузер не поддерживает видео.
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-left text-white pointer-events-none z-10">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-red-600 text-[10px] font-black uppercase tracking-wider mb-1.5 shadow-sm">
                    LIVE ВИДЕО
                  </span>
                  <div className="text-base sm:text-lg font-bold drop-shadow">
                    Энергия и атмосфера массовых марафонов
                  </div>
                  <div className="text-xs text-slate-300">
                    Почувствуйте дух главного спортивного события запада Казахстана
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
        <div>
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

      </div>

    </div>
  );
};
