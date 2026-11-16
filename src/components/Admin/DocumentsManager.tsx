import React, { useState, useEffect } from 'react';
import type { LegalDocument } from '../../types/marathon';
import { marathonStorage } from '../../services/marathonStorage';
import { 
  FileText, Upload, Download, Trash2, Edit3, 
  Plus, Check, X, ArrowUp, ArrowDown,
  FileCheck, AlertCircle, RefreshCw
} from 'lucide-react';

interface DocumentsManagerProps {
  onOpenPreview?: (key: string) => void;
}

export const DocumentsManager: React.FC<DocumentsManagerProps> = () => {
  const [documents, setDocuments] = useState<LegalDocument[]>(() => marathonStorage.getDocuments());
  
  // Isolated state for editing a SINGLE specific document
  const [editingDoc, setEditingDoc] = useState<LegalDocument | null>(null);

  // New Document form state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newFileUrl, setNewFileUrl] = useState<string | undefined>(undefined);
  const [newFileName, setNewFileName] = useState<string | undefined>(undefined);
  const [newFileSize, setNewFileSize] = useState<string | undefined>(undefined);

  const [notification, setNotification] = useState<string | null>(null);

  const refreshDocs = () => {
    setDocuments(marathonStorage.getDocuments());
  };

  useEffect(() => {
    const handleStorageUpdate = () => {
      setDocuments(marathonStorage.getDocuments());
    };
    window.addEventListener('marathon-storage-update', handleStorageUpdate);
    return () => window.removeEventListener('marathon-storage-update', handleStorageUpdate);
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Upload file helper
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (dataUrl: string, name: string, size: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 30 * 1024 * 1024) {
      alert('Файл слишком большой. Максимальный размер: 30 МБ.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} МБ` 
        : `${Math.round(file.size / 1024)} КБ`;

      onSuccess(dataUrl, file.name, sizeStr);
    };
    reader.readAsDataURL(file);
  };

  // Start editing a specific document
  const handleStartEdit = (doc: LegalDocument) => {
    setIsAddingNew(false);
    // Create an isolated clone of the document
    setEditingDoc({
      ...doc,
      title: doc.title,
      fileUrl: doc.fileUrl,
      fileName: doc.fileName,
      fileSize: doc.fileSize
    });
  };

  // Save the currently edited document
  const handleSaveEdit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingDoc) return;

    if (!editingDoc.title.trim()) {
      alert('Введите название документа');
      return;
    }

    const updated: LegalDocument = {
      ...editingDoc,
      title: editingDoc.title.trim(),
      updatedAt: new Date().toISOString().split('T')[0]
    };

    marathonStorage.saveDocument(updated);
    setEditingDoc(null);
    refreshDocs();
    showNotification(`Документ «${updated.title}» успешно обновлен`);
  };

  // Delete a document
  const handleDelete = (doc: LegalDocument) => {
    const confirmed = window.confirm(`Вы действительно хотите удалить документ «${doc.title}»?\nОн исчезнет из подвала сайта.`);
    if (!confirmed) return;

    marathonStorage.deleteDocument(doc.id);
    if (editingDoc?.id === doc.id) {
      setEditingDoc(null);
    }
    refreshDocs();
    showNotification(`Документ «${doc.title}» удален`);
  };

  // Reset to clean 5 initial documents if corrupted
  const handleResetToDefaults = () => {
    const confirmed = window.confirm(
      'Восстановить исходные 5 документов (Положение, Оферта, Политика конфиденциальности, Медицинские требования, Правила передачи слота)?\n\nИспользуйте это, если названия документов были случайно перезаписаны.'
    );
    if (!confirmed) return;

    marathonStorage.resetDocumentsToDefaults();
    setEditingDoc(null);
    setIsAddingNew(false);
    refreshDocs();
    showNotification('Список документов восстановлен к стандартному виду');
  };

  // Create new document
  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Введите название документа');
      return;
    }

    const newDoc: LegalDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: newTitle.trim(),
      fileUrl: newFileUrl,
      fileName: newFileName,
      fileSize: newFileSize,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    marathonStorage.saveDocument(newDoc);
    refreshDocs();
    setIsAddingNew(false);
    setNewTitle('');
    setNewFileUrl(undefined);
    setNewFileName(undefined);
    setNewFileSize(undefined);
    showNotification(`Новый документ «${newDoc.title}» успешно добавлен`);
  };

  // Move document up or down
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= documents.length) return;

    const updated = [...documents];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    marathonStorage.reorderDocuments(updated);
    setDocuments(updated);
    showNotification('Порядок документов обновлен');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-widest mb-1">
            <FileText className="w-4 h-4" />
            Документы соревнования
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-athletic text-white">
            УПРАВЛЕНИЕ ОФИЦИАЛЬНЫМИ ДОКУМЕНТАМИ И ФАЙЛАМИ
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Загружайте реальные файлы (PDF, DOCX). При нажатии на ссылку на сайте документ сразу скачивается или открывается в новой вкладке. Вы можете добавлять, переименовывать и прикреплять файлы к каждому документу индивидуально.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleResetToDefaults}
            title="Восстановить стандартные 5 документов (Положение, Оферта, Политика, Мед. справки, Слот)"
            className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer flex items-center gap-2 text-xs font-bold"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden md:inline">Сбросить к исходным</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsAddingNew(true);
              setEditingDoc(null);
            }}
            className="px-5 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-600/30"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Добавить документ
          </button>
        </div>
      </div>

      {/* Global Notification Toast */}
      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* FORM: EDIT SINGLE SELECTED DOCUMENT                      */}
      {/* ======================================================== */}
      {editingDoc && (
        <form 
          onSubmit={handleSaveEdit}
          className="p-6 rounded-3xl bg-[#0e0f17] border-2 border-red-500 shadow-2xl space-y-4 animate-in fade-in zoom-in-98"
        >
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <span className="text-xs font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Редактирование: «{editingDoc.title || 'Документ'}»
            </span>
            <button
              type="button"
              onClick={() => setEditingDoc(null)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Закрыть без сохранения"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                Название документа *
              </label>
              <input
                type="text"
                required
                value={editingDoc.title}
                onChange={e => setEditingDoc({ ...editingDoc, title: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-medium"
                placeholder="Например: Официальный регламент 2026..."
              />
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5 text-red-400" />
                  Файл документа (PDF / DOC / скан)
                </span>

                <div>
                  <label
                    htmlFor={`edit-doc-file-${editingDoc.id}`}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors border border-zinc-700"
                  >
                    <Upload className="w-3.5 h-3.5 text-red-400" />
                    {editingDoc.fileUrl ? 'Заменить файл с компьютера' : 'Выбрать файл с компьютера'}
                  </label>
                  <input
                    id={`edit-doc-file-${editingDoc.id}`}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    onChange={e => handleFileUpload(e, (url, name, size) => {
                      setEditingDoc({
                        ...editingDoc,
                        fileUrl: url,
                        fileName: name,
                        fileSize: size
                      });
                    })}
                    className="hidden"
                  />
                </div>
              </div>

              {editingDoc.fileUrl ? (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-white truncate">
                      {editingDoc.fileName || 'document.pdf'}
                    </span>
                    {editingDoc.fileSize && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800 shrink-0">
                        {editingDoc.fileSize}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <a
                      href={editingDoc.fileUrl}
                      download={editingDoc.fileName || `${editingDoc.title}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      Проверить файл
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDoc({
                          ...editingDoc,
                          fileUrl: undefined,
                          fileName: undefined,
                          fileSize: undefined
                        });
                      }}
                      className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Открепить файл"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="url"
                    placeholder="Либо вставьте прямую ссылку на файл: https://... (Google Drive, Яндекс.Диск)"
                    value={editingDoc.fileUrl || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setEditingDoc({
                        ...editingDoc,
                        fileUrl: val,
                        fileName: val.split('/').pop() || 'Документ по ссылке'
                      });
                    }}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditingDoc(null)}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold uppercase transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Check className="w-4 h-4" />
              Сохранить изменения
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* FORM: ADD NEW DOCUMENT                                   */}
      {/* ======================================================== */}
      {isAddingNew && (
        <form 
          onSubmit={handleCreateDocument} 
          className="p-6 rounded-3xl bg-[#0e0f17] border-2 border-red-500/60 shadow-2xl space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Plus className="w-4 h-4 text-red-500" />
              Добавление нового официального документа
            </div>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                Название документа * (отображается для посетителей)
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Например: Официальное Положение 2027 (PDF) или Расписка об ответственности"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-medium"
              />
            </div>

            {/* File Upload Box */}
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5 text-red-400" />
                  Прикрепить файл документа (PDF, Word, скан)
                </span>

                <div>
                  <label
                    htmlFor="new-doc-file-input"
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors border border-zinc-700"
                  >
                    <Upload className="w-3.5 h-3.5 text-red-400" />
                    Выбрать файл с компьютера
                  </label>
                  <input
                    id="new-doc-file-input"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    onChange={e => handleFileUpload(e, (url, name, size) => {
                      setNewFileUrl(url);
                      setNewFileName(name);
                      setNewFileSize(size);
                    })}
                    className="hidden"
                  />
                </div>
              </div>

              {newFileUrl ? (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-white truncate">
                      {newFileName || 'document.pdf'}
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800 shrink-0">
                      {newFileSize}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewFileUrl(undefined);
                      setNewFileName(undefined);
                      setNewFileSize(undefined);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                    title="Удалить файл"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="url"
                    placeholder="Либо вставьте прямую ссылку на файл: https://... (Google Drive, Dropbox, Яндекс.Диск)"
                    value={newFileUrl || ''}
                    onChange={e => {
                      setNewFileUrl(e.target.value);
                      setNewFileName(e.target.value.split('/').pop() || 'Документ по ссылке');
                    }}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-bold uppercase transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Check className="w-4 h-4" />
              Добавить в список
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* DOCUMENTS LIST (EACH DOCUMENT IN ITS OWN CLEAN ROW)      */}
      {/* ======================================================== */}
      <div className="space-y-3">
        {documents.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#0e0f17] border border-zinc-800 space-y-3">
            <AlertCircle className="w-10 h-10 text-zinc-500 mx-auto" />
            <h3 className="text-base font-bold text-white">Список документов пуст</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Нажмите кнопку «Добавить документ» вверху, чтобы добавить официальное положение, регламент или правила.
            </p>
          </div>
        ) : (
          documents.map((doc, idx) => {
            const isCurrentlyBeingEdited = editingDoc?.id === doc.id;
            const hasFile = Boolean(doc.fileUrl);

            return (
              <div
                key={doc.id}
                className={`p-4 sm:p-5 rounded-2xl bg-[#0e0f17] border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                  isCurrentlyBeingEdited 
                    ? 'border-red-500 ring-2 ring-red-500/20 shadow-lg' 
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Left: Move handles & Doc info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Order Buttons */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'up')}
                      className={`p-1 rounded bg-zinc-900 border border-zinc-800 transition-colors ${
                        idx === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer'
                      }`}
                      title="Переместить выше"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === documents.length - 1}
                      onClick={() => handleMove(idx, 'down')}
                      className={`p-1 rounded bg-zinc-900 border border-zinc-800 transition-colors ${
                        idx === documents.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer'
                      }`}
                      title="Переместить ниже"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Icon */}
                  <div className={`p-2.5 rounded-xl border shrink-0 ${
                    hasFile 
                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' 
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>

                  {/* Title & File details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors truncate">
                        {doc.title}
                      </h4>
                      {isCurrentlyBeingEdited && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500 text-white animate-pulse">
                          Редактируется выше ↑
                        </span>
                      )}
                      {hasFile ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          Файл готов {doc.fileSize && `(${doc.fileSize})`}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/40 text-amber-400 border border-amber-900/40">
                          Файл не прикреплен
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-3">
                      {hasFile ? (
                        <span className="truncate text-zinc-300">
                          Имя файла: <b className="text-white">{doc.fileName || 'document.pdf'}</b>
                        </span>
                      ) : (
                        <span className="text-amber-500/80">
                          Нажмите «Редактировать» чтобы прикрепить PDF с компьютера
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  {hasFile && (
                    <a
                      href={doc.fileUrl}
                      download={doc.fileName || `${doc.title}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-emerald-400 text-xs font-bold flex items-center gap-1.5 border border-zinc-700 transition-colors cursor-pointer"
                      title="Скачать или открыть в новой вкладке"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Скачать ↗
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => handleStartEdit(doc)}
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold flex items-center gap-1.5 border border-zinc-700 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
                    Редактировать
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(doc)}
                    className="p-2 rounded-xl bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-white border border-red-900/30 transition-colors cursor-pointer"
                    title="Удалить документ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
