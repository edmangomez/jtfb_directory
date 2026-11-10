import React from 'react';
import { Phone, Smartphone, PhoneCall, ShieldAlert, Building2, Check } from 'lucide-react';

export default function DashboardStats({
  totalPhones,
  deviceStats,
  selectedDeviceType,
  setSelectedDeviceType,
  totalCrash,
  totalBuildings,
  onOpenBuildingModal,
  onSwitchToCrashTab
}) {
  return (
    <div className="mb-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {/* Total Directory Lines */}
        <div
          onClick={() => setSelectedDeviceType('')}
          className={`cursor-pointer rounded-2xl p-3 sm:p-3.5 border transition-all ${
            !selectedDeviceType
              ? 'bg-sky-50/80 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">All Lines</span>
            <Phone className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {totalPhones.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            Active extensions
          </div>
        </div>

        {/* Analog Phones */}
        {deviceStats['Analog'] !== undefined && (
          <div
            onClick={() => setSelectedDeviceType(selectedDeviceType === 'Analog' ? '' : 'Analog')}
            className={`cursor-pointer rounded-2xl p-3 sm:p-3.5 border transition-all ${
              selectedDeviceType === 'Analog'
                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 dark:border-amber-700 shadow-sm ring-2 ring-amber-400/30'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-800'
            }`}
          >
            <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Analog</span>
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {deviceStats['Analog'].toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center justify-between">
              <span>Standard line</span>
              {selectedDeviceType === 'Analog' && <span className="font-semibold text-amber-600 dark:text-amber-400">Active</span>}
            </div>
          </div>
        )}

        {/* Cisco DP-9851 */}
        {deviceStats['DP-9851'] !== undefined && (
          <div
            onClick={() => setSelectedDeviceType(selectedDeviceType === 'DP-9851' ? '' : 'DP-9851')}
            className={`cursor-pointer rounded-2xl p-3 sm:p-3.5 border transition-all ${
              selectedDeviceType === 'DP-9851'
                ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-400 dark:border-sky-700 shadow-sm ring-2 ring-sky-400/30'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-800'
            }`}
          >
            <div className="flex items-center justify-between text-sky-700 dark:text-sky-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">DP-9851</span>
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {deviceStats['DP-9851'].toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center justify-between">
              <span>Cisco IP Phone</span>
              {selectedDeviceType === 'DP-9851' && <span className="font-semibold text-sky-600 dark:text-sky-400">Active</span>}
            </div>
          </div>
        )}

        {/* Cisco CP-8851NR */}
        {deviceStats['CP-8851NR'] !== undefined && (
          <div
            onClick={() => setSelectedDeviceType(selectedDeviceType === 'CP-8851NR' ? '' : 'CP-8851NR')}
            className={`cursor-pointer rounded-2xl p-3 sm:p-3.5 border transition-all ${
              selectedDeviceType === 'CP-8851NR'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-700 shadow-sm ring-2 ring-indigo-400/30'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800'
            }`}
          >
            <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">CP-8851NR</span>
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {deviceStats['CP-8851NR'].toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center justify-between">
              <span>Executive IP</span>
              {selectedDeviceType === 'CP-8851NR' && <span className="font-semibold text-indigo-600 dark:text-indigo-400">Active</span>}
            </div>
          </div>
        )}

        {/* Emergency Crash Lines */}
        <div
          onClick={onSwitchToCrashTab}
          className="cursor-pointer rounded-2xl p-3 sm:p-3.5 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 hover:border-rose-400 dark:hover:border-rose-700 transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Crash Lines</span>
            <ShieldAlert className="w-4 h-4 group-hover:scale-110 transition-transform text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
            {totalCrash}
          </div>
          <div className="text-[10px] text-rose-600/70 dark:text-rose-400/70 mt-0.5">
            Emergency circuits
          </div>
        </div>

        {/* Buildings Modal Launcher */}
        <div
          onClick={onOpenBuildingModal}
          className="cursor-pointer rounded-2xl p-3 sm:p-3.5 bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-600 transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Buildings</span>
            <Building2 className="w-4 h-4 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {totalBuildings}
          </div>
          <div className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold mt-0.5">
            Open selector →
          </div>
        </div>
      </div>
    </div>
  );
}
