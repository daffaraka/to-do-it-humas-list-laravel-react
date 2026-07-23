"use client";

import React, { useEffect, useState } from "react";
import { useKpiStore } from "../store/kpiStore";
import { useKanban } from "../store/kanbanStore";
import type { Kpi, Board } from "../types";
import { KpiSkeleton } from "../components/Skeleton";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Target,
  LayoutGrid,
  X,
  Briefcase,
  Filter,
  ChevronDown,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { differenceInDays, startOfDay, format } from "date-fns";
import { id as dateFnsIdLocale } from "date-fns/locale";

import { useAuthStore } from "../store/authStore";
import api from "../lib/api";
interface KpiDashboardProps {
  viewType?: "all" | "me";
}

const getDaysRemaining = (dateString: string) => {
  const target = startOfDay(new Date(dateString));
  const now = startOfDay(new Date());
  const diff = differenceInDays(target, now);
  
  if (diff < 0) {
    return { text: `Terlewat ${Math.abs(diff)} hari`, isOverdue: true };
  } else if (diff === 0) {
    return { text: `Batas waktu hari ini`, isOverdue: false };
  } else {
    return { text: `Sisa waktu ${diff} hari`, isOverdue: false };
  }
};

export const KpiDashboard: React.FC<KpiDashboardProps> = ({
  viewType = "me",
}) => {
  const { kpis, fetchKpis, createKpi, updateKpi, deleteKpi, isLoading } =
    useKpiStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role?.name?.toLowerCase() === "admin";
  const { boards, fetchBoards } = useKanban();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState<Kpi | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetDate: "",
  });

  // Board Modal state
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [targetKpiIdForBoard, setTargetKpiIdForBoard] = useState<string | null>(
    null,
  );
  const [boardType, setBoardType] = useState<"kpi" | "non-kpi">("non-kpi");
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [boardTitle, setBoardTitle] = useState("");
  const [boardDesc, setBoardDesc] = useState("");
  const [boardStartDate, setBoardStartDate] = useState("");
  const [boardTargetDate, setBoardTargetDate] = useState("");
  const [boardKondisiAktual, setBoardKondisiAktual] = useState("");
  const [boardTargetAkhirTahun, setBoardTargetAkhirTahun] = useState("");
  const [boardOutputAkhir, setBoardOutputAkhir] = useState("");
  const [boardPrioritas, setBoardPrioritas] = useState("");
  const [kategoriProgramIdForBoard, setKategoriProgramIdForBoard] = useState<string | null>(null);
  const [kategoriPrograms, setKategoriPrograms] = useState<any[]>([]);
  const [isKpiDropdownOpen, setIsKpiDropdownOpen] = useState(false);
  const { createBoard, deleteBoard, updateBoard } = useKanban();
  const { departments, fetchDepartments } = useKanban();
  const [mounted, setMounted] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [searchKpi, setSearchKpi] = useState("");

  const [filterIndepDepartment, setFilterIndepDepartment] = useState<string>("all");
  const [isIndepDeptDropdownOpen, setIsIndepDeptDropdownOpen] = useState(false);
  const [filterIndepPic, setFilterIndepPic] = useState<string>("all");
  const [isIndepPicDropdownOpen, setIsIndepPicDropdownOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  const independentBoards = boards.filter(
    (board) => !board.kpiId && !board.kpi_id,
    // && (viewType === "me" ? board.userId === user?.id : true),
  );

  const uniqueIndepPics = React.useMemo(() => {
    const pics = new Set<string>();
    independentBoards.forEach((board) => {
      board.tasks?.forEach((t: any) => {
        if (typeof t.pic === 'object' && t.pic) {
          pics.add((t.pic as any).name);
        } else if (typeof t.pic === 'string') {
          const u = users.find(u => u.id === t.pic);
          if (u && u.name) pics.add(u.name);
        } else if (t.pic_id) {
          const u = users.find(u => u.id === t.pic_id);
          if (u && u.name) pics.add(u.name);
        }
      });
    });
    users.forEach((u) => {
      if (u.name) pics.add(u.name);
    });
    return Array.from(pics).sort();
  }, [independentBoards, users]);

  useEffect(() => {
    setMounted(true);
    fetchKpis();
    fetchBoards();
    fetchDepartments();
    api.get('/users').then((res) => setUsers(res.data)).catch(console.error);
    api.get("/kategori-program-kerja").then((res) => setKategoriPrograms(res.data)).catch(console.error);
  }, [fetchKpis, fetchBoards, fetchDepartments]);

  if (!mounted) return null;

  const handleOpenModal = (kpi?: Kpi) => {
    if (kpi) {
      setEditingKpi(kpi);
      setFormData({
        title: kpi.title,
        description: kpi.description || "",
        targetDate: kpi.targetDate
          ? new Date(kpi.targetDate).toISOString().split("T")[0]
          : "",
      });
    } else {
      setEditingKpi(null);
      setFormData({ title: "", description: "", targetDate: "" });
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

  const handleDeleteBoard = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Apakah Anda yakin ingin menghapus Board ini?")) {
      await deleteBoard(id);
      fetchKpis();
      fetchBoards();
    }
  };

  const handleCreateBoardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardTitle.trim()) return;

    if (editingBoardId) {
      await updateBoard(editingBoardId, {
        title: boardTitle,
        description: boardDesc,
        kpiId: boardType === "kpi" ? targetKpiIdForBoard || undefined : null,
        startDate: boardStartDate || null,
        targetDate: boardTargetDate || null,
        kategoriProgramId: kategoriProgramIdForBoard || null,
        kondisiAktual: boardKondisiAktual || null,
        targetAkhirTahun: boardTargetAkhirTahun || null,
        outputAkhir: boardOutputAkhir || null,
        prioritas: boardPrioritas || null
      });
    } else {
      await createBoard(
        boardTitle,
        boardDesc,
        boardType === "kpi" ? targetKpiIdForBoard || undefined : undefined,
        boardStartDate || undefined,
        boardTargetDate || undefined,
        undefined,
        kategoriProgramIdForBoard || undefined,
        boardKondisiAktual || undefined,
        boardTargetAkhirTahun || undefined,
        boardOutputAkhir || undefined,
        boardPrioritas || undefined
      );
    }

    setIsBoardModalOpen(false);
    setBoardTitle("");
    setBoardDesc("");
    setBoardStartDate("");
    setBoardTargetDate("");
    setBoardKondisiAktual("");
    setBoardTargetAkhirTahun("");
    setBoardOutputAkhir("");
    setBoardPrioritas("");
    setKategoriProgramIdForBoard(null);
    setEditingBoardId(null);
    fetchKpis(); // Refresh to see the new board in the KPI
    fetchBoards();
  };

  const calculateProgress = (boards: Board[]) => {
    if (!boards || boards.length === 0) return 0;

    let totalTasks = 0;
    let doneTasks = 0;

    boards.forEach((board) => {
      const tasks = board.tasks || [];
      totalTasks += tasks.length;
      doneTasks += tasks.filter((t) => t.columnId === "done").length;
    });

    if (totalTasks === 0) return 0;
    return Math.round((doneTasks / totalTasks) * 100);
  };

  // const displayKpis =
  //   viewType === "me" ? kpis.filter((k) => k.userId === user?.id) : kpis;
  const displayKpis = kpis;

  if (isLoading && kpis.length === 0) return <KpiSkeleton />;

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6 bg-bgPrimary">
      {/* Department Filter */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <button
            onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all shadow-sm ${
              filterDepartment !== 'all'
                ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                : 'bg-white dark:bg-bgSecondary border-gray-200 dark:border-borderBase text-textSecondary hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-bgGlassHover'
            }`}
          >
            <Filter size={16} />
            <span>
              {filterDepartment === 'all'
                ? 'Semua Departemen'
                : departments.find(d => d.id === filterDepartment)?.name || 'Departemen'}
            </span>
            <ChevronDown size={14} className={`transition-transform ${isDeptDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDeptDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsDeptDropdownOpen(false)} />
              <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-bgSecondary border border-gray-200 dark:border-borderBase rounded-xl shadow-xl z-50 py-1 max-h-72 overflow-y-auto custom-scrollbar">
                <button
                  onClick={() => { setFilterDepartment('all'); setIsDeptDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    filterDepartment === 'all'
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium'
                      : 'text-textPrimary hover:bg-gray-50 dark:hover:bg-bgGlass'
                  }`}
                >
                  Semua Departemen
                </button>
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => { setFilterDepartment(dept.id); setIsDeptDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-t border-gray-100 dark:border-white/[0.05] ${
                      filterDepartment === dept.id
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium'
                        : 'text-textPrimary hover:bg-gray-50 dark:hover:bg-bgGlass'
                    }`}
                  >
                    {dept.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        {filterDepartment !== 'all' && (
          <button
            onClick={() => setFilterDepartment('all')}
            className="text-xs text-textSecondary hover:text-red-500 transition-colors"
          >
            ✕ Reset
          </button>
        )}

        {/* Search */}
        <div className="relative flex-1 max-w-sm ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" size={16} />
          <input
            type="text"
            placeholder="Cari project, board..."
            value={searchKpi}
            onChange={(e) => setSearchKpi(e.target.value)}
            className="w-full bg-white dark:bg-bgSecondary border border-gray-200 dark:border-borderBase rounded-xl py-2.5 pl-10 pr-4 text-sm text-textPrimary placeholder-textSecondary/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 transition-all shadow-sm"
          />
          {searchKpi && (
            <button
              onClick={() => setSearchKpi('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-textSecondary hover:text-textPrimary transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {displayKpis
          .filter((kpi) => filterDepartment === 'all' || kpi.departmentId === filterDepartment)
          .filter((kpi) => {
            if (!searchKpi.trim()) return true;
            const q = searchKpi.toLowerCase();
            if (kpi.title.toLowerCase().includes(q)) return true;
            if (kpi.description?.toLowerCase().includes(q)) return true;
            if (kpi.department?.name?.toLowerCase().includes(q)) return true;
            if (kpi.boards?.some(b => b.title.toLowerCase().includes(q))) return true;
            return false;
          })
          .map((kpi) => {
          const progress = calculateProgress(kpi.boards || []);
          const canViewDetails = isAdmin || kpi.userId === user?.id;

          return (
            <div
              key={kpi.id}
              className="mb-6 sm:mb-10 bg-bgPrimary rounded-2xl p-4 sm:p-6 shadow-sm border border-black/[0.03] dark:border-white/[0.03] hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
                      <Target size={20} />
                    </div>
                    <h2 className="text-lg sm:text-xl md:text-xl font-bold text-textPrimary">
                      Main Project - {kpi.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-textSecondary pl-12">
                    <span className="flex items-center gap-1.5">
                      <Briefcase size={14} className="text-indigo-400" />{" "}
                      {kpi.department?.name || "Semua Departemen"}
                    </span>
                    <span className="flex items-center gap-1.5 flex-wrap">
                      <Calendar size={14} className="text-indigo-400" />{" "}
                      {kpi.targetDate ? (
                        <>
                          {new Date(kpi.targetDate).toLocaleDateString("id-ID")}
                          {(() => { const r = getDaysRemaining(kpi.targetDate); return (
                            <span className={`font-semibold text-[11px] px-1.5 py-0.5 rounded-md ${r.isOverdue ? 'text-red-600 dark:text-red-400 bg-red-500/10' : 'text-amber-600 dark:text-amber-500 bg-amber-500/10'}`}>
                              ({r.text})
                            </span>
                          ); })()}
                        </>
                      ) : (
                        "-"
                      )}
                    </span>
                  </div>
                </div>
                {canViewDetails && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(kpi)}
                      className="p-2 text-textSecondary hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl transition-all"
                      title="Edit KPI"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(kpi.id)}
                      className="p-2 text-textSecondary hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      title="Hapus KPI"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Boards List */}
              <div>
                {/* {!canViewDetails ? (
                  <div
                    onClick={() => alert("Anda tidak berada di KPI ini")}
                    className="cursor-pointer bg-bgSecondary/50 border border-border/30 rounded-xl p-6 text-center text-textSecondary hover:bg-bgSecondary transition-colors"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <LayoutGrid size={18} className="opacity-50" />
                      <span className="font-medium text-sm">
                        {kpi.boards?.length || 0} Board(s) Terkunci
                      </span>
                    </div>
                  </div>
                ) : ( */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                  {/* Create Board Card */}
                  <div
                    onClick={() => {
                      setTargetKpiIdForBoard(kpi.id);
                      setBoardType("kpi");
                      setEditingBoardId(null);
                      setBoardTitle("");
                      setBoardDesc("");
                      setBoardStartDate("");
                      setBoardTargetDate("");
                      setIsBoardModalOpen(true);
                    }}
                    className="bg-bgSecondary rounded-xl p-4 sm:p-5 border border-border/50 shadow-sm hover:border-indigo-500/30 hover:bg-indigo-500/5 hover:shadow-md transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[140px] sm:min-h-[160px]"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                      <Plus size={20} />
                    </div>
                    <span className="text-sm font-medium text-textSecondary group-hover:text-indigo-500 transition-colors text-center">
                      Tambah Board Project
                    </span>
                  </div>

                  {kpi.boards &&
                    kpi.boards.map((board) => {
                      const tasks = board.tasks || [];
                      const todoTasks = tasks.filter(
                        (t: any) => t.columnId === "new",
                      ).length;
                      const progressTasks = tasks.filter(
                        (t: any) => t.columnId === "progress",
                      ).length;
                      const doneTasks = tasks.filter(
                        (t: any) => t.columnId === "done",
                      ).length;

                      return (
                        <div
                          key={board.id}
                          onClick={() => navigate(`/board/${board.id}`)}
                          className={`rounded-xl p-4 sm:p-5 border shadow-sm hover:shadow-[0_4px_12px_-4px_rgba(6,81,237,0.15)] transition-all cursor-pointer group flex flex-col min-h-[140px] sm:min-h-[160px] transform hover:-translate-y-1 relative ${
                            board.userId === user?.id
                              ? "bg-blue-200 dark:bg-blue-900/60 border-blue-400 dark:border-blue-600"
                              : "bg-bgSecondary border-border/30"
                          }`}
                        >
                          {(isAdmin ||
                            board.userId === user?.id ||
                            kpi.userId === user?.id) && (
                            <div className="absolute top-2 right-2 flex gap-0.5 opacity-40 group-hover:opacity-100 transition-all z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingBoardId(board.id);
                                  setBoardTitle(board.title);
                                  setBoardDesc(board.description || "");
                                  setBoardStartDate(
                                    board.startDate
                                      ? new Date(board.startDate)
                                          .toISOString()
                                          .split("T")[0]
                                      : "",
                                  );
                                  setBoardTargetDate(
                                    board.targetDate
                                      ? new Date(board.targetDate)
                                          .toISOString()
                                          .split("T")[0]
                                      : "",
                                  );
                                  setBoardKondisiAktual(board.kondisiAktual || "");
                                  setBoardTargetAkhirTahun(board.targetAkhirTahun || "");
                                  setBoardOutputAkhir(board.outputAkhir || "");
                                  setBoardPrioritas(board.prioritas || "");
                                  setKategoriProgramIdForBoard(board.kategoriProgramId || board.kategori_program_id || null);
                                  setTargetKpiIdForBoard(
                                    board.kpiId || board.kpi_id || null,
                                  );
                                  setBoardType("kpi");
                                  setIsBoardModalOpen(true);
                                }}
                                className="p-1 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 hover:ring-2 hover:ring-amber-500/50 rounded-md transition-all"
                                title="Edit Board"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={(e) => handleDeleteBoard(e, board.id)}
                                className="p-1 text-red-500 hover:text-red-600 hover:bg-red-500/10 hover:ring-2 hover:ring-red-500/50 rounded-md transition-all"
                                title="Hapus Board"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                          <div className="mb-3 flex-1 mt-4 sm:mt-0">
                            <h5 className="font-semibold text-sm sm:text-base text-textPrimary group-hover:text-indigo-500 transition-all mb-1 line-clamp-2 leading-tight pr-12">
                              {board.title}
                            </h5>
                            {board.description && (
                              <p className="text-[11px] text-textSecondary line-clamp-1 mt-1">
                                {board.description}
                              </p>
                            )}
                            <p className="text-[10px] text-indigo-400 mt-2 font-medium">
                              Oleh: {board.user?.name || "Sistem"}
                            </p>
                            
                            {(board.startDate || board.targetDate) && (
                              <div className="flex flex-wrap gap-1.5 mt-2.5">
                                {board.startDate && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400 border border-gray-200 dark:border-white/10">
                                    <Calendar size={10} />
                                    {new Date(board.startDate).toLocaleDateString("id-ID")}
                                  </span>
                                )}
                                {board.targetDate && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400 border border-gray-200 dark:border-white/10">
                                    <Target size={10} />
                                    {new Date(board.targetDate).toLocaleDateString("id-ID")}
                                    {(() => { const r = getDaysRemaining(board.targetDate); return (
                                      <span className={`ml-0.5 ${r.isOverdue ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-500'}`}>
                                        ({r.text})
                                      </span>
                                    ); })()}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-3 gap-1.5 text-center mt-auto">

                            <div className="bg-bgPrimary rounded-lg p-1.5 shadow-sm border border-black/[0.02] dark:border-white/[0.02]">
                              <div className="text-[10px] text-textSecondary mb-0.5 font-medium tracking-wider">
                                TODO
                              </div>
                              <div className="font-bold text-textPrimary text-sm">
                                {todoTasks}
                              </div>
                            </div>
                            <div className="bg-bgPrimary rounded-lg p-1.5 shadow-sm border border-black/[0.02] dark:border-white/[0.02]">
                              <div className="text-[10px] text-textSecondary mb-0.5 font-medium tracking-wider">
                                PROG
                              </div>
                              <div className="font-bold text-amber-500 text-sm">
                                {progressTasks}
                              </div>
                            </div>
                            <div className="bg-bgPrimary rounded-lg p-1.5 shadow-sm border border-black/[0.02] dark:border-white/[0.02]">
                              <div className="text-[10px] text-textSecondary mb-0.5 font-medium tracking-wider">
                                DONE
                              </div>
                              <div className="font-bold text-emerald-500 text-sm">
                                {doneTasks}
                              </div>
                            </div>
                          </div>

                          <div className="mt-2 space-y-1">
                            {board.kondisiAktual && (
                              <div className="text-[10px] text-textSecondary line-clamp-1">
                                <span className="font-semibold text-textPrimary">Kondisi Aktual:</span> {board.kondisiAktual}
                              </div>
                            )}
                            {board.targetAkhirTahun && (
                              <div className="text-[10px] text-textSecondary line-clamp-1">
                                <span className="font-semibold text-textPrimary">Target:</span> {board.targetAkhirTahun}
                              </div>
                            )}
                            {board.outputAkhir && (
                              <div className="text-[10px] text-textSecondary line-clamp-1">
                                <span className="font-semibold text-textPrimary">Output:</span> {board.outputAkhir}
                              </div>
                            )}
                          </div>

                          {board.prioritas && (
                            <div className="mt-2">
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                                  board.prioritas === "high"
                                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50"
                                    : board.prioritas === "medium"
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50"
                                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50"
                                }`}
                              >
                                {board.prioritas === "high" ? "Prioritas Tinggi" : board.prioritas === "medium" ? "Prioritas Sedang" : "Prioritas Rendah"}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Section for Independent Boards (Boards without KPI) */}
        <div className="mb-6 sm:mb-10 bg-bgPrimary rounded-2xl p-4 sm:p-6 shadow-sm border border-black/[0.03] dark:border-white/[0.03] hover:shadow-md transition-shadow min-h-[300px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white shadow-md shadow-gray-500/20 shrink-0">
                <LayoutGrid size={20} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-textPrimary">
                  Pekerjaan tanpa Main Project
                </h2>
                <p className="text-xs text-textSecondary mt-0.5">
                  Board pekerjaan yang tidak terkait dengan indikator main
                  project
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Department Filter */}
              <div className="relative">
                <button
                  onClick={() => setIsIndepDeptDropdownOpen(!isIndepDeptDropdownOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all shadow-sm ${
                    filterIndepDepartment !== 'all'
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                      : 'bg-white dark:bg-bgSecondary border-gray-200 dark:border-borderBase text-textSecondary hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-bgGlassHover'
                  }`}
                >
                  <Filter size={14} />
                  <span>
                    {filterIndepDepartment === 'all'
                      ? 'Semua Departemen'
                      : departments.find(d => d.id === filterIndepDepartment)?.name || 'Departemen'}
                  </span>
                  <ChevronDown size={14} className={`transition-transform ${isIndepDeptDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isIndepDeptDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsIndepDeptDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-bgSecondary border border-gray-200 dark:border-borderBase rounded-xl shadow-xl z-50 py-1 max-h-72 overflow-y-auto custom-scrollbar">
                      <button
                        onClick={() => { setFilterIndepDepartment('all'); setIsIndepDeptDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                          filterIndepDepartment === 'all'
                            ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium'
                            : 'text-textPrimary hover:bg-gray-50 dark:hover:bg-bgGlass'
                        }`}
                      >
                        Semua Departemen
                      </button>
                      {departments.map((dept) => (
                        <button
                          key={dept.id}
                          onClick={() => { setFilterIndepDepartment(dept.id); setIsIndepDeptDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-xs transition-colors border-t border-gray-100 dark:border-white/[0.05] ${
                            filterIndepDepartment === dept.id
                              ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium'
                              : 'text-textPrimary hover:bg-gray-50 dark:hover:bg-bgGlass'
                          }`}
                        >
                          {dept.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* PIC Filter */}
              <div className="relative">
                <button
                  onClick={() => setIsIndepPicDropdownOpen(!isIndepPicDropdownOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all shadow-sm ${
                    filterIndepPic !== 'all'
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                      : 'bg-white dark:bg-bgSecondary border-gray-200 dark:border-borderBase text-textSecondary hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-bgGlassHover'
                  }`}
                >
                  <Briefcase size={14} />
                  <span className="max-w-[100px] truncate">
                    {filterIndepPic === 'all' ? 'Semua PIC' : filterIndepPic}
                  </span>
                  <ChevronDown size={14} className={`transition-transform ${isIndepPicDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isIndepPicDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsIndepPicDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-bgSecondary border border-gray-200 dark:border-borderBase rounded-xl shadow-xl z-50 py-1 max-h-72 overflow-y-auto custom-scrollbar">
                      <button
                        onClick={() => { setFilterIndepPic('all'); setIsIndepPicDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                          filterIndepPic === 'all'
                            ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium'
                            : 'text-textPrimary hover:bg-gray-50 dark:hover:bg-bgGlass'
                        }`}
                      >
                        Semua PIC
                      </button>
                      {uniqueIndepPics.map((pic) => (
                        <button
                          key={pic}
                          onClick={() => { setFilterIndepPic(pic); setIsIndepPicDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-xs transition-colors border-t border-gray-100 dark:border-white/[0.05] ${
                            filterIndepPic === pic
                              ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium'
                              : 'text-textPrimary hover:bg-gray-50 dark:hover:bg-bgGlass'
                          }`}
                        >
                          {pic}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => {
                  setTargetKpiIdForBoard("");
                  setBoardType("non-kpi");
                  setEditingBoardId(null);
                  setBoardTitle("");
                  setBoardDesc("");
                  setBoardStartDate("");
                  setBoardTargetDate("");
                  setIsBoardModalOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl text-xs font-medium transition-all shadow-sm shadow-indigo-500/20 flex items-center gap-1.5 w-full sm:w-auto justify-center"
              >
                <Plus size={14} />
                Buat Board
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
            {independentBoards
              .filter((board) => {
                // Apply Department filter
                if (filterIndepDepartment !== "all") {
                  const deptId = board.departmentId || (board as any).department_id;
                  if (deptId !== filterIndepDepartment) {
                    return false;
                  }
                }

                // Apply PIC filter
                if (filterIndepPic !== "all") {
                  let isMatch = false;
                  if (board.user?.name === filterIndepPic) {
                    isMatch = true;
                  } else {
                    isMatch = !!board.tasks?.some((t: any) => {
                      let picName = null;
                      if (typeof t.pic === 'object' && t.pic) {
                        picName = (t.pic as any).name;
                      } else if (typeof t.pic === 'string') {
                        const foundUser = users.find(u => u.id === t.pic);
                        if (foundUser) picName = foundUser.name;
                      } else if (t.pic_id) {
                        const foundUser = users.find(u => u.id === t.pic_id);
                        if (foundUser) picName = foundUser.name;
                      }
                      return picName === filterIndepPic;
                    });
                  }
                  if (!isMatch) return false;
                }

                if (!searchKpi.trim()) return true;
                const q = searchKpi.toLowerCase();
                if (board.title.toLowerCase().includes(q)) return true;
                if (board.description?.toLowerCase().includes(q)) return true;
                if (board.user?.name?.toLowerCase().includes(q)) return true;
                return false;
              })
              .map((board) => {
              const tasks = board.tasks || [];
              const todoTasks = tasks.filter(
                (t: any) => t.columnId === "new",
              ).length;
              const progressTasks = tasks.filter(
                (t: any) => t.columnId === "progress",
              ).length;
              const doneTasks = tasks.filter(
                (t: any) => t.columnId === "done",
              ).length;

              return (
                <div
                  key={board.id}
                  onClick={() => navigate(`/board/${board.id}`)}
                  className={`rounded-xl p-4 sm:p-5 border shadow-sm hover:shadow-[0_4px_12px_-4px_rgba(6,81,237,0.15)] transition-all cursor-pointer group flex flex-col min-h-[140px] sm:min-h-[160px] transform hover:-translate-y-1 relative ${
                    board.userId === user?.id
                      ? "bg-blue-200 dark:bg-blue-900/60 border-blue-400 dark:border-blue-600"
                      : "bg-bgSecondary border-border/30"
                  }`}
                >
                  {(isAdmin || board.userId === user?.id) && (
                    <div className="absolute top-2 right-2 flex gap-0.5 opacity-40 group-hover:opacity-100 transition-all z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingBoardId(board.id);
                          setBoardTitle(board.title);
                          setBoardDesc(board.description || "");
                          setBoardStartDate(
                            board.startDate
                              ? new Date(board.startDate)
                                  .toISOString()
                                  .split("T")[0]
                              : "",
                          );
                          setBoardTargetDate(
                            board.targetDate
                              ? new Date(board.targetDate)
                                  .toISOString()
                                  .split("T")[0]
                              : "",
                          );
                          setBoardKondisiAktual(board.kondisiAktual || "");
                          setBoardTargetAkhirTahun(board.targetAkhirTahun || "");
                          setBoardOutputAkhir(board.outputAkhir || "");
                          setBoardPrioritas(board.prioritas || "");
                          setKategoriProgramIdForBoard(board.kategoriProgramId || board.kategori_program_id || null);
                          setTargetKpiIdForBoard(null);
                          setBoardType("non-kpi");
                          setIsBoardModalOpen(true);
                        }}
                        className="p-1 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 hover:ring-2 hover:ring-amber-500/50 rounded-md transition-all"
                        title="Edit Board"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteBoard(e, board.id)}
                        className="p-1 text-red-500 hover:text-red-600 hover:bg-red-500/10 hover:ring-2 hover:ring-red-500/50 rounded-md transition-all"
                        title="Hapus Board"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                  <div className="mb-3 flex-1 mt-4 sm:mt-0">
                    <h5 className="font-semibold text-sm sm:text-base text-textPrimary group-hover:text-indigo-500 transition-all mb-1 line-clamp-2 leading-tight pr-12">
                      {board.title}
                    </h5>
                    {board.description && (
                      <p className="text-[11px] text-textSecondary line-clamp-1 mt-1">
                        {board.description}
                      </p>
                    )}
                    <p className="text-[10px] text-indigo-400 mt-2 font-medium">
                      Oleh: {board.user?.name || "Sistem"}
                    </p>
                    
                    {(board.startDate || board.targetDate) && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {board.startDate && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400 border border-gray-200 dark:border-white/10">
                            <Calendar size={10} />
                            {new Date(board.startDate).toLocaleDateString("id-ID")}
                          </span>
                        )}
                        {board.targetDate && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400 border border-gray-200 dark:border-white/10">
                            <Target size={10} />
                            {new Date(board.targetDate).toLocaleDateString("id-ID")}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-center mt-auto">
                    <div className="bg-bgPrimary rounded-lg p-1.5 shadow-sm border border-black/[0.02] dark:border-white/[0.02]">
                      <div className="text-[10px] text-textSecondary mb-0.5 font-medium tracking-wider">
                        TODO
                      </div>
                      <div className="font-bold text-textPrimary text-sm">
                        {todoTasks}
                      </div>
                    </div>
                    <div className="bg-bgPrimary rounded-lg p-1.5 shadow-sm border border-black/[0.02] dark:border-white/[0.02]">
                      <div className="text-[10px] text-textSecondary mb-0.5 font-medium tracking-wider">
                        PROG
                      </div>
                      <div className="font-bold text-amber-500 text-sm">
                        {progressTasks}
                      </div>
                    </div>
                    <div className="bg-bgPrimary rounded-lg p-1.5 shadow-sm border border-black/[0.02] dark:border-white/[0.02]">
                      <div className="text-[10px] text-textSecondary mb-0.5 font-medium tracking-wider">
                        DONE
                      </div>
                      <div className="font-bold text-emerald-500 text-sm">
                        {doneTasks}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {displayKpis.length === 0 &&
          independentBoards.length === 0 &&
          !isLoading && (
            <div className="text-center py-20 bg-gradient-to-br from-bgSecondary to-bgPrimary rounded-3xl shadow-sm border border-black/[0.02] dark:border-white/[0.02]">
              <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target size={32} className="text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold text-textPrimary mb-3">
                Belum ada KPI
              </h3>
              <p className="text-textSecondary max-w-md mx-auto mb-8">
                Mulai dengan membuat Key Performance Indicator (KPI) pertama
                Anda untuk memantau progress seluruh proyek.
              </p>
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
              <h2 className="text-xl font-bold text-textPrimary">
                {editingKpi ? "Edit KPI" : "Buat KPI Baru"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-black/[0.05] dark:bg-white/[0.05] rounded-full text-textSecondary hover:text-textPrimary hover:bg-black/[0.1] dark:hover:bg-white/[0.1] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-7 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-textSecondary mb-2">
                  Judul KPI <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all placeholder-textSecondary/50"
                  placeholder="Contoh: Implementasi Website E-Commerce"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-textSecondary mb-2">
                  Deskripsi Singkat
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all min-h-[120px] placeholder-textSecondary/50 resize-none"
                  placeholder="Jelaskan tujuan dan ruang lingkup KPI ini..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-textSecondary mb-2">
                  Tanggal Target Pencapaian{" "}
                  <span className="text-red-400">*</span>
                </label>
                <DatePicker
                  selected={
                    formData.targetDate ? new Date(formData.targetDate) : null
                  }
                  onChange={(date: any) =>
                    setFormData({
                      ...formData,
                      targetDate: date ? format(date, "yyyy-MM-dd") : "",
                    })
                  }
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
                  {editingKpi ? "Simpan Perubahan" : "Buat KPI"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Board Modal */}
      {isBoardModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bgPrimary rounded-3xl w-full max-w-lg shadow-2xl border border-black/[0.05] dark:border-white/[0.05] animate-in fade-in zoom-in-95 duration-200 overflow-hidden m-4">
            <div className="flex justify-between items-center p-6 bg-black/[0.02] dark:bg-white/[0.02]">
              <h2 className="text-xl font-bold text-textPrimary">
                {editingBoardId ? "Edit Board" : "Buat Board Baru"}
              </h2>
              <button
                onClick={() => {
                  setIsBoardModalOpen(false);
                  setBoardTitle("");
                  setBoardDesc("");
                  setBoardStartDate("");
                  setBoardTargetDate("");
                  setEditingBoardId(null);
                }}
                className="p-2 bg-black/[0.05] dark:bg-white/[0.05] rounded-full text-textSecondary hover:text-textPrimary hover:bg-black/[0.1] dark:hover:bg-white/[0.1] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBoardSubmit} className="p-7 space-y-5">
              <div className="flex bg-gray-100 dark:bg-bgGlass border border-gray-200 dark:border-borderBase rounded-xl p-1 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setBoardType("non-kpi");
                    setTargetKpiIdForBoard(null);
                  }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    boardType === "non-kpi"
                      ? "bg-white dark:bg-bgPrimary text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-textSecondary hover:text-textPrimary hover:bg-gray-200/50 dark:hover:bg-bgGlassHover"
                  }`}
                >
                  Non Project
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBoardType("kpi");
                    if (kpis.length > 0 && !targetKpiIdForBoard) {
                      setTargetKpiIdForBoard(kpis[0].id);
                    }
                  }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    boardType === "kpi"
                      ? "bg-white dark:bg-bgPrimary text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-textSecondary hover:text-textPrimary hover:bg-gray-200/50 dark:hover:bg-bgGlassHover"
                  }`}
                >
                  Terikat Main Project
                </button>
              </div>

              {boardType === "kpi" && (
                <div className="relative">
                  <label className="block text-sm font-semibold text-textSecondary mb-2">
                    Pilih Main Project <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsKpiDropdownOpen(!isKpiDropdownOpen)}
                      className="w-full text-left bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all flex justify-between items-center"
                    >
                      <span className="truncate pr-4">
                        {targetKpiIdForBoard
                          ? kpis.find(k => k.id === targetKpiIdForBoard)?.title || "-- Pilih Main Project --"
                          : "-- Pilih Main Project --"}
                      </span>
                      <svg className={`w-4 h-4 text-textSecondary transition-transform ${isKpiDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    
                    {isKpiDropdownOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-white dark:bg-bgSecondary border border-gray-200 dark:border-borderBase rounded-xl shadow-lg max-h-60 overflow-y-auto custom-scrollbar py-1">
                        {kpis.map((kpi) => (
                          <div
                            key={kpi.id}
                            onClick={() => {
                              setTargetKpiIdForBoard(kpi.id);
                              setIsKpiDropdownOpen(false);
                            }}
                            className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-bgGlass break-words whitespace-normal border-b border-gray-100 last:border-0 dark:border-white/[0.05] ${targetKpiIdForBoard === kpi.id ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium' : 'text-textPrimary'}`}
                          >
                            {kpi.title}
                          </div>
                        ))}
                        {kpis.length === 0 && (
                          <div className="px-4 py-3 text-sm text-textSecondary text-center">
                            Tidak ada Main Project
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-textSecondary mb-2">
                  Judul Board Project <span className="text-red-400">*</span>
                </label>
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
                <label className="block text-sm font-semibold text-textSecondary mb-2">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  value={boardDesc}
                  onChange={(e) => setBoardDesc(e.target.value)}
                  className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all min-h-[120px] placeholder-textSecondary/50 resize-none"
                  placeholder="Tambahkan detail proyek..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-textSecondary mb-2">
                    Mulai <span className="text-red-400">*</span>
                  </label>
                  <DatePicker
                    selected={boardStartDate ? new Date(boardStartDate) : null}
                    onChange={(date: any) =>
                      setBoardStartDate(
                        date ? format(date, "yyyy-MM-dd") : "",
                      )
                    }
                    dateFormat="dd/MM/yyyy"
                    locale={dateFnsIdLocale}
                    placeholderText="dd/mm/yyyy"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    required
                    className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 placeholder-textSecondary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-textSecondary mb-2">
                    Target <span className="text-red-400">*</span>
                  </label>
                  <DatePicker
                    selected={
                      boardTargetDate ? new Date(boardTargetDate) : null
                    }
                    onChange={(date: any) =>
                      setBoardTargetDate(
                        date ? format(date, "yyyy-MM-dd") : "",
                      )
                    }
                    dateFormat="dd/MM/yyyy"
                    locale={dateFnsIdLocale}
                    placeholderText="dd/mm/yyyy"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    required
                    className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 placeholder-textSecondary transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-black/[0.03] dark:border-white/[0.03]">
                <button
                  type="button"
                  onClick={() => {
                    setIsBoardModalOpen(false);
                    setBoardTitle("");
                    setBoardDesc("");
                    setEditingBoardId(null);
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
                  {editingBoardId ? "Simpan Perubahan" : "Buat Board"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
