import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

export default function PhoneTable({ phones }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyRow = async (phone) => {
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

    const ok = await copyToClipboard(details);
    if (ok) {
      setCopiedId(phone.id);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800 whitespace-nowrap">
            <tr>
              <th className="px-3.5 py-3 text-center">Copy</th>
              <th className="px-3.5 py-3">Extension</th>
              <th className="px-3.5 py-3">Caller ID</th>
              <th className="px-3.5 py-3">Organization</th>
              <th className="px-3.5 py-3">Building</th>
              <th className="px-3.5 py-3">Device</th>
              <th className="px-3.5 py-3">Switch / VG</th>
              <th className="px-3.5 py-3">Port</th>
              <th className="px-3.5 py-3">MAC Address</th>
              <th className="px-3.5 py-3">Serial No</th>
              <th className="px-3.5 py-3">Cable</th>
              <th className="px-3.5 py-3">Pair</th>
              <th className="px-3.5 py-3">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {phones.map((p) => {
              const isCopied = copiedId === p.id;
              return (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Single Copy Button per Row */}
                  <td className="px-3 py-2 text-center whitespace-nowrap">
                    <button
                      onClick={() => handleCopyRow(p)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        isCopied
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                      title="Copy all details of this phone"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-white" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* 1. Extension */}
                  <td className="px-3.5 py-2.5 whitespace-nowrap font-mono font-bold text-slate-900 dark:text-white">
                    {p.number}
                  </td>

                  {/* 2. Caller ID */}
                  <td className="px-3.5 py-2.5 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {p.caller_id || '-'}
                  </td>

                  {/* 3. Organization */}
                  <td className="px-3.5 py-2.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {p.organization || '-'}
                  </td>

                  {/* 4. Building */}
                  <td className="px-3.5 py-2.5 whitespace-nowrap">
                    {p.building ? (
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300">
                        {p.building}
                      </span>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">-</span>
                    )}
                  </td>

                  {/* 5. Device */}
                  <td className="px-3.5 py-2.5 whitespace-nowrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      p.device_type?.toLowerCase().includes('analog')
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        : 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300'
                    }`}>
                      {p.device_type || '-'}
                    </span>
                  </td>

                  {/* 6. Switch / VG */}
                  <td className="px-3.5 py-2.5 whitespace-nowrap font-mono text-xs text-slate-600 dark:text-slate-300">
                    {p.cisco_switch || '-'}
                  </td>

                  {/* 7. Port */}
                  <td className="px-3.5 py-2.5 whitespace-nowrap font-mono text-xs text-slate-600 dark:text-slate-300">
                    {p.port || '-'}
                  </td>

                  {/* 8. MAC Address */}
                  <td className="px-3.5 py-2.5 whitespace-nowrap font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                    {p.mac || '-'}
                  </td>

                  {/* 9. Serial No */}
                  <td className="px-3.5 py-2.5 whitespace-nowrap font-mono text-xs text-slate-600 dark:text-slate-400">
                    {p.serial_no || '-'}
                  </td>

                  {/* 10. Cable */}
                  <td className="px-3.5 py-2.5 whitespace-nowrap font-mono text-xs font-medium text-slate-700 dark:text-slate-300">
                    {p.cable || '-'}
                  </td>

                  {/* 11. Pair */}
                  <td className="px-3.5 py-2.5 whitespace-nowrap font-mono text-xs font-medium text-slate-700 dark:text-slate-300">
                    {p.pair || '-'}
                  </td>

                  {/* 12. Remarks */}
                  <td className="px-3.5 py-2.5 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                    {p.remarks || '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
