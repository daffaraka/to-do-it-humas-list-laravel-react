import React from "react";
import { X } from "lucide-react";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { id as dateFnsIdLocale } from "date-fns/locale";

interface BoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBoardId: string | null;
  boardType: "kpi" | "non-kpi";
  setBoardType: (type: "kpi" | "non-kpi") => void;
  targetKpiIdForBoard: string | null;
  setTargetKpiIdForBoard: (id: string | null) => void;
  isKpiDropdownOpen: boolean;
  setIsKpiDropdownOpen: (open: boolean) => void;
  kpis: any[];
  boardTitle: string;
  setBoardTitle: (title: string) => void;
  boardDesc: string;
  setBoardDesc: (desc: string) => void;
  boardStartDate: string;
  setBoardStartDate: (date: string) => void;
  boardTargetDate: string;
  setBoardTargetDate: (date: string) => void;
  kategoriPrograms: any[];
  kategoriProgramIdForBoard: string | null;
  setKategoriProgramIdForBoard: (id: string | null) => void;
  boardKondisiAktual: string;
  setBoardKondisiAktual: (val: string) => void;
  boardTargetAkhirTahun: string;
  setBoardTargetAkhirTahun: (val: string) => void;
  boardOutputAkhir: string;
  setBoardOutputAkhir: (val: string) => void;
  boardPrioritas: string;
  setBoardPrioritas: (val: string) => void;
  boardBobot: number | string;
  setBoardBobot: (val: number | string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
}

export function BoardModal({
  isOpen,
  onClose,
  editingBoardId,
  boardType,
  setBoardType,
  targetKpiIdForBoard,
  setTargetKpiIdForBoard,
  isKpiDropdownOpen,
  setIsKpiDropdownOpen,
  kpis,
  boardTitle,
  setBoardTitle,
  boardDesc,
  setBoardDesc,
  boardStartDate,
  setBoardStartDate,
  boardTargetDate,
  setBoardTargetDate,
  kategoriPrograms,
  kategoriProgramIdForBoard,
  setKategoriProgramIdForBoard,
  boardKondisiAktual,
  setBoardKondisiAktual,
  boardTargetAkhirTahun,
  setBoardTargetAkhirTahun,
  boardOutputAkhir,
  setBoardOutputAkhir,
  boardPrioritas,
  setBoardPrioritas,
  boardBobot,
  setBoardBobot,
  onSubmit,
  isSubmitting = false,
}: BoardModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bgPrimary rounded-3xl w-full max-w-4xl shadow-2xl border border-black/[0.05] dark:border-white/[0.05] animate-in fade-in zoom-in-95 duration-200 overflow-hidden m-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 bg-black/[0.02] dark:bg-white/[0.02] shrink-0">
          <h2 className="text-xl font-bold text-textPrimary">
            {editingBoardId ? "Edit Program Kerja" : "Buat Program Kerja Baru"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-black/[0.05] dark:bg-white/[0.05] rounded-full text-textSecondary hover:text-textPrimary hover:bg-black/[0.1] dark:hover:bg-white/[0.1] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-7 space-y-5 overflow-y-auto custom-scrollbar">
          {/* Type Switcher - full width */}
          <div className="flex bg-gray-100 dark:bg-bgGlass border border-gray-200 dark:border-borderBase rounded-xl p-1">
            <button
              type="button"
              onClick={() => {
                setBoardType("non-kpi");
                setTargetKpiIdForBoard(null);
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                boardType === "non-kpi"
                  ? "bg-white dark:bg-bgPrimary text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-textSecondary hover:text-textPrimary hover:bg-gray-200/50 dark:hover:bg-bgGlassHover"
              }`}
            >
              Non Project
            </button>
            <button
              type="button"
              onClick={() => {
                setBoardType("kpi");
                if (kpis.length > 0 && !targetKpiIdForBoard) {
                  setTargetKpiIdForBoard(kpis[0].id);
                }
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                boardType === "kpi"
                  ? "bg-white dark:bg-bgPrimary text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-textSecondary hover:text-textPrimary hover:bg-gray-200/50 dark:hover:bg-bgGlassHover"
              }`}
            >
              Terikat Main Project
            </button>
          </div>

          {/* KPI Dropdown - full width */}
          {boardType === "kpi" && (
            <div className="relative">
              <label className="block text-sm font-semibold text-textSecondary mb-2">
                Pilih Main Project <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsKpiDropdownOpen(!isKpiDropdownOpen)}
                  className="w-full text-left bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all flex justify-between items-center"
                >
                  <span className="truncate pr-4">
                    {targetKpiIdForBoard
                      ? kpis.find((k) => k.id === targetKpiIdForBoard)
                          ?.title || "-- Pilih Main Project --"
                      : "-- Pilih Main Project --"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-textSecondary transition-transform ${isKpiDropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </button>

                {isKpiDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-bgSecondary border border-gray-200 dark:border-borderBase rounded-xl shadow-lg max-h-60 overflow-y-auto custom-scrollbar py-1">
                    {kpis.map((kpi) => (
                      <div
                        key={kpi.id}
                        onClick={() => {
                          setTargetKpiIdForBoard(kpi.id);
                          setIsKpiDropdownOpen(false);
                        }}
                        className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-bgGlass break-words whitespace-normal border-b border-gray-100 last:border-0 dark:border-white/[0.05] ${targetKpiIdForBoard === kpi.id ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium" : "text-textPrimary"}`}
                      >
                        {kpi.title}
                      </div>
                    ))}
                    {kpis.length === 0 && (
                      <div className="px-4 py-3 text-sm text-textSecondary text-center">
                        Tidak ada Main Project
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Kategori Program - full width */}
          <div>
            <label className="block text-sm font-semibold text-textSecondary mb-2">
              Kategori Program
            </label>
            <select
              value={kategoriProgramIdForBoard || ""}
              onChange={(e) => setKategoriProgramIdForBoard(e.target.value || null)}
              className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all"
            >
              <option value="">-- Tanpa Kategori --</option>
              {kategoriPrograms.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* === 2-Column Grid Layout === */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT COLUMN */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-textSecondary mb-2">
                  Judul Program Kerja <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={boardTitle}
                  onChange={(e) => setBoardTitle(e.target.value)}
                  className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all placeholder-textSecondary/50"
                  placeholder="Contoh: Desain Antarmuka Aplikasi"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-textSecondary mb-2">
                  Tujuan Program
                </label>
                <textarea
                  value={boardDesc}
                  onChange={(e) => setBoardDesc(e.target.value)}
                  className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all min-h-[100px] placeholder-textSecondary/50 resize-none"
                  placeholder="Tambahkan detail proyek..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-textSecondary mb-2">
                    Mulai <span className="text-red-400">*</span>
                  </label>
                  <DatePicker
                    selected={boardStartDate ? new Date(boardStartDate) : null}
                    onChange={(date: any) =>
                      setBoardStartDate(date ? format(date, "yyyy-MM-dd") : "")
                    }
                    dateFormat="dd/MM/yyyy"
                    locale={dateFnsIdLocale}
                    placeholderText="dd/mm/yyyy"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    required
                    className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 placeholder-textSecondary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-textSecondary mb-2">
                    Target <span className="text-red-400">*</span>
                  </label>
                  <DatePicker
                    selected={
                      boardTargetDate ? new Date(boardTargetDate) : null
                    }
                    onChange={(date: any) =>
                      setBoardTargetDate(date ? format(date, "yyyy-MM-dd") : "")
                    }
                    dateFormat="dd/MM/yyyy"
                    locale={dateFnsIdLocale}
                    placeholderText="dd/mm/yyyy"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    required
                    className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 placeholder-textSecondary transition-all"
                  />
                </div>
              </div>

              {/* Prioritas - pill style like to-do */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-semibold text-textSecondary">
                    Prioritas
                  </label>
                </div>
                <div className="flex gap-2">
                  {(["low", "medium", "high"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setBoardPrioritas(boardPrioritas === p ? "" : p)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                        boardPrioritas === p
                          ? p === "high"
                            ? "bg-red-500/20 text-red-500 border-2 border-red-500/50 dark:text-red-300 shadow-sm shadow-red-500/10"
                            : p === "medium"
                              ? "bg-indigo-500/20 text-indigo-500 border-2 border-indigo-500/50 dark:text-indigo-300 shadow-sm shadow-indigo-500/10"
                              : "bg-gray-500/20 text-gray-600 border-2 border-gray-500/50 dark:text-gray-400 shadow-sm"
                          : "bg-white dark:bg-bgGlass text-textSecondary border-2 border-gray-200 dark:border-borderBase hover:bg-gray-50 dark:hover:bg-bgGlassHover"
                      }`}
                    >
                      {p === "high" ? "Tinggi" : p === "medium" ? "Sedang" : "Rendah"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bobot Lead Measure */}
              {boardType === "kpi" && (
                <div>
                  <label className="block text-sm font-semibold text-textSecondary mb-2">
                    Bobot Lead Measure
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={boardBobot}
                    onChange={(e) => setBoardBobot(e.target.value)}
                    className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all placeholder-textSecondary/50"
                    placeholder="Contoh: 25"
                  />
                </div>
              )}
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-textSecondary mb-2">
                  Kondisi Aktual
                </label>
                <textarea
                  value={boardKondisiAktual}
                  onChange={(e) => setBoardKondisiAktual(e.target.value)}
                  className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all min-h-[100px] placeholder-textSecondary/50 resize-none"
                  placeholder="Jelaskan kondisi saat ini..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-textSecondary mb-2">
                  Target Akhir Tahun
                </label>
                <textarea
                  value={boardTargetAkhirTahun}
                  onChange={(e) => setBoardTargetAkhirTahun(e.target.value)}
                  className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all min-h-[100px] placeholder-textSecondary/50 resize-none"
                  placeholder="Target yang ingin dicapai akhir tahun..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-textSecondary mb-2">
                  Output Akhir
                </label>
                <textarea
                  value={boardOutputAkhir}
                  onChange={(e) => setBoardOutputAkhir(e.target.value)}
                  className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all min-h-[100px] placeholder-textSecondary/50 resize-none"
                  placeholder="Output yang diharapkan..."
                />
              </div>
            </div>
          </div>

          {/* Action Buttons - full width */}
          <div className="flex justify-end gap-3 pt-6 border-t border-black/[0.03] dark:border-white/[0.03]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-textSecondary bg-white border border-gray-200 hover:bg-gray-50 hover:text-textPrimary rounded-xl transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!boardTitle.trim() || isSubmitting}
              className={`px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 border border-indigo-700 hover:bg-indigo-700 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 ${
                !boardTitle.trim() || isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                editingBoardId ? "Simpan Perubahan" : "Buat Program Kerja"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
