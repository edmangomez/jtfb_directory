import React, { useState } from 'react';
import { X, FileSpreadsheet, Lock, UploadCloud, AlertCircle, CheckCircle2, RotateCcw, KeyRound } from 'lucide-react';
import { parseExcelFile } from '../utils/excelParser';
import { getAdminPin, setAdminPin, saveData, resetToDefault } from '../utils/storage';

export default function UpdateModal({ isOpen, onClose, onDataUpdated }) {
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState('');
  
  // File upload state
  const [parsedPreview, setParsedPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Change PIN mode
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState('');

  if (!isOpen) return null;

  const handleVerifyPin = (e) => {
    e.preventDefault();
    const correctPin = getAdminPin();
    if (pinInput.trim() === correctPin) {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Incorrect PIN. Default PIN is 1234.');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setUploadError('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }

    setIsProcessing(true);
    setUploadError('');
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target.result;
        const result = parseExcelFile(buffer);
        if (result.phones.length === 0) {
          setUploadError('No valid phones found in the "Phone Database" sheet.');
          setParsedPreview(null);
        } else {
          setParsedPreview(result);
        }
      } catch (err) {
        console.error(err);
        setUploadError('Error parsing Excel: ' + (err.message || 'Unknown format'));
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmSave = () => {
    if (!parsedPreview) return;
    const ok = saveData(parsedPreview);
    if (ok) {
      setSuccessMsg('Directory updated successfully!');
      onDataUpdated(parsedPreview);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } else {
      setUploadError('Could not save data to browser local storage.');
    }
  };

  const handleResetFactory = () => {
    if (window.confirm('Are you sure you want to restore the default factory directory?')) {
      const def = resetToDefault();
      onDataUpdated(def);
      setSuccessMsg('Restored to factory original data.');
      setTimeout(() => {
        handleClose();
      }, 1200);
    }
  };

  const handleChangePin = (e) => {
    e.preventDefault();
    if (newPin.length < 4) {
      setPinChangeMsg('PIN must be at least 4 characters long.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinChangeMsg('PINs do not match.');
      return;
    }
    setAdminPin(newPin);
    setPinChangeMsg('PIN changed successfully.');
    setIsChangingPin(false);
    setNewPin('');
    setConfirmPin('');
  };

  const handleClose = () => {
    setPinInput('');
    setIsAuthenticated(false);
    setPinError('');
    setParsedPreview(null);
    setFileName('');
    setUploadError('');
    setSuccessMsg('');
    setIsChangingPin(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Update Excel Database
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload an updated .xlsx file to refresh the phone directory
            </p>
          </div>
        </div>

        {/* Step 1: PIN Authentication */}
        {!isAuthenticated ? (
          <form onSubmit={handleVerifyPin} className="space-y-4 py-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 text-center">
              <Lock className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Administrator PIN Required
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                To prevent accidental overwrites, enter the administrator PIN.
              </p>
              <p className="text-[11px] text-sky-600 dark:text-sky-400 font-mono mt-1 font-medium">
                (Default PIN: 1234)
              </p>
            </div>

            <div>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter PIN (e.g. 1234)"
                autoFocus
                className="w-full px-4 py-3 text-center text-lg tracking-widest font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {pinError && (
                <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1 justify-center">
                  <AlertCircle className="w-3.5 h-3.5" /> {pinError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              Unlock and Continue
            </button>
          </form>
        ) : (
          /* Step 2: Upload Excel and Options */
          <div className="space-y-4">
            {successMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-center text-emerald-800 dark:text-emerald-300 font-medium text-sm flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            ) : (
              <>
                {/* Upload Zone */}
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-950/40">
                  <input
                    type="file"
                    id="excelInput"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="excelInput" className="cursor-pointer block">
                    <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block">
                      Click to choose or drag & drop Excel file (.xlsx)
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                      Must contain sheets: "Phone Database", "Primary Crash", "Secondary Crash"
                    </span>
                  </label>
                </div>

                {uploadError && (
                  <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {uploadError}
                  </p>
                )}

                {/* Parsed Preview */}
                {parsedPreview && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                      <span>File: {fileName}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100">
                        Valid Schema
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
                      <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900">
                        <span className="text-[10px] text-slate-400 block font-sans">Phones</span>
                        <strong className="text-base text-emerald-600 dark:text-emerald-400">
                          {parsedPreview.phones.length}
                        </strong>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900">
                        <span className="text-[10px] text-slate-400 block font-sans">Primary Crash</span>
                        <strong className="text-base text-amber-600 dark:text-amber-400">
                          {parsedPreview.primary_crash.length}
                        </strong>
                      </div>
                      <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900">
                        <span className="text-[10px] text-slate-400 block font-sans">Secondary Crash</span>
                        <strong className="text-base text-rose-600 dark:text-rose-400">
                          {parsedPreview.secondary_crash.length}
                        </strong>
                      </div>
                    </div>

                    <button
                      onClick={handleConfirmSave}
                      className="w-full mt-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
                    >
                      Apply and Save Changes
                    </button>
                  </div>
                )}

                {/* Additional Options (Change PIN / Reset Factory) */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <button
                    onClick={() => setIsChangingPin(!isChangingPin)}
                    className="inline-flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-sky-500" />
                    <span>Change PIN</span>
                  </button>

                  <button
                    onClick={handleResetFactory}
                    className="inline-flex items-center gap-1 text-rose-500 hover:text-rose-600 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Factory Data</span>
                  </button>
                </div>

                {isChangingPin && (
                  <form onSubmit={handleChangePin} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl space-y-2 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block">New PIN:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="password"
                        placeholder="New PIN"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                      />
                      <input
                        type="password"
                        placeholder="Confirm PIN"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                      />
                    </div>
                    {pinChangeMsg && (
                      <p className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">{pinChangeMsg}</p>
                    )}
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-semibold"
                    >
                      Save New PIN
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
