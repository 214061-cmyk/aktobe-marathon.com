import React, { useState } from 'react';
import { Lock, User, ArrowLeft, ShieldCheck, KeyRound, Sparkles, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToSite
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Пожалуйста, введите логин и пароль администратора');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Check credentials (admin / admin2026 or admin / admin)
      if (
        (username.trim().toLowerCase() === 'admin' && (password === 'admin2026' || password === 'admin')) ||
        (username.trim().toLowerCase() === 'director' && password === 'marathon2026')
      ) {
        sessionStorage.setItem('marathon_admin_authenticated', 'true');
        onLoginSuccess();
      } else {
        setError('Неверный логин или пароль. Попробуйте admin / admin2026');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    setUsername('admin');
    setPassword('admin2026');
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      sessionStorage.setItem('marathon_admin_authenticated', 'true');
      onLoginSuccess();
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-red-50/40 text-slate-900 flex flex-col justify-center items-center p-4">
      
      {/* Top back link */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between">
        <button
          onClick={onBackToSite}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-red-600 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Вернуться на сайт
        </button>
        <span className="text-xs font-semibold text-slate-400">AQTOBE MARATHON CORE</span>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200 p-8 sm:p-10 relative overflow-hidden">
        
        {/* Decorative Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-red-500" />

        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2 mb-4 bg-red-50 rounded-2xl border border-red-100">
            <img
              src="/logo.png"
              alt="Aqtobe Marathon"
              className="h-14 sm:h-16 w-auto object-contain"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100/80 text-red-700 text-[11px] font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
            Служебный доступ оргкомитета
          </div>
          <h1 className="text-2xl font-black font-bebas tracking-wide text-slate-900">
            АВТОРИЗАЦИЯ ОРГАНИЗАТОРА
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Управление марафонами, дистанциями, участниками и расписанием
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Логин администратора
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-sm font-medium transition-all text-slate-900 placeholder:text-slate-400"
                autoFocus
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Пароль
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:border-red-600 focus:ring-2 focus:ring-red-100 outline-none text-sm font-medium transition-all text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Quick Demo Credentials Info */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800">Тестовый логин: </span>
              <code className="text-red-600 font-mono font-bold">admin</code>
              <span className="mx-1">•</span>
              <span className="font-bold text-slate-800">Пароль: </span>
              <code className="text-red-600 font-mono font-bold">admin2026</code>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="text-red-600 hover:text-red-700 font-bold hover:underline cursor-pointer flex items-center gap-1 shrink-0 ml-2"
            >
              <Sparkles className="w-3 h-3" /> Вставить
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm uppercase tracking-wider transition-all duration-200 shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                Войти в панель управления
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Защищенная зона управления соревнованием. Все действия фиксируются в журнале событий.
        </div>

      </div>
    </div>
  );
};
