import React from 'react';
import { Search, X, Building2, Smartphone, SlidersHorizontal } from 'lucide-react';

export default function SearchBar({
  searchTerm,
  setSearchTerm,
  selectedBuilding,
  setSelectedBuilding,
  selectedDeviceType,
  setSelectedDeviceType,
  topBuildings,
  deviceTypes,
  resultCount,
  totalCount,
  onOpenBuildingModal
}) {
  const hasActiveFilters = searchTerm || selectedBuilding || selectedDeviceType;

  const handleClearAll = () => {
    setSearchTerm('');
    setSelectedBuilding('');
    setSelectedDeviceType('');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-5 mb-5 transition-colors">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none text-slate-400 dark:text-slate-500">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by extension (e.g. 6843000), Caller ID, Building, MAC, Switch IP..."
          className="w-full pl-11 pr-10 py-3 text-sm sm:text-base rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700"
            title="Clear search"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="mt-3.5 flex flex-col gap-2.5">
        {/* Buildings Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] shrink-0 mr-1">
            <Building2 className="w-3.5 h-3.5" /> Building:
          </span>

          {/* All / Pop-up launcher button */}
          <button
            onClick={onOpenBuildingModal}
            className={`px-3 py-1.5 rounded-lg shrink-0 transition-all font-semibold inline-flex items-center gap-1.5 ${
              selectedBuilding
                ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-300 dark:ring-sky-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>{selectedBuilding ? `Bldg: ${selectedBuilding}` : 'All Buildings (Popup)'}</span>
          </button>

          {/* Quick top chips */}
          {topBuildings.slice(0, 6).map((b) => (
            <button
              key={b}
              onClick={() => setSelectedBuilding(selectedBuilding === b ? '' : b)}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-all font-medium ${
                selectedBuilding === b
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {b}
            </button>
          ))}

          {/* More buildings button */}
          <button
            onClick={onOpenBuildingModal}
            className="px-2.5 py-1 rounded-lg shrink-0 text-sky-600 dark:text-sky-400 font-semibold hover:underline"
          >
            + Browse all buildings...
          </button>
        </div>

        {/* Device Type Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] shrink-0 mr-1">
            <Smartphone className="w-3.5 h-3.5" /> Device:
          </span>
          <button
            onClick={() => setSelectedDeviceType('')}
            className={`px-2.5 py-1 rounded-lg shrink-0 transition-all font-medium ${
              selectedDeviceType === ''
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Devices
          </button>
          {deviceTypes.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedDeviceType(selectedDeviceType === t ? '' : t)}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-all font-medium ${
                selectedDeviceType === t
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Status Bar */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div>
          Showing <strong className="text-slate-900 dark:text-white font-semibold">{resultCount.toLocaleString()}</strong> of {totalCount.toLocaleString()} phones
          {hasActiveFilters && <span className="text-sky-600 dark:text-sky-400 font-medium"> (filtered)</span>}
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="text-xs text-rose-500 hover:text-rose-600 dark:text-rose-400 font-medium hover:underline inline-flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Reset all filters
          </button>
        )}
      </div>
    </div>
  );
}
