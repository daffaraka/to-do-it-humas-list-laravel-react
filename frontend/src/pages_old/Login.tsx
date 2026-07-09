"use client";

import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import api from "../lib/api";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      setAuth(res.data.user, res.data.token);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal login, periksa koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center bg-gray-500 justify-center text-textPrimary transition-colors duration-300 p-4">
      <div className="bg-bgSecondary p-8 rounded-xl shadow-2xl w-full max-w-md border-2 border-gray-400">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-700 tracking-tight mb-2">
            Selamat Datang
          </h1>
          <p className="text-sm font-medium text-textSecondary">
            Portal Manajemen Humas & Jaringan
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-500 p-3 rounded-lg mb-4 text-sm text-center border border-red-500/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-textPrimary mb-2">
              Alamat Email
            </label>
            <input
              type="email"
              className="w-full bg-white border border-gray-200 dark:bg-bgPrimary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50 focus:border-indigo-500 transition-all placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="user@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-textPrimary mb-2">
              Kata Sandi
            </label>
            <input
              type="password"
              className="w-full bg-white border border-gray-200 dark:bg-bgPrimary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50 focus:border-indigo-500 transition-all placeholder-gray-400 dark:placeholder-gray-500"
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
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
