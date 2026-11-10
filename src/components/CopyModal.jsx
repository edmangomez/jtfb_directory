import React, { useRef } from 'react';
import { X, Copy, Check } from 'lucide-react';

export default function CopyModal({ isOpen, onClose, textToCopy }) {
  const textareaRef = useRef(null);
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !textToCopy) return null;

  const handleManualCopy = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
      textareaRef.current.setSelectionRange(0, 999999);
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
          onClose();
        }, 1500);
      } catch (err) {
        // Fallback: user can manually tap copy
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
          Copy Phone Information
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Tap the button below or press and hold the text to copy:
        </p>

        <textarea
          ref={textareaRef}
          value={textToCopy}
          readOnly
          rows={7}
          onClick={(e) => e.target.select()}
          className="w-full p-3 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 mb-4 selection:bg-sky-500 selection:text-white"
        />

        <div className="flex gap-2">
          <button
            onClick={handleManualCopy}
            className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
