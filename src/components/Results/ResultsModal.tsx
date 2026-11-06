import React, { useState } from 'react';
import { RaceResult } from '../../types/marathon';
import { marathonStorage } from '../../services/marathonStorage';
import { Search, Trophy, Medal, Timer, Award, Download, X, ExternalLink, Sparkles } from 'lucide-react';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [query, setQuery] = useState('');
  const [selectedResult, setSelectedResult] = useState<RaceResult | null>(null);

  if (!isOpen) return null;

  const results = marathonStorage.getResults();

  const filtered = results.filter(r =>
    r.fullName.toLowerCase().includes(query.toLowerCase()) ||
    r.bibNumber.toLowerCase().includes(query.toLowerCase()) ||
    r.distanceName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0f1017] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-zinc-800/80 bg-zinc-950/60">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-lime-400 uppercase tracking-widest">
              <Trophy className="w-3.5 h-3.5" />
              Официальный тайминг и протоколы
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-athletic text-white">
              ПОИСК РЕЗУЛЬТАТОВ ЗАБЕГА
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Электронный хронометраж ChronoTrack & MyLaps
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Search Bar */}
        <div className="p-5 sm:p-6 pb-2 border-b border-zinc-850">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Введите номер Bib (например: 42-101), фамилию или дистанцию..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 transition-colors shadow-inner"
              autoFocus
            />
          </div>
        </div>

        {/* Modal Content / Table */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-zinc-800">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] font-bold border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Место</th>
                  <th className="py-3 px-4">Bib</th>
                  <th className="py-3 px-4">Атлет</th>
                  <th className="py-3 px-4">Дистанция</th>
                  <th className="py-3 px-4">Чистое время (Chip)</th>
                  <th className="py-3 px-4">Темп</th>
                  <th className="py-3 px-4">Категория</th>
                  <th className="py-3 px-4 text-right">Диплом</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/30">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-500 text-xs">
                      По вашему запросу результатов не найдено
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3 px-4 font-black">
                        {item.overallPlace === 1 ? (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                            <Medal className="w-4 h-4" /> 1
                          </span>
                        ) : item.overallPlace === 2 ? (
                          <span className="inline-flex items-center gap-1 text-zinc-300 font-bold">
                            <Medal className="w-4 h-4" /> 2
                          </span>
                        ) : item.overallPlace === 3 ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                            <Medal className="w-4 h-4" /> 3
                          </span>
                        ) : (
                          <span className="text-zinc-400 font-bold">#{item.overallPlace}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-lime-400">
                        {item.bibNumber}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {item.fullName}
                      </td>
                      <td className="py-3 px-4 text-zinc-300">
                        {item.distanceName}
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-white text-base">
                        {item.chipTime}
                      </td>
                      <td className="py-3 px-4 text-zinc-400 font-mono">
                        {item.avgPace}
                      </td>
                      <td className="py-3 px-4 text-zinc-400">
                        {item.ageGroup}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedResult(item)}
                          className="px-3 py-1.5 rounded-xl bg-lime-400/10 hover:bg-lime-400 text-lime-400 hover:text-black font-bold text-xs transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5" /> Диплом
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* DIPLOMA MODAL OVERLAY */}
          {selectedResult && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
              <div className="relative w-full max-w-xl bg-gradient-to-b from-[#11131c] to-[#08090f] border-2 border-lime-400/40 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
                
                <button
                  onClick={() => setSelectedResult(null)}
                  className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800/80 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="w-16 h-16 rounded-3xl bg-lime-400/20 text-lime-400 flex items-center justify-center mx-auto border border-lime-400/40 shadow-lg shadow-lime-400/10">
                  <Award className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-xs uppercase font-black text-lime-400 tracking-widest block mb-1">
                    Электронный диплом финишера
                  </span>
                  <h4 className="text-3xl font-black text-white font-bebas tracking-wide">
                    {selectedResult.fullName}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Успешно финишировал(а) на дистанции <b className="text-white">{selectedResult.distanceName}</b>
                  </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Чистое время</span>
                    <span className="text-lg font-black text-lime-400 font-mono">{selectedResult.chipTime}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Средний темп</span>
                    <span className="text-lg font-black text-white font-mono">{selectedResult.avgPace}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Место (абсолют)</span>
                    <span className="text-lg font-black text-amber-400 font-mono">#{selectedResult.overallPlace}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-left text-xs bg-zinc-950/40 p-3 rounded-xl border border-zinc-850">
                  <div className="text-zinc-400">
                    Место в гендере: <b className="text-white">#{selectedResult.genderPlace}</b>
                  </div>
                  <div className="text-zinc-400">
                    Место в категории ({selectedResult.ageGroup}): <b className="text-white">#{selectedResult.categoryPlace}</b>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-3 rounded-xl bg-lime-400 text-black font-black text-xs uppercase tracking-wider hover:bg-lime-300 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-lime-400/20 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Скачать диплом (PDF)
                  </button>
                  <button
                    onClick={() => setSelectedResult(null)}
                    className="px-5 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Закрыть
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Закрыть окно
          </button>
        </div>

      </div>
    </div>
  );
};
