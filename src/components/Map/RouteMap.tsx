import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Distance, RoutePoint } from '../../types/marathon';
import { MapPin, Navigation, Droplets, HeartPulse, Timer, Mountain, Flag, Info, Sparkles, ExternalLink } from 'lucide-react';

interface RouteMapProps {
  distances: Distance[];
  centerCoords: [number, number];
  city: string;
}

// Convert user link (e.g. plotaroute, alltrails, strava, or image) into clean embed url or format
const getMapEmbedInfo = (url?: string) => {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();

  // 1. Plotaroute: https://www.plotaroute.com/route/3478900 -> embed https://www.plotaroute.com/embedmap/3478900
  const plotarouteMatch = trimmed.match(/plotaroute\.com\/(?:route|embedmap)\/(\d+)/i);
  if (plotarouteMatch) {
    const routeId = plotarouteMatch[1];
    return {
      type: 'iframe' as const,
      embedUrl: `https://www.plotaroute.com/embedmap/${routeId}`,
      sourceUrl: `https://www.plotaroute.com/route/${routeId}`,
      provider: 'Plotaroute'
    };
  }

  // 2. AllTrails: https://www.alltrails.com/trail/... or embed
  if (trimmed.includes('alltrails.com')) {
    const embedUrl = trimmed.includes('/widget') ? trimmed : trimmed.replace('/trail/', '/widget/trail/');
    return {
      type: 'iframe' as const,
      embedUrl,
      sourceUrl: trimmed,
      provider: 'AllTrails'
    };
  }

  // 3. Yandex Maps / Google Maps MyMaps embed
  if (trimmed.includes('yandex.kz/map-widget') || trimmed.includes('yandex.ru/map-widget') || trimmed.includes('google.com/maps/d/embed')) {
    return {
      type: 'iframe' as const,
      embedUrl: trimmed,
      sourceUrl: trimmed,
      provider: 'Карты'
    };
  }

  // 4. Direct Image or Data URL (base64, png, jpg, webp)
  if (trimmed.startsWith('data:image/') || /\.(png|jpe?g|webp|svg|gif)($|\?)/i.test(trimmed)) {
    return {
      type: 'image' as const,
      imageUrl: trimmed,
      sourceUrl: trimmed,
      provider: 'Изображение'
    };
  }

  // 5. Generic Web page or Iframe
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return {
      type: 'iframe' as const,
      embedUrl: trimmed,
      sourceUrl: trimmed,
      provider: 'Онлайн-трек'
    };
  }

  return null;
};

export const RouteMap: React.FC<RouteMapProps> = ({ distances, centerCoords, city }) => {
  const [selectedDistanceId, setSelectedDistanceId] = useState<string>(distances[0]?.id || '');
  const [activePoint, setActivePoint] = useState<RoutePoint | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylineLayerRef = useRef<L.Polyline | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const activeDistance = distances.find(d => d.id === selectedDistanceId) || distances[0];
  const embedInfo = getMapEmbedInfo(activeDistance?.mapImageUrl);

  // If distance has custom map, default to custom_map view; otherwise interactive
  const [viewMode, setViewMode] = useState<'custom_map' | 'interactive'>('custom_map');

  // Update viewMode automatically when switching distances
  useEffect(() => {
    if (activeDistance?.mapImageUrl) {
      setViewMode('custom_map');
    } else {
      setViewMode('interactive');
    }
  }, [activeDistance?.id, activeDistance?.mapImageUrl]);

  // Leaflet initialization (only runs when interactive map container is rendered)
  useEffect(() => {
    if (viewMode !== 'interactive' && embedInfo) return;
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: centerCoords,
        zoom: 13,
        zoomControl: true,
        attributionControl: false
      });

      // Free reliable OpenStreetMap tiles (No API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    // Force map size refresh
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 150);
  }, [viewMode, centerCoords, embedInfo]);

  // Update route polyline and markers when active distance changes
  useEffect(() => {
    if (viewMode !== 'interactive' && embedInfo) return;
    const map = mapInstanceRef.current;
    if (!map || !activeDistance) return;

    // Remove existing polyline
    if (polylineLayerRef.current) {
      polylineLayerRef.current.remove();
    }

    // Remove existing markers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }

    // Draw route polyline
    if (activeDistance.routeWaypoints && activeDistance.routeWaypoints.length > 0) {
      // Glow background line
      const glowLine = L.polyline(activeDistance.routeWaypoints, {
        color: activeDistance.hexColor || '#dc2626',
        weight: 8,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      // Main sharp line
      const mainLine = L.polyline(activeDistance.routeWaypoints, {
        color: activeDistance.hexColor || '#dc2626',
        weight: 4,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(map);

      polylineLayerRef.current = mainLine;

      // Fit bounds to the route
      map.fitBounds(mainLine.getBounds(), { padding: [50, 50] });

      markersLayerRef.current?.addLayer(glowLine);
    }

    // Add markers
    if (activeDistance.points && markersLayerRef.current) {
      activeDistance.points.forEach(point => {
        let iconBg = 'bg-slate-900 text-white';
        let iconBorder = 'border-white';
        let emoji = '📍';

        if (point.type === 'start') {
          iconBg = 'bg-emerald-600 text-white font-black';
          emoji = '🏁';
        } else if (point.type === 'finish') {
          iconBg = 'bg-red-600 text-white font-black';
          emoji = '🏆';
        } else if (point.type === 'water') {
          iconBg = 'bg-cyan-600 text-white';
          emoji = '💧';
        } else if (point.type === 'medical') {
          iconBg = 'bg-rose-600 text-white';
          emoji = '🚑';
        } else if (point.type === 'toilet') {
          iconBg = 'bg-amber-600 text-white';
          emoji = '🚻';
        } else if (point.type === 'timing') {
          iconBg = 'bg-blue-600 text-white font-bold';
          emoji = '⏱';
        }

        const customDiv = L.divIcon({
          className: 'leaflet-custom-marker',
          html: `
            <div style="cursor: pointer; transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; box-shadow: 0 4px 15px rgba(0,0,0,0.25);" class="${iconBg} border-2 ${iconBorder}">
              <span style="font-size: 15px;">${emoji}</span>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const marker = L.marker(point.coords, { icon: customDiv });
        marker.on('click', () => {
          setActivePoint(point);
        });
        marker.bindTooltip(`<b>${point.title}</b><br/><span style="color:#64748b;font-size:12px;">${point.description}</span>`, {
          direction: 'top',
          offset: [0, -18],
          className: 'custom-leaflet-tooltip'
        });

        markersLayerRef.current?.addLayer(marker);
      });
    }
  }, [activeDistance, viewMode, embedInfo]);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm relative overflow-hidden">
      
      {/* Header & Distance Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-red-600 text-xs font-bold tracking-widest uppercase mb-1">
            <Navigation className="w-3.5 h-3.5" />
            Интерактивная карта трассы • {city}
          </div>
          <h3 className="text-2xl sm:text-3xl font-black font-athletic text-slate-900 tracking-wide">
            СХЕМА ТРАССЫ И ТОЧКИ СЕРВИСА
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Старт, финиш, пункты гидратации, медпосты, туалеты и перепад высот
          </p>
        </div>

        {/* Distance Selector Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {distances.map(d => {
            const isSelected = d.id === selectedDistanceId;
            return (
              <button
                key={d.id}
                onClick={() => {
                  setSelectedDistanceId(d.id);
                  setActivePoint(null);
                }}
                className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: isSelected ? '#ffffff' : d.hexColor || '#dc2626' }}
                />
                {d.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Stats Bar */}
      {activeDistance && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Дистанция</div>
              <div className="text-base sm:text-lg font-black text-slate-900">{activeDistance.name}</div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <Mountain className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Набор высоты</div>
              <div className="text-base sm:text-lg font-black text-slate-900">{activeDistance.elevationGain}</div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Лимит времени</div>
              <div className="text-base sm:text-lg font-black text-slate-900">{activeDistance.timeLimit}</div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium">Точки питания / Мед</div>
              <div className="text-base sm:text-lg font-black text-slate-900">
                {(activeDistance.points?.filter(p => p.type === 'water').length || 1) + 
                 (activeDistance.points?.filter(p => p.type === 'medical').length || 1)} пунктов
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Display Custom Embed / Image OR Leaflet Map */}
      {embedInfo ? (
        <div className="relative w-full h-[520px] sm:h-[600px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
          {embedInfo.type === 'iframe' ? (
            <iframe
              src={embedInfo.embedUrl}
              title={`Маршрут ${activeDistance.name}`}
              className="w-full h-full border-0"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-3 bg-slate-950">
              <img
                src={embedInfo.imageUrl}
                alt={`Схема ${activeDistance.name}`}
                className="max-h-full max-w-full object-contain rounded-xl"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="relative w-full h-[450px] sm:h-[520px] rounded-2xl overflow-hidden border border-slate-200">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-3 text-xs flex flex-wrap gap-3 shadow-md pointer-events-auto">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Старт
            </div>
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <span className="w-3 h-3 rounded-full bg-red-600 inline-block" /> Финиш
            </div>
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block" /> Пункт питания
            </div>
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> Медпост
            </div>
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Туалет (WC)
            </div>
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Чиповые маты
            </div>
          </div>

          {/* Selected Point Popover */}
          {activePoint && (
            <div className="absolute top-4 right-4 z-10 max-w-xs bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-xl animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
                  {activePoint.type.toUpperCase()} ТОЧКА
                </span>
                <button
                  onClick={() => setActivePoint(null)}
                  className="text-slate-400 hover:text-slate-800 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">{activePoint.title}</h4>
              <p className="text-slate-600 text-xs mb-3">{activePoint.description}</p>
              <div className="text-[11px] text-slate-400 font-mono">
                GPS: {activePoint.coords[0].toFixed(4)}, {activePoint.coords[1].toFixed(4)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Elevation Profile Graphic representation */}
      <div className="mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-4">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-2 font-medium">
          <span className="flex items-center gap-1.5 text-slate-900 font-bold">
            <Mountain className="w-3.5 h-3.5 text-red-600" />
            Профиль высот трассы ({activeDistance.name})
          </span>
          <span>Набор высоты: <b className="text-red-600 font-bold">{activeDistance.elevationGain}</b></span>
        </div>
        <div className="h-14 w-full flex items-end gap-1 px-1 pt-2">
          {Array.from({ length: 42 }).map((_, i) => {
            const heightFactor = Math.sin(i / 4) * 15 + Math.cos(i / 6) * 12 + 25;
            return (
              <div
                key={i}
                className="flex-1 rounded-t-sm transition-all duration-300 hover:opacity-100 group relative"
                style={{
                  height: `${heightFactor}px`,
                  backgroundColor: activeDistance.hexColor || '#dc2626',
                  opacity: i % 2 === 0 ? 0.85 : 0.6
                }}
              >
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-[10px] text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20 shadow-xs">
                  {Math.round(200 + heightFactor)} м
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1 px-1">
          <span>0 км (Стартовая арка)</span>
          <span>{Math.round(activeDistance.distanceKm / 2)} км</span>
          <span>{activeDistance.name} (Финишная арка)</span>
        </div>
      </div>
    </div>
  );
};
