import { Check, Save } from "lucide-react";
import { AVICENNA_CATEGORIES } from "@/lib/avicennaWay";
import { AvicennaWayTable } from "@/components/avicenna-way/AvicennaWayTable";
import { AvicennaWayFavoriteSummary } from "@/components/avicenna-way/AvicennaWayFavoriteSummary";
import {
  useAvicennaWaySheets,
  type SaveState,
} from "@/hooks/useAvicennaWaySheets";

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

function AvicennaWayCategoryTabs({
  activeCategory,
  onSelectCategory,
}: {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}) {
  return (
    <div className="border-t border-borderBase bg-bgGlass/50 px-3 pt-3">
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
    </div>
  );
}

export default function AvicennaWayPage() {
  const {
    activeCategory,
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

  return (
    <div className="flex-1 overflow-y-auto bg-bgPrimary p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <AvicennaWayBanner saveState={saveState} />

        <section className="overflow-hidden rounded-2xl border border-borderBase bg-bgSecondary shadow-sm">
          <AvicennaWayTable
            sheet={sheet}
            groups={dateGroups}
            isLoading={isLoading}
            handlers={{
              onSetCell: setCell,
              onDateFocusStart: handleDateFocusStart,
              onDateFocusEnd: handleDateFocusEnd,
              onAddRow: addRow,
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
