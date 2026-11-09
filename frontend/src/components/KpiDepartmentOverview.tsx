import { useMemo } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Layers3,
  Users,
} from "lucide-react";
import type { Board, Department, Kpi } from "@/types";

type DepartmentOverviewProps = {
  departments: Department[];
  kpis: Kpi[];
  boards: Board[];
  users: any[];
  isLoading: boolean;
  onSelectDepartment: (departmentId: string) => void;
};

type DepartmentSummary = {
  department: Department;
  wigCount: number;
  programCount: number;
  boardCount: number;
  taskCount: number;
  doneCount: number;
  relatedEmployees: number;
  crossDepartmentEmployees: number;
  progress: number;
};

const getBoardDepartmentId = (board: Board) => board.departmentId || board.department?.id;
const getTaskPicId = (task: any) => task.picId || task.pic_id || task.pic?.id;

export function KpiDepartmentOverview({
  departments,
  kpis,
  boards,
  users,
  isLoading,
  onSelectDepartment,
}: DepartmentOverviewProps) {
  const summaries = useMemo<DepartmentSummary[]>(() => departments.map((department) => {
    const departmentKpis = kpis.filter((kpi) => kpi.departmentId === department.id);
    const kpiBoards = departmentKpis.flatMap((kpi) => kpi.boards || []);
    const independentBoards = boards.filter(
      (board) => !board.kpiId && !board.kpi_id && getBoardDepartmentId(board) === department.id,
    );
    const departmentBoards = [...kpiBoards, ...independentBoards].filter(
      (board, index, list) => list.findIndex((item) => item.id === board.id) === index,
    );
    const tasks = departmentBoards.flatMap((board) => board.tasks || []);
    const getOccurrenceCount = (task: any) => Math.max(1, Number(task.recurrenceCount || 1));
    const relatedIds = new Set<string>();
    const crossDepartmentIds = new Set<string>();

    departmentBoards.forEach((board) => {
      if (board.userId) relatedIds.add(board.userId);
      (board.tasks || []).forEach((task: any) => {
        const picId = getTaskPicId(task);
        if (!picId) return;
        relatedIds.add(picId);
        const taskUser = users.find((user) => user.id === picId);
        if (taskUser && taskUser.departmentId !== department.id) crossDepartmentIds.add(picId);
      });
    });

    const taskCount = tasks.reduce((sum: number, task: any) => sum + getOccurrenceCount(task), 0);
    const doneCount = tasks.reduce(
      (sum: number, task: any) => sum + (task.columnId === "done" ? getOccurrenceCount(task) : 0),
      0,
    );
    return {
      department,
      wigCount: departmentKpis.length,
      programCount: independentBoards.length,
      boardCount: departmentBoards.length,
      taskCount,
      doneCount,
      relatedEmployees: relatedIds.size,
      crossDepartmentEmployees: crossDepartmentIds.size,
      progress: taskCount ? Math.round((doneCount / taskCount) * 100) : 0,
    };
  }), [boards, departments, kpis, users]);

  const overall = summaries.reduce(
    (result, item) => ({
      wig: result.wig + item.wigCount,
      programs: result.programs + item.programCount,
      tasks: result.tasks + item.taskCount,
      done: result.done + item.doneCount,
    }),
    { wig: 0, programs: 0, tasks: 0, done: 0 },
  );

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-bgPrimary p-4 sm:p-6">
      <div className="mx-auto max-w-[1700px] space-y-6">
        <section className="relative overflow-hidden rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 text-white shadow-xl shadow-indigo-900/10 sm:p-8">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-indigo-100">
                <Layers3 size={18} />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">KPI Workspace</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Klasifikasi Dashboard KPI</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
                Pilih departemen untuk membuka WIG dan Program Kerja. Pegawai yang membantu pekerjaan lintas departemen tetap dihitung sebagai kolaborator.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ["WIG", overall.wig],
                ["Program Kerja", overall.programs],
                ["Pekerjaan", overall.tasks],
                ["Selesai", overall.done],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <div className="text-xs text-indigo-100">{label}</div>
                  <div className="mt-1 text-2xl font-bold">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="flex items-center justify-center rounded-3xl border border-borderBase bg-bgSecondary py-24 text-sm text-textSecondary">Memuat klasifikasi departemen...</div>
        ) : summaries.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-borderBase bg-bgSecondary py-24 text-center text-textSecondary">Belum ada departemen yang dapat ditampilkan.</div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {summaries.map((summary, index) => {
              const gradient = ["from-indigo-500 to-violet-600", "from-cyan-500 to-blue-600", "from-emerald-500 to-teal-600", "from-amber-500 to-orange-600"][index % 4];
              return (
                <button
                  key={summary.department.id}
                  type="button"
                  onClick={() => onSelectDepartment(summary.department.id)}
                  className="group relative overflow-hidden rounded-3xl border border-borderBase bg-bgSecondary p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-indigo-400/50 hover:shadow-xl"
                >
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient}`} />
                  <div className="flex items-start justify-between gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
                      <Building2 size={22} />
                    </div>
                    <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-500">Buka Dashboard <ArrowRight size={13} className="ml-1 inline transition group-hover:translate-x-1" /></span>
                  </div>
                  <h2 className="mt-5 text-xl font-bold text-textPrimary">{summary.department.name}</h2>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-indigo-500"><Layers3 size={14} /> WIG</div>
                      <div className="mt-1 text-2xl font-bold text-textPrimary">{summary.wigCount}</div>
                    </div>
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500"><BriefcaseBusiness size={14} /> Program Kerja</div>
                      <div className="mt-1 text-2xl font-bold text-textPrimary">{summary.programCount}</div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-xl bg-bgPrimary/70 p-2.5"><div className="text-textSecondary">Pekerjaan</div><div className="mt-1 font-bold text-textPrimary">{summary.taskCount}</div></div>
                    <div className="rounded-xl bg-bgPrimary/70 p-2.5"><div className="text-textSecondary">Selesai</div><div className="mt-1 font-bold text-emerald-500">{summary.doneCount}</div></div>
                    <div className="rounded-xl bg-bgPrimary/70 p-2.5"><div className="text-textSecondary">Pegawai</div><div className="mt-1 font-bold text-textPrimary">{summary.relatedEmployees}</div></div>
                  </div>
                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-xs"><span className="font-semibold text-textSecondary">Progress pekerjaan</span><span className="font-bold text-textPrimary">{summary.progress}%</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-borderBase/60"><div className={`h-full rounded-full bg-gradient-to-r ${gradient}`} style={{ width: `${summary.progress}%` }} /></div>
                  </div>
                  {summary.crossDepartmentEmployees > 0 && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                      <Users size={14} /> {summary.crossDepartmentEmployees} pegawai lintas departemen ikut berkontribusi
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.04] p-4 text-sm leading-6 text-textSecondary">
          <span className="font-semibold text-textPrimary">Catatan fleksibilitas:</span> klasifikasi utama mengikuti departemen WIG atau Program Kerja. Namun, pegawai tetap ditampilkan sebagai pegawai terkait ketika menjadi pemilik board atau PIC task di departemen lain.
        </div>
      </div>
    </div>
  );
}
