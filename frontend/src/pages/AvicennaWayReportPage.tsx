import { useEffect, useMemo, useState } from "react";
import { HeartHandshake, Loader2, RefreshCw, Users } from "lucide-react";
import api from "@/lib/api";

const CATEGORY_COLORS: Record<string, string> = {
  Integritas: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  Profesional: "text-violet-500 bg-violet-500/10 border-violet-500/20",
  Adaptif: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  Dedikatif: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  Sinergi: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
};

type CategoryStats = { entries: number; people: number; favoritePoints: number; analyzed: number; latestDate?: string | null; dates?: string[]; missingDates?: string[] };
type ReportMember = { id: string; name: string; role: { name?: string }; department?: { name?: string | null }; categories: Record<string, CategoryStats> };
type ReportRole = { id: string; name: string; members: ReportMember[]; categories: Record<string, CategoryStats> };
type Report = { categories: string[]; categoryTotals: Record<string, CategoryStats>; roles: ReportRole[] };

const emptyReport: Report = { categories: [], categoryTotals: {}, roles: [] };
const totalEntries = (stats: Record<string, CategoryStats>) => Object.values(stats).reduce((sum, item) => sum + item.entries, 0);
const totalFavoritePoints = (stats: Record<string, CategoryStats>) => Object.values(stats).reduce((sum, item) => sum + item.favoritePoints, 0);
const getCategoryStats = (stats: Record<string, CategoryStats> | undefined, category: string): CategoryStats => {
  if (!stats) return { entries: 0, people: 0, favoritePoints: 0, analyzed: 0 };
  const exact = stats[category];
  if (exact) return exact;
  const match = Object.entries(stats).find(([key]) => key.toLowerCase() === category.toLowerCase());
  return match?.[1] || { entries: 0, people: 0, favoritePoints: 0, analyzed: 0 };
};

const formatAvicennaDate = (value: string) => new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T00:00:00`));

function MissingAvicennaDates({ member, categories, categoryTotals }: { member: ReportMember; categories: string[]; categoryTotals: Record<string, CategoryStats> }) {
  const categoriesWithRange = categories.filter((category) => (getCategoryStats(categoryTotals, category).dates || []).length > 0);
  if (categoriesWithRange.length === 0) return null;
  const categoriesWithMissingDates = categoriesWithRange.map((category) => ({ category, dates: getCategoryStats(member.categories, category).missingDates || [] })).filter((item) => item.dates.length > 0);
  return <details className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/[0.04] px-2 py-1.5"><summary className="cursor-pointer text-[11px] font-semibold text-amber-600 dark:text-amber-400">Lihat tanggal nilai yang belum diisi</summary><div className="mt-2 space-y-1 text-[11px] leading-5 text-textSecondary">{categoriesWithMissingDates.length > 0 ? categoriesWithMissingDates.map(({ category, dates }) => <div key={category}><span className="font-semibold text-textPrimary">{category}:</span> {dates.map(formatAvicennaDate).join(", ")}</div>) : <div>Tidak ada tanggal yang perlu dilengkapi.</div>}</div></details>;
}

export default function AvicennaWayReportPage() {
  const [report, setReport] = useState<Report>(emptyReport);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Partial<Report>>("/avicenna-way/report", { timeout: 8000 });
      const data = response.data || {};
      setReport({
        categories: Array.isArray(data.categories) ? data.categories : [],
        categoryTotals: data.categoryTotals && typeof data.categoryTotals === "object" ? data.categoryTotals : {},
        roles: Array.isArray(data.roles) ? data.roles : [],
      });
    } catch (requestError) {
      console.error("Gagal memuat laporan Avicenna Way", requestError);
      setError("Laporan Avicenna Way belum dapat dimuat. Silakan coba Refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const total = useMemo(() => Object.values(report.categoryTotals || {}).reduce((sum, item) => sum + item.entries, 0), [report.categoryTotals]);

  return (
    <div className="flex-1 overflow-y-auto bg-bgPrimary p-4 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-[1920px] space-y-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-500">Avicenna Way Report</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-textPrimary">Dashboard Avicenna Way</h1>
            <p className="mt-2 max-w-3xl text-sm text-textSecondary">Ringkasan penilaian perilaku berdasarkan anggota tim dan role yang dapat Anda lihat.</p>
          </div>
          <button onClick={() => void load()} className="inline-flex items-center gap-2 self-start rounded-xl border border-borderBase bg-bgSecondary px-3 py-2 text-sm text-textSecondary hover:text-textPrimary lg:self-auto"><RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh</button>
        </div>

        {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">{error}</div>}
        {loading ? <div className="rounded-2xl border border-borderBase bg-bgSecondary p-10 text-center text-sm text-textSecondary"><Loader2 size={20} className="mr-2 inline animate-spin" /> Memuat laporan Avicenna Way...</div> : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {report.categories.map((category) => {
                const stats = getCategoryStats(report.categoryTotals, category);
                return <div key={category} className={`rounded-2xl border p-4 ${CATEGORY_COLORS[category] || "border-borderBase bg-bgSecondary text-textPrimary"}`}><div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold">{category}</span><HeartHandshake size={17} /></div><div className="mt-3 text-3xl font-bold text-textPrimary">{stats.entries} <span className="text-sm font-semibold">Log Aktivitas</span></div><div className="mt-1 text-xs text-textSecondary">{stats.people} anggota · {stats.favoritePoints} favorit · {stats.analyzed} dianalisis</div></div>;
              })}
            </div>

            <section className="rounded-2xl border border-borderBase bg-bgSecondary p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="font-semibold text-textPrimary">Penilaian per role dan anggota tim</h2><p className="mt-1 text-xs text-textSecondary">Total {total} entri penilaian dari {report.roles.length} role.</p></div><Users size={20} className="text-indigo-500" /></div>
              <div className="overflow-x-auto rounded-2xl border border-borderBase">
                <table className="min-w-[980px] w-full table-fixed text-left text-sm">
                  <colgroup><col className="w-[30%]" />{report.categories.map((category) => <col key={category} className="w-[10%]" />)}<col className="w-[10%]" /><col className="w-[10%]" /></colgroup>
                  <thead className="border-b border-borderBase bg-bgSecondary text-xs text-textSecondary"><tr><th className="px-4 py-3 font-semibold">Nama anggota</th>{report.categories.map((category) => <th key={category} className="px-3 py-3 text-center font-semibold">{category}</th>)}<th className="px-2 py-3 text-center font-semibold leading-tight">Total log<br />aktivitas</th><th className="px-2 py-3 text-center font-semibold leading-tight">Total<br />favorit</th></tr></thead>
                  <tbody className="divide-y divide-borderBase">
                    {[...report.roles].sort((a, b) => totalFavoritePoints(b.categories) - totalFavoritePoints(a.categories) || totalEntries(b.categories) - totalEntries(a.categories)).flatMap((role) => [
                      <tr key={`role-${role.id}`} className="bg-bgGlass"><td colSpan={report.categories.length + 3} className="px-4 py-3"><h3 className="font-semibold text-textPrimary">{role.name}</h3></td></tr>,
                    ...[...role.members].sort((a, b) => totalFavoritePoints(b.categories) - totalFavoritePoints(a.categories) || totalEntries(b.categories) - totalEntries(a.categories) || a.name.localeCompare(b.name)).map((member) => <tr key={member.id} className="hover:bg-bgGlass/50"><td className="px-4 py-3"><div className="truncate font-medium text-textPrimary">{member.name}</div><div className="mt-0.5 truncate text-xs text-textSecondary">{member.department?.name || "Tanpa departemen"}</div><MissingAvicennaDates member={member} categories={report.categories} categoryTotals={report.categoryTotals} /></td>{report.categories.map((category) => { const stats = getCategoryStats(member.categories, category); return <td key={category} className="px-3 py-3 text-center"><span className={`inline-flex min-w-8 justify-center rounded-full px-2 py-1 text-xs font-bold ${stats.entries ? "bg-indigo-500/10 text-indigo-500" : "bg-bgGlass text-textSecondary"}`}>{stats.entries}</span><div className="mt-1 text-[10px] text-textSecondary">{stats.favoritePoints} fav</div></td>; })}<td className="px-3 py-3 text-center font-bold text-textPrimary">{totalEntries(member.categories)}</td><td className="px-3 py-3 text-center font-bold text-indigo-500">{totalFavoritePoints(member.categories)}</td></tr>),
                    ])}
                    {report.roles.length === 0 && <tr><td colSpan={report.categories.length + 2} className="py-10 text-center text-sm text-textSecondary">Belum ada data anggota tim.</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
