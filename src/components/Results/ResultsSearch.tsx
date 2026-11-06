import React, { useState } from 'react';
import { RaceResult } from '../../types/marathon';
import { marathonStorage } from '../../services/marathonStorage';
import { Search, Trophy, Medal, Timer, Award, Download, X, ExternalLink } from 'lucide-react';

export const ResultsSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedResult, setSelectedResult] = useState<RaceResult | null>(null);
  const results = marathonStorage.getResults();

  const filtered = results.filter(r =>
    r.fullName.toLowerCase().includes(query.toLowerCase()) ||
    r.bibNumber.toLowerCase().includes(query.toLowerCase()) ||
    r.distanceName.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="bg-[#0e0f17] border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-lime-400 text-xs font-bold uppercase tracking-widest mb-1">
            <Trophy className="w-3.5 h-3.5" />
            Официальный тайминг и протоколы
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold font-athletic text-white">
            ПОИСК РЕЗУЛЬТАТОВ ЗАБЕГА
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Введите стартовый номер (Bib) или фамилию атлета для просмотра сплитов и диплома
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Номер Bib (42-101) или фамилия..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 transition-colors"
          />
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-800">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[11px] font-bold border-b border-zinc-800">
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
                <td colSpan={8} className="py-8 text-center text-zinc-500">
                  По вашему запросу результатов не найдено
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-black">
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
                  <td className="py-3.5 px-4 font-mono font-bold text-lime-400">
                    {item.bibNumber}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    {item.fullName}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-300">
                    {item.distanceName}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-white text-base">
                    {item.chipTime}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400 font-mono">
                    {item.avgPace}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400">
                    {item.ageGroup} (#{item.categoryPlace})
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedResult(item)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-lime-400 hover:text-black text-xs font-bold transition-all text-zinc-300 inline-flex items-center gap-1"
                    >
                      <Award className="w-3.5 h-3.5" />
                      Диплом
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Finisher Diploma Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-zinc-950 border-2 border-amber-400/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedResult(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Diploma Top */}
            <div className="w-16 h-16 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/30 flex items-center justify-center mx-auto shadow-lg">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="text-xs uppercase tracking-widest font-black text-amber-400">
              Официальный сертификат финишера
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-bebas text-white tracking-wider">
              AQTOBE INTERNATIONAL MARATHON
            </h2>

            <div className="py-3 border-y border-zinc-800 my-2">
              <div className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Награждается атлет</div>
              <div className="text-2xl sm:text-3xl font-black font-athletic text-white text-gradient">
                {selectedResult.fullName}
              </div>
              <div className="text-sm font-mono text-lime-400 mt-1 font-bold">
                Стартовый номер: {selectedResult.bibNumber}
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800">
                <div className="text-[10px] text-zinc-500 uppercase">Дистанция</div>
                <div className="text-sm font-black text-white">{selectedResult.distanceName}</div>
              </div>
              <div className="bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800">
                <div className="text-[10px] text-zinc-500 uppercase">Чистое время</div>
                <div className="text-sm font-black text-lime-400 font-mono">{selectedResult.chipTime}</div>
              </div>
              <div className="bg-zinc-900/80 p-3 rounded-2xl border border-zinc-800">
                <div className="text-[10px] text-zinc-500 uppercase">Темп / км</div>
                <div className="text-sm font-black text-white font-mono">{selectedResult.avgPace}</div>
              </div>
            </div>

            <div className="text-xs text-zinc-400 pt-2">
              Место в абсолюте: <b className="text-white">#{selectedResult.overallPlace}</b> • В категории {selectedResult.ageGroup}: <b className="text-white">#{selectedResult.categoryPlace}</b>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-amber-400 text-black font-black text-xs uppercase tracking-wider hover:bg-amber-300 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Скачать сертификат (PDF)
              </button>
              <button
                onClick={() => setSelectedResult(null)}
                className="px-5 py-3 rounded-xl bg-zinc-900 text-zinc-300 text-xs font-bold uppercase hover:bg-zinc-800"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
