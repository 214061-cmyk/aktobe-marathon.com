import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Mail, Send, Users, Settings, Image as ImageIcon, Eye, Smartphone, Monitor,
  Plus, Trash2, CheckCircle2, AlertCircle, RefreshCw, Download, Upload,
  Search, ShieldAlert, Sparkles, ExternalLink, Copy, Check, Info, FileSpreadsheet
} from 'lucide-react';
import { marathonStorage } from '../../services/marathonStorage';
import type { NewsletterContact, EmailTemplate, EmailServerConfig } from '../../types/marathon';
import { buildEmailHtml } from '../../utils/emailHtmlBuilder';
import * as XLSX from 'xlsx';

export const NewsletterManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'templates' | 'subscribers' | 'server'>('templates');
  
  // Data state
  const [subscribers, setSubscribers] = useState<NewsletterContact[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<string>('');
  const [serverConfig, setServerConfig] = useState<EmailServerConfig>(marathonStorage.getEmailServerConfig());

  // Template editor state
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Subscribers list state
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'old' | 'reg' | 'manual'>('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 50;
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '', city: 'Актобе' });

  // Test send state
  const [testEmailAddress, setTestEmailAddress] = useState('ulan.turemuratov@alex-asu.kz');
  const [testSendStatus, setTestSendStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

  // Server connection test state
  const [serverTestStatus, setServerTestStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

  // Mass send state
  const [massSendAudience, setMassSendAudience] = useState<'all' | 'reg' | 'old'>('all');
  const [isMassSending, setIsMassSending] = useState(false);
  const [massSendProgress, setMassSendProgress] = useState({ current: 0, total: 0, sent: 0, failed: 0, percent: 0 });
  const [massSendLogs, setMassSendLogs] = useState<string[]>([]);
  const cancelSendRef = useRef(false);

  // File upload ref for image
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvImportRef = useRef<HTMLInputElement>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
    const handleStorageUpdate = () => loadData();
    window.addEventListener('marathon-storage-update', handleStorageUpdate);
    return () => window.removeEventListener('marathon-storage-update', handleStorageUpdate);
  }, []);

  const loadData = () => {
    const subs = marathonStorage.getSubscribers();
    const tpls = marathonStorage.getEmailTemplates();
    const cfg = marathonStorage.getEmailServerConfig();
    
    setSubscribers(subs);
    setTemplates(tpls);
    setServerConfig(cfg);

    if (tpls.length > 0) {
      if (!activeTemplateId || !tpls.find(t => t.id === activeTemplateId)) {
        setActiveTemplateId(tpls[0].id);
        setCurrentTemplate({ ...tpls[0] });
      } else {
        const found = tpls.find(t => t.id === activeTemplateId);
        if (found) setCurrentTemplate({ ...found });
      }
    }
  };

  const handleSelectTemplate = (id: string) => {
    setActiveTemplateId(id);
    const found = templates.find(t => t.id === id);
    if (found) {
      setCurrentTemplate({ ...found });
    }
  };

  const handleSaveCurrentTemplate = () => {
    if (!currentTemplate) return;
    marathonStorage.saveEmailTemplate(currentTemplate);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentTemplate) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Размер изображения превышает 2 МБ. Пожалуйста, сожмите картинку для быстрого открытия в почте.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCurrentTemplate({
        ...currentTemplate,
        bannerImageUrl: result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCreateNewTemplate = () => {
    const newTpl: EmailTemplate = {
      id: 'template_' + Date.now(),
      name: 'Новый анонс забега ' + new Date().toLocaleDateString('ru-RU'),
      subject: '🏃 Важная новость от Aktobe Marathon',
      badgeText: 'НОВОСТЬ',
      title: 'Анонс нового спортивного события',
      greetingText: 'Здравствуйте, {NAME}!',
      greeting: 'Здравствуйте, {NAME}!',
      mainBodyText: 'Рады сообщить вам о новых событиях и стартах бегового сезона в Актобе.',
      body: 'Рады сообщить вам о новых событиях и стартах бегового сезона в Актобе.',
      bannerImageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80',
      highlightBoxTitle: '📌 Что важно знать:',
      highlightBoxText: 'Следите за обновлениями на официальном сайте и в наших соцсетях.',
      ctaButtonText: 'Подробнее на сайте →',
      ctaButtonUrl: 'https://aktobemarathon.kz',
      footerNote: 'Организационный комитет Aktobe Marathon\ninfo@aktobemarathon.kz',
      footerText: 'Организационный комитет Aktobe Marathon\ninfo@aktobemarathon.kz',
      updatedAt: new Date().toISOString()
    };
    marathonStorage.saveEmailTemplate(newTpl);
    setActiveTemplateId(newTpl.id);
    setCurrentTemplate(newTpl);
  };

  const handleDeleteTemplate = (id: string) => {
    if (templates.length <= 1) {
      alert('Нельзя удалить последний оставшийся шаблон.');
      return;
    }
    if (confirm('Удалить этот шаблон рассылки?')) {
      const remaining = templates.filter(t => t.id !== id);
      setTemplates(remaining);
      marathonStorage.resetEmailTemplates();
      remaining.forEach(t => marathonStorage.saveEmailTemplate(t));
      setActiveTemplateId(remaining[0].id);
      setCurrentTemplate({ ...remaining[0] });
    }
  };

  const handleSaveServerConfig = () => {
    marathonStorage.saveEmailServerConfig(serverConfig);
    setServerTestStatus({
      type: 'success',
      message: '✅ Настройки почтового сервера успешно сохранены в системе!'
    });
    setTimeout(() => {
      setServerTestStatus(prev => prev.message.includes('сохранены') ? { type: 'idle', message: '' } : prev);
    }, 4000);
  };

  // Test SMTP / API server connection (Verification check)
  const handleTestServerConnection = async () => {
    setServerTestStatus({ type: 'loading', message: 'Проверка подключения к почтовому серверу...' });
    
    try {
      // Also automatically auto-save latest entered values to storage
      marathonStorage.saveEmailServerConfig(serverConfig);

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          serverConfig
        })
      });

      const resData = await response.json();
      if (resData.success) {
        setServerTestStatus({
          type: 'success',
          message: resData.message || '✅ Подключение успешно! Почтовый сервер ответил и авторизация подтверждена.'
        });
      } else {
        setServerTestStatus({
          type: 'error',
          message: resData.error || resData.message || '❌ Ошибка проверки подключения к серверу'
        });
      }
    } catch (err: any) {
      setServerTestStatus({
        type: 'error',
        message: '❌ Не удалось связаться с сервером отправки: ' + (err?.message || err)
      });
    }
  };

  // Test email sender
  const handleSendTestEmail = async () => {
    if (!currentTemplate) return;
    if (!testEmailAddress || !testEmailAddress.includes('@')) {
      setTestSendStatus({ type: 'error', message: 'Введите корректный email для теста' });
      return;
    }

    setTestSendStatus({ type: 'loading', message: 'Отправка тестового письма через ' + serverConfig.provider.toUpperCase() + '...' });
    
    try {
      const html = buildEmailHtml(currentTemplate, 'Уважаемый участник');
      const subject = currentTemplate.subject.replace(/\{NAME\}/g, 'Атлет').replace(/\{EVENT_TITLE\}/g, 'Aktobe Marathon 2026');

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serverConfig,
          to: testEmailAddress.trim(),
          recipientName: 'Уважаемый участник',
          subject: subject,
          html
        })
      });

      const resData = await response.json();
      const isOk = resData.success && (resData.sentCount === undefined || resData.sentCount > 0);

      if (isOk) {
        setTestSendStatus({
          type: 'success',
          message: `✅ Письмо успешно отправлено на ${testEmailAddress}! Режим: ${resData.provider || serverConfig.provider}`
        });
      } else {
        const errorDetail = resData.error || resData.message || resData.errors?.[0]?.error || 'Сервер отклонил отправку письма';
        setTestSendStatus({
          type: 'error',
          message: `❌ Не удалось отправить письмо: ${errorDetail}`
        });
      }
    } catch (err: any) {
      setTestSendStatus({
        type: 'error',
        message: '❌ Ошибка сети при обращении к серверу: ' + (err?.message || err)
      });
    }
  };

  // Filtered subscribers list
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter(s => {
      const contactName = s.name || s.fullName || '';
      const matchesSearch = 
        !searchQuery ||
        contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.phone && s.phone.includes(searchQuery)) ||
        (s.city && s.city.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesSource = true;
      if (sourceFilter === 'old') {
        matchesSource = s.source === 'archive_import' || s.source.includes('Архив') || s.source.includes('старый');
      } else if (sourceFilter === 'reg') {
        matchesSource = s.source === 'website_registration' || s.source.includes('Регистрация');
      } else if (sourceFilter === 'manual') {
        matchesSource = s.source === 'manual' || s.source.includes('Ручной') || s.source.includes('Импорт');
      }

      return matchesSearch && matchesSource;
    });
  }, [subscribers, searchQuery, sourceFilter]);

  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage) || 1;
  const paginatedSubscribers = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredSubscribers.slice(start, start + itemsPerPage);
  }, [filteredSubscribers, page]);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 1800);
  };

  const handleAddManualSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.email || !newContact.email.includes('@')) {
      alert('Укажите корректный email');
      return;
    }
    marathonStorage.addSubscriber({
      name: newContact.name || 'Участник забега',
      email: newContact.email.trim().toLowerCase(),
      phone: newContact.phone,
      city: newContact.city,
      source: 'manual',
      active: true,
      status: 'active'
    });
    setNewContact({ name: '', email: '', phone: '', city: 'Актобе' });
    setIsAddModalOpen(false);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet);

        const contactsToImport: Array<{ name: string; email: string; phone?: string; city?: string }> = [];
        for (const row of rows) {
          const email = row['Почта'] || row['Email'] || row['email'] || row['E-mail'] || row['почта'];
          const name = row['Имя'] || row['Name'] || row['ФИО'] || row['имя'] || 'Участник забега';
          const phone = row['Телефон'] || row['Phone'] || row['моб'] || '';
          const city = row['Город'] || row['City'] || 'Актобе';

          if (email && typeof email === 'string' && email.includes('@')) {
            contactsToImport.push({ name: String(name), email: String(email), phone: String(phone), city: String(city) });
          }
        }

        const count = marathonStorage.importSubscribers(contactsToImport);
        alert(`✅ Успешно импортировано ${count} новых уникальных контактов!`);
      } catch (err: any) {
        alert('Ошибка при чтении файла: ' + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Mass mailing loop
  const handleStartMassMailing = async () => {
    if (!currentTemplate) return;
    
    // Determine audience
    let audience = subscribers.filter(s => (s.active ?? (s.status === 'active')));
    if (massSendAudience === 'reg') {
      audience = audience.filter(s => s.source === 'website_registration' || s.source.includes('Регистрация'));
    } else if (massSendAudience === 'old') {
      audience = audience.filter(s => s.source === 'archive_import' || s.source.includes('Архив'));
    }

    if (audience.length === 0) {
      alert('Выбранная аудитория пуста.');
      return;
    }

    const confirmText = `Внимание! Вы собираетесь отправить email рассылку "${currentTemplate.name}" для ${audience.length} адресатов.\n\nРежим сервера: ${serverConfig.provider.toUpperCase()}\n\nНачать отправку?`;
    if (!confirm(confirmText)) return;

    setIsMassSending(true);
    cancelSendRef.current = false;
    setMassSendLogs([`[${new Date().toLocaleTimeString()}] Старт рассылки по ${audience.length} адресам...`]);
    setMassSendProgress({ current: 0, total: audience.length, sent: 0, failed: 0, percent: 0 });

    let sent = 0;
    let failed = 0;

    for (let i = 0; i < audience.length; i++) {
      if (cancelSendRef.current) {
        setMassSendLogs(prev => [`[${new Date().toLocaleTimeString()}] 🛑 Рассылка остановлена администратором.`, ...prev.slice(0, 50)]);
        break;
      }

      const contact = audience[i];
      const personName = contact.name || contact.fullName || 'Участник забега';
      const html = buildEmailHtml(currentTemplate, personName);
      const subject = currentTemplate.subject
        .replace(/\{NAME\}/g, personName)
        .replace(/\{EVENT_TITLE\}/g, 'Aktobe Marathon 2026');

      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serverConfig,
            to: contact.email,
            recipientName: personName,
            subject,
            html
          })
        });

        const resData = await response.json();
        const isOk = resData.success && (resData.sentCount === undefined || resData.sentCount > 0);
        if (isOk) {
          sent++;
          if (i % 10 === 0 || i === audience.length - 1) {
            setMassSendLogs(prev => [`✅ Доставлено: ${contact.email} (${personName})`, ...prev.slice(0, 50)]);
          }
        } else {
          failed++;
          const errMsg = resData.error || resData.message || resData.errors?.[0]?.error || 'Сервер отклонил письмо';
          setMassSendLogs(prev => [`❌ Ошибка [${contact.email}]: ${errMsg}`, ...prev.slice(0, 50)]);
        }
      } catch (err: any) {
        failed++;
        setMassSendLogs(prev => [`❌ Сбой соединения [${contact.email}]: ${err.message}`, ...prev.slice(0, 50)]);
      }

      const current = i + 1;
      const percent = Math.round((current / audience.length) * 100);
      setMassSendProgress({ current, total: audience.length, sent, failed, percent });

      // Small throttling delay to avoid API rate limits (50ms)
      await new Promise(r => setTimeout(r, 60));
    }

    setIsMassSending(false);
    setMassSendLogs(prev => [`[${new Date().toLocaleTimeString()}] 🎉 Рассылка завершена! Успешно: ${sent}, Ошибок: ${failed}`, ...prev.slice(0, 50)]);
  };

  const handleStopMassMailing = () => {
    cancelSendRef.current = true;
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Mail className="w-3.5 h-3.5" />
                Email CRM & Рассылки
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Users className="w-3.5 h-3.5" />
                {subscribers.length.toLocaleString('ru-RU')} атлетов в базе
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Центр Email-рассылок и уведомлений атлетов
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Уведомляйте бегунов об открытии регистрации, выдаче стартовых пакетов на Expo и важных новостях с красивым адаптивным дизайном и поддержкой фото.
            </p>
          </div>

          {/* Quick stats pills */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'templates'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Mail className="w-4 h-4" />
              Шаблоны и Дизайн
            </button>

            <button
              onClick={() => setActiveTab('subscribers')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'subscribers'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              База атлетов ({subscribers.length})
            </button>

            <button
              onClick={() => setActiveTab('server')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'server'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              Почтовый сервер
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: TEMPLATE EDITOR */}
      {activeTab === 'templates' && currentTemplate && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Template Selection & Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Template Selector Bar */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Шаблон:</span>
                {templates.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      tpl.id === activeTemplateId
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {tpl.name}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCreateNewTemplate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md"
                  title="Создать новый шаблон рассылки"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Новый шаблон
                </button>
                {templates.length > 1 && (
                  <button
                    onClick={() => handleDeleteTemplate(currentTemplate.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    title="Удалить этот шаблон"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Template Form Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Редактирование шаблона</h3>
                  <p className="text-xs text-slate-400">Настройте текст, загрузите изображение и ссылки</p>
                </div>

                <div className="flex items-center gap-2">
                  {saveSuccessNotice && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold animate-pulse">
                      <CheckCircle2 className="w-4 h-4" /> Сохранено
                    </span>
                  )}
                  <button
                    onClick={handleSaveCurrentTemplate}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all"
                  >
                    💾 Сохранить изменения
                  </button>
                </div>
              </div>

              {/* Template Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Внутреннее название шаблона
                </label>
                <input
                  type="text"
                  value={currentTemplate.name}
                  onChange={e => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-rose-500 focus:outline-none"
                  placeholder="Например: Анонс открытия регистрации 2026"
                />
              </div>

              {/* Subject */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Тема письма (Subject)
                  </label>
                  <span className="text-[11px] text-slate-400">Теги: <code className="text-rose-400">{'{NAME}'}</code>, <code className="text-rose-400">{'{EVENT_TITLE}'}</code></span>
                </div>
                <input
                  type="text"
                  value={currentTemplate.subject}
                  onChange={e => setCurrentTemplate({ ...currentTemplate, subject: e.target.value })}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-rose-500 focus:outline-none font-medium"
                  placeholder="🏃 Регистрация на Aktobe Marathon открыта!"
                />
              </div>

              {/* Banner Image with Upload & Presets */}
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-rose-400" />
                    Изображение баннера письма (Шапка)
                  </label>
                  {currentTemplate.bannerImageUrl && (
                    <button
                      onClick={() => setCurrentTemplate({ ...currentTemplate, bannerImageUrl: '' })}
                      className="text-xs text-rose-400 hover:text-rose-300"
                    >
                      Убрать картинку
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={currentTemplate.bannerImageUrl || ''}
                    onChange={e => setCurrentTemplate({ ...currentTemplate, bannerImageUrl: e.target.value })}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:border-rose-500 focus:outline-none"
                    placeholder="URL картинки (например: https://images.unsplash.com/...)"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-all shrink-0 border border-slate-700"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Загрузить фото
                  </button>
                </div>

                {/* Image presets */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400">Быстрые пресеты:</span>
                  <button
                    type="button"
                    onClick={() => setCurrentTemplate({
                      ...currentTemplate,
                      bannerImageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1200&q=80'
                    })}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Марафонский старт
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentTemplate({
                      ...currentTemplate,
                      bannerImageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80'
                    })}
                    className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Медали финишера
                  </button>
                </div>

                {currentTemplate.bannerImageUrl && (
                  <div className="relative rounded-lg overflow-hidden border border-slate-800 max-h-36">
                    <img
                      src={currentTemplate.bannerImageUrl}
                      alt="Banner Preview"
                      className="w-full h-36 object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Badge & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Мини-бейдж
                  </label>
                  <input
                    type="text"
                    value={currentTemplate.badgeText || ''}
                    onChange={e => setCurrentTemplate({ ...currentTemplate, badgeText: e.target.value })}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:border-rose-500 focus:outline-none"
                    placeholder="ГЛАВНЫЙ СТАРТ ГОДА"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Заголовок в письме
                  </label>
                  <input
                    type="text"
                    value={currentTemplate.title}
                    onChange={e => setCurrentTemplate({ ...currentTemplate, title: e.target.value })}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:border-rose-500 focus:outline-none"
                    placeholder="Открыта регистрация на Aktobe Marathon!"
                  />
                </div>
              </div>

              {/* Greeting */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Приветствие (поддерживает {'{NAME}'})
                </label>
                <input
                  type="text"
                  value={currentTemplate.greetingText || currentTemplate.greeting || ''}
                  onChange={e => setCurrentTemplate({ 
                    ...currentTemplate, 
                    greetingText: e.target.value,
                    greeting: e.target.value 
                  })}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:border-rose-500 focus:outline-none"
                  placeholder="Здравствуйте, {NAME}!"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Основной текст письма
                </label>
                <textarea
                  rows={4}
                  value={currentTemplate.mainBodyText || currentTemplate.body || ''}
                  onChange={e => setCurrentTemplate({ 
                    ...currentTemplate, 
                    mainBodyText: e.target.value,
                    body: e.target.value 
                  })}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:border-rose-500 focus:outline-none leading-relaxed"
                  placeholder="Текст письма... Каждая пустая строка создаст новый абзац."
                />
              </div>

              {/* Highlight Box */}
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-3">
                <label className="block text-xs font-semibold text-rose-400 uppercase tracking-wider">
                  ⚡ Выделенный информационный блок (карточка с рамкой)
                </label>
                <input
                  type="text"
                  value={currentTemplate.highlightBoxTitle || ''}
                  onChange={e => setCurrentTemplate({ ...currentTemplate, highlightBoxTitle: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:border-rose-500 focus:outline-none"
                  placeholder="Заголовок блока: Что вас ждет:"
                />
                <textarea
                  rows={3}
                  value={currentTemplate.highlightBoxText || ''}
                  onChange={e => setCurrentTemplate({ ...currentTemplate, highlightBoxText: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:border-rose-500 focus:outline-none"
                  placeholder="• Сертифицированная быстрая трасса&#10;• Эксклюзивные медали финишеров&#10;• Праздничный стартовый городок"
                />
              </div>

              {/* CTA Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Текст кнопки перехода (CTA)
                  </label>
                  <input
                    type="text"
                    value={currentTemplate.ctaButtonText || ''}
                    onChange={e => setCurrentTemplate({ ...currentTemplate, ctaButtonText: e.target.value })}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:border-rose-500 focus:outline-none"
                    placeholder="Зарегистрироваться сейчас →"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Ссылка кнопки перехода
                  </label>
                  <input
                    type="text"
                    value={currentTemplate.ctaButtonUrl || ''}
                    onChange={e => setCurrentTemplate({ ...currentTemplate, ctaButtonUrl: e.target.value })}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-white text-sm focus:border-rose-500 focus:outline-none"
                    placeholder="https://aktobemarathon.kz"
                  />
                </div>
              </div>

              {/* Footer text */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Текст подвала (подпись)
                </label>
                <input
                  type="text"
                  value={currentTemplate.footerNote || currentTemplate.footerText || ''}
                  onChange={e => setCurrentTemplate({ 
                    ...currentTemplate, 
                    footerNote: e.target.value,
                    footerText: e.target.value 
                  })}
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:border-rose-500 focus:outline-none"
                  placeholder="Организационный комитет Aktobe Marathon"
                />
              </div>

              {/* Action row */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Сбросить все шаблоны к исходным заводским?')) {
                      marathonStorage.resetEmailTemplates();
                      loadData();
                    }
                  }}
                  className="text-xs text-slate-400 hover:text-slate-300 flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Сбросить к исходным
                </button>

                <button
                  onClick={handleSaveCurrentTemplate}
                  className="px-6 py-2.5 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all text-sm"
                >
                  💾 Сохранить изменения в шаблоне
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Responsive Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-rose-400" />
                <span className="text-sm font-bold text-white">Интерактивное превью</span>
              </div>

              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                    previewDevice === 'desktop'
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Десктопная версия"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  Десктоп
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                    previewDevice === 'mobile'
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Мобильная версия"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Мобильный
                </button>
              </div>
            </div>

            {/* Preview Frame */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-3 flex justify-center shadow-inner overflow-hidden">
              <div
                className={`transition-all duration-300 bg-white rounded-xl shadow-2xl overflow-hidden ${
                  previewDevice === 'mobile' ? 'w-[375px]' : 'w-full'
                }`}
                style={{ height: '700px' }}
              >
                <iframe
                  title="Email Preview"
                  srcDoc={buildEmailHtml(currentTemplate, 'Виктор')}
                  className="w-full h-full border-0"
                />
              </div>
            </div>

            {/* Quick Test Send Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-rose-400" />
                Быстрый тест отправки этого шаблона
              </h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={e => setTestEmailAddress(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:border-rose-500 focus:outline-none"
                  placeholder="Ваш email для проверки"
                />
                <button
                  onClick={handleSendTestEmail}
                  disabled={testSendStatus.type === 'loading'}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md disabled:opacity-50 shrink-0"
                >
                  {testSendStatus.type === 'loading' ? 'Отправка...' : 'Отправить'}
                </button>
              </div>

              {testSendStatus.message && (
                <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  testSendStatus.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : testSendStatus.type === 'error'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {testSendStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  {testSendStatus.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{testSendStatus.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUBSCRIBERS CRM */}
      {activeTab === 'subscribers' && (
        <div className="space-y-4">
          {/* Action Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search & Source filter */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                  placeholder="Поиск по ФИО, email, телефону..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-white text-xs focus:border-rose-500 focus:outline-none"
                />
              </div>

              <select
                value={sourceFilter}
                onChange={e => { setSourceFilter(e.target.value as any); setPage(1); }}
                className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:border-rose-500 focus:outline-none w-full sm:w-auto"
              >
                <option value="all">Все источники ({subscribers.length})</option>
                <option value="old">Архив старого сайта</option>
                <option value="reg">Регистрации на забег</option>
                <option value="manual">Ручной ввод / Импорт</option>
              </select>
            </div>

            {/* Actions: Export / Import / Add */}
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
              <button
                onClick={() => marathonStorage.exportSubscribersToExcel()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700"
                title="Экспорт базы в Excel"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                Экспорт в Excel
              </button>

              <input
                type="file"
                ref={csvImportRef}
                onChange={handleImportCSV}
                accept=".csv, .xlsx, .xls"
                className="hidden"
              />
              <button
                onClick={() => csvImportRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700"
                title="Импорт из Excel или CSV"
              >
                <Upload className="w-4 h-4 text-blue-400" />
                Импорт контактов
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                Добавить атлета
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <div>
              Найдено контактов: <strong className="text-white">{filteredSubscribers.length.toLocaleString('ru-RU')}</strong> из {subscribers.length.toLocaleString('ru-RU')}
            </div>
            <div>
              Страница {page} из {totalPages}
            </div>
          </div>

          {/* Subscribers Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4 w-12">#</th>
                    <th className="py-3 px-4">Атлет (ФИО)</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Телефон</th>
                    <th className="py-3 px-4">Город</th>
                    <th className="py-3 px-4">Источник</th>
                    <th className="py-3 px-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {paginatedSubscribers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Контактов не найдено по заданным фильтрам
                      </td>
                    </tr>
                  ) : (
                    paginatedSubscribers.map((item, idx) => {
                      const absoluteIndex = (page - 1) * itemsPerPage + idx + 1;
                      return (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 text-slate-500 font-mono">{absoluteIndex}</td>
                          <td className="py-3 px-4 font-semibold text-white">
                            {item.name || item.fullName || '—'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-rose-300">{item.email}</span>
                              <button
                                onClick={() => handleCopyEmail(item.email)}
                                className="p-1 text-slate-500 hover:text-white"
                                title="Скопировать email"
                              >
                                {copiedEmail === item.email ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-300 font-mono">
                            {item.phone || '—'}
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {item.city || 'Актобе'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              item.source.includes('Архив')
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : item.source.includes('Регистрация')
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                              {item.source}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                if (confirm(`Удалить контакт ${item.email}?`)) {
                                  marathonStorage.deleteSubscriber(item.id);
                                  loadData();
                                }
                              }}
                              className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                              title="Удалить"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            {totalPages > 1 && (
              <div className="bg-slate-950/80 border-t border-slate-800 p-3 flex items-center justify-between">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40"
                >
                  ← Предыдущая
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && page > 3) {
                      pageNum = Math.min(totalPages - 4 + i, page - 2 + i);
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                          page === pageNum
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40"
                >
                  Следующая →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SERVER SETTINGS & MASS SENDING */}
      {activeTab === 'server' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Server Configuration (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-rose-400" />
                  Конфигурация почтового сервера
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Выберите сервис отправки: Resend API (рекомендуется для массовых писем) или корпоративный SMTP (Яндекс, Mail.ru, Gmail).
                </p>
              </div>

              {/* Provider selection cards */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Провайдер отправки
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setServerConfig({ ...serverConfig, provider: 'resend' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      serverConfig.provider === 'resend'
                        ? 'border-rose-500 bg-rose-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      Resend API
                      {serverConfig.provider === 'resend' && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Рекомендуется (3000 писем/день)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setServerConfig({ ...serverConfig, provider: 'smtp' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      serverConfig.provider === 'smtp'
                        ? 'border-rose-500 bg-rose-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      SMTP Сервер
                      {serverConfig.provider === 'smtp' && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Яндекс, Mail.ru, Gmail</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setServerConfig({ ...serverConfig, provider: 'demo' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      serverConfig.provider === 'demo'
                        ? 'border-rose-500 bg-rose-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center justify-between">
                      Демо-режим
                      {serverConfig.provider === 'demo' && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">Логирование без отправки</div>
                  </button>
                </div>
              </div>

              {/* Sender Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Имя отправителя
                  </label>
                  <input
                    type="text"
                    value={serverConfig.fromName}
                    onChange={e => setServerConfig({ ...serverConfig, fromName: e.target.value })}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:border-rose-500 focus:outline-none"
                    placeholder="Aktobe Marathon"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Email отправителя (From)
                    </label>
                    {serverConfig.provider === 'smtp' && serverConfig.smtpUser && serverConfig.fromEmail !== serverConfig.smtpUser && (
                      <button
                        type="button"
                        onClick={() => setServerConfig({ ...serverConfig, fromEmail: serverConfig.smtpUser || '' })}
                        className="text-[10px] text-amber-400 hover:underline"
                        title="Подставить адрес логина SMTP"
                      >
                        Совместить с логином
                      </button>
                    )}
                  </div>
                  <input
                    type="email"
                    value={serverConfig.fromEmail}
                    onChange={e => setServerConfig({ ...serverConfig, fromEmail: e.target.value })}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:border-rose-500 focus:outline-none"
                    placeholder="scan@alex-asu.kz"
                  />
                  {serverConfig.provider === 'smtp' && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      💡 Совет: Корпоративные SMTP-серверы часто блокируют отправку, если <code>From</code> отличается от логина авторизации (<strong>{serverConfig.smtpUser || 'логин'}</strong>).
                    </p>
                  )}
                </div>
              </div>

              {/* Provider-specific fields */}
              {serverConfig.provider === 'resend' && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-rose-400 uppercase tracking-wider">
                      Resend API Key
                    </label>
                    <a
                      href="https://resend.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1"
                    >
                      Получить ключ на resend.com <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={serverConfig.resendApiKey || ''}
                    onChange={e => setServerConfig({ ...serverConfig, resendApiKey: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-mono focus:border-rose-500 focus:outline-none"
                    placeholder="re_xxxxxxxxxxxxxxxxxxxxxx"
                  />
                  <p className="text-[11px] text-slate-400">
                    💡 Примечание: Если ключ не указан, отправка автоматически переключается в локальный Демо-режим (симуляция доставки).
                  </p>
                </div>
              )}

              {serverConfig.provider === 'smtp' && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                    Параметры SMTP Сервера
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[11px] text-slate-400 mb-1">SMTP Host</label>
                      <input
                        type="text"
                        value={serverConfig.smtpHost || ''}
                        onChange={e => setServerConfig({ ...serverConfig, smtpHost: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white text-xs"
                        placeholder="smtp.yandex.ru"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Порт</label>
                      <input
                        type="number"
                        value={serverConfig.smtpPort || 465}
                        onChange={e => setServerConfig({ ...serverConfig, smtpPort: parseInt(e.target.value) || 465 })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white text-xs"
                        placeholder="465"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Логин / Почта</label>
                      <input
                        type="text"
                        value={serverConfig.smtpUser || ''}
                        onChange={e => setServerConfig({ ...serverConfig, smtpUser: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white text-xs"
                        placeholder="user@yandex.ru"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Пароль приложения</label>
                      <input
                        type="password"
                        value={serverConfig.smtpPass || serverConfig.smtpPassword || ''}
                        onChange={e => setServerConfig({ ...serverConfig, smtpPass: e.target.value, smtpPassword: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-white text-xs"
                        placeholder="••••••••••••••••"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="smtpSecure"
                      checked={serverConfig.smtpSecure ?? true}
                      onChange={e => setServerConfig({ ...serverConfig, smtpSecure: e.target.checked })}
                      className="rounded accent-rose-600"
                    />
                    <label htmlFor="smtpSecure" className="text-xs text-slate-300">
                      Использовать безопасное SSL/TLS соединение (порт 465)
                    </label>
                  </div>
                </div>
              )}

              {/* Server Test Feedback / Diagnostics Box */}
              {serverTestStatus.message && (
                <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 transition-all ${
                  serverTestStatus.type === 'loading'
                    ? 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                    : serverTestStatus.type === 'success'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                }`}>
                  {serverTestStatus.type === 'loading' && <RefreshCw className="w-4 h-4 shrink-0 mt-0.5 animate-spin text-blue-400" />}
                  {serverTestStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />}
                  {serverTestStatus.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />}
                  <div className="flex-1 space-y-1">
                    <div className="font-semibold leading-relaxed">{serverTestStatus.message}</div>
                    {serverTestStatus.type === 'error' && serverConfig.provider === 'smtp' && (
                      <div className="text-[11px] text-slate-300 opacity-90 pt-1.5 border-t border-rose-500/20 space-y-0.5">
                        <div className="font-bold text-rose-300">Рекомендации по устранению ошибки:</div>
                        <div>• Если ошибка <em>authentication failed (535)</em> — перепроверьте правильность пароля почты <code>{serverConfig.smtpUser}</code>.</div>
                        <div>• Если сервер не отвечает по SSL (порт 465), попробуйте снять галочку SSL и использовать порт <strong>587</strong> (STARTTLS) или порт <strong>25</strong>.</div>
                        <div>• Убедитесь, что <em>Email отправителя (From)</em> совпадает с логином <code>{serverConfig.smtpUser || 'scan@alex-asu.kz'}</code>.</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Server Action Buttons: Test Connection + Save */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTestServerConnection}
                  disabled={serverTestStatus.type === 'loading'}
                  className="py-2.5 px-4 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
                  title="Отправить запрос проверки соединения и авторизации к почтовому серверу"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${serverTestStatus.type === 'loading' ? 'animate-spin text-rose-400' : 'text-slate-400'}`} />
                  {serverTestStatus.type === 'loading' ? 'Проверка...' : '🔌 Проверить подключение'}
                </button>

                <button
                  type="button"
                  onClick={handleSaveServerConfig}
                  className="py-2.5 px-4 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  💾 Сохранить параметры
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Mass Mailing Launch (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-rose-400" />
                  Запуск массовой рассылки
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Отправка выбранного письма по всей базе атлетов или определенному сегменту.
                </p>
              </div>

              {/* Template chosen summary */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Выбранный шаблон для рассылки:</span>
                  <span className="text-xs font-bold text-white">{currentTemplate?.name || 'Шаблон не выбран'}</span>
                </div>
                <button
                  onClick={() => setActiveTab('templates')}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Изменить
                </button>
              </div>

              {/* Target Segment */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Целевая аудитория (сегмент)
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/40 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="radio"
                      name="massAudience"
                      checked={massSendAudience === 'all'}
                      onChange={() => setMassSendAudience('all')}
                      className="accent-rose-600"
                    />
                    <div>
                      <div className="text-xs font-semibold text-white">Все активные подписчики</div>
                      <div className="text-[11px] text-slate-400">
                        {subscribers.filter(s => (s.active ?? (s.status === 'active'))).length.toLocaleString('ru-RU')} атлетов (вся общая база)
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/40 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="radio"
                      name="massAudience"
                      checked={massSendAudience === 'old'}
                      onChange={() => setMassSendAudience('old')}
                      className="accent-rose-600"
                    />
                    <div>
                      <div className="text-xs font-semibold text-white">Участники из архива старого сайта</div>
                      <div className="text-[11px] text-slate-400">
                        {subscribers.filter(s => s.source.includes('Архив')).length.toLocaleString('ru-RU')} атлетов
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/40 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="radio"
                      name="massAudience"
                      checked={massSendAudience === 'reg'}
                      onChange={() => setMassSendAudience('reg')}
                      className="accent-rose-600"
                    />
                    <div>
                      <div className="text-xs font-semibold text-white">Только зарегистрированные на текущие забеги</div>
                      <div className="text-[11px] text-slate-400">
                        {subscribers.filter(s => s.source.includes('Регистрация')).length.toLocaleString('ru-RU')} атлетов
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Progress bar (when active) */}
              {isMassSending && (
                <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/30 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-400" />
                      Идет рассылка: {massSendProgress.current} из {massSendProgress.total}
                    </span>
                    <span className="font-mono text-rose-400 font-bold">{massSendProgress.percent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-rose-600 to-amber-500 h-full transition-all duration-200"
                      style={{ width: `${massSendProgress.percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Успешно: <strong className="text-emerald-400">{massSendProgress.sent}</strong></span>
                    <span>Ошибок: <strong className="text-rose-400">{massSendProgress.failed}</strong></span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                {!isMassSending ? (
                  <button
                    type="button"
                    onClick={handleStartMassMailing}
                    className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-xl shadow-rose-600/30 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Запустить массовую рассылку
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopMassMailing}
                    className="flex-1 py-3 rounded-xl font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-xl shadow-amber-600/30 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    🛑 Остановить рассылку
                  </button>
                )}
              </div>

              {/* Send Logs */}
              {massSendLogs.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Журнал отправки (Live-лог):
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] max-h-40 overflow-y-auto space-y-1">
                    {massSendLogs.map((log, i) => (
                      <div
                        key={i}
                        className={log.includes('❌') ? 'text-rose-400' : log.includes('🛑') ? 'text-amber-400' : 'text-slate-300'}
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Subscriber manually */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-rose-400" />
              Добавить атлета в базу рассылки
            </h3>

            <form onSubmit={handleAddManualSubscriber} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ФИО атлета</label>
                <input
                  type="text"
                  required
                  value={newContact.name}
                  onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="Иванов Иван"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={newContact.email}
                  onChange={e => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="runner@example.kz"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Телефон</label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="+7 705 000 00 00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Город</label>
                <input
                  type="text"
                  value={newContact.city}
                  onChange={e => setNewContact({ ...newContact, city: e.target.value })}
                  placeholder="Актобе"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
