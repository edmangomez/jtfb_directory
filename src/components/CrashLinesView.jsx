import React, { useState, useMemo } from 'react';
import { ShieldAlert, Radio, Zap, Search, X, Check, Copy } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

export default function CrashLinesView({ primaryCrash, secondaryCrash, primaryTitle, secondaryTitle }) {
  const [crashSearch, setCrashSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const handleCopySecondary = async (line) => {
    const details = [
      `System: Secondary Crash Line`,
      `Extension: ${line.number}`,
      `Caller ID: ${line.caller_id}`,
      `Building: ${line.building}`,
      line.device_type ? `Device: ${line.device_type}` : '',
      line.cisco_switch ? `Switch/VG: ${line.cisco_switch}` : '',
      line.port ? `Port: ${line.port}` : '',
      line.cable ? `Cable: ${line.cable}` : '',
      line.pair ? `Pair: ${line.pair}` : '',
      line.remarks ? `Remarks: ${line.remarks}` : '',
    ].filter(Boolean).join('\n');

    const ok = await copyToClipboard(details);
    if (ok) {
      setCopiedId(line.id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  const handleCopyPrimary = async (item) => {
    const details = [
      `System: Primary Crash ETVS Circuit`,
      `Destination: ${item.remarks}`,
      `Dest Building: ${item.building}`,
      `Jumper: ${item.jumper}`,
      `Origin (D-11): Cable ${item.cable_source} : Pair ${item.pair_source}`,
      `Destination: Cable ${item.cable_dest} : Pair ${item.pair_dest}`,
    ].filter(Boolean).join('\n');

    const ok = await copyToClipboard(details);
    if (ok) {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  const handleCopyConf = async () => {
    const ok = await copyToClipboard('Secondary Crash Conference Extension: 5903');
    if (ok) {
      setCopiedId('conf_5903');
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  // Filter both crash sections with search query
  const { filteredSec, filteredPri } = useMemo(() => {
    const q = crashSearch.trim().toLowerCase();
    if (!q) {
      return { filteredSec: secondaryCrash, filteredPri: primaryCrash };
    }

    const sec = secondaryCrash.filter((line) => {
      return (
        line.number?.toLowerCase().includes(q) ||
        line.caller_id?.toLowerCase().includes(q) ||
        line.building?.toLowerCase().includes(q) ||
        line.cisco_switch?.toLowerCase().includes(q) ||
        line.port?.toLowerCase().includes(q) ||
        line.cable?.toLowerCase().includes(q) ||
        String(line.pair)?.toLowerCase().includes(q) ||
        line.remarks?.toLowerCase().includes(q)
      );
    });

    const pri = primaryCrash.filter((item) => {
      return (
        item.remarks?.toLowerCase().includes(q) ||
        item.building?.toLowerCase().includes(q) ||
        item.origin?.toLowerCase().includes(q) ||
        item.jumper?.toLowerCase().includes(q) ||
        item.cable_source?.toLowerCase().includes(q) ||
        String(item.pair_source)?.toLowerCase().includes(q) ||
        item.cable_dest?.toLowerCase().includes(q) ||
        String(item.pair_dest)?.toLowerCase().includes(q)
      );
    });

    return { filteredSec: sec, filteredPri: pri };
  }, [secondaryCrash, primaryCrash, crashSearch]);

  const totalMatches = filteredSec.length + filteredPri.length;

  return (
    <div className="space-y-6">
      {/* Emergency Banner Header */}
      <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-rose-900/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shrink-0">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded-full inline-block mb-1">
                Emergency & Critical Alert Lines
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                JTFB Base Emergency Systems
              </h2>
            </div>
          </div>

          {/* Quick Copy 5903 Conference Info */}
          <button
            onClick={handleCopyConf}
            className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black shadow-lg transition-all text-sm sm:text-base ${
              copiedId === 'conf_5903'
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                : 'bg-white text-rose-700 hover:bg-rose-50 active:scale-95'
            }`}
          >
            {copiedId === 'conf_5903' ? (
              <>
                <Check className="w-5 h-5 text-white" />
                <span>Copied 5903 Info!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 text-rose-600" />
                <span>Crash Conference: Ext 5903</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Crash Search Input */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-rose-200 dark:border-rose-900/40 shadow-sm">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-rose-400" />
          <input
            type="text"
            value={crashSearch}
            onChange={(e) => setCrashSearch(e.target.value)}
            placeholder="Search crash lines (e.g. 5903, BASE OPS, FIRE DEPT, Building, Switch, Port, Cable)..."
            className="w-full pl-11 pr-10 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          {crashSearch && (
            <button
              onClick={() => setCrashSearch('')}
              className="absolute right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {crashSearch && (
          <div className="mt-2 text-xs text-rose-600 dark:text-rose-400 flex items-center justify-between font-medium">
            <span>Found {totalMatches} matching emergency lines</span>
            <button
              onClick={() => setCrashSearch('')}
              className="hover:underline text-[11px]"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {totalMatches === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border border-slate-200 dark:border-slate-800 shadow-sm max-w-md mx-auto my-6">
          <ShieldAlert className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
            No crash lines match your search
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Try searching by extension, department name or clear the search.
          </p>
          <button
            onClick={() => setCrashSearch('')}
            className="mt-3 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold"
          >
            Reset Crash Search
          </button>
        </div>
      )}

      {/* Section 1: Secondary Crash Lines */}
      {filteredSec.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3.5">
            <Radio className="w-5 h-5 text-rose-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {secondaryTitle || 'Secondary Crash Conference: Customer calls to 5903'}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold">
              {filteredSec.length} Alternate Extensions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredSec.map((line) => {
              const isCopied = copiedId === line.id;
              return (
                <div
                  key={line.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-rose-200 dark:border-rose-900/40 shadow-sm hover:border-rose-400 dark:hover:border-rose-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xl font-black text-rose-600 dark:text-rose-400">
                          {line.number}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
                          Crash
                        </span>
                      </div>

                      {/* Single Copy Button */}
                      <button
                        onClick={() => handleCopySecondary(line)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isCopied
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                        }`}
                        title="Copy all details of this crash line"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Info</span>
                          </>
                        )}
                      </button>
                    </div>

                    <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-2 truncate">
                      {line.caller_id}
                    </h4>

                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300">
                        Building: <strong className="font-semibold">{line.building}</strong>
                      </span>
                      {line.device_type && (
                        <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                          {line.device_type}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Technical wiring details */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 grid grid-cols-2 gap-2 font-mono">
                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950">
                      <span className="text-[9px] text-slate-400 block uppercase font-sans">Switch / Port</span>
                      <span className="truncate block font-semibold">{line.cisco_switch ? `${line.cisco_switch} (${line.port})` : line.port || '-'}</span>
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950">
                      <span className="text-[9px] text-slate-400 block uppercase font-sans">Cable / Pair</span>
                      <span className="font-semibold">{line.cable} / {line.pair}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 2: Primary Crash System (ETVS) */}
      {filteredPri.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-3.5">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {primaryTitle || 'Primary Crash System : ETVS from D-11'}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold">
              {filteredPri.length} Hardwired Circuits
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredPri.map((item) => {
              const isCopied = copiedId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-amber-200 dark:border-amber-900/40 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        ETVS Circuit
                      </span>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {item.remarks || 'Circuit'}
                      </h4>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Dest Building: <strong className="font-semibold text-slate-800 dark:text-slate-200">{item.building}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold">
                        Jumper: {item.jumper || 'OCP'}
                      </span>
                      <button
                        onClick={() => handleCopyPrimary(item)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          isCopied
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 hover:bg-amber-200'
                        }`}
                        title="Copy all circuit details"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-white" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Cable Routing details */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase font-sans">Origin (D-11)</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {item.cable_source || '-'} : {item.pair_source || '-'}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase font-sans">Destination</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {item.cable_dest || '-'} : {item.pair_dest || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
