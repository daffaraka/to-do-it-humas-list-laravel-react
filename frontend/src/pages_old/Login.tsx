"use client";

import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth(res.data.user, res.data.token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal login, periksa koneksi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgPrimary text-textPrimary transition-colors duration-300 p-4">
      <div className="bg-bgSecondary p-8 rounded-3xl shadow-xl w-full max-w-md border border-borderBase">
        <h1 className="text-2xl font-bold mb-6 text-center text-textPrimary">Login Humas & Jaringan</h1>
        
        {error && (
          <div className="bg-red-500/20 text-red-500 p-3 rounded-lg mb-4 text-sm text-center border border-red-500/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-2">Email</label>
            <input 
              type="email" 
              className="w-full bg-white border border-gray-200 dark:bg-bgPrimary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all placeholder-textSecondary/50"
              placeholder="user@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-2">Password</label>
            <input 
              type="password" 
              className="w-full bg-white border border-gray-200 dark:bg-bgPrimary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all placeholder-textSecondary/50"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 border border-indigo-700 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all mt-6 shadow-sm"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
