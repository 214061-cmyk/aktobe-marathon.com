import React from 'react';
import { QrCode, Cpu, ShieldCheck } from 'lucide-react';

interface DigitalBibProps {
  bibNumber: string;
  runnerName: string;
  distanceName: string;
  hexColor?: string;
  eventName?: string;
  city?: string;
  wave?: string;
  countryCode?: string;
}

export const DigitalBib: React.FC<DigitalBibProps> = ({
  bibNumber,
  runnerName,
  distanceName,
  hexColor = '#84cc16',
  eventName = 'AQTOBE INTERNATIONAL MARATHON',
  city = 'AQTOBE 2026',
  wave = 'CORRAL A • WAVE 1',
  countryCode = '🇰🇿 KAZ'
}) => {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-[1.38/1] bg-gradient-to-b from-white via-zinc-100 to-zinc-200 text-zinc-900 rounded-2xl p-5 shadow-2xl border-4 border-zinc-300 flex flex-col justify-between overflow-hidden select-none">
      {/* 4 Corner Pin Holes */}
      <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 rounded-full bg-zinc-900/25 border-2 border-zinc-400/80 shadow-inner" />
      <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 rounded-full bg-zinc-900/25 border-2 border-zinc-400/80 shadow-inner" />
      <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 rounded-full bg-zinc-900/25 border-2 border-zinc-400/80 shadow-inner" />
      <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 rounded-full bg-zinc-900/25 border-2 border-zinc-400/80 shadow-inner" />

      {/* Top Banner with Distance Accent */}
      <div>
        <div
          className="h-2.5 w-full rounded-full mb-3 transition-colors duration-300"
          style={{ backgroundColor: hexColor }}
        />
        <div className="flex items-center justify-between text-[11px] font-black tracking-widest text-zinc-800 uppercase px-1">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: hexColor }} />
            {eventName}
          </span>
          <span className="font-mono text-zinc-600">{city}</span>
        </div>
      </div>

      {/* Main Bib Number */}
      <div className="my-auto text-center py-1">
        <div className="text-6xl sm:text-7xl font-black font-bebas tracking-wider text-black leading-none drop-shadow-sm">
          {bibNumber}
        </div>
        <div className="text-base sm:text-lg font-black tracking-wider uppercase text-zinc-900 mt-1 truncate px-2 font-athletic">
          {runnerName || 'ИМЯ УЧАСТНИКА'}
        </div>
      </div>

      {/* Bottom Bar: Wave, QR Code, Distance Badge & Chip */}
      <div className="pt-2 border-t-2 border-dashed border-zinc-300">
        <div className="flex items-center justify-between">
          {/* Left: Wave & Country */}
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{wave}</span>
            <span className="text-xs font-black text-zinc-800 flex items-center gap-1">
              {countryCode}
            </span>
            <span className="text-[9px] text-zinc-500 flex items-center gap-1 mt-0.5">
              <Cpu className="w-2.5 h-2.5 text-zinc-700" />
              ChronoTrack RFID BibTag
            </span>
          </div>

          {/* Center: Distance Badge */}
          <div
            className="px-3.5 py-1 rounded-xl text-black font-black text-xs sm:text-sm tracking-wider uppercase shadow-md flex items-center gap-1"
            style={{ backgroundColor: hexColor }}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {distanceName}
          </div>

          {/* Right: Mock QR / Barcode */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-zinc-200">
            <QrCode className="w-8 h-8 text-black" />
          </div>
        </div>
      </div>
    </div>
  );
};
