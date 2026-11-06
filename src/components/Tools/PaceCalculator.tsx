import React, { useState } from 'react';
import { Timer, Zap, Gauge, Flame, Sparkles } from 'lucide-react';

export const PaceCalculator: React.FC = () => {
  const [distanceKm, setDistanceKm] = useState<number>(42.195);
  const [hours, setHours] = useState<number>(3);
  const [minutes, setMinutes] = useState<number>(30);
  const [seconds, setSeconds] = useState<number>(0);

  // Total target seconds
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  const paceSecondsPerKm = totalSeconds > 0 && distanceKm > 0 ? totalSeconds / distanceKm : 0;

  const paceMinutes = Math.floor(paceSecondsPerKm / 60);
  const paceSecondsRemainder = Math.round(paceSecondsPerKm % 60);

  const speedKmh = totalSeconds > 0 ? (distanceKm / (totalSeconds / 3600)).toFixed(2) : '0';

  // Format splits
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.round(secs % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#0e0f17] border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-lime-400 text-xs font-bold uppercase tracking-widest mb-1">
            <Timer className="w-3.5 h-3.5" />
            Инструмент атлета
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold font-athletic text-white">
            КАЛЬКУЛЯТОР ТЕМПА И СРЕЗОВ
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Рассчитайте необходимый темп на километр для достижения вашего личного рекорда
          </p>
        </div>

        {/* Distance presets */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: '42.2K', val: 42.195 },
            { label: '21.1K', val: 21.097 },
            { label: '10K', val: 10 },
            { label: '5K', val: 5 },
          ].map(p => (
            <button
              key={p.label}
              onClick={() => setDistanceKm(p.val)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                distanceKm === p.val
                  ? 'bg-lime-400 text-black shadow-md'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Inputs */}
        <div className="space-y-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Желаемое финишное время:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-zinc-500 block mb-1">ЧАСЫ</span>
                <input
                  type="number"
                  min={0}
                  max={12}
                  value={hours}
                  onChange={e => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-center text-lg font-black text-white focus:border-lime-400"
                />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block mb-1">МИНУТЫ</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={e => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-center text-lg font-black text-white focus:border-lime-400"
                />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block mb-1">СЕКУНДЫ</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={seconds}
                  onChange={e => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-center text-lg font-black text-white focus:border-lime-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Точная дистанция (км):
            </label>
            <input
              type="number"
              step="0.001"
              value={distanceKm}
              onChange={e => setDistanceKm(parseFloat(e.target.value) || 1)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm font-bold text-white focus:border-lime-400"
            />
          </div>
        </div>

        {/* Center: Pace Result HUD */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between text-center relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              ЦЕЛЕВОЙ СРЕДНИЙ ТЕМП
            </span>
            <div className="text-5xl font-black font-bebas text-lime-400 tracking-wide mt-1">
              {paceMinutes}:{paceSecondsRemainder.toString().padStart(2, '0')}
              <span className="text-base text-zinc-400 font-sans ml-1 font-semibold">/км</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-zinc-800/80">
            <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center">
              <div className="text-[10px] text-zinc-500 uppercase flex items-center justify-center gap-1">
                <Gauge className="w-3 h-3 text-cyan-400" />
                Скорость
              </div>
              <div className="text-base font-black text-white mt-0.5">{speedKmh} км/ч</div>
            </div>
            <div className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-center">
              <div className="text-[10px] text-zinc-500 uppercase flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" />
                Пейсмейкер
              </div>
              <div className="text-base font-black text-white mt-0.5">
                {hours}:{minutes < 30 ? '00' : '30'}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Checkpoint Splits Timeline */}
        <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-lime-400" />
            Расчетные контрольные отсечки:
          </h4>
          <div className="space-y-2 text-xs">
            {[5, 10, 21.097, 30, distanceKm].filter(d => d <= distanceKm).map(dist => {
              const splitTime = paceSecondsPerKm * dist;
              const isFinish = dist === distanceKm;
              return (
                <div
                  key={dist}
                  className={`flex justify-between items-center py-1.5 px-2.5 rounded-lg border ${
                    isFinish
                      ? 'bg-lime-400/10 border-lime-400/40 text-lime-300 font-black'
                      : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-300'
                  }`}
                >
                  <span>{dist === 21.097 ? '21.1 км (Половина)' : isFinish ? `${dist} км (ФИНИШ)` : `${dist} км`}</span>
                  <span className="font-mono font-bold">{formatTime(splitTime)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
