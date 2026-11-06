import React, { useState } from 'react';
import { Trophy, Menu, X, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenRegistration: () => void;
  onOpenResults: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenRegistration,
  onOpenResults
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<'RU' | 'KZ' | 'EN'>('RU');

  const navLinks = [
    { label: 'Все события', href: '#events-showcase' },
    { label: 'Дистанции', href: '#distances' },
    { label: 'Трасса', href: '#map' },
    { label: 'Расписание', href: '#schedule' },
    { label: 'Список атлетов', href: '#participants-list' },
    { label: 'Калькулятор темпа', href: '#calculator' },
    { label: 'Партнеры', href: '#partners' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo with User's Uploaded Logo */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="AQTOBE MARATHON"
              className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-5">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNavClick(link.href)}
              className="text-xs font-bold text-slate-700 hover:text-red-600 uppercase tracking-wider transition-colors cursor-pointer"
            >
              {link.label}
            </button>
          ))}

          {/* Results Modal Button */}
          <button
            onClick={onOpenResults}
            className="text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer bg-red-50 hover:bg-red-100/80 px-3 py-1.5 rounded-xl border border-red-200"
          >
            <Trophy className="w-3.5 h-3.5 text-red-600" />
            Результаты забега
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 text-[11px] font-bold">
            {(['KZ', 'RU', 'EN'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setCurrentLang(lang)}
                className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                  currentLang === lang ? 'bg-white text-red-600 shadow-xs font-black' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Register CTA */}
          <button
            onClick={onOpenRegistration}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs uppercase tracking-wider hover:from-red-500 hover:to-rose-500 transition-all flex items-center gap-1.5 shadow-lg shadow-red-500/25 cursor-pointer hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            Регистрация
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenResults}
            className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-600"
            title="Результаты"
          >
            <Trophy className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenRegistration}
            className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white font-black text-[11px] uppercase tracking-wider shadow-sm"
          >
            Регистрация
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-4">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="text-left py-2.5 text-sm font-bold text-slate-700 hover:text-red-600 border-b border-slate-100"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenResults();
              }}
              className="text-left py-2.5 text-sm font-bold text-red-600 border-b border-slate-100 flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" /> Результаты забега (Поиск диплома)
            </button>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs font-bold">
              {(['KZ', 'RU', 'EN'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => setCurrentLang(lang)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    currentLang === lang ? 'bg-white text-red-600 shadow-xs font-black' : 'text-slate-500'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRegistration();
              }}
              className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-black text-xs uppercase"
            >
              Регистрация
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
