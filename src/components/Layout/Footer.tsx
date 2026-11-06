import React from 'react';
import type { Sponsor } from '../../types/marathon';
import { Mail, Phone, MapPin, Send, FileText } from 'lucide-react';

interface FooterProps {
  sponsors: Sponsor[];
  onOpenDocument: (key: 'regulation' | 'offer' | 'privacy' | 'medical' | 'transfer') => void;
}

export const Footer: React.FC<FooterProps> = ({ sponsors, onOpenDocument }) => {
  return (
    <footer className="w-full bg-slate-900 border-t border-slate-800 text-slate-400 text-xs">
      
      {/* Sponsors Section */}
      <div id="partners" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-b border-slate-800">
        <div className="text-center mb-10">
          <div className="text-red-500 text-xs font-bold uppercase tracking-widest mb-1">
            Партнеры и Спонсоры
          </div>
          <h3 className="text-2xl sm:text-3xl font-black font-bebas text-white tracking-wider">
            ПРИ ПОДДЕРЖКЕ ЛИДЕРОВ СПОРТИВНОЙ ИНДУСТРИИ
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {sponsors.map((sp, idx) => {
            const tierLabel = 
              sp.tier === 'title' ? 'Титульный спонсор' :
              sp.tier === 'general' ? 'Генеральный партнер' :
              sp.tier === 'technical' ? 'Технический партнер' :
              sp.tier === 'media' ? 'Медиа-партнер' : 'Официальный партнер';

            const CardContent = (
              <>
                <span className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                  {tierLabel}
                </span>

                {sp.logoUrl ? (
                  <div className="h-10 flex items-center justify-center my-1 group-hover:scale-105 transition-transform">
                    <img
                      src={sp.logoUrl}
                      alt={sp.name}
                      className="max-h-9 max-w-[130px] object-contain drop-shadow"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="font-bebas text-xl sm:text-2xl font-black tracking-wider transition-colors group-hover:scale-105"
                    style={{ color: sp.accent || '#dc2626' }}
                  >
                    {sp.logoText}
                  </div>
                )}

                <div className="text-[10px] text-slate-300 mt-1 truncate max-w-full font-medium">
                  {sp.name}
                </div>
              </>
            );

            return sp.websiteUrl ? (
              <a
                key={sp.id || idx}
                href={sp.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-red-500/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
              >
                {CardContent}
              </a>
            ) : (
              <div
                key={sp.id || idx}
                className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-red-500/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all group"
              >
                {CardContent}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Footer Info Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="AQTOBE MARATHON"
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Главное спортивное событие Западного Казахстана. Член Ассоциации международных марафонов и пробегов (AIMS).
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Навигация</h4>
            <ul className="space-y-2">
              <li><a href="#events-showcase" className="hover:text-red-400 transition-colors">Календарь забегов</a></li>
              <li><a href="#distances" className="hover:text-red-400 transition-colors">Дистанции и слоты</a></li>
              <li><a href="#map" className="hover:text-red-400 transition-colors">Интерактивная карта трассы</a></li>
              <li><a href="#schedule" className="hover:text-red-400 transition-colors">Программа уикенда и ЭКСПО</a></li>
              <li><a href="#participants-list" className="hover:text-red-400 transition-colors">Список зарегистрированных атлетов</a></li>
              <li><a href="#calculator" className="hover:text-red-400 transition-colors">Калькулятор темпа</a></li>
            </ul>
          </div>

          {/* Real Official Legal Documents */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-red-500" />
              Документы соревнования
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDocument('regulation')}
                  className="text-left text-slate-300 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1.5 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 group-hover:scale-125 transition-transform" />
                  Официальное Положение забега (PDF)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDocument('offer')}
                  className="text-left text-slate-300 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1.5 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-red-500 group-hover:scale-125 transition-all" />
                  Договор публичной оферты
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDocument('privacy')}
                  className="text-left text-slate-300 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1.5 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-red-500 group-hover:scale-125 transition-all" />
                  Политика конфиденциальности
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDocument('medical')}
                  className="text-left text-slate-300 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1.5 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-red-500 group-hover:scale-125 transition-all" />
                  Медицинские требования и справки
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenDocument('transfer')}
                  className="text-left text-slate-300 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1.5 group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 group-hover:bg-red-500 group-hover:scale-125 transition-all" />
                  Правила передачи стартового слота
                </button>
              </li>
            </ul>
          </div>

          {/* Contacts & Socials */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-1">Контакты оргкомитета</h4>
            <div className="flex items-center gap-2 text-slate-300">
              <Phone className="w-4 h-4 text-red-500" />
              <a href="tel:+77058618151" className="hover:text-white font-mono">+7 (705) 861 81 51</a>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Mail className="w-4 h-4 text-red-500" />
              <a href="mailto:info@aktobe-marathon.kz" className="hover:text-white font-mono">info@aktobe-marathon.kz</a>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
              <span>г. Актобе, пр. Абилкайыр хана, 52</span>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <a
                href="https://instagram.com/aqtobemarathon"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                title="Instagram"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a
                href="https://wa.me/77058618151"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                title="WhatsApp"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright - NO public button for organizer login */}
        <div className="pt-8 mt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 AQTOBE MARATHON // Официальная платформа. Все права защищены.
          </div>
          <div className="flex items-center gap-4">
            <span>Безопасная оплата Kaspi Pay & Visa / Mastercard</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
