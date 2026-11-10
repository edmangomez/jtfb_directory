import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

export default function PhoneCard({ phone, onFallbackCopy }) {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyAll = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const details = [
      `Extension: ${phone.number}`,
      phone.caller_id ? `Caller ID: ${phone.caller_id}` : '',
      phone.organization && phone.organization !== phone.caller_id ? `Organization: ${phone.organization}` : '',
      phone.building ? `Building: ${phone.building}` : '',
      phone.device_type ? `Device: ${phone.device_type}` : '',
      phone.cisco_switch ? `Switch/VG: ${phone.cisco_switch}` : '',
      phone.port ? `Port: ${phone.port}` : '',
      phone.mac ? `MAC Address: ${phone.mac}` : '',
      phone.serial_no ? `Serial No: ${phone.serial_no}` : '',
      phone.cable ? `Cable: ${phone.cable}` : '',
      phone.pair ? `Pair: ${phone.pair}` : '',
      phone.remarks ? `Remarks: ${phone.remarks}` : '',
    ].filter(Boolean).join('\n');

    // Run synchronously on user tap
    const ok = copyToClipboard(details);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else if (onFallbackCopy) {
      onFallbackCopy(details);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
      {/* Top Header Row: Extension, Device, Badges & Single Copy All Button */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Extension Number & Device Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              {phone.number}
            </span>
            {phone.device_type && (
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                phone.device_type.toLowerCase().includes('analog')
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60'
                  : 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900/60'
              }`}>
                {phone.device_type}
              </span>
            )}
          </div>

          {/* Caller ID / Sub Org */}
          <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 truncate mt-1">
            {phone.caller_id || phone.organization || 'Unassigned Name'}
          </h2>

          {/* Org & Building Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {phone.building && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 font-normal">Building:</span> {phone.building}
              </span>
            )}
            {phone.organization && phone.organization !== phone.caller_id && (
              <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                {phone.organization}
              </span>
            )}
          </div>
        </div>

        {/* Single Copy All Info Button */}
        <button
          onClick={handleCopyAll}
          onTouchEnd={handleCopyAll}
          type="button"
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
            copied
              ? 'bg-emerald-600 text-white shadow-emerald-600/20 ring-2 ring-emerald-400'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 active:scale-95'
          }`}
          title="Copy all details of this phone"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Copy Info</span>
            </>
          )}
        </button>
      </div>

      {/* Accordion / Full Details Section */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <span>All Technical Details</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-950/70 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800">
            {/* Cisco Switch / VG */}
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Switch / VG</span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{phone.cisco_switch || '-'}</span>
            </div>

            {/* Port */}
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Port</span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{phone.port || '-'}</span>
            </div>

            {/* MAC Address */}
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 sm:col-span-2">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">MAC Address</span>
              <span className="font-mono font-bold text-sky-600 dark:text-sky-400 tracking-wider">{phone.mac || '-'}</span>
            </div>

            {/* Serial Number */}
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 sm:col-span-2">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Serial No</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{phone.serial_no || '-'}</span>
            </div>

            {/* Cable */}
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cable</span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{phone.cable || '-'}</span>
            </div>

            {/* Pair */}
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Pair</span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{phone.pair || '-'}</span>
            </div>

            {/* Remarks */}
            {phone.remarks && (
              <div className="sm:col-span-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Remarks</span>
                <span className="text-slate-700 dark:text-slate-300">{phone.remarks}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
