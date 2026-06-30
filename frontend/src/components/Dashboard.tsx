"use client";

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Plus, Clock } from 'lucide-react';
import { useKanban } from '../store/kanbanStore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useKpiStore } from '../store/kpiStore';

export function Dashboard() {
  const navigate = useNavigate();
  const { boards, fetchBoards, setActiveBoardId, createBoard, isLoading } = useKanban();
  const { kpis, fetchKpis } = useKpiStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newKpiId, setNewKpiId] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchBoards();
    fetchKpis();
  }, [fetchBoards, fetchKpis]);

  if (!mounted) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    await createBoard(newTitle, newDesc, newKpiId || undefined);
    setNewTitle('');
    setNewDesc('');
    setNewKpiId('');
    setIsCreating(false);
  };

  if (isLoading && boards.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-textSecondary">Memuat papan kerja...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-bgPrimary transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-textPrimary">Main Jobs</h1>
            <p className="text-textSecondary text-sm mt-1">Pilih pekerjaan utama untuk melihat To Do List</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            Buat Main Job
          </button>
        </div>

        {isCreating && (
          <form onSubmit={handleCreate} className="bg-bgSecondary border border-borderBase p-6 rounded-xl shadow-sm mb-8 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-lg font-semibold text-textPrimary mb-4">Buat Main Job Baru</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">Judul Pekerjaan</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-bgPrimary border border-borderBase rounded-lg px-4 py-2 text-textPrimary focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Contoh: Pembuatan Aplikasi Jaringan"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">Deskripsi (Opsional)</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-bgPrimary border border-borderBase rounded-lg px-4 py-2 text-textPrimary focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[80px]"
                  placeholder="Tambahkan detail..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">Pilih KPI Induk (Opsional)</label>
                <select
                  value={newKpiId}
                  onChange={(e) => setNewKpiId(e.target.value)}
                  className="w-full bg-bgPrimary border border-borderBase rounded-lg px-4 py-2 text-textPrimary focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- Tanpa KPI --</option>
                  {kpis.map(kpi => (
                    <option key={kpi.id} value={kpi.id}>{kpi.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-textSecondary hover:bg-bgGlass transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Simpan
                </button>
              </div>
            </div>
          </form>
        )}

        {boards.length === 0 && !isCreating ? (
          <div className="text-center py-20 border-2 border-dashed border-borderBase rounded-2xl bg-bgSecondary">
            <FolderKanban className="mx-auto h-12 w-12 text-textSecondary mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-textPrimary">Belum ada Main Job</h3>
            <p className="text-textSecondary text-sm mt-1 mb-4">Mulai dengan membuat Main Job pertama Anda.</p>
            <button
              onClick={() => setIsCreating(true)}
              className="text-indigo-500 hover:text-indigo-600 font-medium text-sm transition-colors"
            >
              + Buat Main Job
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <div
                key={board.id}
                onClick={() => {
                  setActiveBoardId(board.id);
                  navigate(`/board/${board.id}`);
                }}
                className="group cursor-pointer bg-bgSecondary border border-borderBase rounded-xl p-6 hover:shadow-lg hover:border-indigo-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <FolderKanban size={20} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-textPrimary mb-2 group-hover:text-indigo-500 transition-colors line-clamp-2">
                  {board.title}
                </h3>
                {board.description && (
                  <p className="text-sm text-textSecondary line-clamp-2 mb-4">
                    {board.description}
                  </p>
                )}
                <div className="mt-auto pt-4 border-t border-borderBase flex items-center justify-between text-xs text-textSecondary">
                  <div className="flex flex-col gap-2">
                    {board.kpiId && (
                      <div className="flex items-center gap-1.5 text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded w-fit">
                        <span className="font-medium truncate max-w-[150px]">
                          KPI: {kpis.find(k => k.id === board.kpiId)?.title || 'Unknown KPI'}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      <span>Dibuat {format(new Date(board.createdAt), 'dd MMM yyyy', { locale: id })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
