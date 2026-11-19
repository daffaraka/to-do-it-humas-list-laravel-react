import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FolderKanban,
  ListTodo,
  RefreshCw,
  Target,
  Users,
} from "lucide-react";
import { cachedGet } from "@/lib/api";
import type { Board, Card, Department } from "@/types";

type DashboardUser = { id: string; name: string; departmentId?: string; department?: Department };
type Period = "all" | "month";

const dateValue = (value?: string | null) => (value ? new Date(value) : null);
const isDone = (task: Card) => task.columnId === "done";
const isOverdue = (task: Card) => {
  const due = dateValue(task.dueDate);
  return Boolean(due && due < new Date() && !isDone(task));
};
const formatDate = (value?: string | null) =>
  value ? new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)) : "Tanpa deadline";

function MetricCard({ label, value, hint, icon: Icon, tone }: { label: string; value: string | number; hint: string; icon: typeof ListTodo; tone: string }) {
  return (
    <div className="rounded-2xl border border-borderBase bg-bgSecondary p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-textSecondary">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-textPrimary">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${tone}`}><Icon size={20} /></div>
      </div>
      <p className="mt-3 text-xs text-textSecondary">{hint}</p>
    </div>
  );
}

export default function ExecutiveDashboardPage() {
  const [tasks, setTasks] = useState<Card[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [period, setPeriod] = useState<Period>("all");
  const [departmentId, setDepartmentId] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await cachedGet<{ tasks: Card[]; boards: Board[]; departments: Department[]; users: DashboardUser[] }>("/dashboard/summary");
      setTasks(response.data.tasks);
      setBoards(response.data.boards);
      setDepartments(response.data.departments);
      setUsers(response.data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Data dashboard gagal dimuat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filteredTasks = useMemo(() => {
    const now = new Date();
    return tasks.filter((task) => {
      const taskDepartment = task.departmentId || task.board?.departmentId;
      if (departmentId !== "all" && taskDepartment !== departmentId) return false;
      if (period === "month") {
        const created = dateValue(task.createdAt);
        return Boolean(created && created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear());
      }
      return true;
    });
  }, [departmentId, period, tasks]);

  const metrics = useMemo(() => {
    const done = filteredTasks.filter(isDone).length;
    const progress = filteredTasks.filter((task) => task.columnId === "progress").length;
    const overdue = filteredTasks.filter(isOverdue).length;
    const rate = filteredTasks.length ? Math.round((done / filteredTasks.length) * 100) : 0;
    return { total: filteredTasks.length, done, progress, overdue, rate };
  }, [filteredTasks]);

  const projectRows = useMemo(() => boards.map((board) => {
    const rows = filteredTasks.filter((task) => task.boardId === board.id);
    const done = rows.filter(isDone).length;
    return { board, total: rows.length, done, rate: rows.length ? Math.round((done / rows.length) * 100) : 0 };
  }).filter((row) => row.total > 0).sort((a, b) => b.total - a.total).slice(0, 6), [boards, filteredTasks]);

  const departmentRows = useMemo(() => departments.map((department) => {
    const rows = filteredTasks.filter((task) => (task.departmentId || task.board?.departmentId) === department.id);
    const done = rows.filter(isDone).length;
    return { department, total: rows.length, done, overdue: rows.filter(isOverdue).length, rate: rows.length ? Math.round((done / rows.length) * 100) : 0 };
  }).filter((row) => row.total > 0).sort((a, b) => b.rate - a.rate), [departments, filteredTasks]);

  const urgentTasks = useMemo(() => filteredTasks.filter(isOverdue).sort((a, b) => (dateValue(a.dueDate)?.getTime() || 0) - (dateValue(b.dueDate)?.getTime() || 0)).slice(0, 5), [filteredTasks]);

  return (
    <div className="flex-1 overflow-y-auto bg-bgPrimary p-4 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-[1920px] space-y-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-500">Executive Insight</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-textPrimary">Dashboard Eksekutif</h1>
            <p className="mt-2 max-w-2xl text-sm text-textSecondary">Ringkasan kesehatan pekerjaan, pencapaian proyek, dan area yang membutuhkan perhatian.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={departmentId} onChange={(event) => setDepartmentId(event.target.value)} className="rounded-xl border border-borderBase bg-bgSecondary px-3 py-2 text-sm text-textPrimary outline-none">
              <option value="all">Semua departemen</option>
              {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </select>
            <select value={period} onChange={(event) => setPeriod(event.target.value as Period)} className="rounded-xl border border-borderBase bg-bgSecondary px-3 py-2 text-sm text-textPrimary outline-none">
              <option value="all">Semua periode</option>
              <option value="month">Bulan ini</option>
            </select>
            <button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-borderBase bg-bgSecondary px-3 py-2 text-sm text-textSecondary hover:text-textPrimary"><RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh</button>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">{error}</div>}
        {loading ? <div className="rounded-2xl border border-borderBase bg-bgSecondary p-10 text-center text-sm text-textSecondary">Memuat insight dashboard...</div> : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <MetricCard label="Total tugas" value={metrics.total} hint={`${users.length} anggota terdata`} icon={ListTodo} tone="bg-indigo-500/10 text-indigo-500" />
              <MetricCard label="Selesai" value={metrics.done} hint={`${metrics.rate}% tingkat penyelesaian`} icon={CheckCircle2} tone="bg-emerald-500/10 text-emerald-500" />
              <MetricCard label="Dalam proses" value={metrics.progress} hint="Sedang dikerjakan" icon={Clock3} tone="bg-amber-500/10 text-amber-500" />
              <MetricCard label="Terlambat" value={metrics.overdue} hint="Perlu ditindaklanjuti" icon={AlertTriangle} tone="bg-red-500/10 text-red-500" />
              <MetricCard label="Proyek aktif" value={projectRows.length} hint={`${boards.length} proyek terlihat`} icon={FolderKanban} tone="bg-purple-500/10 text-purple-500" />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_1fr]">
              <section className="rounded-2xl border border-borderBase bg-bgSecondary p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold text-textPrimary">Progress proyek</h2><p className="mt-1 text-xs text-textSecondary">Proyek dengan aktivitas tugas terbanyak</p></div><Target size={20} className="text-indigo-500" /></div>
                <div className="space-y-5">
                  {projectRows.length === 0 && <p className="py-8 text-center text-sm text-textSecondary">Belum ada data proyek.</p>}
                  {projectRows.map(({ board, total, done, rate }) => <div key={board.id}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm"><span className="truncate font-medium text-textPrimary">{board.title}</span><span className="shrink-0 text-xs text-textSecondary">{done}/{total} selesai</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-bgGlass"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all" style={{ width: `${rate}%` }} /></div>
                    <div className="mt-1 text-right text-[11px] font-semibold text-indigo-500">{rate}%</div>
                  </div>)}
                </div>
              </section>

              <section className="rounded-2xl border border-borderBase bg-bgSecondary p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold text-textPrimary">Performa departemen</h2><p className="mt-1 text-xs text-textSecondary">Tingkat penyelesaian tugas</p></div><Users size={20} className="text-purple-500" /></div>
                <div className="space-y-4">
                  {departmentRows.map(({ department, total, done, overdue, rate }) => <div key={department.id} className="rounded-xl bg-bgGlass p-3"><div className="flex items-center justify-between gap-3"><span className="truncate text-sm font-medium text-textPrimary">{department.name}</span><span className="text-sm font-bold text-textPrimary">{rate}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bgSecondary"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${rate}%` }} /></div><div className="mt-2 flex justify-between text-[11px] text-textSecondary"><span>{done}/{total} selesai</span><span className={overdue ? "text-red-500" : "text-emerald-500"}>{overdue ? `${overdue} terlambat` : "On track"}</span></div></div>)}
                  {departmentRows.length === 0 && <p className="py-8 text-center text-sm text-textSecondary">Belum ada data departemen.</p>}
                </div>
              </section>
            </div>

            <section className="rounded-2xl border border-borderBase bg-bgSecondary p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold text-textPrimary">Perhatian utama</h2><p className="mt-1 text-xs text-textSecondary">Tugas yang melewati deadline</p></div><AlertTriangle size={20} className="text-red-500" /></div>
              {urgentTasks.length === 0 ? <div className="rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-600">Semua tugas dalam filter ini masih sesuai deadline.</div> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">{urgentTasks.map((task) => <div key={task.id} className="rounded-xl border border-red-500/20 bg-red-500/5 p-3"><p className="line-clamp-2 text-sm font-medium text-textPrimary">{task.title}</p><p className="mt-2 text-xs text-red-500">Deadline {formatDate(task.dueDate)}</p></div>)}</div>}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
