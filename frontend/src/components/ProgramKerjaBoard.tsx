import React, { useState, useMemo } from "react";
import {
  LayoutGrid,
  Filter,
  ChevronDown,
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Target,
  ListTree,
} from "lucide-react";

interface ProgramKerjaBoardProps {
  independentBoards: any[];
  departments: any[];
  users: any[];
  searchKpi: string;
  isAdmin: boolean;
  user: any;
  navigate: (path: string) => void;
  kategoriPrograms?: any[];
  onEditBoard: (board: any) => void;
  onDeleteBoard: (e: React.MouseEvent, boardId: string) => void;
  onCreateBoard: () => void;
}

export function ProgramKerjaBoard({
  independentBoards,
  departments,
  users,
  searchKpi,
  isAdmin,
  user,
  navigate,
  kategoriPrograms = [],
  onEditBoard,
  onDeleteBoard,
  onCreateBoard,
}: ProgramKerjaBoardProps) {
  const [filterIndepDepartment, setFilterIndepDepartment] =
    useState<string>("all");
  const [filterIndepPic, setFilterIndepPic] = useState<string>("all");
  const [isIndepDeptDropdownOpen, setIsIndepDeptDropdownOpen] = useState(false);
  const [isIndepPicDropdownOpen, setIsIndepPicDropdownOpen] = useState(false);

  const [viewMode, setViewMode] = useState<"all" | "grouped">("all");

  const uniqueIndepPics = useMemo(() => {
    const pics = new Set<string>();
    independentBoards.forEach((board) => {
      if (board.user?.name) pics.add(board.user.name);
      if (board.tasks) {
        board.tasks.forEach((t: any) => {
          if (typeof t.pic === "object" && t.pic) {
            pics.add((t.pic as any).name);
          } else if (typeof t.pic === "string") {
            const foundUser = users.find((u) => u.id === t.pic);
            if (foundUser) pics.add(foundUser.name);
          } else if (t.pic_id) {
            const foundUser = users.find((u) => u.id === t.pic_id);
            if (foundUser) pics.add(foundUser.name);
          }
        });
      }
    });
    return Array.from(pics).sort();
  }, [independentBoards, users]);

  const filteredBoards = useMemo(() => {
    return independentBoards.filter((board) => {
      if (filterIndepDepartment !== "all") {
        const deptId = board.departmentId || board.department_id;
        if (deptId !== filterIndepDepartment) {
          return false;
        }
      }

      if (filterIndepPic !== "all") {
        let isMatch = false;
        if (board.user?.name === filterIndepPic) {
          isMatch = true;
        } else {
          isMatch = !!board.tasks?.some((t: any) => {
            let picName = null;
            if (typeof t.pic === "object" && t.pic) {
              picName = (t.pic as any).name;
            } else if (typeof t.pic === "string") {
              const foundUser = users.find((u) => u.id === t.pic);
              if (foundUser) picName = foundUser.name;
            } else if (t.pic_id) {
              const foundUser = users.find((u) => u.id === t.pic_id);
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
    });
  }, [
    independentBoards,
    filterIndepDepartment,
    filterIndepPic,
    searchKpi,
    users,
  ]);

  const groupedBoards = useMemo(() => {
    const groups: Record<string, any[]> = {};

    kategoriPrograms.forEach((cat) => {
      groups[cat.id] = [];
    });
    groups["uncategorized"] = [];

    filteredBoards.forEach((board) => {
      const catId = board.kategoriProgramId || board.kategori_program_id;
      if (catId && groups[catId]) {
        groups[catId].push(board);
      } else {
        groups["uncategorized"].push(board);
      }
    });
    return groups;
  }, [filteredBoards, kategoriPrograms]);

  const renderBoardCard = (board: any) => {
    const tasks = board.tasks || [];
    const todoTasks = tasks.filter((t: any) => t.columnId === "new").length;
    const progressTasks = tasks.filter(
      (t: any) => t.columnId === "progress",
    ).length;
    const doneTasks = tasks.filter((t: any) => t.columnId === "done").length;

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
                onEditBoard(board);
              }}
              className="p-1 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 hover:ring-2 hover:ring-amber-500/50 rounded-md transition-all"
              title="Edit Leadmeassure"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={(e) => onDeleteBoard(e, board.id)}
              className="p-1 text-red-500 hover:text-red-600 hover:bg-red-500/10 hover:ring-2 hover:ring-red-500/50 rounded-md transition-all"
              title="Hapus Leadmeassure"
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
  };

  return (
    <div className="mb-6 sm:mb-10 bg-bgPrimary rounded-2xl p-4 sm:p-6 shadow-sm border border-black/[0.03] dark:border-white/[0.03] hover:shadow-md transition-shadow min-h-[300px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white shadow-md shadow-gray-500/20 shrink-0">
            <LayoutGrid size={20} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-textPrimary">
              Program Kerja
            </h2>
            <p className="text-xs text-textSecondary mt-0.5">
              Leadmeassure pekerjaan yang tidak terkait dengan indikator WIG
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-gray-100 dark:bg-bgSecondary p-1 rounded-xl flex items-center border border-gray-200 dark:border-borderBase shadow-sm">
            <button
              onClick={() => setViewMode("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "all"
                  ? "bg-white dark:bg-bgPrimary text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-textSecondary hover:text-textPrimary"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setViewMode("grouped")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === "grouped"
                  ? "bg-white dark:bg-bgPrimary text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-textSecondary hover:text-textPrimary"
              }`}
            >
              <ListTree size={14} />
              Grup Kategori
            </button>
          </div>

          {/* Department Filter */}
          <div className="relative">
            <button
              onClick={() =>
                setIsIndepDeptDropdownOpen(!isIndepDeptDropdownOpen)
              }
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all shadow-sm ${
                filterIndepDepartment !== "all"
                  ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400"
                  : "bg-white dark:bg-bgSecondary border-gray-200 dark:border-borderBase text-textSecondary hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-bgGlassHover"
              }`}
            >
              <Filter size={14} />
              <span>
                {filterIndepDepartment === "all"
                  ? "Semua Departemen"
                  : departments.find((d) => d.id === filterIndepDepartment)
                      ?.name || "Departemen"}
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform ${isIndepDeptDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isIndepDeptDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsIndepDeptDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-bgSecondary border border-gray-200 dark:border-borderBase rounded-xl shadow-xl z-50 py-1 max-h-72 overflow-y-auto custom-scrollbar">
                  <button
                    onClick={() => {
                      setFilterIndepDepartment("all");
                      setIsIndepDeptDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                      filterIndepDepartment === "all"
                        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium"
                        : "text-textPrimary hover:bg-gray-50 dark:hover:bg-bgGlass"
                    }`}
                  >
                    Semua Departemen
                  </button>
                  {departments.map((dept) => (
                    <button
                      key={dept.id}
                      onClick={() => {
                        setFilterIndepDepartment(dept.id);
                        setIsIndepDeptDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs transition-colors border-t border-gray-100 dark:border-white/[0.05] ${
                        filterIndepDepartment === dept.id
                          ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium"
                          : "text-textPrimary hover:bg-gray-50 dark:hover:bg-bgGlass"
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
                filterIndepPic !== "all"
                  ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400"
                  : "bg-white dark:bg-bgSecondary border-gray-200 dark:border-borderBase text-textSecondary hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-bgGlassHover"
              }`}
            >
              <Briefcase size={14} />
              <span className="max-w-[100px] truncate">
                {filterIndepPic === "all" ? "Semua PIC" : filterIndepPic}
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform ${isIndepPicDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isIndepPicDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsIndepPicDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-bgSecondary border border-gray-200 dark:border-borderBase rounded-xl shadow-xl z-50 py-1 max-h-72 overflow-y-auto custom-scrollbar">
                  <button
                    onClick={() => {
                      setFilterIndepPic("all");
                      setIsIndepPicDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs transition-colors ${
                      filterIndepPic === "all"
                        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium"
                        : "text-textPrimary hover:bg-gray-50 dark:hover:bg-bgGlass"
                    }`}
                  >
                    Semua PIC
                  </button>
                  {uniqueIndepPics.map((pic) => (
                    <button
                      key={pic}
                      onClick={() => {
                        setFilterIndepPic(pic);
                        setIsIndepPicDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs transition-colors border-t border-gray-100 dark:border-white/[0.05] ${
                        filterIndepPic === pic
                          ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium"
                          : "text-textPrimary hover:bg-gray-50 dark:hover:bg-bgGlass"
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
            type="button"
            onClick={onCreateBoard}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl text-xs font-medium transition-all shadow-sm shadow-indigo-500/20 flex items-center gap-1.5 w-full sm:w-auto justify-center"
          >
            <Plus size={14} />
            Buat Program Kerja
          </button>
        </div>
      </div>

      {viewMode === "all" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
          {filteredBoards.map(renderBoardCard)}
        </div>
      ) : (
        <div className="space-y-8">
          {kategoriPrograms.map((cat) => {
            const boards = groupedBoards[cat.id] || [];
            return (
              <div
                key={cat.id}
                className="bg-gray-50/50 dark:bg-white/[0.02] border-2 border-gray-200/80 dark:border-white/[0.08] shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 rounded-2xl p-5 space-y-4"
              >
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-borderBase pb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <ListTree size={16} />
                  </div>
                  <h3 className="text-lg font-semibold text-textPrimary">
                    {cat.name}
                  </h3>
                  <span className="bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs font-medium">
                    {boards.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                  {boards.map(renderBoardCard)}
                  {boards.length === 0 && (
                    <div className="col-span-full py-8 text-center text-sm text-textSecondary bg-white/40 dark:bg-bgSecondary/20 rounded-xl border border-dashed border-gray-200 dark:border-white/5">
                      Belum ada leadmeassure pada kategori ini.
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {groupedBoards["uncategorized"]?.length > 0 && (
            <div className="bg-gray-50/50 dark:bg-white/[0.02] border-2 border-gray-200/80 dark:border-white/[0.08] shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-borderBase pb-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-bgSecondary flex items-center justify-center text-gray-500">
                  <LayoutGrid size={16} />
                </div>
                <h3 className="text-lg font-semibold text-textPrimary">
                  Tanpa Kategori
                </h3>
                <span className="bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs font-medium">
                  {groupedBoards["uncategorized"].length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                {groupedBoards["uncategorized"].map(renderBoardCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
