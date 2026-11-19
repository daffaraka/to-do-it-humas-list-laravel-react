import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, RefreshCw, Users } from "lucide-react";
import { cachedGet } from "@/lib/api";
import type { Card, Department } from "@/types";

type WorkloadUser = { id: string; name: string; departmentId?: string; department?: Department };
const done = (task: Card) => task.columnId === "done";
const overdue = (task: Card) => Boolean(task.dueDate && new Date(task.dueDate) < new Date() && !done(task));

export default function WorkloadPage() {
  const [tasks, setTasks] = useState<Card[]>([]);
  const [users, setUsers] = useState<WorkloadUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentId, setDepartmentId] = useState("all");
  const [onlyAttention, setOnlyAttention] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const response = await cachedGet<{ tasks: Card[]; users: WorkloadUser[]; departments: Department[] }>("/dashboard/summary");
      setTasks(response.data.tasks); setUsers(response.data.users); setDepartments(response.data.departments);
    } catch (err) { setError(err instanceof Error ? err.message : "Data workload gagal dimuat"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const rows = useMemo(() => users.map((user) => {
    const userTasks = tasks.filter((task) => {
      const picId = (task as any).picId || (task as any).pic_id || (task as any).pic?.id || task.pic;
      const taskDepartment = task.departmentId || task.board?.departmentId;
      return String(picId) === String(user.id) && (departmentId === "all" || taskDepartment === departmentId);
    });
    const completed = userTasks.filter(done).length;
    const active = userTasks.filter((task) => !done(task)).length;
    const late = userTasks.filter(overdue).length;
    return { user, total: userTasks.length, completed, active, late, rate: userTasks.length ? Math.round((completed / userTasks.length) * 100) : 0 };
  }).filter((row) => row.total > 0 || !onlyAttention || row.late > 0).sort((a, b) => (b.active + b.late * 2) - (a.active + a.late * 2)), [departmentId, onlyAttention, tasks, users]);

  const summary = useMemo(() => ({ people: rows.length, active: rows.reduce((sum, row) => sum + row.active, 0), late: rows.reduce((sum, row) => sum + row.late, 0), overloaded: rows.filter((row) => row.active >= 8 || row.late >= 3).length }), [rows]);
  const maxLoad = Math.max(1, ...rows.map((row) => row.active));

  return <div className="flex-1 overflow-y-auto bg-bgPrimary p-4 sm:p-6 lg:p-10"><div className="mx-auto max-w-[1920px] space-y-6">
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-500">Capacity Planning</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-textPrimary">Workload Management</h1><p className="mt-2 max-w-2xl text-sm text-textSecondary">Pantau pembagian tugas dan temukan PIC yang membutuhkan bantuan sebelum pekerjaan terlambat.</p></div><div className="flex flex-wrap gap-2"><select value={departmentId} onChange={(event) => setDepartmentId(event.target.value)} className="rounded-xl border border-borderBase bg-bgSecondary px-3 py-2 text-sm text-textPrimary outline-none"><option value="all">Semua departemen</option>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select><button onClick={() => setOnlyAttention((value) => !value)} className={`rounded-xl border px-3 py-2 text-sm ${onlyAttention ? "border-red-500/40 bg-red-500/10 text-red-500" : "border-borderBase bg-bgSecondary text-textSecondary"}`}>Hanya perlu perhatian</button><button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-borderBase bg-bgSecondary px-3 py-2 text-sm text-textSecondary hover:text-textPrimary"><RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh</button></div></div>
    {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">{error}</div>}
    {loading ? <div className="rounded-2xl border border-borderBase bg-bgSecondary p-10 text-center text-sm text-textSecondary">Memuat pembagian workload...</div> : <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><div className="rounded-2xl border border-borderBase bg-bgSecondary p-5"><Users className="text-indigo-500" size={20} /><p className="mt-4 text-xs uppercase tracking-wider text-textSecondary">PIC aktif</p><p className="mt-1 text-3xl font-bold text-textPrimary">{summary.people}</p></div><div className="rounded-2xl border border-borderBase bg-bgSecondary p-5"><Clock3 className="text-amber-500" size={20} /><p className="mt-4 text-xs uppercase tracking-wider text-textSecondary">Tugas berjalan</p><p className="mt-1 text-3xl font-bold text-textPrimary">{summary.active}</p></div><div className="rounded-2xl border border-borderBase bg-bgSecondary p-5"><AlertTriangle className="text-red-500" size={20} /><p className="mt-4 text-xs uppercase tracking-wider text-textSecondary">Terlambat</p><p className="mt-1 text-3xl font-bold text-textPrimary">{summary.late}</p></div><div className="rounded-2xl border border-borderBase bg-bgSecondary p-5"><CheckCircle2 className="text-purple-500" size={20} /><p className="mt-4 text-xs uppercase tracking-wider text-textSecondary">Overload</p><p className="mt-1 text-3xl font-bold text-textPrimary">{summary.overloaded}</p></div></div>
      <section className="overflow-hidden rounded-2xl border border-borderBase bg-bgSecondary shadow-sm"><div className="border-b border-borderBase p-5"><h2 className="font-semibold text-textPrimary">Peta beban kerja per PIC</h2><p className="mt-1 text-xs text-textSecondary">Beban aktif diberi bobot lebih tinggi jika sudah melewati deadline.</p></div><div className="divide-y divide-borderBase">{rows.length === 0 && <p className="p-8 text-center text-sm text-textSecondary">Tidak ada PIC dengan data sesuai filter.</p>}{rows.map((row) => <div key={row.user.id} className="p-4 transition-colors hover:bg-bgGlass"><div className="flex flex-col gap-3 lg:flex-row lg:items-center"><div className="flex min-w-[220px] items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-bold text-white">{row.user.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-semibold text-textPrimary">{row.user.name}</p><p className="truncate text-xs text-textSecondary">{row.user.department?.name || departments.find((department) => department.id === row.user.departmentId)?.name || "Tanpa departemen"}</p></div></div><div className="flex-1"><div className="mb-2 flex items-center justify-between text-xs"><span className="text-textSecondary">{row.active} tugas aktif dari {row.total}</span><span className={row.late ? "font-semibold text-red-500" : "font-semibold text-emerald-500"}>{row.late ? `${row.late} terlambat` : `${row.rate}% selesai`}</span></div><div className="flex h-3 gap-1 overflow-hidden rounded-full bg-bgGlass"><div className="rounded-full bg-amber-400" style={{ width: `${Math.max(4, (row.active / maxLoad) * 78)}%` }} /><div className="rounded-full bg-red-500" style={{ width: `${row.late ? Math.max(4, (row.late / maxLoad) * 22) : 0}%` }} /></div></div><div className="grid grid-cols-3 gap-4 text-right text-xs lg:w-64"><div><p className="text-textSecondary">Selesai</p><p className="mt-1 font-semibold text-emerald-500">{row.completed}</p></div><div><p className="text-textSecondary">Aktif</p><p className="mt-1 font-semibold text-amber-500">{row.active}</p></div><div><p className="text-textSecondary">Status</p><p className={`mt-1 font-semibold ${row.active >= 8 || row.late >= 3 ? "text-red-500" : "text-indigo-500"}`}>{row.active >= 8 || row.late >= 3 ? "Overload" : "Sehat"}</p></div></div></div></div>)}</div></section>
    </>}
  </div></div>;
}
