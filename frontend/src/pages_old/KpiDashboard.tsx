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
  Flag,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { differenceInDays, startOfDay, format } from "date-fns";
import { id as dateFnsIdLocale } from "date-fns/locale";

import { useAuthStore } from "../store/authStore";
import api from "../lib/api";
import { ProgramKerjaBoard } from "../components/ProgramKerjaBoard";
import { KpiModal } from "../components/modals/KpiModal";
import { BoardModal } from "../components/modals/BoardModal";
import { KpiBoardCard } from "../components/KpiBoardCard";
import { DashboardFilter } from "../components/DashboardFilter";
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
  const [activeTab, setActiveTab] = useState<"wig" | "program_kerja">("wig");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetDate: "",
    bobot: 100,
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
  const [boardBobot, setBoardBobot] = useState<number | string>("");
  const [kategoriProgramIdForBoard, setKategoriProgramIdForBoard] = useState<
    string | null
  >(null);
  const [kategoriPrograms, setKategoriPrograms] = useState<any[]>([]);
  const [isKpiDropdownOpen, setIsKpiDropdownOpen] = useState(false);
  const { createBoard, deleteBoard, updateBoard } = useKanban();
  const { departments, fetchDepartments } = useKanban();
  const [mounted, setMounted] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [searchKpi, setSearchKpi] = useState("");

  const [filterIndepDepartment, setFilterIndepDepartment] =
    useState<string>("all");
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
        if (typeof t.pic === "object" && t.pic) {
          pics.add((t.pic as any).name);
        } else if (typeof t.pic === "string") {
          const u = users.find((u) => u.id === t.pic);
          if (u && u.name) pics.add(u.name);
        } else if (t.pic_id) {
          const u = users.find((u) => u.id === t.pic_id);
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
    api
      .get("/users")
      .then((res) => setUsers(res.data))
      .catch(console.error);
    api
      .get("/kategori-program-kerja")
      .then((res) => setKategoriPrograms(res.data))
      .catch(console.error);
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
        bobot: kpi.bobot ? Number(kpi.bobot) : 100,
      });
    } else {
      setEditingKpi(null);
      setFormData({ title: "", description: "", targetDate: "", bobot: 100 });
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
        prioritas: boardPrioritas || null,
        bobot: boardBobot || null,
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
        boardPrioritas || undefined,
        boardBobot || undefined
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
    setBoardBobot("");
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
      <DashboardFilter
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filterDepartment={filterDepartment}
        setFilterDepartment={setFilterDepartment}
        isDeptDropdownOpen={isDeptDropdownOpen}
        setIsDeptDropdownOpen={setIsDeptDropdownOpen}
        searchKpi={searchKpi}
        setSearchKpi={setSearchKpi}
        departments={departments}
      />

      {activeTab === "wig" && (
        <>
          <div className="space-y-8">
            {displayKpis
              .filter(
                (kpi) =>
                  filterDepartment === "all" ||
                  kpi.departmentId === filterDepartment,
              )
              .filter((kpi) => {
                if (!searchKpi.trim()) return true;
                const q = searchKpi.toLowerCase();
                if (kpi.title.toLowerCase().includes(q)) return true;
                if (kpi.description?.toLowerCase().includes(q)) return true;
                if (kpi.department?.name?.toLowerCase().includes(q))
                  return true;
                if (kpi.boards?.some((b) => b.title.toLowerCase().includes(q)))
                  return true;
                return false;
              })
              .map((kpi) => {
                const progress = calculateProgress(kpi.boards || []);
                const canViewDetails = isAdmin || kpi.userId === user?.id;
                
                const bobotWig = Number(kpi.bobot ?? 100);
                const usedBobot = (kpi.boards || []).reduce((acc, board) => acc + Number(board.bobot ?? 0), 0);
                const sisaBobot = bobotWig - usedBobot;

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

                          {/* Info Description Tooltip moved here */}
                          {kpi.description && (
                            <div className="relative group flex items-center">
                              <button className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 transition-colors cursor-help">
                                <Info size={14} />
                                <span className="text-[11px] font-semibold tracking-wide">Deskripsi</span>
                              </button>
                              
                              <div className="absolute left-0 sm:left-4 top-full mt-2 w-72 sm:w-80 p-3 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-sm rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                                {kpi.description}
                                <div className="absolute -top-1.5 left-6 w-3 h-3 bg-gray-900 dark:bg-gray-100 rotate-45"></div>
                              </div>
                            </div>
                          )}

                          <span className="flex items-center gap-1.5 flex-wrap">
                            <Calendar size={14} className="text-indigo-400" />{" "}
                            {kpi.targetDate ? (
                              <>
                                {new Date(kpi.targetDate).toLocaleDateString(
                                  "id-ID",
                                )}
                                {(() => {
                                  const r = getDaysRemaining(kpi.targetDate);
                                  return (
                                    <span
                                      className={`font-semibold text-[11px] px-1.5 py-0.5 rounded-md ${r.isOverdue ? "text-red-600 dark:text-red-400 bg-red-500/10" : "text-amber-600 dark:text-amber-500 bg-amber-500/10"}`}
                                    >
                                      ({r.text})
                                    </span>
                                  );
                                })()}
                              </>
                            ) : (
                              "-"
                            )}
                            <span className="flex items-center gap-1.5 ml-2">
                              <div className="flex items-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-md text-xs font-semibold border border-indigo-200 dark:border-indigo-800">
                                Bobot WIG: {bobotWig}
                              </div>
                              <div className={`flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                                sisaBobot < 0 
                                  ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                                  : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              }`}>
                                Sisa Bobot: {sisaBobot}
                              </div>
                            </span>
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
                            setBoardBobot("");
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
                              <KpiBoardCard
                                key={board.id}
                                board={board}
                                user={user}
                                isAdmin={isAdmin}
                                kpiUserId={kpi.userId}
                                navigate={navigate}
                                onEdit={(board, e) => {
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
                                  setBoardKondisiAktual(
                                    board.kondisiAktual || "",
                                  );
                                  setBoardTargetAkhirTahun(
                                    board.targetAkhirTahun || "",
                                  );
                                  setBoardOutputAkhir(board.outputAkhir || "");
                                  setBoardPrioritas(board.prioritas || "");
                                  setKategoriProgramIdForBoard(
                                    board.kategoriProgramId ||
                                      board.kategori_program_id ||
                                      null,
                                  );
                                  setTargetKpiIdForBoard(
                                    board.kpiId || board.kpi_id || null,
                                  );
                                  setBoardBobot(board.bobot || "");
                                  setBoardType("kpi");
                                  setIsBoardModalOpen(true);
                                }}
                                onDelete={(boardId, e) =>
                                  handleDeleteBoard(e, boardId as number)
                                }
                              />
                            );
                          })}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </>
      )}

      {activeTab === "program_kerja" && (
        <ProgramKerjaBoard
          independentBoards={independentBoards}
          departments={departments}
          users={users}
          searchKpi={searchKpi}
          isAdmin={isAdmin}
          user={user}
          navigate={navigate}
          kategoriPrograms={kategoriPrograms}
          onEditBoard={(board: any) => {
            setEditingBoardId(board.id);
            setBoardTitle(board.title);
            setBoardDesc(board.description || "");
            setBoardStartDate(
              board.startDate
                ? new Date(board.startDate).toISOString().split("T")[0]
                : "",
            );
            setBoardTargetDate(
              board.targetDate
                ? new Date(board.targetDate).toISOString().split("T")[0]
                : "",
            );
            setBoardKondisiAktual(board.kondisiAktual || "");
            setBoardTargetAkhirTahun(board.targetAkhirTahun || "");
            setBoardOutputAkhir(board.outputAkhir || "");
            setBoardPrioritas(board.prioritas || "");
            setKategoriProgramIdForBoard(
              board.kategoriProgramId || board.kategori_program_id || null,
            );
            setTargetKpiIdForBoard(null);
            setBoardBobot(board.bobot || "");
            setBoardType("non-kpi");
            setIsBoardModalOpen(true);
          }}
          onDeleteBoard={(e: any, id: any) => handleDeleteBoard(e, id)}
          onCreateBoard={() => {
            setTargetKpiIdForBoard("");
            setBoardType("non-kpi");
            setEditingBoardId(null);
            setBoardTitle("");
            setBoardDesc("");
            setBoardStartDate("");
            setBoardTargetDate("");
            setBoardKondisiAktual("");
            setBoardTargetAkhirTahun("");
            setBoardOutputAkhir("");
            setBoardPrioritas("");
            setBoardBobot("");
            setKategoriProgramIdForBoard(null);
            setIsBoardModalOpen(true);
          }}
        />
      )}

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
              Mulai dengan membuat Key Performance Indicator (KPI) pertama Anda
              untuk memantau progress seluruh proyek.
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

      {/* KPI Modal */}
      <KpiModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingKpi={editingKpi}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
      />

      {/* Create Board Modal */}
      <BoardModal
        isOpen={isBoardModalOpen}
        onClose={() => {
          setIsBoardModalOpen(false);
          setBoardTitle("");
          setBoardDesc("");
          setBoardStartDate("");
          setBoardTargetDate("");
          setEditingBoardId(null);
        }}
        editingBoardId={editingBoardId}
        boardType={boardType}
        setBoardType={setBoardType}
        targetKpiIdForBoard={targetKpiIdForBoard}
        setTargetKpiIdForBoard={setTargetKpiIdForBoard}
        isKpiDropdownOpen={isKpiDropdownOpen}
        setIsKpiDropdownOpen={setIsKpiDropdownOpen}
        kpis={kpis}
        boardTitle={boardTitle}
        setBoardTitle={setBoardTitle}
        boardDesc={boardDesc}
        setBoardDesc={setBoardDesc}
        boardStartDate={boardStartDate}
        setBoardStartDate={setBoardStartDate}
        boardTargetDate={boardTargetDate}
        setBoardTargetDate={setBoardTargetDate}
        kategoriPrograms={kategoriPrograms}
        kategoriProgramIdForBoard={kategoriProgramIdForBoard}
        setKategoriProgramIdForBoard={setKategoriProgramIdForBoard}
        boardKondisiAktual={boardKondisiAktual}
        setBoardKondisiAktual={setBoardKondisiAktual}
        boardTargetAkhirTahun={boardTargetAkhirTahun}
        setBoardTargetAkhirTahun={setBoardTargetAkhirTahun}
        boardOutputAkhir={boardOutputAkhir}
        setBoardOutputAkhir={setBoardOutputAkhir}
        boardPrioritas={boardPrioritas}
        setBoardPrioritas={setBoardPrioritas}
        boardBobot={boardBobot}
        setBoardBobot={setBoardBobot}
        onSubmit={handleCreateBoardSubmit}
      />
    </div>
  );
};
