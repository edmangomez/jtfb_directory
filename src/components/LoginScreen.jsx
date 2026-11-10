import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import { loginUser } from '../utils/storage';

export default function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      const res = loginUser(username, password);
      if (res.success) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || 'Invalid credentials');
        setLoading(false);
      }
    }, 250);
  };

  const handleFillDemo = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-slate-100 relative overflow-hidden">
      {/* Background visual accents */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-950/85 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Brand Header with Telecom Logo */}
        <div className="text-center mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-3.5 p-2 rounded-3xl bg-white shadow-xl shadow-cyan-500/10 flex items-center justify-center overflow-hidden border border-slate-200">
            <img src="/logo.jpg" alt="Telecom Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white">
              Telecom <span className="text-cyan-400">Directory</span>
            </h1>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              JTFB Cisco
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Joint Task Force-Bravo • Secure Communications Gateway
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Administrator Username
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                autoFocus
                autoComplete="username"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1 rounded text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <p className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider mb-2 text-center">
            System Administrator Accounts:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleFillDemo('admin', 'admin')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left transition-colors"
            >
              <div className="font-bold text-cyan-400">Chief Admin</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">admin / admin</div>
            </button>

            <button
              type="button"
              onClick={() => handleFillDemo('telecom', 'telecom123')}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left transition-colors"
            >
              <div className="font-bold text-teal-400">Telecom Lead</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">telecom / telecom123</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
