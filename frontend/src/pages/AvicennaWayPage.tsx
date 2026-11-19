import { useRef, useState, type ReactNode } from "react";
import ExcelJS from "exceljs";
import { Check, Download, Plus, Save } from "lucide-react";
import { AVICENNA_CATEGORIES, getTodayIsoDate } from "@/lib/avicennaWay";
import { AvicennaWayTable } from "@/components/avicenna-way/AvicennaWayTable";
import { AvicennaWayFavoriteSummary } from "@/components/avicenna-way/AvicennaWayFavoriteSummary";
import {
  useAvicennaWaySheets,
  type SaveState,
} from "@/hooks/useAvicennaWaySheets";
import type { AvicennaWaySheet } from "@/lib/avicennaWay";

async function downloadAvicennaWorkbook(sheets: Record<string, AvicennaWaySheet>) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TimePro";
  workbook.created = new Date();

  AVICENNA_CATEGORIES.forEach((category) => {
    const source = sheets[category];
    const columns = source?.columns || [];
    const worksheet = workbook.addWorksheet(category);
    worksheet.views = [{ state: "frozen", ySplit: 3 }];
    worksheet.mergeCells(1, 1, 1, columns.length);
    const title = worksheet.getCell(1, 1);
    title.value = `Avicenna Way - ${category}`;
    title.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
    title.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F46E5" } };
    title.alignment = { vertical: "middle", horizontal: "left" };
    worksheet.getRow(1).height = 28;
    worksheet.mergeCells(2, 1, 2, columns.length);
    worksheet.getCell(2, 1).value = "Data penilaian perilaku Avicenna Way";
    worksheet.getCell(2, 1).font = { italic: true, color: { argb: "FF64748B" } };

    const header = worksheet.addRow(columns);
    header.height = 32;
    header.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6366F1" } };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      cell.border = { bottom: { style: "thin", color: { argb: "FFD1D5DB" } } };
    });

    (source?.rows || []).forEach((row) => {
      const exportCells = row.cells.map((value, index) => {
        if (columns[index] !== "Fasilitator") return value;
        const normalized = String(value || "").trim().toLowerCase();
        return ["true", "1", "ya", "yes", "✓", "✔"].includes(normalized) ? "✓" : normalized === "false" || normalized === "0" || normalized === "tidak" || normalized === "no" ? "" : value;
      });
      const excelRow = worksheet.addRow(exportCells);
      excelRow.alignment = { vertical: "top", wrapText: true };
      excelRow.eachCell((cell) => {
        cell.border = { bottom: { style: "hair", color: { argb: "FFE2E8F0" } } };
      });
      if (excelRow.number % 2 === 0) {
        excelRow.eachCell((cell) => { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } }; });
      }
    });

    worksheet.autoFilter = { from: { row: 3, column: 1 }, to: { row: Math.max(3, worksheet.rowCount), column: columns.length } };
    worksheet.columns.forEach((column, index) => {
      const longest = Math.max(columns[index]?.length || 0, ...((source?.rows || []).map((row) => String(row.cells[index] || "").length).slice(0, 100)));
      column.width = Math.min(45, Math.max(14, longest + 2));
    });
    const dateIndex = columns.indexOf("Tanggal");
    if (dateIndex >= 0) worksheet.getColumn(dateIndex + 1).width = 15;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Avicenna_Way_${new Date().toISOString().slice(0, 10)}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

function AvicennaWayBanner({ saveState }: { saveState: SaveState }) {
  const statusLabel =
    saveState === "saving"
      ? "Menyimpan..."
      : saveState === "error"
        ? "Gagal menyimpan"
        : saveState === "saved"
          ? "Tersimpan otomatis"
          : "Siap diedit";

  return (
    <section className="rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-6 text-white shadow-xl sm:p-8">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-white/70">
            Dashboard Project
          </div>
          <h1 className="text-3xl font-bold sm:text-4xl">Avicenna Ways</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/80">
            Dokumentasikan perilaku, indikator, dan bukti penerapan nilai Avicenna secara kolaboratif.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm">
          {saveState === "saving" ? (
            <Save size={16} className="animate-pulse" />
          ) : (
            <Check size={16} />
          )}
          {statusLabel}
        </div>
      </div>
    </section>
  );
}

function useCollapsedDateGroups(category: string) {
  const [collapsedDates, setCollapsedDates] = useState<Record<string, boolean>>({});

  const isGroupCollapsed = (dateKey: string) =>
    Boolean(collapsedDates[`${category}:${dateKey}`]);

  const toggleGroup = (dateKey: string) => {
    const key = `${category}:${dateKey}`;
    setCollapsedDates((current) => ({ ...current, [key]: !current[key] }));
  };

  const expandGroup = (dateKey: string) => {
    const key = `${category}:${dateKey}`;
    setCollapsedDates((current) =>
      current[key] ? { ...current, [key]: false } : current,
    );
  };

  return { isGroupCollapsed, toggleGroup, expandGroup };
}

function AvicennaWayCategoryTabs({
  activeCategory,
  onSelectCategory,
  action,
  withTopBorder = true,
}: {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  action?: ReactNode;
  withTopBorder?: boolean;
}) {
  return (
    <div
      className={`${withTopBorder ? "border-t border-borderBase" : ""} bg-bgGlass/50 px-3 pt-3`}
    >
      <div className="flex flex-col-reverse gap-2.5 md:flex-row md:items-end md:justify-between">
        <div
          className="flex gap-1 overflow-x-auto"
          role="tablist"
          aria-label="Kategori Avicenna Way"
        >
          {AVICENNA_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={activeCategory === category}
              onClick={() => onSelectCategory(category)}
              className={`whitespace-nowrap rounded-t-xl border border-b-0 px-4 py-3 text-sm font-semibold transition ${
                activeCategory === category
                  ? "border-borderBase bg-bgSecondary text-indigo-500"
                  : "border-transparent text-textSecondary hover:bg-bgSecondary/60 hover:text-textPrimary"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        {action && (
          <div className="flex shrink-0 justify-end pb-1 md:pb-2">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AvicennaWayPage() {
  const {
    activeCategory,
    sheets,
    setActiveCategory,
    isLoading,
    saveState,
    sheet,
    dateGroups,
    favoriteSummary,
    setCell,
    handleDateFocusStart,
    handleDateFocusEnd,
    addRow,
    deleteRow,
    clearAnalysis,
    analyzeRow,
  } = useAvicennaWaySheets();
  const { isGroupCollapsed, toggleGroup, expandGroup } =
    useCollapsedDateGroups(activeCategory);
  const sheetSectionRef = useRef<HTMLElement>(null);

  const handleAddRow = (defaultDate = getTodayIsoDate()) => {
    expandGroup(defaultDate);
    addRow(defaultDate);
  };

  const handleAddTodayFromBottom = () => {
    handleAddRow(getTodayIsoDate());
    sheetSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-bgPrimary p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1920px] space-y-5">
        <AvicennaWayBanner saveState={saveState} />

        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => addRow()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} /> Tambah baris (Hari ini)
          </button>
          <button type="button" onClick={() => void downloadAvicennaWorkbook(sheets)} disabled={isLoading} className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-400"><Download size={16} /> Download Excel</button>
        </div>

        <section
          ref={sheetSectionRef}
          className="overflow-hidden rounded-2xl border border-borderBase bg-bgSecondary shadow-sm"
        >
          <AvicennaWayCategoryTabs
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            withTopBorder={false}
            action={
              <button
                type="button"
                onClick={() => handleAddRow()}
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <Plus size={16} /> Tambah baris (Hari ini)
              </button>
            }
          />

          <AvicennaWayTable
            sheet={sheet}
            groups={dateGroups}
            isLoading={isLoading}
            isGroupCollapsed={isGroupCollapsed}
            onToggleGroup={toggleGroup}
            handlers={{
              onSetCell: setCell,
              onDateFocusStart: handleDateFocusStart,
              onDateFocusEnd: handleDateFocusEnd,
              onAddRow: handleAddRow,
              onAddTodayFromBottom: handleAddTodayFromBottom,
              onDeleteRow: deleteRow,
              onAnalyzeRow: analyzeRow,
              onClearAnalysis: clearAnalysis,
            }}
          />

          <AvicennaWayFavoriteSummary summary={favoriteSummary} />

          <AvicennaWayCategoryTabs
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
        </section>

        <p className="text-xs text-textSecondary">
          Baris dikelompokkan dan diurutkan otomatis dari tanggal terbaru ke terlama. Perubahan disimpan otomatis sekitar 0,65 detik setelah selesai mengetik.
        </p>
      </div>
    </div>
  );
}
