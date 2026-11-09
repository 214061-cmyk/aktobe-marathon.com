import React from 'react';
import { X, FileText, Download, ShieldCheck, ExternalLink } from 'lucide-react';
import type { DocumentKey } from '../../types/marathon';
import { marathonStorage } from '../../services/marathonStorage';

export interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentKey: DocumentKey | null;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  documentKey
}) => {
  if (!isOpen || !documentKey) return null;

  const currentDoc = marathonStorage.getDocument(documentKey);
  if (!currentDoc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Top Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-red-50 text-red-600 border border-red-200 shrink-0 mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-red-600 uppercase tracking-widest block">
                Официальная документация оргкомитета
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-athletic text-slate-900 leading-snug">
                {currentDoc.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {currentDoc.subtitle || 'AQTOBE INTERNATIONAL MARATHON'} • {currentDoc.date || 'Утверждено Оргкомитетом'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Banner if Real File is Attached */}
        {currentDoc.fileUrl && (
          <div className="px-6 py-3 bg-red-50/70 border-b border-red-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-red-900 font-medium">
              <FileText className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                Прикреплен официальный файл: <b className="text-slate-900">{currentDoc.fileName || 'Документ (PDF)'}</b> {currentDoc.fileSize && `(${currentDoc.fileSize})`}
              </span>
            </div>
            <a
              href={currentDoc.fileUrl}
              download={currentDoc.fileName || `${currentDoc.title}.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              Скачать файл {currentDoc.fileSize ? `(${currentDoc.fileSize})` : ''}
            </a>
          </div>
        )}

        {/* Scrollable Document Text Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
          {currentDoc.contentHtml ? (
            <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-sans">
              {currentDoc.contentHtml}
            </div>
          ) : currentDoc.fileUrl ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center border border-red-200">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Документ доступен для скачивания и просмотра в формате PDF
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Файл «{currentDoc.fileName || 'Официальный регламент'}» загружен оргкомитетом. Нажмите кнопку ниже для загрузки или просмотра.
              </p>
              <a
                href={currentDoc.fileUrl}
                download={currentDoc.fileName || `${currentDoc.title}.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-500/25 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Открыть / Скачать документ
              </a>
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic py-8 text-center">
              Текст документа находится на утверждении в оргкомитете соревнований.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            Официальная редакция документа Qazaq Marathon
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {currentDoc.fileUrl && (
              <a
                href={currentDoc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-300 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Открыть в новой вкладке
              </a>
            )}
            <button
              onClick={() => window.print()}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Печать
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
