import React, { useState, useEffect, useMemo } from 'react';
import { 
  Ticket, Plus, Trash2, Edit3, CheckCircle2, AlertTriangle, 
  Copy, Check, Gift, Tag, Percent, Calendar, Users, RefreshCw, 
  Search, Filter, Sparkles, X, Power, ArrowRight
} from 'lucide-react';
import { marathonStorage } from '../../services/marathonStorage';
import type { PromoCode, PromoCodeDiscountType, MarathonEvent } from '../../types/marathon';

interface PromoCodesManagerProps {
  events: MarathonEvent[];
}

export const PromoCodesManager: React.FC<PromoCodesManagerProps> = ({ events }) => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'free' | 'percentage' | 'fixed' | 'active'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    code: string;
    discountType: PromoCodeDiscountType;
    discountValue: number;
    eventId: string;
    distanceId: string;
    maxUses: string;
    expiresAt: string;
    active: boolean;
    description: string;
  }>({
    code: '',
    discountType: 'free',
    discountValue: 100,
    eventId: '',
    distanceId: '',
    maxUses: '',
    expiresAt: '',
    active: true,
    description: ''
  });

  useEffect(() => {
    loadData();
    const handleStorageUpdate = () => loadData();
    window.addEventListener('marathon-storage-update', handleStorageUpdate);
    return () => window.removeEventListener('marathon-storage-update', handleStorageUpdate);
  }, []);

  const loadData = () => {
    setPromoCodes(marathonStorage.getPromoCodes());
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  const handleGenerateRandomCode = () => {
    const prefixes = ['VIP', 'RUN', 'START', 'AQTOBE', 'FAST', 'GUEST'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(100 + Math.random() * 900);
    setFormData(prev => ({
      ...prev,
      code: `${prefix}${num}`
    }));
  };

  const handleOpenCreateModal = () => {
    setEditingPromoId(null);
    setFormData({
      code: '',
      discountType: 'free',
      discountValue: 100,
      eventId: '',
      distanceId: '',
      maxUses: '',
      expiresAt: '',
      active: true,
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (promo: PromoCode) => {
    setEditingPromoId(promo.id);
    setFormData({
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      eventId: promo.eventId || '',
      distanceId: promo.distanceId || '',
      maxUses: promo.maxUses ? promo.maxUses.toString() : '',
      expiresAt: promo.expiresAt ? promo.expiresAt.split('T')[0] : '',
      active: promo.active,
      description: promo.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDeletePromo = (id: string, code: string) => {
    if (confirm(`Удалить промокод «${code}»?`)) {
      marathonStorage.deletePromoCode(id);
      loadData();
    }
  };

  const handleToggleActive = (id: string) => {
    marathonStorage.togglePromoCodeActive(id);
    loadData();
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = formData.code.trim().toUpperCase();
    if (!cleanCode) {
      alert('Укажите код промокода');
      return;
    }

    const maxUsesNum = formData.maxUses.trim() ? parseInt(formData.maxUses.trim()) : undefined;
    const expiresAtIso = formData.expiresAt.trim() ? new Date(formData.expiresAt).toISOString() : undefined;

    const promoToSave: PromoCode = {
      id: editingPromoId || 'promo-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      code: cleanCode,
      discountType: formData.discountType,
      discountValue: formData.discountType === 'free' ? 100 : Number(formData.discountValue) || 0,
      eventId: formData.eventId || undefined,
      distanceId: formData.distanceId || undefined,
      maxUses: maxUsesNum && maxUsesNum > 0 ? maxUsesNum : undefined,
      usedCount: editingPromoId ? (promoCodes.find(p => p.id === editingPromoId)?.usedCount || 0) : 0,
      expiresAt: expiresAtIso,
      active: formData.active,
      description: formData.description.trim() || undefined,
      createdAt: editingPromoId ? (promoCodes.find(p => p.id === editingPromoId)?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };

    marathonStorage.savePromoCode(promoToSave);
    setIsModalOpen(false);
    loadData();
  };

  // Metrics
  const totalCodes = promoCodes.length;
  const freeCodes = promoCodes.filter(p => p.discountType === 'free').length;
  const percentageCodes = promoCodes.filter(p => p.discountType === 'percentage').length;
  const totalTimesUsed = promoCodes.reduce((sum, p) => sum + (p.usedCount || 0), 0);

  // Filtered List
  const filteredList = useMemo(() => {
    return promoCodes.filter(p => {
      const matchesSearch = 
        !searchQuery ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesType = true;
      if (typeFilter === 'free') {
        matchesType = p.discountType === 'free';
      } else if (typeFilter === 'percentage') {
        matchesType = p.discountType === 'percentage';
      } else if (typeFilter === 'fixed') {
        matchesType = p.discountType === 'fixed';
      } else if (typeFilter === 'active') {
        matchesType = p.active;
      }

      return matchesSearch && matchesType;
    });
  }, [promoCodes, searchQuery, typeFilter]);

  // Selected event distances for dropdown in modal
  const selectedEventObj = events.find(e => e.id === formData.eventId);

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                <Ticket className="w-3.5 h-3.5" />
                Скидки и промокоды
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Gift className="w-3.5 h-3.5" />
                {freeCodes} бесплатных промокодов
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Управление промокодами забегов
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Создавайте бесплатные слоты (100% скидка) для почетных гостей, спонсоров и льготных категорий, а также персональные скидки в процентах для беговых клубов.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm('Сбросить промокоды к заводским демонстрационным?')) {
                  marathonStorage.resetPromoCodes();
                  loadData();
                }
              }}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              title="Восстановить заводские промокоды"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Сброс
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/30 transition-all cursor-pointer uppercase tracking-wider"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Создать промокод
            </button>
          </div>
        </div>

        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Всего промокодов</div>
            <div className="text-2xl font-black text-white font-mono mt-0.5">{totalCodes}</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Gift className="w-3.5 h-3.5" /> Бесплатные (100%)
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">{freeCodes}</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Percent className="w-3.5 h-3.5" /> Скидочные (%)
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">{percentageCodes}</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Активаций атлетами
            </div>
            <div className="text-2xl font-black text-blue-400 font-mono mt-0.5">{totalTimesUsed}</div>
          </div>
        </div>
      </div>

      {/* Action Bar (Search & Filter) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по коду или описанию..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-white text-xs focus:border-red-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Фильтр:
          </span>
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              typeFilter === 'all' ? 'bg-red-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Все ({totalCodes})
          </button>
          <button
            onClick={() => setTypeFilter('free')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              typeFilter === 'free' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🎁 100% Бесплатные
          </button>
          <button
            onClick={() => setTypeFilter('percentage')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              typeFilter === 'percentage' ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            % Со скидкой
          </button>
          <button
            onClick={() => setTypeFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              typeFilter === 'active' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Активные
          </button>
        </div>
      </div>

      {/* Promo Codes Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 w-12">#</th>
                <th className="py-3.5 px-4">Промокод</th>
                <th className="py-3.5 px-4">Тип скидки</th>
                <th className="py-3.5 px-4">Применимость</th>
                <th className="py-3.5 px-4">Использовано</th>
                <th className="py-3.5 px-4">Срок действия</th>
                <th className="py-3.5 px-4">Описание / Кому выдан</th>
                <th className="py-3.5 px-4 text-center">Статус</th>
                <th className="py-3.5 px-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Ticket className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    Промокодов не найдено. Нажмите «Создать промокод», чтобы добавить первый.
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => {
                  const isExpired = item.expiresAt && new Date(item.expiresAt).getTime() < Date.now();
                  const isLimitReached = item.maxUses && item.maxUses > 0 && item.usedCount >= item.maxUses;
                  const eventObj = events.find(e => e.id === item.eventId);
                  const distanceObj = eventObj?.distances.find(d => d.id === item.distanceId);

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-white text-sm tracking-wider bg-slate-950 px-2 py-1 rounded border border-slate-800">
                            {item.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(item.code)}
                            className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Скопировать промокод"
                          >
                            {copiedCode === item.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {item.discountType === 'free' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            <Gift className="w-3 h-3" />
                            100% БЕСПЛАТНО
                          </span>
                        ) : item.discountType === 'percentage' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            <Percent className="w-3 h-3" />
                            Скидка -{item.discountValue}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            <Tag className="w-3 h-3" />
                            -{item.discountValue.toLocaleString('ru-RU')} ₸
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {eventObj ? (
                          <div>
                            <div className="font-semibold text-white">{eventObj.title}</div>
                            {distanceObj && (
                              <div className="text-[10px] text-slate-400">{distanceObj.name}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">Все забеги</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-200">
                          <strong>{item.usedCount}</strong>
                          <span className="text-slate-500"> / {item.maxUses && item.maxUses > 0 ? item.maxUses : '∞'}</span>
                        </div>
                        {item.maxUses && item.maxUses > 0 && (
                          <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                            <div 
                              className={`h-full ${isLimitReached ? 'bg-red-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, Math.round((item.usedCount / item.maxUses) * 100))}%` }}
                            />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {item.expiresAt ? (
                          <span className={isExpired ? 'text-red-400 font-semibold' : 'text-slate-300'}>
                            {new Date(item.expiresAt).toLocaleDateString('ru-RU')}
                            {isExpired && ' (Истек)'}
                          </span>
                        ) : (
                          <span className="text-slate-400">Бессрочно</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={item.description || ''}>
                        {item.description || '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(item.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                            item.active && !isExpired && !isLimitReached
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          {item.active && !isExpired && !isLimitReached ? 'Активен' : 'Отключен'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Редактировать"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePromo(item.id, item.code)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Удалить"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <span className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Ticket className="w-4 h-4" />
                  {editingPromoId ? 'Редактирование промокода' : 'Новый промокод'}
                </span>
                <h3 className="text-xl font-black font-bebas text-white tracking-wide mt-0.5">
                  {editingPromoId ? `ПАРАМЕТРЫ: ${formData.code}` : 'СОЗДАНИЕ ПРОМОКОДА'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="space-y-4">
              {/* Code Input with Generator */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Код промокода *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Например: VIPFREE, RUN30"
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-mono font-bold tracking-wider text-sm uppercase focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateRandomCode}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-700 transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Сгенерировать случайный код"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    🎲 Авто
                  </button>
                </div>
              </div>

              {/* Discount Type Selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                  Тип скидки *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, discountType: 'free', discountValue: 100 })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      formData.discountType === 'free'
                        ? 'border-emerald-500 bg-emerald-500/15 text-white'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5 text-emerald-400">
                      <Gift className="w-4 h-4" />
                      100% БЕСПЛАТНО
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1">Бесплатный слот атлету (0 ₸)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, discountType: 'percentage', discountValue: 30 })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      formData.discountType === 'percentage'
                        ? 'border-amber-500 bg-amber-500/15 text-white'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5 text-amber-400">
                      <Percent className="w-4 h-4" />
                      Процентная (%)
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1">Скидка в процентах от цены</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, discountType: 'fixed', discountValue: 2000 })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      formData.discountType === 'fixed'
                        ? 'border-purple-500 bg-purple-500/15 text-white'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1.5 text-purple-400">
                      <Tag className="w-4 h-4" />
                      Фиксированная (₸)
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1">Минус фиксированная сумма</div>
                  </button>
                </div>
              </div>

              {/* Discount Value (if not free) */}
              {formData.discountType !== 'free' && (
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    {formData.discountType === 'percentage' ? 'Процент скидки (% от 1 до 99)' : 'Сумма скидки в тенге (₸)'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={formData.discountType === 'percentage' ? 99 : 100000}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-red-500"
                    placeholder={formData.discountType === 'percentage' ? '30' : '2000'}
                  />
                </div>
              )}

              {/* Usage Limit & Expiry Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Лимит использований (кол-во раз)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    placeholder="Без ограничений"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                  <span className="text-[10px] text-zinc-500 mt-0.5 block">Оставьте пустым для безлимита</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Срок действия (до даты)
                  </label>
                  <input
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                  <span className="text-[10px] text-zinc-500 mt-0.5 block">Оставьте пустым для бессрочного</span>
                </div>
              </div>

              {/* Event & Distance Restriction */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Привязать к забегу
                  </label>
                  <select
                    value={formData.eventId}
                    onChange={(e) => setFormData({ ...formData, eventId: e.target.value, distanceId: '' })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500"
                  >
                    <option value="">Для всех забегов сайта</option>
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.title} ({ev.city})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Привязать к дистанции
                  </label>
                  <select
                    value={formData.distanceId}
                    disabled={!formData.eventId}
                    onChange={(e) => setFormData({ ...formData, distanceId: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-red-500 disabled:opacity-40"
                  >
                    <option value="">Для любой дистанции</option>
                    {selectedEventObj?.distances.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.price} ₸)</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description / Admin Note */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Описание / Для кого предназначен промокод
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Например: Для амбассадоров, VIP-гостей или клуба Aqtobe Runners"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="promoActive"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded accent-red-600 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="promoActive" className="text-xs font-semibold text-zinc-300 cursor-pointer">
                  Промокод активен и доступен для использования атлетами
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/30 transition-all cursor-pointer uppercase tracking-wider"
                >
                  {editingPromoId ? 'Сохранить изменения' : 'Создать промокод'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
