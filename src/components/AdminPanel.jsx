import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Users,
  UserPlus,
  Trash2,
  Edit3,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Shield,
  History,
  Download,
  HardDriveDownload,
  Clock,
  ArrowRight
} from 'lucide-react';
import { parseExcelFile } from '../utils/excelParser';
import {
  saveData,
  resetToDefault,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getVersions,
  addVersion,
  restoreVersion,
  exportCompleteSystemBackup,
  importCompleteSystemBackup
} from '../utils/storage';
import ConfirmModal from './ConfirmModal';
import EditUserModal from './EditUserModal';

export default function AdminPanel({ onDataUpdated, currentSession }) {
  const [activeAdminTab, setActiveAdminTab] = useState('database'); // 'database' | 'users' | 'backup'

  // Database upload state
  const [parsedPreview, setParsedPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [dbError, setDbError] = useState('');
  const [dbSuccess, setDbSuccess] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Version History state
  const [versionsList, setVersionsList] = useState(() => getVersions());

  // User management state
  const [usersList, setUsersList] = useState(() => getUsers());
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  // Backup & Disaster Recovery state
  const [backupSuccess, setBackupSuccess] = useState('');
  const [backupError, setBackupError] = useState('');

  // In-App Confirm Modal State (replaces browser confirm)
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    type: 'danger',
    action: () => {}
  });

  const openConfirm = (title, message, action, type = 'danger', confirmText = 'Confirm') => {
    setConfirmConfig({
      isOpen: true,
      title,
      message,
      confirmText,
      type,
      action
    });
  };

  // --- Excel Upload & Versioning ---

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setDbError('Please upload a valid Excel spreadsheet (.xlsx or .xls)');
      return;
    }

    setIsProcessing(true);
    setDbError('');
    setDbSuccess('');
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target.result;
        const result = parseExcelFile(buffer);
        if (result.phones.length === 0) {
          setDbError('No valid telephone entries found in "Phone Database" sheet.');
          setParsedPreview(null);
        } else {
          setParsedPreview(result);
        }
      } catch (err) {
        console.error(err);
        setDbError('Failed to parse Excel file: ' + (err.message || 'Unknown structure'));
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleApplyDatabase = () => {
    if (!parsedPreview) return;
    const ok = saveData(parsedPreview);
    if (ok) {
      // Save version snapshot log
      addVersion(fileName, parsedPreview, currentSession?.username || 'admin');
      setVersionsList(getVersions());

      setDbSuccess('Phone directory database successfully updated and version logged!');
      onDataUpdated(parsedPreview);
      setParsedPreview(null);
      setFileName('');
      setTimeout(() => setDbSuccess(''), 4500);
    } else {
      setDbError('Could not save database to storage.');
    }
  };

  const handleRestoreVersionClick = (ver) => {
    openConfirm(
      `Load Version ${ver.versionNumber}?`,
      `Are you sure you want to load version "${ver.fileName}" (${ver.totalPhones} phones, uploaded by ${ver.uploadedBy} on ${ver.timestamp})? The current directory will be updated with this snapshot.`,
      () => {
        const restored = restoreVersion(ver.id);
        if (restored) {
          onDataUpdated(restored);
          setDbSuccess(`Directory successfully restored to Version ${ver.versionNumber} (${ver.fileName})!`);
          setTimeout(() => setDbSuccess(''), 4500);
        } else {
          setDbError('Could not restore the selected version data.');
        }
      },
      'info',
      'Load This Version'
    );
  };

  const handleResetFactoryClick = () => {
    openConfirm(
      'Revert to Factory Defaults?',
      'Are you sure you want to revert the entire phone directory back to the initial factory database (1,609 extensions)? Any uploaded custom changes will be replaced.',
      () => {
        const def = resetToDefault();
        onDataUpdated(def);
        setDbSuccess('Directory reverted to factory original data.');
        setParsedPreview(null);
        setTimeout(() => setDbSuccess(''), 4500);
      },
      'danger',
      'Revert Everything'
    );
  };

  // --- User Management (All Administrators) ---

  const handleCreateUser = (e) => {
    e.preventDefault();
    setUserError('');
    setUserSuccess('');

    if (!newUsername.trim()) {
      setUserError('Username is required.');
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setUserError('Password must be at least 4 characters long.');
      return;
    }

    const res = createUser({
      username: newUsername,
      name: newName,
      password: newPassword
    });

    if (res.success) {
      setUserSuccess(`Administrator account "${res.user.username}" created successfully!`);
      setUsersList(getUsers());
      setNewUsername('');
      setNewName('');
      setNewPassword('');
      setTimeout(() => setUserSuccess(''), 3500);
    } else {
      setUserError(res.error || 'Failed to create user');
    }
  };

  const handleSaveEditUser = (userId, updatedFields) => {
    const res = updateUser(userId, updatedFields);
    if (res.success) {
      setUsersList(getUsers());
      setUserSuccess(`Administrator "${res.user.username}" updated successfully!`);
      setTimeout(() => setUserSuccess(''), 3500);
    }
    return res;
  };

  const handleDeleteUserClick = (userId, username) => {
    if (userId === currentSession?.id) {
      setUserError('You cannot delete your own currently logged-in account.');
      return;
    }

    openConfirm(
      'Delete Administrator Account?',
      `Are you sure you want to permanently delete administrator "${username}"? They will no longer have access to the system.`,
      () => {
        const res = deleteUser(userId);
        if (res.success) {
          setUsersList(getUsers());
          setUserSuccess(`Administrator "${username}" was removed.`);
          setTimeout(() => setUserSuccess(''), 3000);
        } else {
          setUserError(res.error || 'Could not delete user');
        }
      },
      'danger',
      'Delete Account'
    );
  };

  // --- Disaster Recovery / Complete System Backup & Restore ---

  const handleDownloadBackup = () => {
    try {
      const backupJson = exportCompleteSystemBackup();
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      a.href = url;
      a.download = `Telecom_JTFB_System_Backup_${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupSuccess('Complete system backup downloaded successfully!');
      setTimeout(() => setBackupSuccess(''), 4000);
    } catch (err) {
      setBackupError('Failed to generate backup: ' + err.message);
    }
  };

  const handleRestoreBackupFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      openConfirm(
        'Restore Complete System Backup?',
        `Loading backup file "${file.name}". This will restore the phone directory, all version snapshots, and administrator accounts. Continue?`,
        () => {
          const res = importCompleteSystemBackup(content);
          if (res.success) {
            onDataUpdated(res.data);
            setUsersList(getUsers());
            setVersionsList(getVersions());
            setBackupSuccess(
              `System successfully restored! (${res.totalPhones} phones, ${res.usersRestored} admin accounts, ${res.versionsRestored} versions).`
            );
            setTimeout(() => setBackupSuccess(''), 5000);
          } else {
            setBackupError(res.error || 'Failed to restore backup.');
          }
        },
        'warning',
        'Restore System'
      );
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Admin Panel Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 inline-block mb-1">
              Telecom Administration Center
            </span>
            <h2 className="text-xl sm:text-2xl font-black">
              System Control & Data Versioning
            </h2>
          </div>
        </div>

        {/* Sub-tabs switch */}
        <div className="flex bg-slate-800/80 p-1 rounded-2xl border border-slate-700/80 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveAdminTab('database')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeAdminTab === 'database'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel & Versions ({versionsList.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('users')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeAdminTab === 'users'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Administrators ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('backup')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeAdminTab === 'backup'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>System Backup & Restore</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Excel Database Management & Version Logs */}
      {activeAdminTab === 'database' && (
        <div className="space-y-6">
          {/* Upload Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                <span>Upload Updated Excel Workbook</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Upload a new .xlsx file to refresh the directory. Every upload is automatically logged in the version history below.
              </p>
            </div>

            {dbSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm font-semibold flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>{dbSuccess}</span>
              </div>
            )}

            {dbError && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-sm font-semibold flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <span>{dbError}</span>
              </div>
            )}

            {/* Upload Dropzone */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 rounded-3xl p-7 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-950/50">
              <input
                type="file"
                id="adminExcelUpload"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="adminExcelUpload" className="cursor-pointer block space-y-2">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block">
                  Click to browse or drag & drop your updated Excel file (.xlsx)
                </span>
                <span className="text-xs text-slate-400 block">
                  Required sheets: "Phone Database", "Primary Crash", "Secondary Crash"
                </span>
              </label>
            </div>

            {/* Parsed Preview Card */}
            {parsedPreview && (
              <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between text-sm text-emerald-800 dark:text-emerald-300 font-bold">
                  <span>File: {fileName}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 text-xs">
                    Ready to Save
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900">
                    <span className="text-xs text-slate-400 block">Extensions</span>
                    <strong className="text-xl text-emerald-600 dark:text-emerald-400">
                      {parsedPreview.phones.length.toLocaleString()}
                    </strong>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900">
                    <span className="text-xs text-slate-400 block">Primary Crash</span>
                    <strong className="text-xl text-amber-600 dark:text-amber-400">
                      {parsedPreview.primary_crash.length}
                    </strong>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900">
                    <span className="text-xs text-slate-400 block">Secondary Crash</span>
                    <strong className="text-xl text-rose-600 dark:text-rose-400">
                      {parsedPreview.secondary_crash.length}
                    </strong>
                  </div>
                </div>

                <button
                  onClick={handleApplyDatabase}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Save and Log New Version</span>
                </button>
              </div>
            )}
          </div>

          {/* Version History & Upload Logs */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-cyan-500" />
                  <span>Version History & Upload Logs ({versionsList.length})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Every uploaded Excel file is preserved here. You can rollback or load any previous version at any time.
                </p>
              </div>

              <button
                onClick={handleResetFactoryClick}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900 transition-colors inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Factory (v1)</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {versionsList.map((ver, idx) => (
                <div
                  key={ver.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    idx === 0
                      ? 'bg-cyan-50/50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800'
                      : 'bg-slate-50/70 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      v{ver.versionNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {ver.fileName}
                        </span>
                        {idx === 0 && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                            Latest Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Clock className="w-3.5 h-3.5" /> {ver.timestamp}
                        </span>
                        <span>•</span>
                        <span>By: <strong>{ver.uploadedBy}</strong></span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {ver.totalPhones.toLocaleString()} phones ({ver.primaryCrash + ver.secondaryCrash} crash lines)
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRestoreVersionClick(ver)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-700 hover:border-cyan-300 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Load this Version</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Administrator Accounts Management */}
      {activeAdminTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Admin Form */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm h-fit space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-500" />
                <span>Create Administrator</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                All accounts have administrator control
              </p>
            </div>

            {userSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{userSuccess}</span>
              </div>
            )}

            {userError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{userError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. telecom_admin"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Full Name / Role Title
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Communications Chief"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 4 characters"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Administrator</span>
              </button>
            </form>
          </div>

          {/* Administrators List Table */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-500" />
                  <span>Authorized Administrators ({usersList.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Accounts with full privileges to manage the directory and system
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800 whitespace-nowrap">
                  <tr>
                    <th className="px-3.5 py-2.5">Username</th>
                    <th className="px-3.5 py-2.5">Name / Title</th>
                    <th className="px-3.5 py-2.5">Role</th>
                    <th className="px-3.5 py-2.5">Created</th>
                    <th className="px-3.5 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {usersList.map((u) => {
                    const isSelf = u.id === currentSession?.id;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="px-3.5 py-3 font-mono font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-1.5">
                            <span>{u.username}</span>
                            {isSelf && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-sans">
                                (You)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3.5 py-3 text-slate-700 dark:text-slate-300 font-medium">
                          {u.name || '-'}
                        </td>
                        <td className="px-3.5 py-3">
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-900">
                            Administrator
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-slate-400 text-[11px] font-mono">
                          {u.createdAt || '-'}
                        </td>
                        <td className="px-3.5 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditingUser(u)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 transition-colors"
                              title="Edit user / Change password"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {!isSelf && (
                              <button
                                onClick={() => handleDeleteUserClick(u.id, u.username)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Disaster Recovery / Complete System Backup & Restore */}
      {activeAdminTab === 'backup' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-cyan-500" />
              <span>Disaster Recovery: System Backup & Restore</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Export a complete backup file to protect your system against crashes, browser data loss, or to migrate to another computer or server.
            </p>
          </div>

          {backupSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm font-semibold flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>{backupSuccess}</span>
            </div>
          )}

          {backupError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-sm font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>{backupError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Backup Card */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-3">
                  <Download className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Export System Backup
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Downloads a complete JSON snapshot containing all 1,600+ phone extensions, emergency circuits, all version history logs, and administrator credentials.
                </p>
              </div>

              <button
                onClick={handleDownloadBackup}
                className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Full Backup (.json)</span>
              </button>
            </div>

            {/* Import / Restore Backup Card */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                  <HardDriveDownload className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Restore System from Backup
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Select a previously downloaded backup (.json) file to restore the entire directory and all settings in case the system was wiped or reset.
                </p>
              </div>

              <div>
                <input
                  type="file"
                  id="systemBackupUpload"
                  accept=".json"
                  onChange={handleRestoreBackupFile}
                  className="hidden"
                />
                <label
                  htmlFor="systemBackupUpload"
                  className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <HardDriveDownload className="w-4 h-4" />
                  <span>Choose Backup File to Restore</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-App Custom Confirm Modal (Replaces browser window.confirm) */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.action}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        type={confirmConfig.type}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onSave={handleSaveEditUser}
      />
    </div>
  );
}
