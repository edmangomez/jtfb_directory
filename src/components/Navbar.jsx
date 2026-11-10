import React from 'react';
import { ShieldAlert, Settings, LogOut, Sun, Moon, Database, Phone, CheckCircle2 } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  totalPhones,
  totalCrash,
  darkMode,
  setDarkMode,
  currentUser,
  onLogout,
  isCustomData
}) {
  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* Brand Logo & Title with Official Telecom Logo */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white p-1 flex items-center justify-center shadow-md shadow-cyan-500/10 overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                <img src="/logo.jpg" alt="Telecom" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
                    Telecom <span className="text-cyan-600 dark:text-cyan-400 font-black">Directory</span>
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 shrink-0">
                    JTFB
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block truncate">
                  Joint Task Force-Bravo • Base Communications
                </p>
              </div>
            </div>

            {/* Desktop Center Segmented Tabs (Hidden on mobile) */}
            <nav aria-label="Desktop Navigation" className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800/70 p-1 rounded-2xl border border-slate-200 dark:border-slate-700/80">
              <button
                onClick={() => setActiveTab('directory')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'directory'
                    ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>General Directory</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                  {totalPhones.toLocaleString()}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('crash')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'crash'
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                <span>Crash Lines</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono">
                  {totalCrash}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'admin'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Administration</span>
              </button>
            </nav>

            {/* User Profile, Theme & Logout */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* User Session Pill - Prominent on both Mobile and Desktop */}
              {currentUser && (
                <div
                  title={`Logged in as ${currentUser.username} (${currentUser.name || 'Administrator'})`}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-200 dark:border-cyan-800 text-xs shadow-sm"
                >
                  <div className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px] font-extrabold uppercase shrink-0">
                    {currentUser.username.charAt(0)}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-cyan-950 dark:text-cyan-200 text-xs">
                      {currentUser.username}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Central Server Connected" />
                  </div>
                </div>
              )}

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label="Toggle color theme"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                title="Sign Out"
                aria-label="Sign Out"
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Fixed for effortless thumb reach on phones) */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-all">
        <div className="grid grid-cols-3 h-16 max-w-md mx-auto px-2">
          {/* Tab 1: Directory */}
          <button
            onClick={() => setActiveTab('directory')}
            className={`flex flex-col items-center justify-center gap-1 transition-all relative ${
              activeTab === 'directory'
                ? 'text-cyan-600 dark:text-cyan-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${
              activeTab === 'directory' ? 'bg-cyan-50 dark:bg-cyan-950/80 scale-110 shadow-sm' : ''
            }`}>
              <Phone className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] leading-none">Directory</span>
              <span className="text-[9px] px-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                {totalPhones.toLocaleString()}
              </span>
            </div>
          </button>

          {/* Tab 2: Crash Lines */}
          <button
            onClick={() => setActiveTab('crash')}
            className={`flex flex-col items-center justify-center gap-1 transition-all relative ${
              activeTab === 'crash'
                ? 'text-rose-600 dark:text-rose-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all relative ${
              activeTab === 'crash' ? 'bg-rose-50 dark:bg-rose-950/80 scale-110 shadow-sm' : ''
            }`}>
              <ShieldAlert className="w-5 h-5 text-rose-500" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] leading-none">Crash Lines</span>
              <span className="text-[9px] px-1 rounded-full bg-rose-500 text-white font-bold font-mono">
                {totalCrash}
              </span>
            </div>
          </button>

          {/* Tab 3: Administration */}
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center justify-center gap-1 transition-all relative ${
              activeTab === 'admin'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${
              activeTab === 'admin' ? 'bg-indigo-50 dark:bg-indigo-950/80 scale-110 shadow-sm' : ''
            }`}>
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-[11px] leading-none">Admin</span>
          </button>
        </div>
      </nav>
    </>
  );
}
