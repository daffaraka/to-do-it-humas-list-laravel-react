"use client";

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Plus, Clock } from 'lucide-react';
import { useKanban } from '../store/kanbanStore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useKpiStore } from '../store/kpiStore';
import { DashboardSkeleton } from './Skeleton';

export function Dashboard() {
  const navigate = useNavigate();
  const { boards, fetchBoards, setActiveBoardId, createBoard, isLoading } = useKanban();
  const { kpis, fetchKpis } = useKpiStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newKpiId, setNewKpiId] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
    fetchBoards();
    fetchKpis();
  }, [fetchBoards, fetchKpis]);

  if (!mounted) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi Front-end
    const newErrors: Record<string, string> = {};
    if (!newTitle.trim()) newErrors.title = "Judul pekerjaan wajib diisi";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrors({});

    try {
      await createBoard(newTitle.trim(), newDesc.trim(), newKpiId || undefined);
      setNewTitle('');
      setNewDesc('');
      setNewKpiId('');
      setIsCreating(false);
    } catch (err: any) {
      console.error("Failed to create board", err);
      if (err.response?.data?.errors) {
        const apiErrors: Record<string, string> = {};
        Object.keys(err.response.data.errors).forEach(key => {
          apiErrors[key] = err.response.data.errors[key][0];
        });
        setErrors(apiErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && boards.length === 0) {
    return <DashboardSkeleton />;
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
                <label className="block text-sm font-medium text-textSecondary mb-1">Judul Pekerjaan <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (errors.title) setErrors({...errors, title: ''});
                  }}
                  className={`w-full bg-bgPrimary border rounded-lg px-4 py-2 text-textPrimary focus:outline-none focus:ring-1 transition-all ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-borderBase focus:border-indigo-500 focus:ring-indigo-500'}`}
                  placeholder="Contoh: Pembuatan Aplikasi Jaringan"
                  autoFocus
                />
                {errors.title && <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1">Deskripsi (Opsional)</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => {
                    setNewDesc(e.target.value);
                    if (errors.description) setErrors({...errors, description: ''});
                  }}
                  className={`w-full bg-bgPrimary border rounded-lg px-4 py-2 text-textPrimary focus:outline-none focus:ring-1 min-h-[80px] transition-all ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-borderBase focus:border-indigo-500 focus:ring-indigo-500'}`}
                  placeholder="Tambahkan detail..."
                />
                {errors.description && <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1">{errors.description}</p>}
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
                  disabled={isSubmitting}
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-textSecondary bg-transparent border-2 border-gray-300 hover:border-gray-400 hover:bg-bgGlass transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-lg text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center min-w-[120px] cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan"
                  )}
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
