"use client";

import React, { useEffect, useState } from 'react';
import { useKpiStore } from '../store/kpiStore';
import { useKanban } from '../store/kanbanStore';
import type { Kpi, Board } from '../types';
import { KpiSkeleton } from '../components/Skeleton';
import { Plus, Edit, Trash2, Calendar, Target, LayoutGrid, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { id as dateFnsIdLocale } from 'date-fns/locale';

import { useAuthStore } from '../store/authStore';

interface KpiDashboardProps {
  viewType?: 'all' | 'me';
}

export const KpiDashboard: React.FC<KpiDashboardProps> = ({ viewType = 'me' }) => {
  const { kpis, fetchKpis, createKpi, updateKpi, deleteKpi, isLoading } = useKpiStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role?.name?.toLowerCase() === 'admin';
  const { boards, fetchBoards } = useKanban();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<Kpi | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetDate: ''
  });

  // Board Modal state
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [targetKpiIdForBoard, setTargetKpiIdForBoard] = useState<string | null>(null);
  const [boardTitle, setBoardTitle] = useState('');
  const [boardDesc, setBoardDesc] = useState('');
  const { createBoard } = useKanban();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchKpis();
    fetchBoards(); // for safety
  }, [fetchKpis, fetchBoards]);

  if (!mounted) return null;

  const handleOpenModal = (kpi?: Kpi) => {
    if (kpi) {
      setEditingKpi(kpi);
      setFormData({
        title: kpi.title,
        description: kpi.description || '',
        targetDate: kpi.targetDate ? new Date(kpi.targetDate).toISOString().split('T')[0] : ''
      });
    } else {
      setEditingKpi(null);
      setFormData({ title: '', description: '', targetDate: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingKpi) {
      await updateKpi(editingKpi.id, formData);
    } else {
      await createKpi(formData);
    }
    setIsModalOpen(false);
    fetchKpis(); // refresh
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus KPI ini?")) {
      await deleteKpi(id);
      fetchKpis(); // refresh
    }
  };

  const handleCreateBoardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardTitle.trim()) return;
    
    await createBoard(boardTitle, boardDesc, targetKpiIdForBoard || undefined);
    setIsBoardModalOpen(false);
    setBoardTitle('');
    setBoardDesc('');
    fetchKpis(); // Refresh to see the new board in the KPI
  };

  const calculateProgress = (boards: Board[]) => {
    if (!boards || boards.length === 0) return 0;
    
    let totalTasks = 0;
    let doneTasks = 0;
    
    boards.forEach(board => {
      const tasks = board.tasks || [];
      totalTasks += tasks.length;
      doneTasks += tasks.filter(t => t.columnId === 'done').length;
    });

    if (totalTasks === 0) return 0;
    return Math.round((doneTasks / totalTasks) * 100);
  };

  const displayKpis = viewType === 'me' ? kpis.filter(k => k.userId === user?.id) : kpis;
  const independentBoards = boards.filter(board => !board.kpiId && !board.kpi_id);

  if (isLoading && kpis.length === 0) return <KpiSkeleton />;

  return (
    <div className="flex-1 overflow-auto p-6 bg-bgPrimary">

      <div className="space-y-8">
        {displayKpis.map(kpi => {
          const progress = calculateProgress(kpi.boards || []);
          const canViewDetails = isAdmin || kpi.userId === user?.id;
          
          return (
            <div key={kpi.id} className="mb-10 bg-bgPrimary rounded-2xl p-6 shadow-sm border border-black/[0.03] dark:border-white/[0.03] hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                    <Target size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-textPrimary">Main Project -  {kpi.title}</h2>
                </div>
                {canViewDetails && (
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(kpi)} className="p-2 text-textSecondary hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all" title="Edit KPI">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(kpi.id)} className="p-2 text-textSecondary hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Hapus KPI">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Boards List */}
              <div>
                {!canViewDetails ? (
                  <div 
                    onClick={() => alert('Anda tidak berada di KPI ini')}
                    className="cursor-pointer bg-bgSecondary/50 border border-border/30 rounded-xl p-6 text-center text-textSecondary hover:bg-bgSecondary transition-colors"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <LayoutGrid size={18} className="opacity-50" />
                      <span className="font-medium text-sm">{kpi.boards?.length || 0} Board(s) Terkunci</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                    {/* Create Board Card */}
                    <div 
                      onClick={() => {
                        setTargetKpiIdForBoard(kpi.id);
                        setIsBoardModalOpen(true);
                      }}
                      className="bg-bgSecondary rounded-xl p-4 border border-border/50 shadow-sm hover:border-indigo-500/30 hover:bg-indigo-500/5 hover:shadow-md transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[140px]"
                    >
                      <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                        <Plus size={20} />
                      </div>
                      <span className="text-sm font-medium text-textSecondary group-hover:text-indigo-500 transition-colors text-center">Tambah Board</span>
                    </div>

                    {kpi.boards && kpi.boards.map(board => {
                      const tasks = board.tasks || [];
                      const todoTasks = tasks.filter((t: any) => t.columnId === 'new').length;
                      const progressTasks = tasks.filter((t: any) => t.columnId === 'progress').length;
                      const doneTasks = tasks.filter((t: any) => t.columnId === 'done').length;

                      return (
                        <div 
                          key={board.id} 
                          onClick={() => navigate(`/board/${board.id}`)}
                          className="bg-bgSecondary rounded-xl p-4 border border-border/30 shadow-sm hover:shadow-[0_4px_12px_-4px_rgba(6,81,237,0.15)] transition-all cursor-pointer group flex flex-col min-h-[140px] transform hover:-translate-y-1"
                        >
                          <div className="mb-3 flex-1">
                            <h5 className="font-semibold text-sm text-textPrimary group-hover:text-indigo-500 transition-all mb-1 line-clamp-2 leading-tight">{board.title}</h5>
                            {board.description && <p className="text-[11px] text-textSecondary line-clamp-1 mt-1">{board.description}</p>}
                            <p className="text-[10px] text-indigo-400 mt-2 font-medium">Oleh: {board.user?.name || 'Sistem'}</p>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-1.5 text-center mt-auto">
                            <div className="bg-bgPrimary rounded-lg p-1.5 shadow-sm border border-black/[0.02] dark:border-white/[0.02]">
                              <div className="text-[10px] text-textSecondary mb-0.5 font-medium tracking-wider">TODO</div>
                              <div className="font-bold text-textPrimary text-sm">{todoTasks}</div>
                            </div>
                            <div className="bg-bgPrimary rounded-lg p-1.5 shadow-sm border border-black/[0.02] dark:border-white/[0.02]">
                              <div className="text-[10px] text-textSecondary mb-0.5 font-medium tracking-wider">PROG</div>
                              <div className="font-bold text-amber-500 text-sm">{progressTasks}</div>
                            </div>
                            <div className="bg-bgPrimary rounded-lg p-1.5 shadow-sm border border-black/[0.02] dark:border-white/[0.02]">
                              <div className="text-[10px] text-textSecondary mb-0.5 font-medium tracking-wider">DONE</div>
                              <div className="font-bold text-emerald-500 text-sm">{doneTasks}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Section for Independent Boards (Boards without KPI) */}
        <div className="mb-10 bg-bgPrimary rounded-2xl p-6 shadow-sm border border-black/[0.03] dark:border-white/[0.03] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white shadow-md shadow-gray-500/20">
                <LayoutGrid size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-textPrimary">Board Tanpa KPI (Proyek Mandiri)</h2>
                <p className="text-xs text-textSecondary mt-0.5">Board yang tidak terkait dengan indikator kinerja (KPI) manapun</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setTargetKpiIdForBoard('');
                setIsBoardModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm shadow-indigo-500/20 flex items-center gap-2"
            >
              <Plus size={16} />
              Buat Board Baru
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {independentBoards.map(board => {
                const tasks = board.tasks || [];
                const todoTasks = tasks.filter((t: any) => t.columnId === 'new').length;
                const progressTasks = tasks.filter((t: any) => t.columnId === 'progress').length;
                const doneTasks = tasks.filter((t: any) => t.columnId === 'done').length;

                return (
                  <div 
                    key={board.id} 
                    onClick={() => navigate(`/board/${board.id}`)}
                    className="bg-bgSecondary rounded-xl p-4 border border-border/30 shadow-sm hover:shadow-[0_4px_12px_-4px_rgba(6,81,237,0.15)] transition-all cursor-pointer group flex flex-col min-h-[140px] transform hover:-translate-y-1"
                  >
                    <div className="mb-3 flex-1">
                      <h5 className="font-semibold text-sm text-textPrimary group-hover:text-indigo-500 transition-all mb-1 line-clamp-2 leading-tight">{board.title}</h5>
                      {board.description && <p className="text-[11px] text-textSecondary line-clamp-1 mt-1">{board.description}</p>}
                      <p className="text-[10px] text-indigo-400 mt-2 font-medium">Oleh: {board.user?.name || 'Sistem'}</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1.5 text-center mt-auto">
                      <div className="bg-bgPrimary rounded-lg p-1.5 shadow-sm border border-black/[0.02] dark:border-white/[0.02]">
                        <div className="text-[10px] text-textSecondary mb-0.5 font-medium tracking-wider">TODO</div>
                        <div className="font-bold text-textPrimary text-sm">{todoTasks}</div>
                      </div>
                      <div className="bg-bgPrimary rounded-lg p-1.5 shadow-sm border border-black/[0.02] dark:border-white/[0.02]">
                        <div className="text-[10px] text-textSecondary mb-0.5 font-medium tracking-wider">PROG</div>
                        <div className="font-bold text-amber-500 text-sm">{progressTasks}</div>
                      </div>
                      <div className="bg-bgPrimary rounded-lg p-1.5 shadow-sm border border-black/[0.02] dark:border-white/[0.02]">
                        <div className="text-[10px] text-textSecondary mb-0.5 font-medium tracking-wider">DONE</div>
                        <div className="font-bold text-emerald-500 text-sm">{doneTasks}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        {displayKpis.length === 0 && independentBoards.length === 0 && !isLoading && (
          <div className="text-center py-20 bg-gradient-to-br from-bgSecondary to-bgPrimary rounded-3xl shadow-sm border border-black/[0.02] dark:border-white/[0.02]">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target size={32} className="text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold text-textPrimary mb-3">Belum ada KPI</h3>
            <p className="text-textSecondary max-w-md mx-auto mb-8">Mulai dengan membuat Key Performance Indicator (KPI) pertama Anda untuk memantau progress seluruh proyek.</p>
            <button 
              onClick={() => handleOpenModal()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all mx-auto flex items-center gap-2 shadow-lg shadow-indigo-500/25"
            >
              <Plus size={18} />
              Buat KPI Sekarang
            </button>
          </div>
        )}
      </div>

      {/* KPI Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bgPrimary rounded-3xl w-full max-w-lg shadow-2xl border border-black/[0.05] dark:border-white/[0.05] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex justify-between items-center p-6 bg-black/[0.02] dark:bg-white/[0.02]">
              <h2 className="text-xl font-bold text-textPrimary">{editingKpi ? 'Edit KPI' : 'Buat KPI Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-black/[0.05] dark:bg-white/[0.05] rounded-full text-textSecondary hover:text-textPrimary hover:bg-black/[0.1] dark:hover:bg-white/[0.1] transition-all">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-7 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-textSecondary mb-2">Judul KPI <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all placeholder-textSecondary/50"
                  placeholder="Contoh: Implementasi Website E-Commerce"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-textSecondary mb-2">Deskripsi Singkat</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all min-h-[120px] placeholder-textSecondary/50 resize-none"
                  placeholder="Jelaskan tujuan dan ruang lingkup KPI ini..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-textSecondary mb-2">Tanggal Target Pencapaian <span className="text-red-400">*</span></label>
                <DatePicker
                  selected={formData.targetDate ? new Date(formData.targetDate) : null}
                  onChange={(date: any) => setFormData({...formData, targetDate: date ? date.toISOString().split('T')[0] : ''})}
                  dateFormat="dd/MM/yyyy"
                  locale={dateFnsIdLocale}
                  placeholderText="dd/mm/yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 placeholder-textSecondary transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-black/[0.03] dark:border-white/[0.03]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-textSecondary bg-white border border-gray-200 hover:bg-gray-50 hover:text-textPrimary rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 border border-indigo-700 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
                >
                  {editingKpi ? 'Simpan Perubahan' : 'Buat KPI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Board Modal */}
      {isBoardModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bgPrimary rounded-3xl w-full max-w-lg shadow-2xl border border-black/[0.05] dark:border-white/[0.05] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex justify-between items-center p-6 bg-black/[0.02] dark:bg-white/[0.02]">
              <h2 className="text-xl font-bold text-textPrimary">Buat Board Baru</h2>
              <button 
                onClick={() => {
                  setIsBoardModalOpen(false);
                  setBoardTitle('');
                  setBoardDesc('');
                }} 
                className="p-2 bg-black/[0.05] dark:bg-white/[0.05] rounded-full text-textSecondary hover:text-textPrimary hover:bg-black/[0.1] dark:hover:bg-white/[0.1] transition-all"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateBoardSubmit} className="p-7 space-y-5">
              {!targetKpiIdForBoard && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-sm text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                  <Target size={16} />
                  <span>Ini adalah Board mandiri tanpa terhubung ke Main Project (KPI) mana pun.</span>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-textSecondary mb-2">Judul Board <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={boardTitle}
                  onChange={(e) => setBoardTitle(e.target.value)}
                  className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all placeholder-textSecondary/50"
                  placeholder="Contoh: Desain Antarmuka Aplikasi"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-textSecondary mb-2">Deskripsi (Opsional)</label>
                <textarea
                  value={boardDesc}
                  onChange={(e) => setBoardDesc(e.target.value)}
                  className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all min-h-[120px] placeholder-textSecondary/50 resize-none"
                  placeholder="Tambahkan detail proyek..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-black/[0.03] dark:border-white/[0.03]">
                <button
                  type="button"
                  onClick={() => {
                    setIsBoardModalOpen(false);
                    setBoardTitle('');
                    setBoardDesc('');
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-textSecondary bg-white border border-gray-200 hover:bg-gray-50 hover:text-textPrimary rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!boardTitle.trim()}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 border border-indigo-700 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all"
                >
                  Buat Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
