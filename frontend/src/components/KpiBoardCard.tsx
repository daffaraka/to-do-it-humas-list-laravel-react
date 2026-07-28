import React from "react";
import { Edit, Trash2, Calendar, Target, Info } from "lucide-react";
import { getDaysRemaining } from "../lib/utils";

interface KpiBoardCardProps {
  board: any;
  user: any;
  isAdmin: boolean;
  kpiUserId: string | number;
  navigate: (path: string) => void;
  onEdit: (board: any, e: React.MouseEvent) => void;
  onDelete: (boardId: string | number, e: React.MouseEvent) => void;
}

export function KpiBoardCard({
  board,
  user,
  isAdmin,
  kpiUserId,
  navigate,
  onEdit,
  onDelete,
}: KpiBoardCardProps) {
  const tasks = board.tasks || [];
  const todoTasks = tasks.filter((t: any) => t.columnId === "new").length;
  const progressTasks = tasks.filter(
    (t: any) => t.columnId === "progress",
  ).length;
  const doneTasks = tasks.filter((t: any) => t.columnId === "done").length;

  return (
    <div
      onClick={() => navigate(`/board/${board.id}`)}
      className={`rounded-xl p-4 sm:p-5 border shadow-sm hover:shadow-[0_4px_12px_-4px_rgba(6,81,237,0.15)] transition-all cursor-pointer group flex flex-col min-h-[140px] sm:min-h-[160px] transform hover:-translate-y-1 relative ${
        board.userId === user?.id
          ? "bg-blue-200 dark:bg-blue-900/60 border-blue-400 dark:border-blue-600"
          : "bg-bgSecondary border-border/30"
      }`}
    >
      {(isAdmin || board.userId === user?.id || kpiUserId === user?.id) && (
        <div className="absolute top-2 right-2 flex gap-0.5 opacity-40 group-hover:opacity-100 transition-all z-10">
          <button
            onClick={(e) => onEdit(board, e)}
            className="p-1 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 hover:ring-2 hover:ring-amber-500/50 rounded-md transition-all"
            title="Edit Board"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={(e) => onDelete(board.id, e)}
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
          <div className="relative group/desc mt-2 mb-1 w-fit">
            <button className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 transition-colors cursor-help">
              <Info size={12} />
              <span className="text-[10px] font-semibold tracking-wide">
                Deskripsi
              </span>
            </button>

            <div className="absolute left-0 top-full mt-2 w-64 sm:w-72 p-3 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/desc:opacity-100 group-hover/desc:visible transition-all duration-200 z-[60] pointer-events-none">
              {board.description}
              <div className="absolute -top-1.5 left-4 w-3 h-3 bg-gray-900 dark:bg-gray-100 rotate-45"></div>
            </div>
          </div>
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
                {(() => {
                  const r = getDaysRemaining(board.targetDate);
                  return (
                    <span
                      className={`ml-0.5 ${r.isOverdue ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-500"}`}
                    >
                      ({r.text})
                    </span>
                  );
                })()}
              </span>
            )}
            {/* {board.bobot_board !== undefined && ( */}
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              Bobot: {board.bobot_board ?? 0}
            </span>
            {/* )} */}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5 text-center mt-auto">
        <div className="bg-bgPrimary rounded-lg p-1.5 shadow-sm border border-black/[0.02] dark:border-white/[0.02]">
          <div className="text-[10px] text-textSecondary mb-0.5 font-medium tracking-wider">
            TODO
          </div>
          <div className="font-bold text-textPrimary text-sm">{todoTasks}</div>
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
          <div className="font-bold text-emerald-500 text-sm">{doneTasks}</div>
        </div>
      </div>

      <div className="mt-2 space-y-1">
        {board.kondisiAktual && (
          <div className="text-[10px] text-textSecondary line-clamp-1">
            <span className="font-semibold text-textPrimary">
              Kondisi Aktual:
            </span>{" "}
            {board.kondisiAktual}
          </div>
        )}
        {board.targetAkhirTahun && (
          <div className="text-[10px] text-textSecondary line-clamp-1">
            <span className="font-semibold text-textPrimary">Target:</span>{" "}
            {board.targetAkhirTahun}
          </div>
        )}
        {board.outputAkhir && (
          <div className="text-[10px] text-textSecondary line-clamp-1">
            <span className="font-semibold text-textPrimary">Output:</span>{" "}
            {board.outputAkhir}
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
            {board.prioritas === "high"
              ? "Prioritas Tinggi"
              : board.prioritas === "medium"
                ? "Prioritas Sedang"
                : "Prioritas Rendah"}
          </span>
        </div>
      )}

      {board.bobot !== undefined && board.bobot !== null && (
        <div className="mt-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
            Bobot: {board.bobot}
          </span>
        </div>
      )}
    </div>
  );
}
