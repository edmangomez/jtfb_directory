import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Smartphone, Wifi, Download, Check, Copy } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

export default function QRModal({ isOpen, onClose }) {
  const [currentUrl, setCurrentUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    const ok = await copyToClipboard(currentUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Connect from Mobile Phone
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Scan this QR code with your smartphone camera
          </p>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-200 w-fit mx-auto mb-4">
          <QRCodeSVG
            value={currentUrl || 'http://localhost:3000'}
            size={200}
            level="M"
            includeMargin={true}
          />
        </div>

        {/* URL Display with Copy */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono mb-4 text-slate-700 dark:text-slate-300">
          <span className="truncate flex-1">{currentUrl}</span>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 shrink-0 font-sans font-medium text-[11px] inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-start gap-2">
            <Wifi className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
            <span>Make sure your phone is connected to the <strong>same Wi-Fi / intranet</strong> network.</span>
          </div>
          <div className="flex items-start gap-2">
            <Download className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              <strong>Install as Mobile App:</strong> On Android tap browser menu (3 dots) &gt; <em>"Install App"</em>. On iPhone tap Share &gt; <em>"Add to Home Screen"</em>.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
