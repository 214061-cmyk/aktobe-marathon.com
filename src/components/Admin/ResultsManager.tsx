import React, { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { MarathonEvent, RaceResult, Distance } from '../../types/marathon';
import { marathonStorage } from '../../services/marathonStorage';
import { generateDiplomaDataUrl, downloadDiploma } from '../../utils/diplomaGenerator';
import {
  Trophy,
  Upload,
  FileSpreadsheet,
  Trash2,
  Search,
  Award,
  Image as ImageIcon,
  Download,
  Filter,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  RefreshCw,
  Plus,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

interface ResultsManagerProps {
  activeEvent: MarathonEvent;
  onResultsChange?: () => void;
}

function normalizeTime(t: any): string {
  if (!t) return '00:00:00';
  const str = String(t).trim();
  const parts = str.split(':');
  if (parts.length === 2) {
    return '00:' + parts[0].padStart(2, '0') + ':' + parts[1].padStart(2, '0');
  }
  if (parts.length === 3) {
    return parts[0].padStart(2, '0') + ':' + parts[1].padStart(2, '0') + ':' + parts[2].padStart(2, '0');
  }
  return str;
}

function calcPace(chipTime: string, distanceKm: number = 10): string {
  const norm = normalizeTime(chipTime);
  const [h, m, s] = norm.split(':').map(Number);
  const totalSec = (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
  if (!totalSec || !distanceKm) return '0:00 мин/км';
  const secPerKm = totalSec / distanceKm;
  const pMin = Math.floor(secPerKm / 60);
  const pSec = Math.round(secPerKm % 60);
  return `${pMin}:${String(pSec).padStart(2, '0')} мин/км`;
}

export const ResultsManager: React.FC<ResultsManagerProps> = ({
  activeEvent,
  onResultsChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const diplomaBgInputRef = useRef<HTMLInputElement>(null);

  const [results, setResults] = useState<RaceResult[]>(() => marathonStorage.getResults(activeEvent.id));
  const [diplomaBgUrl, setDiplomaBgUrl] = useState<string | null>(() => marathonStorage.getDiplomaBgUrl(activeEvent.id));

  // Distance selection for import & filter
  const eventDistances: Distance[] = activeEvent.distances || [];
  const defaultDistName = eventDistances.length > 0 ? eventDistances[0].name : '10 км';
  const [selectedDistanceName, setSelectedDistanceName] = useState<string>('all');
  const [importTargetDistance, setImportTargetDistance] = useState<string>(defaultDistName);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedPreview, setParsedPreview] = useState<RaceResult[]>([]);
  const [importMode, setImportMode] = useState<'replace_distance' | 'replace_all' | 'append'>('replace_distance');
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Text paste import state
  const [isPasteMode, setIsPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState('');

  // Diploma Preview state
  const [previewResult, setPreviewResult] = useState<RaceResult | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isGeneratingDiploma, setIsGeneratingDiploma] = useState(false);

  // Diploma Background management state
  const [customBgInputUrl, setCustomBgInputUrl] = useState('');
  const [bgStatusMessage, setBgStatusMessage] = useState<string | null>(null);

  const reloadResults = () => {
    const list = marathonStorage.getResults(activeEvent.id);
    setResults(list);
    onResultsChange?.();
  };

  // Find target distance km for pace calculation
  const getKmForDistanceName = (distName: string): number => {
    const found = eventDistances.find(d => d.name.toLowerCase() === distName.toLowerCase());
    if (found && found.distanceKm) return found.distanceKm;
    const match = distName.match(/(\d+([.,]\d+)?)/);
    if (match) return parseFloat(match[1].replace(',', '.'));
    return 10;
  };

  // --- PARSE MYLAPS / EXCEL / CSV ---
  const parseRowsToResults = (rawRows: any[], targetDist: string): RaceResult[] => {
    const distKm = getKmForDistanceName(targetDist);

    return rawRows.map((r, i) => {
      // Find keys case-insensitively
      const getVal = (keys: string[]): any => {
        for (const k of keys) {
          if (r[k] !== undefined && r[k] !== null && r[k] !== '') return r[k];
          // Check lowercase match
          const foundKey = Object.keys(r).find(x => x.toLowerCase() === k.toLowerCase());
          if (foundKey && r[foundKey] !== undefined && r[foundKey] !== '') return r[foundKey];
        }
        return '';
      };

      const bib = String(getVal(['bib', 'bibnumber', 'bib_number', 'номер']) || '').trim() || String(i + 1);
      const name = String(getVal(['name', 'fullname', 'athlete', 'фио', 'участник', 'спортсмен']) || `Атлет #${bib}`).trim();
      const rawGender = String(getVal(['gender', 'sex', 'пол']) || 'M').toUpperCase();
      const gender: 'M' | 'F' = rawGender.startsWith('F') || rawGender.startsWith('Ж') || rawGender.startsWith('W') ? 'F' : 'M';
      const category = String(getVal(['category', 'cat', 'agegroup', 'age_group', 'категория']) || '18-29').trim();

      const rawOverall = getVal(['overallposition', 'overall_position', 'overallplace', 'место', 'место_абсолют']);
      const overallPlace = rawOverall ? Math.round(Number(rawOverall)) || (i + 1) : (i + 1);

      const rawCatPos = getVal(['categoryposition', 'category_position', 'catpos', 'место_в_категории']);
      const categoryPlace = rawCatPos ? Math.round(Number(rawCatPos)) || 1 : 1;

      const rawGenPos = getVal(['genderposition', 'gender_position', 'genpos', 'место_в_поле']);
      const genderPlace = rawGenPos ? Math.round(Number(rawGenPos)) || 1 : 1;

      const chipTime = normalizeTime(getVal(['chiptime', 'chip_time', 'чистоевремя', 'чистое_время', 'nettime', 'time']));
      const gunTime = normalizeTime(getVal(['guntime', 'gun_time', 'время_gun', 'gross_time']) || chipTime);

      const team = String(getVal(['team', 'club', 'клуб', 'команда']) || '').trim();
      const city = String(getVal(['athletecity', 'city', 'город']) || '').trim();
      const country = String(getVal(['countrycode', 'country', 'страна']) || 'KAZ').trim();

      // Collect splits
      const splits: Record<string, string> = {};
      Object.keys(r).forEach(k => {
        if (k.toLowerCase().startsWith('split')) {
          splits[k] = normalizeTime(r[k]);
        }
      });

      const avgPace = calcPace(chipTime, distKm);

      return {
        id: `res_${activeEvent.id}_${targetDist}_${bib}_${i}`,
        eventId: activeEvent.id,
        bibNumber: bib,
        fullName: name,
        gender,
        ageGroup: category,
        distanceName: targetDist,
        chipTime,
        gunTime,
        avgPace,
        overallPlace,
        genderPlace,
        categoryPlace,
        team,
        city,
        country,
        splits
      };
    });
  };

  // Handle file drop / selection
  const handleFileChange = async (file: File) => {
    setImportFile(file);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const rawData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      // Auto-detect distance name from filename (e.g. "10_km" -> "10 км", "21_km" -> "21.1 км")
      let detectedDist = importTargetDistance;
      const lowerFile = file.name.toLowerCase();
      for (const d of eventDistances) {
        const cleanName = d.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (lowerFile.includes(cleanName) || lowerFile.includes(String(d.distanceKm))) {
          detectedDist = d.name;
          setImportTargetDistance(d.name);
          break;
        }
      }

      const parsed = parseRowsToResults(rawData, detectedDist);
      setParsedPreview(parsed);
      setIsImportModalOpen(true);
    } catch (err: any) {
      alert(`Ошибка чтения файла: ${err?.message || 'Не удалось прочитать таблицу'}`);
    }
  };

  // Handle pasted text parse
  const handleParsePastedText = () => {
    if (!pastedText.trim()) return;
    try {
      const workbook = XLSX.read(pastedText, { type: 'string' });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const rawData = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      const parsed = parseRowsToResults(rawData, importTargetDistance);
      setParsedPreview(parsed);
      setIsImportModalOpen(true);
    } catch (err: any) {
      alert(`Ошибка разбора текста: ${err?.message || 'Неверный формат данных'}`);
    }
  };

  // Execute import
  const handleExecuteImport = () => {
    if (parsedPreview.length === 0) return;
    setIsImporting(true);

    try {
      const updatedList = parsedPreview.map(r => ({
        ...r,
        distanceName: importTargetDistance,
        avgPace: calcPace(r.chipTime, getKmForDistanceName(importTargetDistance))
      }));

      marathonStorage.importResults(updatedList, importMode, importTargetDistance);
      reloadResults();

      setImportSuccessMsg(`Успешно импортировано ${updatedList.length} результатов для дистанции «${importTargetDistance}»!`);
      setTimeout(() => setImportSuccessMsg(null), 5000);

      setIsImportModalOpen(false);
      setImportFile(null);
      setParsedPreview([]);
      setPastedText('');
      setIsPasteMode(false);
    } catch (e: any) {
      alert(`Ошибка импорта: ${e?.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  // Handle background image upload
  const handleDiplomaBgUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        marathonStorage.setDiplomaBgUrl(dataUrl, activeEvent.id);
        setDiplomaBgUrl(dataUrl);
        setBgStatusMessage('Фон диплома успешно обновлен!');
        setTimeout(() => setBgStatusMessage(null), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSetBgUrl = () => {
    if (!customBgInputUrl.trim()) return;
    marathonStorage.setDiplomaBgUrl(customBgInputUrl.trim(), activeEvent.id);
    setDiplomaBgUrl(customBgInputUrl.trim());
    setCustomBgInputUrl('');
    setBgStatusMessage('Фон диплома успешно установлен по ссылке!');
    setTimeout(() => setBgStatusMessage(null), 4000);
  };

  const handleResetDiplomaBg = () => {
    if (confirm('Сбросить фоновое изображение диплома к стандартному шаблону?')) {
      marathonStorage.setDiplomaBgUrl(null, activeEvent.id);
      setDiplomaBgUrl(null);
      setBgStatusMessage('Фон диплома сброшен к стандартному.');
      setTimeout(() => setBgStatusMessage(null), 4000);
    }
  };

  // Open diploma preview modal
  const handleOpenDiplomaPreview = async (item: RaceResult) => {
    setPreviewResult(item);
    setIsGeneratingDiploma(true);
    try {
      const dataUrl = await generateDiplomaDataUrl(item, {
        eventTitle: activeEvent.title,
        eventDate: activeEvent.displayDate || activeEvent.date,
        bgUrl: diplomaBgUrl
      });
      setPreviewDataUrl(dataUrl);
    } catch (e) {
      console.error('Error generating diploma preview', e);
    } finally {
      setIsGeneratingDiploma(false);
    }
  };

  // Filtered results
  const filteredResults = useMemo(() => {
    return results.filter(r => {
      if (selectedDistanceName !== 'all' && r.distanceName !== selectedDistanceName) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.bibNumber.toLowerCase().includes(q) ||
        r.fullName.toLowerCase().includes(q) ||
        r.distanceName.toLowerCase().includes(q) ||
        (r.team && r.team.toLowerCase().includes(q)) ||
        (r.city && r.city.toLowerCase().includes(q))
      );
    });
  }, [results, selectedDistanceName, searchQuery]);

  // Statistics
  const totalCount = results.length;
  const menCount = results.filter(r => r.gender === 'M' || r.gender === 'male').length;
  const womenCount = results.filter(r => r.gender === 'F' || r.gender === 'female').length;

  // Clear results
  const handleClearDistance = (distName: string) => {
    if (confirm(`Вы уверены, что хотите удалить все результаты для дистанции «${distName}»?`)) {
      marathonStorage.clearResults(distName, activeEvent.id);
      reloadResults();
    }
  };

  const handleClearAll = () => {
    if (confirm(`Удалить ВСЕ (${results.length}) результаты забега? Это действие необратимо!`)) {
      marathonStorage.clearResults(undefined, activeEvent.id);
      reloadResults();
    }
  };

  const handleDeleteSingle = (id: string, name: string) => {
    if (confirm(`Удалить результат участника «${name}»?`)) {
      marathonStorage.deleteResult(id);
      reloadResults();
    }
  };

  // Export to Excel
  const handleExportResultsExcel = () => {
    const rows = filteredResults.map((r, i) => ({
      'Место (абс)': r.overallPlace,
      'Стартовый номер (Bib)': r.bibNumber,
      'ФИО участника': r.fullName,
      'Дистанция': r.distanceName,
      'Чистое время (Chip)': r.chipTime,
      'Время Gun': r.gunTime,
      'Средний темп': r.avgPace,
      'Пол': r.gender === 'F' ? 'Женский' : 'Мужской',
      'Место в гендере': r.genderPlace,
      'Возрастная категория': r.ageGroup,
      'Место в категории': r.categoryPlace,
      'Беговой клуб / Команда': r.team || '',
      'Город': r.city || '',
      'Страна': r.country || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Результаты');
    XLSX.writeFile(workbook, `Результаты_${activeEvent.title.replace(/\s+/g, '_')}_${selectedDistanceName}.xlsx`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-400 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              Хронометраж MyLaps BibTag & ChronoTrack
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-bebas text-white tracking-wide">
              УПРАВЛЕНИЕ РЕЗУЛЬТАТАМИ И ДИПЛОМАМИ
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Загружайте официальные протоколы финишеров из тайминговой системы MyLaps BibTag Timing & Scoring, управляйте фоном официального диплома и предоставляйте участникам мгновенное скачивание персональных сертификатов финишера.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-3 rounded-2xl bg-lime-400 hover:bg-lime-300 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-lime-400/20 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Загрузить протокол MyLaps
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx,.csv,.tsv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileChange(f);
                e.target.value = '';
              }}
            />

            <button
              onClick={() => setIsPasteMode(true)}
              className="px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border border-zinc-700 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Вставить текст / CSV
            </button>

            <button
              onClick={handleExportResultsExcel}
              disabled={results.length === 0}
              className="px-4 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 border border-zinc-700 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Экспорт в Excel
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-zinc-800/80">
          <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/60">
            <span className="text-[11px] font-bold text-zinc-500 uppercase block tracking-wider">Всего финишеров</span>
            <span className="text-2xl font-black text-white font-mono">{totalCount}</span>
          </div>
          <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/60">
            <span className="text-[11px] font-bold text-zinc-500 uppercase block tracking-wider">Мужчин (M)</span>
            <span className="text-2xl font-black text-sky-400 font-mono">{menCount}</span>
          </div>
          <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/60">
            <span className="text-[11px] font-bold text-zinc-500 uppercase block tracking-wider">Женщин (F)</span>
            <span className="text-2xl font-black text-rose-400 font-mono">{womenCount}</span>
          </div>
          <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/60">
            <span className="text-[11px] font-bold text-zinc-500 uppercase block tracking-wider">Дистанций в протоколе</span>
            <span className="text-2xl font-black text-amber-400 font-mono">
              {new Set(results.map(r => r.distanceName)).size}
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {importSuccessMsg && (
        <div className="p-4 rounded-2xl bg-lime-500/10 border border-lime-500/30 text-lime-400 text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{importSuccessMsg}</span>
        </div>
      )}

      {/* SECTION 2: DIPLOMA BACKGROUND SETTINGS */}
      <div className="bg-[#0f1017] border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
              <Award className="w-4 h-4" />
              Официальный диплом финишера
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-athletic text-white mt-1">
              ФОНОВОЕ ИЗОБРАЖЕНИЕ ДИПЛОМА
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Загрузите макет фирменного диплома забега. Все результаты (ФИО, Bib, время, сплиты, темп) наносятся поверх него автоматически.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {diplomaBgUrl && (
              <button
                onClick={handleResetDiplomaBg}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Сбросить к стандарту
              </button>
            )}
            <button
              onClick={() => {
                const sampleResult: RaceResult = results[0] || {
                  id: 'sample',
                  bibNumber: '821',
                  fullName: 'Ернұр Бексұлтан',
                  gender: 'M',
                  ageGroup: '18-29',
                  distanceName: '10 км',
                  chipTime: '00:34:03',
                  gunTime: '00:34:03',
                  avgPace: '3:24 мин/км',
                  overallPlace: 1,
                  genderPlace: 1,
                  categoryPlace: 1,
                  team: 'Qazaq Marathon Elite'
                };
                handleOpenDiplomaPreview(sampleResult);
              }}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-amber-400/20"
            >
              <Eye className="w-3.5 h-3.5" />
              Тестовый предпросмотр
            </button>
          </div>
        </div>

        {bgStatusMessage && (
          <div className="p-3 rounded-xl bg-lime-400/10 border border-lime-400/30 text-lime-400 text-xs font-bold">
            {bgStatusMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Background Card Preview */}
          <div className="relative aspect-[16/9] rounded-2xl border-2 border-dashed border-zinc-700 overflow-hidden bg-zinc-950 flex flex-col items-center justify-center group shadow-inner">
            {diplomaBgUrl ? (
              <>
                <img
                  src={diplomaBgUrl}
                  alt="Фон диплома"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-black/80 text-white text-xs font-bold">
                    Пользовательский фон активен
                  </span>
                </div>
              </>
            ) : (
              <div className="p-6 text-center space-y-2">
                <ImageIcon className="w-10 h-10 text-zinc-600 mx-auto" />
                <span className="text-xs font-bold text-zinc-400 block">Стандартный стильный шаблон</span>
                <span className="text-[11px] text-zinc-600 block">Темный атлетический градиент со спортивной золотой каймой</span>
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Загрузить файл изображения (JPG, PNG, WebP)
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => diplomaBgInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer border border-zinc-700"
                >
                  <Upload className="w-4 h-4 text-lime-400" />
                  Выбрать файл с компьютера
                </button>
                <input
                  ref={diplomaBgInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleDiplomaBgUpload(f);
                    e.target.value = '';
                  }}
                />
                <span className="text-xs text-zinc-500">
                  Рекомендуемый формат: 1920×1080 (16:9), до 15 МБ
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-800/60">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Или укажите прямую ссылку на изображение (URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://example.com/diploma_background.jpg"
                  value={customBgInputUrl}
                  onChange={(e) => setCustomBgInputUrl(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400"
                />
                <button
                  onClick={handleSetBgUrl}
                  disabled={!customBgInputUrl.trim()}
                  className="px-4 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 disabled:opacity-40 text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Применить
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/60 flex flex-wrap items-center gap-3">
              <span className="text-xs text-zinc-400 block w-full">Фирменный фон 1920×1080 с официальным логотипом:</span>
              <a
                href="/diploma_bg_aqtobe_marathon_1920x1080.jpg"
                download="diploma_bg_aqtobe_marathon_1920x1080.jpg"
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 border border-zinc-700 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                Скачать макет JPG (1920×1080)
              </a>
              <a
                href="/diploma_bg_aqtobe_marathon_1920x1080.png"
                download="diploma_bg_aqtobe_marathon_1920x1080.png"
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 border border-zinc-700 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-lime-400" />
                Скачать макет PNG (1920×1080)
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: RESULTS DATABASE & PROTOCOLS TABLE */}
      <div className="bg-[#0f1017] border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
        
        {/* Table Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Distance Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-950/80 rounded-2xl border border-zinc-800">
            <button
              onClick={() => setSelectedDistanceName('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDistanceName === 'all'
                  ? 'bg-lime-400 text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Все дистанции ({results.length})
            </button>

            {eventDistances.map(d => {
              const countForDist = results.filter(r => r.distanceName === d.name).length;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDistanceName(d.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedDistanceName === d.name
                      ? 'bg-lime-400 text-black shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {d.name} ({countForDist})
                </button>
              );
            })}
          </div>

          {/* Search Input & Actions */}
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск по Bib, ФИО, клубу..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lime-400 transition-colors"
              />
            </div>

            {selectedDistanceName !== 'all' && (
              <button
                onClick={() => handleClearDistance(selectedDistanceName)}
                className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900 text-red-400 text-xs font-bold border border-red-800/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                title={`Очистить протокол дистанции ${selectedDistanceName}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Очистить дистанцию
              </button>
            )}

            {results.length > 0 && (
              <button
                onClick={handleClearAll}
                className="p-2 rounded-xl bg-zinc-800/80 hover:bg-red-900/40 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                title="Очистить все результаты"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Results Table */}
        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/40">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] font-bold border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Место (абс)</th>
                <th className="py-3 px-4">Bib</th>
                <th className="py-3 px-4">ФИО Атлета</th>
                <th className="py-3 px-4">Дистанция</th>
                <th className="py-3 px-4">Чистое время (Chip)</th>
                <th className="py-3 px-4">Темп</th>
                <th className="py-3 px-4">Категория</th>
                <th className="py-3 px-4">Пол / Место</th>
                <th className="py-3 px-4">Клуб / Город</th>
                <th className="py-3 px-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/20">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-zinc-500 space-y-2">
                    <Trophy className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
                    <div>Результатов не найдено</div>
                    <div className="text-[11px] text-zinc-600">
                      Загрузите файл Excel (.xls, .xlsx) или CSV протокол MyLaps BibTag с помощью кнопки выше
                    </div>
                  </td>
                </tr>
              ) : (
                filteredResults.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-black text-white">
                      {item.overallPlace === 1 ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                          🥇 1
                        </span>
                      ) : item.overallPlace === 2 ? (
                        <span className="inline-flex items-center gap-1 text-zinc-300 font-bold">
                          🥈 2
                        </span>
                      ) : item.overallPlace === 3 ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                          🥉 3
                        </span>
                      ) : (
                        `#${item.overallPlace}`
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-lime-400">
                      {item.bibNumber}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {item.fullName}
                    </td>
                    <td className="py-3 px-4 text-zinc-300 font-medium">
                      {item.distanceName}
                    </td>
                    <td className="py-3 px-4 font-mono font-black text-white text-base">
                      {item.chipTime}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-400">
                      {item.avgPace}
                    </td>
                    <td className="py-3 px-4 text-zinc-400">
                      {item.ageGroup} <span className="text-zinc-600">(#{item.categoryPlace})</span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400">
                      <span className={item.gender === 'F' ? 'text-rose-400 font-bold' : 'text-sky-400 font-bold'}>
                        {item.gender === 'F' ? 'Ж' : 'М'}
                      </span>{' '}
                      (#{item.genderPlace})
                    </td>
                    <td className="py-3 px-4 text-zinc-400 text-xs">
                      {item.team || item.city || '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDiplomaPreview(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-lime-400/10 hover:bg-lime-400 text-lime-400 hover:text-black font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                          title="Посмотреть диплом атлета"
                        >
                          <Award className="w-3.5 h-3.5" />
                          Диплом
                        </button>
                        <button
                          onClick={() => handleDeleteSingle(item.id, item.fullName)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Удалить запись"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL: IMPORT PROTOCOL CONFIRMATION */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="space-y-1">
                <span className="text-xs font-bold text-lime-400 uppercase tracking-widest flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4" />
                  Импорт протокола результатов
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-bebas text-white tracking-wide">
                  ПРЕДПРОСМОТР ДАННЫХ ИМПОРТА
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Distance Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase block mb-1.5">
                  Привязать к дистанции забега:
                </label>
                <select
                  value={importTargetDistance}
                  onChange={(e) => {
                    const newDist = e.target.value;
                    setImportTargetDistance(newDist);
                    // Re-calculate pace for preview
                    const distKm = getKmForDistanceName(newDist);
                    setParsedPreview(prev => prev.map(r => ({
                      ...r,
                      distanceName: newDist,
                      avgPace: calcPace(r.chipTime, distKm)
                    })));
                  }}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-lime-400 font-bold"
                >
                  {eventDistances.map(d => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.distanceKm} км)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase block mb-1.5">
                  Режим импорта:
                </label>
                <select
                  value={importMode}
                  onChange={(e: any) => setImportMode(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-lime-400 font-bold"
                >
                  <option value="replace_distance">Заменить протокол дистанции «{importTargetDistance}»</option>
                  <option value="append">Добавить / Обновить по номеру Bib</option>
                  <option value="replace_all">Полная замена ВСЕХ результатов старта</option>
                </select>
              </div>
            </div>

            {/* Preview Summary */}
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
              <span>Распознано строк: <b className="text-lime-400 text-sm font-mono">{parsedPreview.length}</b></span>
              <span>Формат: <b className="text-white">MyLaps BibTag Timing & Scoring</b></span>
            </div>

            {/* Preview Table (First 5 records) */}
            <div className="overflow-x-auto rounded-2xl border border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-zinc-500 uppercase text-[10px] font-bold border-b border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-3">Место</th>
                    <th className="py-2.5 px-3">Bib</th>
                    <th className="py-2.5 px-3">ФИО</th>
                    <th className="py-2.5 px-3">Чистое время</th>
                    <th className="py-2.5 px-3">Темп</th>
                    <th className="py-2.5 px-3">Кат.</th>
                    <th className="py-2.5 px-3">Пол</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 bg-zinc-900/30">
                  {parsedPreview.slice(0, 5).map((p, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-mono font-bold text-white">#{p.overallPlace}</td>
                      <td className="py-2 px-3 font-mono font-bold text-lime-400">{p.bibNumber}</td>
                      <td className="py-2 px-3 font-bold text-white">{p.fullName}</td>
                      <td className="py-2 px-3 font-mono text-zinc-200">{p.chipTime}</td>
                      <td className="py-2 px-3 font-mono text-zinc-400">{p.avgPace}</td>
                      <td className="py-2 px-3 text-zinc-400">{p.ageGroup} (#{p.categoryPlace})</td>
                      <td className="py-2 px-3 text-zinc-400">{p.gender} (#{p.genderPlace})</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {parsedPreview.length > 5 && (
              <div className="text-[11px] text-zinc-500 text-center italic">
                ...и еще {parsedPreview.length - 5} финишеров
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={handleExecuteImport}
                disabled={isImporting || parsedPreview.length === 0}
                className="flex-1 py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-300 disabled:opacity-40 text-black font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg shadow-lime-400/20 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                {isImporting ? 'Импортирование...' : `Подтвердить и загрузить (${parsedPreview.length} участников)`}
              </button>

              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-6 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Отмена
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: PASTE TEXT / CSV */}
      {isPasteMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <span className="text-xs font-bold text-lime-400 uppercase tracking-widest">
                  Быстрый ввод
                </span>
                <h3 className="text-xl font-black font-bebas text-white tracking-wide">
                  ВСТАВИТЬ CSV ИЛИ ТАБЛИЦУ РЕЗУЛЬТАТОВ
                </h3>
              </div>
              <button
                onClick={() => setIsPasteMode(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Вставьте строки из Excel или CSV с колонками <code>overallposition, bib, name, category, gender, chiptime, guntime</code>:
            </p>

            <textarea
              rows={8}
              placeholder="overallposition,bib,name,category,gender,chiptime,guntime&#10;1,821,BEXULTAN YERNUR,18-29,M,0:34:03,0:34:03&#10;2,631,Ширшов Алексей,30-39,M,0:34:39,0:34:42"
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl p-4 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-lime-400"
            />

            <div className="flex gap-3">
              <button
                onClick={handleParsePastedText}
                disabled={!pastedText.trim()}
                className="flex-1 py-3 rounded-xl bg-lime-400 hover:bg-lime-300 disabled:opacity-40 text-black font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Разобрать и продолжить
              </button>
              <button
                onClick={() => setIsPasteMode(false)}
                className="px-5 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DIPLOMA LIVE PREVIEW & DOWNLOAD */}
      {previewResult && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-zinc-950 border border-amber-400/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[95vh] overflow-y-auto animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  Официальный сертификат финишера
                </span>
                <h3 className="text-xl font-black font-bebas text-white tracking-wide">
                  ДИПЛОМ: {previewResult.fullName} ({previewResult.distanceName})
                </h3>
              </div>
              <button
                onClick={() => {
                  setPreviewResult(null);
                  setPreviewDataUrl(null);
                }}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Diploma Canvas Render Preview */}
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center shadow-2xl">
              {isGeneratingDiploma ? (
                <div className="text-center space-y-2 text-zinc-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-lime-400" />
                  <span className="text-xs">Генерация сертификата высокого разрешения...</span>
                </div>
              ) : previewDataUrl ? (
                <img
                  src={previewDataUrl}
                  alt="Диплом финишера"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-xs text-zinc-500">Не удалось сгенерировать диплом</div>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Чистое время</span>
                <span className="text-base font-black text-lime-400 font-mono">{previewResult.chipTime}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Темп</span>
                <span className="text-base font-black text-white font-mono">{previewResult.avgPace}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Место в абсолюте</span>
                <span className="text-base font-black text-amber-400 font-mono">#{previewResult.overallPlace}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Категория</span>
                <span className="text-base font-black text-rose-400 font-mono">{previewResult.ageGroup} (№{previewResult.categoryPlace})</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => {
                  downloadDiploma(previewResult, {
                    eventTitle: activeEvent.title,
                    eventDate: activeEvent.displayDate || activeEvent.date,
                    bgUrl: diplomaBgUrl
                  });
                }}
                className="flex-1 py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-black font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg shadow-lime-400/20 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Скачать официальный диплом (PNG 1920×1080)
              </button>

              <button
                onClick={() => window.print()}
                className="px-5 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer border border-zinc-700"
              >
                Печать / PDF
              </button>

              <button
                onClick={() => {
                  setPreviewResult(null);
                  setPreviewDataUrl(null);
                }}
                className="px-6 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
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
