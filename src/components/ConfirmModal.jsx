import React from 'react';
import { AlertTriangle, HelpCircle, X, Check } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger' // 'danger' | 'warning' | 'info'
}) {
  if (!isOpen) return null;

  const colorStyles = {
    danger: {
      iconBg: 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400',
      btn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
    },
    warning: {
      iconBg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
    },
    info: {
      iconBg: 'bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400',
      btn: 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20'
    }
  };

  const style = colorStyles[type] || colorStyles.danger;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl ${style.iconBg} flex items-center justify-center shrink-0`}>
            {type === 'info' ? <HelpCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div className="flex-1 pr-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 ${style.btn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
