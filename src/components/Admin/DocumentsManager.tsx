import React, { useState } from 'react';
import type { DocumentKey, LegalDocument } from '../../types/marathon';
import { marathonStorage } from '../../services/marathonStorage';
import { 
  FileText, Upload, Download, Trash2, Edit3, 
  Check, Eye, ShieldCheck, AlertCircle, FileCheck
} from 'lucide-react';

interface DocumentsManagerProps {
  onOpenPreview: (key: DocumentKey) => void;
}

const DOCUMENT_ITEMS: { key: DocumentKey; label: string; description: string }[] = [
  { 
    key: 'regulation', 
    label: 'Официальное Положение (PDF)', 
    description: 'Главный регламент соревнования: цели, трассы, возрастные ограничения, призовой фонд' 
  },
  { 
    key: 'offer', 
    label: 'Договор публичной оферты', 
    description: 'Условия участия, акцепт, правила возврата и обязанности сторон' 
  },
  { 
    key: 'privacy', 
    label: 'Политика конфиденциальности', 
    description: 'Согласие на сбор, хранение и обработку персональных данных атлетов' 
  },
  { 
    key: 'medical', 
    label: 'Медицинские требования и справки', 
    description: 'Правила допуска к старту, расписки об ответственности, требования к здоровью' 
  },
  { 
    key: 'transfer', 
    label: 'Правила передачи стартового слота', 
    description: 'Порядок перерегистрации слота на другого участника и смена дистанций' 
  },
];

export const DocumentsManager: React.FC<DocumentsManagerProps> = ({ onOpenPreview }) => {
  const [selectedKey, setSelectedKey] = useState<DocumentKey>('regulation');
  const [docForm, setDocForm] = useState<LegalDocument>(() => marathonStorage.getDocument('regulation'));
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSelectDoc = (key: DocumentKey) => {
    setSelectedKey(key);
    setDocForm(marathonStorage.getDocument(key));
    setSaveSuccess(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      alert('Файл слишком большой. Максимальный размер: 25 МБ.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} МБ` 
        : `${Math.round(file.size / 1024)} КБ`;

      setDocForm(prev => ({
        ...prev,
        fileUrl: dataUrl,
        fileName: file.name,
        fileSize: sizeStr
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setDocForm(prev => ({
      ...prev,
      fileUrl: undefined,
      fileName: undefined,
      fileSize: undefined
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    marathonStorage.saveDocument(docForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const currentItemInfo = DOCUMENT_ITEMS.find(item => item.key === selectedKey);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-widest mb-1">
            <FileText className="w-4 h-4" />
            Документы и регламенты соревнований
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-athletic text-white">
            УПРАВЛЕНИЕ ОФИЦИАЛЬНЫМИ ДОКУМЕНТАМИ
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Прикрепляйте реальные файлы (PDF с печатями, DOCX) либо редактируйте текст документа. Все изменения сразу отображаются в футере сайта для посетителей.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenPreview(selectedKey)}
          className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase flex items-center gap-2 transition-all cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Eye className="w-4 h-4 text-red-400" />
          Предпросмотр на сайте
        </button>
      </div>

      {/* Document Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {DOCUMENT_ITEMS.map(item => {
          const isSelected = selectedKey === item.key;
          const currentDoc = marathonStorage.getDocument(item.key);
          const hasFile = Boolean(currentDoc.fileUrl);

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => handleSelectDoc(item.key)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-red-600/10 border-red-500/80 ring-1 ring-red-500/40 text-white shadow-md'
                  : 'bg-[#0e0f17] border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <FileText className={`w-4 h-4 ${isSelected ? 'text-red-500' : 'text-zinc-500'}`} />
                  {hasFile ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      PDF
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-zinc-800 text-zinc-400">
                      Текст
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-white line-clamp-2">
                  {item.label}
                </div>
              </div>

              <div className="text-[10px] text-zinc-500 mt-2 line-clamp-1">
                {hasFile ? currentDoc.fileName : 'Текстовый шаблон'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Document Edit Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Block 1: Real File Attachment (PDF/DOCX) */}
        <div className="bg-[#0e0f17] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-red-500" />
                Прикрепление реального файла для «{currentItemInfo?.label}»
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Загрузите официальный PDF с печатями со своего компьютера (до 25 МБ) или укажите ссылку
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="doc-file-upload-input"
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Выбрать файл с компьютера (PDF / DOC)
              </label>
              <input
                id="doc-file-upload-input"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.png"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Uploaded File Status Box */}
          {docForm.fileUrl ? (
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      {docForm.fileName || 'Официальный_документ.pdf'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                      Готов к скачиванию {docForm.fileSize && `(${docForm.fileSize})`}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">
                    Посетители сайта смогут напрямую скачать или открыть этот документ нажатием одной кнопки в футере
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <a
                  href={docForm.fileUrl}
                  download={docForm.fileName || 'document.pdf'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold flex items-center gap-1.5 border border-zinc-700 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  Скачать / Проверить
                </a>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-white border border-red-900/40 transition-all cursor-pointer"
                  title="Открепить файл"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-center space-y-2">
              <p className="text-xs text-zinc-400">
                Оригинальный файл пока не прикреплен. Нажмите кнопку <b>«Выбрать файл с компьютера»</b> вверху, либо вставьте прямую ссылку на файл ниже:
              </p>
              <div className="max-w-lg mx-auto pt-1">
                <input
                  type="url"
                  placeholder="https://... (прямая ссылка на PDF в Google Drive, Dropbox или сервере)"
                  value={docForm.fileUrl || ''}
                  onChange={e => setDocForm(prev => ({ 
                    ...prev, 
                    fileUrl: e.target.value, 
                    fileName: e.target.value.split('/').pop() || 'Официальный документ (по ссылке)' 
                  }))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Block 2: Title & Text Content */}
        <div className="bg-[#0e0f17] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-zinc-800">
            <Edit3 className="w-4 h-4 text-red-500" />
            Реквизиты и текстовая версия документа
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-zinc-400 font-bold mb-1">Название документа *</label>
              <input
                type="text"
                required
                value={docForm.title}
                onChange={e => setDocForm({ ...docForm, title: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none"
                placeholder="Например: Официальное Положение о проведении марафона..."
              />
            </div>

            <div>
              <label className="block text-zinc-400 font-bold mb-1">Кем утверждено / Подзаголовок</label>
              <input
                type="text"
                value={docForm.subtitle || ''}
                onChange={e => setDocForm({ ...docForm, subtitle: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-red-500 focus:outline-none"
                placeholder="Утверждено Оргкомитетом и Акиматом..."
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block text-zinc-400 font-bold mb-1">Дата редакции / Утверждения</label>
            <input
              type="text"
              value={docForm.date || ''}
              onChange={e => setDocForm({ ...docForm, date: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
              placeholder="Редакция от 01 января 2026 года"
            />
          </div>

          <div className="text-xs">
            <div className="flex items-center justify-between mb-1">
              <label className="text-zinc-400 font-bold">
                Официальный текст документа (разделы, параграфы, правила)
              </label>
              <span className="text-[11px] text-zinc-500">
                Отображается в удобном окне для бегунов на сайте
              </span>
            </div>
            <textarea
              rows={12}
              value={docForm.contentHtml || ''}
              onChange={e => setDocForm({ ...docForm, contentHtml: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl p-4 text-xs text-zinc-200 focus:border-red-500 focus:outline-none leading-relaxed font-sans"
              placeholder="Вставьте официальный текст положения или договора..."
            />
          </div>

          {/* Save Status & Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              Сохранить документ и опубликовать на сайте
            </button>

            <button
              type="button"
              onClick={() => onOpenPreview(selectedKey)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase flex items-center justify-center gap-2 border border-zinc-700 transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4 text-zinc-400" />
              Предпросмотр документа
            </button>

            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-4 h-4" /> Документ успешно сохранен и обновлен!
              </span>
            )}
          </div>
        </div>

      </form>
    </div>
  );
};
