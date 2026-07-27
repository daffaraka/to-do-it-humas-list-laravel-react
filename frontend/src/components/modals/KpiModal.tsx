import React from "react";
import { X } from "lucide-react";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { id as dateFnsIdLocale } from "date-fns/locale";

interface KpiModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingKpi: any;
  formData: { title: string; description: string; targetDate: string; bobot_kpi?: number | string };
  setFormData: (data: { title: string; description: string; targetDate: string; bobot_kpi?: number | string }) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function KpiModal({
  isOpen,
  onClose,
  editingKpi,
  formData,
  setFormData,
  onSubmit,
}: KpiModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-bgPrimary rounded-3xl w-full max-w-lg shadow-2xl border border-black/[0.05] dark:border-white/[0.05] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex justify-between items-center p-6 bg-black/[0.02] dark:bg-white/[0.02]">
          <h2 className="text-xl font-bold text-textPrimary">
            {editingKpi ? "Edit KPI" : "Buat KPI Baru"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-black/[0.05] dark:bg-white/[0.05] rounded-full text-textSecondary hover:text-textPrimary hover:bg-black/[0.1] dark:hover:bg-white/[0.1] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-7 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-textSecondary mb-2">
              Judul KPI <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all placeholder-textSecondary/50"
              placeholder="Contoh: Implementasi Website E-Commerce"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-textSecondary mb-2">
              Deskripsi Singkat
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all min-h-[120px] placeholder-textSecondary/50 resize-none"
              placeholder="Jelaskan tujuan dan ruang lingkup KPI ini..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-textSecondary mb-2">
              Tanggal Target Pencapaian <span className="text-red-400">*</span>
            </label>
            <DatePicker
              selected={
                formData.targetDate ? new Date(formData.targetDate) : null
              }
              onChange={(date: any) =>
                setFormData({
                  ...formData,
                  targetDate: date ? format(date, "yyyy-MM-dd") : "",
                })
              }
              dateFormat="dd/MM/yyyy"
              locale={dateFnsIdLocale}
              placeholderText="dd/mm/yyyy"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 placeholder-textSecondary transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-textSecondary mb-2">
              Bobot WIG (%) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="any"
              min="0"
              required
              value={formData.bobot_kpi ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, bobot_kpi: e.target.value })
              }
              className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all placeholder-textSecondary/50"
              placeholder="Contoh: 100"
            />
          </div>

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
              className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 border border-indigo-700 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
            >
              {editingKpi ? "Simpan Perubahan" : "Buat KPI"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
