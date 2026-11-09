import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Plus, Save, Trash2, X } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const CATEGORIES = ["Integritas", "Profesional", "Adaptif", "Dedikatif", "Sinergi"] as const;
const DEFAULT_COLUMNS = [
  "Nama",
  "Tanggal",
  "Perilaku yang sudah dilakukan (Kemarin)",
  "7 Habits",
  "Irisan Nilai Avicenna Way Lainnya",
  "Fasilitator",
  "Perilaku Favorit (Beri simbol bintang pada salah satu nama)",
  "AI Avicenna Way",
];

type Analysis = { primary_category: string; scores: Record<string, number>; status: string; explanation: string; suggestion: string };
type Sheet = { id: string; category: string; columns: string[]; rows: string[][] };

const blankSheet = (category: string): Sheet => ({
  id: `local-${category}`,
  category,
  columns: DEFAULT_COLUMNS,
  rows: [["", "", "", "", "", "", "", ""]],
});

function AutoResizeTextarea({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${Math.max(ref.current.scrollHeight, 72)}px`;
    }
  }, [value]);

  return <textarea ref={ref} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={2} className="min-h-[72px] w-full resize-y overflow-hidden rounded-lg border border-transparent bg-transparent px-2 py-2 text-sm leading-relaxed text-textPrimary outline-none transition focus:border-indigo-400 focus:bg-bgSecondary" />;
}

function AiCell({ value, onAnalyze, onClear }: { value?: string; onAnalyze: () => void; onClear: () => void }) {
  let analysis: Analysis | null = null;
  try { analysis = value ? JSON.parse(value) as Analysis : null; } catch { analysis = null; }
  return <div className="min-w-[260px] space-y-2 p-1">
    <button type="button" onClick={onAnalyze} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700">{analysis ? "Analisis ulang" : "Analisis dengan AI"}</button>
    {analysis && <div className="relative rounded-lg border border-indigo-200 bg-indigo-50 p-2 pr-8 text-xs text-slate-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-slate-200">
      <button type="button" onClick={onClear} title="Tutup hasil analisis" aria-label="Tutup hasil analisis" className="absolute right-1.5 top-1.5 rounded-md p-1 text-slate-500 transition hover:bg-indigo-100 hover:text-slate-800 dark:hover:bg-indigo-500/20 dark:hover:text-white"><X size={14} /></button>
      <div className="font-bold">{analysis.primary_category} · {analysis.status}</div>
      <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5">{Object.entries(analysis.scores || {}).map(([key, score]) => <span key={key}>{key}: {score}%</span>)}</div>
      <p className="mt-2">{analysis.explanation}</p>
      {analysis.suggestion && <p className="mt-1 text-indigo-700 dark:text-indigo-300">Saran: {analysis.suggestion}</p>}
    </div>}
  </div>;
}

export default function AvicennaWayPage() {
  const [sheets, setSheets] = useState<Record<string, Sheet>>({});
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    api.get<Sheet[]>("/avicenna-way").then(({ data }) => {
      const next: Record<string, Sheet> = {};
      CATEGORIES.forEach((category) => {
        const sheet = data.find((item) => item.category === category);
        next[category] = sheet || blankSheet(category);
      });
      setSheets(next);
    }).catch(() => setSaveState("error")).finally(() => setIsLoading(false));
  }, []);

  const saveSheet = useCallback((sheet: Sheet) => {
    setSaveState("saving");
    api.put(`/avicenna-way/${encodeURIComponent(sheet.category)}`, {
      columns: sheet.columns,
      rows: sheet.rows,
    }).then(() => setSaveState("saved")).catch(() => setSaveState("error"));
  }, []);

  const updateSheet = (category: string, updater: (sheet: Sheet) => Sheet) => {
    setSheets((current) => {
      const nextSheet = updater(current[category] || blankSheet(category));
      const next = { ...current, [category]: nextSheet };
      if (saveTimers.current[category]) clearTimeout(saveTimers.current[category]);
      saveTimers.current[category] = setTimeout(() => saveSheet(nextSheet), 650);
      return next;
    });
  };

  const sheet = sheets[activeCategory] || blankSheet(activeCategory);
  const favoriteColumnIndex = sheet.columns.indexOf("Perilaku Favorit (Beri simbol bintang pada salah satu nama)");
  const favoritePoints = sheet.rows.reduce((total, row) => total + (row[favoriteColumnIndex] === "1" ? 1 : 0), 0);
  const favoriteByName = sheet.rows.reduce<Record<string, number>>((totals, row) => {
    const name = row[0]?.trim();
    if (name && row[favoriteColumnIndex] === "1") totals[name] = (totals[name] || 0) + 1;
    return totals;
  }, {});
  const setCell = (rowIndex: number, columnIndex: number, value: string) => {
    updateSheet(activeCategory, (current) => {
      const rows = current.rows.map((row) => [...row]);
      while (rows[rowIndex].length < current.columns.length) rows[rowIndex].push("");
      rows[rowIndex][columnIndex] = value;
      return { ...current, rows };
    });
  };

  const addRow = () => updateSheet(activeCategory, (current) => ({
    ...current,
    rows: [...current.rows, current.columns.map((column) => column === "Nama" ? currentUser?.name || "" : "")],
  }));

  const deleteRow = (index: number) => updateSheet(activeCategory, (current) => ({
    ...current,
    rows: current.rows.length > 1 ? current.rows.filter((_, rowIndex) => rowIndex !== index) : current.rows,
  }));

  const clearAnalysis = (rowIndex: number) => updateSheet(activeCategory, (current) => {
    const rows = current.rows.map((row) => [...row]);
    rows[rowIndex][current.columns.indexOf("AI Avicenna Way")] = "";
    return { ...current, rows };
  });

  const analyzeRow = async (rowIndex: number) => {
    setSaveState("saving");
    try {
      const { data } = await api.post<Analysis>(`/avicenna-way/${encodeURIComponent(activeCategory)}/analyze`, {
        row: sheet.rows[rowIndex],
        active_category: activeCategory,
      });
      updateSheet(activeCategory, (current) => {
        const rows = current.rows.map((row) => [...row]);
        rows[rowIndex][current.columns.indexOf("AI Avicenna Way")] = JSON.stringify(data);
        return { ...current, rows };
      });
      setSaveState("saved");
    } catch (error: any) {
      setSaveState("error");
      window.alert(error?.response?.data?.message || "Analisis AI gagal diproses.");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-bgPrimary p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-white/70">Dashboard Project</div>
              <h1 className="text-3xl font-bold sm:text-4xl">Avicenna Ways</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/80">Dokumentasikan perilaku, indikator, dan bukti penerapan nilai Avicenna secara kolaboratif.</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm">
              {saveState === "saving" ? <Save size={16} className="animate-pulse" /> : <Check size={16} />}
              {saveState === "saving" ? "Menyimpan..." : saveState === "error" ? "Gagal menyimpan" : saveState === "saved" ? "Tersimpan otomatis" : "Siap diedit"}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-borderBase bg-bgSecondary shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full border-separate border-spacing-0 border border-borderBase text-sm">
              <thead>
                <tr className="bg-bgGlass text-left text-xs font-bold uppercase tracking-wide text-textSecondary">
                  <th className="w-14 border-b border-r border-borderBase px-3 py-3 text-center">No</th>
                  {sheet.columns.map((column, index) => <th key={`${column}-${index}`} className="border-b border-r border-borderBase px-3 py-3 align-middle leading-relaxed">{column}</th>)}
                  <th className="w-14 border-b border-borderBase px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? <tr><td colSpan={sheet.columns.length + 2} className="p-10 text-center text-textSecondary">Memuat sheet...</td></tr> : sheet.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="group hover:bg-bgGlass/40">
                    <td className="border-b border-r border-borderBase px-3 py-2 text-center align-top text-xs font-semibold text-textSecondary">{rowIndex + 1}</td>
                    {sheet.columns.map((_, columnIndex) => <td key={columnIndex} className="min-w-[190px] border-b border-r border-borderBase p-2 align-top">{columnIndex === 1 ? <input type="date" value={row[columnIndex] || ""} onChange={(event) => setCell(rowIndex, columnIndex, event.target.value)} className="w-full rounded-lg border border-transparent bg-transparent px-2 py-3 text-sm text-textPrimary outline-none transition focus:border-indigo-400 focus:bg-bgSecondary" /> : columnIndex === favoriteColumnIndex ? <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-3 text-sm text-textSecondary hover:bg-bgGlass"><input type="checkbox" checked={row[columnIndex] === "1"} onChange={(event) => setCell(rowIndex, columnIndex, event.target.checked ? "1" : "")} className="h-4 w-4 accent-indigo-600" /><span>{row[columnIndex] === "1" ? "1 poin" : "Pilih favorit"}</span></label> : columnIndex === sheet.columns.indexOf("AI Avicenna Way") ? <AiCell value={row[columnIndex]} onAnalyze={() => analyzeRow(rowIndex)} onClear={() => clearAnalysis(rowIndex)} /> : <AutoResizeTextarea value={row[columnIndex] || ""} onChange={(value) => setCell(rowIndex, columnIndex, value)} placeholder="Klik untuk mengisi..." />}</td>)}
                    <td className="border-b border-borderBase px-2 py-2 align-top"><button type="button" onClick={() => deleteRow(rowIndex)} title="Hapus baris" className="rounded-lg p-2 text-textSecondary opacity-0 transition hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-borderBase px-4 py-3"><button type="button" onClick={addRow} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-indigo-500 hover:bg-indigo-500/10"><Plus size={16} /> Tambah baris</button></div>
          <div className="border-t border-borderBase px-4 py-3 text-sm font-semibold text-textSecondary">
            <div>Total poin Perilaku Favorit: <span className="text-indigo-500">{favoritePoints}</span></div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 font-medium text-textSecondary">
              {Object.entries(favoriteByName).length > 0 ? Object.entries(favoriteByName).map(([name, points], index) => <span key={name}>{index + 1}. {name}: <span className="text-indigo-500">{points} Favorite</span></span>) : <span className="font-normal">Belum ada nama yang dipilih sebagai favorit.</span>}
            </div>
          </div>
          <div className="border-t border-borderBase bg-bgGlass/50 px-3 pt-3"><div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Kategori Avicenna Way">
            {CATEGORIES.map((category) => <button key={category} type="button" role="tab" aria-selected={activeCategory === category} onClick={() => setActiveCategory(category)} className={`whitespace-nowrap rounded-t-xl border border-b-0 px-4 py-3 text-sm font-semibold transition ${activeCategory === category ? "border-borderBase bg-bgSecondary text-indigo-500" : "border-transparent text-textSecondary hover:bg-bgSecondary/60 hover:text-textPrimary"}`}>{category}</button>)}
          </div></div>
        </section>
        <p className="text-xs text-textSecondary">Perubahan disimpan otomatis sekitar 0,65 detik setelah selesai mengetik.</p>
      </div>
    </div>
  );
}
