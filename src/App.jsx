import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardStats from './components/DashboardStats';
import SearchBar from './components/SearchBar';
import BuildingModal from './components/BuildingModal';
import PhoneCard from './components/PhoneCard';
import PhoneTable from './components/PhoneTable';
import CrashLinesView from './components/CrashLinesView';
import CopyModal from './components/CopyModal';
import LoginScreen from './components/LoginScreen';
import AdminPanel from './components/AdminPanel';
import { loadData, fetchServerDatabase, getSession, logoutUser } from './utils/storage';
import { LayoutGrid, Table, Phone, ArrowUp, ChevronDown, FileSpreadsheet, Settings } from 'lucide-react';

const PAGE_SIZE = 50;

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getSession());
  const [data, setData] = useState(() => loadData());
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'crash' | 'admin'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedDeviceType, setSelectedDeviceType] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Modals
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [fallbackCopyText, setFallbackCopyText] = useState(null);

  // Dark mode
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Central Server Synchronization
  useEffect(() => {
    fetchServerDatabase().then((serverDb) => {
      if (serverDb && serverDb.phones && serverDb.phones.length > 0) {
        setData(serverDb);
      }
    });
  }, []);

  // Extract building counts and device statistics
  const { topBuildings, buildingsWithCounts, deviceStats, deviceTypes } = useMemo(() => {
    const buildingCounts = {};
    const typeCounts = {};

    data.phones.forEach((p) => {
      if (p.building) {
        buildingCounts[p.building] = (buildingCounts[p.building] || 0) + 1;
      }
      if (p.device_type) {
        typeCounts[p.device_type] = (typeCounts[p.device_type] || 0) + 1;
      }
    });

    const sortedBuildingsArray = Object.entries(buildingCounts).sort((a, b) => b[1] - a[1]);
    const top10 = sortedBuildingsArray.slice(0, 10).map(([b]) => b);

    return {
      topBuildings: top10,
      buildingsWithCounts: sortedBuildingsArray,
      deviceStats: typeCounts,
      deviceTypes: Object.keys(typeCounts).sort(),
    };
  }, [data]);

  // Filter phones with instant multi-field search
  const filteredPhones = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const buildingFilter = selectedBuilding.toLowerCase();
    const typeFilter = selectedDeviceType.toLowerCase();

    return data.phones.filter((p) => {
      if (buildingFilter && (!p.building || p.building.toLowerCase() !== buildingFilter)) {
        return false;
      }
      if (typeFilter && (!p.device_type || p.device_type.toLowerCase() !== typeFilter)) {
        return false;
      }
      if (!term) return true;

      const numMatch = p.number.includes(term);
      const nameMatch = p.caller_id?.toLowerCase().includes(term);
      const orgMatch = p.organization?.toLowerCase().includes(term);
      const bldgMatch = p.building?.toLowerCase().includes(term);
      const macMatch = p.mac?.toLowerCase().includes(term);
      const swMatch = p.cisco_switch?.toLowerCase().includes(term);
      const portMatch = p.port?.toLowerCase().includes(term);
      const serialMatch = p.serial_no?.toLowerCase().includes(term);
      const devMatch = p.device_type?.toLowerCase().includes(term);
      const remarksMatch = p.remarks?.toLowerCase().includes(term);

      return (
        numMatch ||
        nameMatch ||
        orgMatch ||
        bldgMatch ||
        macMatch ||
        swMatch ||
        portMatch ||
        serialMatch ||
        devMatch ||
        remarksMatch
      );
    });
  }, [data.phones, searchTerm, selectedBuilding, selectedDeviceType]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm, selectedBuilding, selectedDeviceType]);

  const displayedPhones = useMemo(() => {
    return filteredPhones.slice(0, visibleCount);
  }, [filteredPhones, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setActiveTab('directory');
  };

  // If not logged in, render the secure Login Screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  const isCustomData = Boolean(data.metadata?.exported_at && data.metadata.exported_at !== '2026-11-10');
  const totalCrashCount = data.primary_crash.length + data.secondary_crash.length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalPhones={data.phones.length}
        totalCrash={totalCrashCount}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentUser={currentUser}
        onLogout={handleLogout}
        isCustomData={isCustomData}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Render Administration Panel */}
        {activeTab === 'admin' ? (
          <AdminPanel
            onDataUpdated={(newData) => setData(newData)}
            currentSession={currentUser}
          />
        ) : data.phones.length === 0 ? (
          /* Empty Database State: Direct user to upload Excel in Admin */
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800 shadow-sm max-w-lg mx-auto my-12 space-y-4 animate-fadeIn">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Welcome to Telecom Directory
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
              No telephone database is loaded yet. As an administrator, navigate to the <strong>Administration</strong> tab to upload your Excel workbook (.xlsx) and initialize the phone directory.
            </p>
            <button
              onClick={() => setActiveTab('admin')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Settings className="w-4 h-4" />
              <span>Go to Administration</span>
            </button>
          </div>
        ) : (
          <>
            {/* Device Types & Metrics Dashboard */}
            <DashboardStats
              totalPhones={data.phones.length}
              deviceStats={deviceStats}
              selectedDeviceType={selectedDeviceType}
              setSelectedDeviceType={setSelectedDeviceType}
              totalCrash={totalCrashCount}
              totalBuildings={buildingsWithCounts.length}
              onOpenBuildingModal={() => setIsBuildingModalOpen(true)}
              onSwitchToCrashTab={() => setActiveTab('crash')}
            />

            {activeTab === 'directory' ? (
              <div>
                {/* Search and Filters */}
                <SearchBar
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  selectedBuilding={selectedBuilding}
                  setSelectedBuilding={setSelectedBuilding}
                  selectedDeviceType={selectedDeviceType}
                  setSelectedDeviceType={setSelectedDeviceType}
                  topBuildings={topBuildings}
                  deviceTypes={deviceTypes}
                  resultCount={filteredPhones.length}
                  totalCount={data.phones.length}
                  onOpenBuildingModal={() => setIsBuildingModalOpen(true)}
                />

                {/* View Mode Switcher */}
                <div className="hidden sm:flex items-center justify-end gap-1 mb-4">
                  <span className="text-xs text-slate-400 mr-2">View:</span>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-colors ${
                      viewMode === 'cards'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    title="Cards View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Cards</span>
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-colors ${
                      viewMode === 'table'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    title="Table View"
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>Table</span>
                  </button>
                </div>

                {/* Results Grid / Table */}
                {filteredPhones.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-800 shadow-sm max-w-md mx-auto my-8">
                    <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
                      <Phone className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      No phones found
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Try searching with a different term, extension, or clear the applied filters.
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedBuilding('');
                        setSelectedDeviceType('');
                      }}
                      className="mt-4 px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-semibold shadow-sm hover:bg-cyan-700 transition-colors"
                    >
                      Reset Search & Filters
                    </button>
                  </div>
                ) : viewMode === 'table' ? (
                  <PhoneTable phones={displayedPhones} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {displayedPhones.map((phone) => (
                      <PhoneCard
                        key={phone.id}
                        phone={phone}
                        onFallbackCopy={(t) => setFallbackCopyText(t)}
                      />
                    ))}
                  </div>
                )}

                {/* Load More Button for Pagination */}
                {visibleCount < filteredPhones.length && (
                  <div className="mt-8 text-center pb-6">
                    <button
                      onClick={handleLoadMore}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 dark:hover:border-cyan-500 text-slate-800 dark:text-slate-200 text-sm font-bold shadow-sm transition-all active:scale-95"
                    >
                      <ChevronDown className="w-4 h-4 text-cyan-500" />
                      <span>
                        Load more ({filteredPhones.length - visibleCount} remaining)
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Emergency / Crash Tab */
              <CrashLinesView
                primaryCrash={data.primary_crash}
                secondaryCrash={data.secondary_crash}
                primaryTitle={data.metadata?.primary_crash_title}
                secondaryTitle={data.metadata?.secondary_crash_title}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-5 right-5 z-20 p-3 rounded-2xl bg-cyan-600/90 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 backdrop-blur-sm active:scale-90 transition-all"
        title="Scroll to top"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

      {/* Modals */}
      <BuildingModal
        isOpen={isBuildingModalOpen}
        onClose={() => setIsBuildingModalOpen(false)}
        buildingsWithCounts={buildingsWithCounts}
        selectedBuilding={selectedBuilding}
        onSelectBuilding={(bldg) => setSelectedBuilding(bldg)}
      />
      <CopyModal
        isOpen={Boolean(fallbackCopyText)}
        onClose={() => setFallbackCopyText(null)}
        textToCopy={fallbackCopyText}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Telecom Directory JTFB Cisco • Official Communications Portal</span>
          <span className="font-mono text-[11px] text-slate-400">
            Administrator: {currentUser.username} | Total Records: {data.phones.length.toLocaleString()}
          </span>
        </div>
      </footer>
    </div>
  );
}
