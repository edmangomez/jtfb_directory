import React, { useState, useMemo } from 'react';
import { X, Search, Building2, Check, ArrowDownUp } from 'lucide-react';

export default function BuildingModal({
  isOpen,
  onClose,
  buildingsWithCounts,
  selectedBuilding,
  onSelectBuilding
}) {
  const [modalSearch, setModalSearch] = useState('');
  const [sortBy, setSortBy] = useState('count'); // 'count' | 'name'

  const filteredBuildings = useMemo(() => {
    const q = modalSearch.trim().toLowerCase();
    let list = buildingsWithCounts.filter(([bldg]) =>
      bldg.toLowerCase().includes(q)
    );

    if (sortBy === 'count') {
      list.sort((a, b) => b[1] - a[1]);
    } else {
      list.sort((a, b) => a[0].localeCompare(b[0]));
    }
    return list;
  }, [buildingsWithCounts, modalSearch, sortBy]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Select Building Filter
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Browse or search among {buildingsWithCounts.length} base buildings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Sort Controls inside Modal */}
        <div className="py-3 space-y-2.5">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={modalSearch}
              onChange={(e) => setModalSearch(e.target.value)}
              placeholder="Search building (e.g. K-05, R-31, D-61)..."
              autoFocus
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            {modalSearch && (
              <button
                onClick={() => setModalSearch('')}
                className="absolute right-3 top-2.5 p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            {/* Show All / Reset button */}
            <button
              onClick={() => {
                onSelectBuilding('');
                onClose();
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                !selectedBuilding
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Buildings (No Filter)
            </button>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortBy(sortBy === 'count' ? 'name' : 'count')}
              className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowDownUp className="w-3.5 h-3.5" />
              <span>Sort by: {sortBy === 'count' ? 'Most Lines' : 'Name A-Z'}</span>
            </button>
          </div>
        </div>

        {/* Buildings Grid with Scroll */}
        <div className="flex-1 overflow-y-auto py-2 pr-1">
          {filteredBuildings.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              No buildings found matching "{modalSearch}"
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {filteredBuildings.map(([bldg, count]) => {
                const isSelected = selectedBuilding === bldg;
                return (
                  <button
                    key={bldg}
                    onClick={() => {
                      onSelectBuilding(bldg);
                      onClose();
                    }}
                    className={`group flex items-center justify-between p-3 rounded-xl border text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-600/20 ring-2 ring-cyan-400/50 dark:ring-cyan-500/40'
                        : 'bg-slate-50 dark:bg-slate-800/90 hover:bg-cyan-50/60 dark:hover:bg-slate-700/90 border-slate-200 dark:border-slate-700/80 hover:border-cyan-300 dark:hover:border-cyan-500/60 text-slate-800 dark:text-slate-100 shadow-sm'
                    }`}
                  >
                    <div className="truncate font-bold flex items-center gap-1.5">
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 shrink-0 text-white" />
                      ) : (
                        <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-cyan-400/80 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors" />
                      )}
                      <span className="truncate font-mono tracking-tight">{bldg}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ml-1 transition-colors ${
                        isSelected
                          ? 'bg-cyan-800/80 text-white'
                          : 'bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-600 group-hover:border-cyan-300 dark:group-hover:border-cyan-500/50'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>{filteredBuildings.length} buildings displayed</span>
          {selectedBuilding && (
            <span className="text-sky-600 dark:text-sky-400 font-medium">
              Currently selected: <strong>{selectedBuilding}</strong>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
