import React from 'react';
import { ShieldAlert, Settings, LogOut, Sun, Moon, Database, Phone } from 'lucide-react';

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
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title with Telecom Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white p-1 flex items-center justify-center shadow-md shadow-cyan-500/10 overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
              <img src="/logo.jpg" alt="Telecom" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                  Telecom <span className="text-cyan-600 dark:text-cyan-400 font-extrabold">Directory</span>
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                  JTFB Cisco
                </span>
                {isCustomData && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <Database className="w-3 h-3" /> Updated
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Base Communications & Official Crash Conference Systems
              </p>
            </div>
          </div>

          {/* User Profile, Theme & Logout */}
          <div className="flex items-center gap-2">
            {/* User Session Pill */}
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="w-6 h-6 rounded-full bg-cyan-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block leading-tight">
                    {currentUser.username}
                  </span>
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-400 uppercase font-semibold">
                    Administrator
                  </span>
                </div>
              </div>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle color theme"
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              title="Sign Out"
              aria-label="Sign Out"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation (Directory vs Crash Lines vs Administration) */}
        <div className="flex space-x-2 border-t border-slate-100 dark:border-slate-800/80 pt-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-2 py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'directory'
                ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400 dark:border-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>General Directory</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {totalPhones.toLocaleString()}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('crash')}
            className={`flex items-center gap-2 py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'crash'
                ? 'border-rose-600 text-rose-600 dark:text-rose-400 dark:border-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>Crash Lines</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
              {totalCrash}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'admin'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Administration</span>
          </button>
        </div>
      </div>
    </header>
  );
}
