import React, { useState, useMemo } from 'react';
import { MarathonEvent } from '../../types/marathon';
import { marathonStorage } from '../../services/marathonStorage';
import { 
  Users, Search, Sparkles, ChevronLeft, ChevronRight, CheckCircle2 
} from 'lucide-react';

interface ParticipantsListProps {
  event: MarathonEvent;
  onRegisterClick: () => void;
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
  event,
  onRegisterClick
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistanceId, setSelectedDistanceId] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  const participants = marathonStorage.getParticipants(event.id);

  // Filtered Participants
  const filteredRunners = useMemo(() => {
    return participants.filter(p => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = 
        !query ||
        p.firstName.toLowerCase().includes(query) ||
        p.lastName.toLowerCase().includes(query) ||
        p.bibNumber.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query) ||
        (p.club && p.club.toLowerCase().includes(query));

      const matchesDistance = selectedDistanceId === 'all' || p.distanceId === selectedDistanceId;
      const matchesGender = genderFilter === 'all' || p.gender === genderFilter;

      return matchesSearch && matchesDistance && matchesGender;
    });
  }, [participants, searchQuery, selectedDistanceId, genderFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredRunners.length / itemsPerPage) || 1;
  const paginatedRunners = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRunners.slice(start, start + itemsPerPage);
  }, [filteredRunners, currentPage]);

  // Statistics
  const totalSlots = event.totalSlots || 4500;
  const totalRegistered = participants.length;
  const menCount = participants.filter(p => p.gender === 'male').length;
  const womenCount = participants.filter(p => p.gender === 'female').length;
  const uniqueClubsCount = new Set(participants.map(p => p.club).filter(Boolean)).size;

  return (
    <section id="participants-list" className="scroll-mt-24 space-y-6">
      
      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-widest mb-1">
              <Users className="w-4 h-4 text-red-600" />
              Официальный стартовый протокол
            </div>
            <h3 className="text-2xl sm:text-3xl font-black font-athletic text-slate-900">
              СПИСОК ЗАРЕГИСТРИРОВАННЫХ АТЛЕТОВ
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Проверьте присвоенный стартовый номер (Bib), возрастную категорию и статус допуска к забегу
            </p>
          </div>

          <button
            onClick={onRegisterClick}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs uppercase tracking-wider hover:from-red-500 hover:to-rose-500 transition-all flex items-center gap-2 shadow-md shadow-red-600/20 cursor-pointer self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            Присоединиться к забегу
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Всего атлетов</span>
            <div className="text-2xl font-black text-slate-900 font-bebas mt-0.5">
              {totalRegistered} <span className="text-xs text-slate-500 font-sans">человек</span>
            </div>
            <div className="text-[11px] text-red-600 font-semibold mt-0.5">
              Слотов осталось: {Math.max(0, totalSlots - totalRegistered)}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Мужчины</span>
            <div className="text-2xl font-black text-blue-600 font-bebas mt-0.5">
              {menCount} <span className="text-xs text-slate-500 font-sans">({totalRegistered > 0 ? Math.round((menCount / totalRegistered) * 100) : 0}%)</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Мужской зачет</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Женщины</span>
            <div className="text-2xl font-black text-rose-600 font-bebas mt-0.5">
              {womenCount} <span className="text-xs text-slate-500 font-sans">({totalRegistered > 0 ? Math.round((womenCount / totalRegistered) * 100) : 0}%)</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Женский зачет</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Беговых клубов</span>
            <div className="text-2xl font-black text-amber-600 font-bebas mt-0.5">
              {uniqueClubsCount} <span className="text-xs text-slate-500 font-sans">команд</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Командный рейтинг</div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="pt-6 space-y-3">
          {/* Distance Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => {
                setSelectedDistanceId('all');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                selectedDistanceId === 'all'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              Все дистанции ({totalRegistered})
            </button>
            {event.distances.map(d => {
              const count = participants.filter(p => p.distanceId === d.id).length;
              const isSelected = selectedDistanceId === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => {
                    setSelectedDistanceId(d.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.hexColor || '#dc2626' }} />
                  {d.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Input & Gender filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск по фамилии, имени, номеру Bib (например, 42-101), городу или клубу..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-100 transition-colors"
              />
            </div>

            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                onClick={() => {
                  setGenderFilter('all');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  genderFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Все
              </button>
              <button
                onClick={() => {
                  setGenderFilter('male');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  genderFilter === 'male' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Мужчины
              </button>
              <button
                onClick={() => {
                  setGenderFilter('female');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  genderFilter === 'female' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Женщины
              </button>
            </div>
          </div>
        </div>

        {/* Table of Registered Athletes */}
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Bib #</th>
                <th className="py-3 px-4">Атлет (ФИО)</th>
                <th className="py-3 px-4">Дистанция</th>
                <th className="py-3 px-4">Категория</th>
                <th className="py-3 px-4">Город / Клуб</th>
                <th className="py-3 px-4 text-right">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedRunners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    По вашему запросу участников не найдено.
                  </td>
                </tr>
              ) : (
                paginatedRunners.map((runner) => (
                  <tr key={runner.id} className="hover:bg-slate-50 transition-colors">
                    {/* Bib Number */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-black text-sm text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
                        {runner.bibNumber}
                      </span>
                    </td>

                    {/* Athlete Name & Gender */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{runner.lastName} {runner.firstName}</span>
                        <span className={`text-[10px] font-black uppercase px-1.5 py-0.2 rounded ${
                          runner.gender === 'male' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {runner.gender === 'male' ? 'M' : 'F'}
                        </span>
                      </div>
                    </td>

                    {/* Distance */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {runner.distanceName}
                    </td>

                    {/* Age Category */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {runner.ageCategory}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                        {runner.age} лет
                      </span>
                    </td>

                    {/* City & Club */}
                    <td className="py-3.5 px-4 text-slate-700">
                      <div>{runner.city}</div>
                      {runner.club && (
                        <div className="text-[11px] text-red-600 font-semibold">{runner.club}</div>
                      )}
                    </td>

                    {/* Registration Status */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Допущен
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 text-xs text-slate-500">
            <div>
              Показано {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredRunners.length)} из {filteredRunners.length} атлетов
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 disabled:opacity-40 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-slate-900 px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 disabled:opacity-40 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
