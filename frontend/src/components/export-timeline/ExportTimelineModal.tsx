import { useState, useEffect } from "react";
import { X, FileSpreadsheet, Loader2, Search } from "lucide-react";
import api from "@/lib/api";
import {
  exportTimelineToExcel,
  type TimelineUserGroup,
} from "@/lib/timelineExcelExporter";
import { UserSelectionItem } from "./UserSelectionItem";

interface ExportTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportTimelineModal({
  isOpen,
  onClose,
}: ExportTimelineModalProps) {
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [userGroups, setUserGroups] = useState<TimelineUserGroup[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setErrorMessage(null);
      setSearchUser("");
      api
        .get("/export/timeline-data")
        .then((res) => {
          const data: TimelineUserGroup[] = res.data.data || [];
          setUserGroups(data);
          setSelectedUserIds(data.map((g) => g.user.id));
        })
        .catch((err) => {
          console.error("Gagal mengambil data timeline:", err);
          setErrorMessage("Gagal memuat data dari database. Silakan coba lagi.");
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleAll = () => {
    if (selectedUserIds.length === userGroups.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(userGroups.map((g) => g.user.id));
    }
  };

  const handleExport = async () => {
    if (selectedUserIds.length === 0) return;
    try {
      setExporting(true);
      const filtered = userGroups.filter((g) =>
        selectedUserIds.includes(g.user.id)
      );
      await exportTimelineToExcel(filtered);
      onClose();
    } catch (err) {
      console.error("Error generating excel:", err);
      setErrorMessage("Terjadi kesalahan saat membuat file Excel.");
    } finally {
      setExporting(false);
    }
  };

  const displayedGroups = userGroups.filter(
    (g) =>
      g.user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      (g.user.department &&
        g.user.department.toLowerCase().includes(searchUser.toLowerCase()))
  );

  const totalTasksSelected = userGroups
    .filter((g) => selectedUserIds.includes(g.user.id))
    .reduce((sum, g) => sum + (g.totalTasks ?? g.total_tasks ?? g.tasks?.length ?? 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                Export Timeline Semua Pegawai
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ekspor data pekerjaan ke tab sheet terpisah per pegawai (.xlsx)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-hidden flex flex-col flex-1">
          {errorMessage && (
            <div className="p-3 text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900">
              {errorMessage}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400 text-sm">
              <Loader2 size={24} className="animate-spin text-emerald-600" />
              <span>Memuat data semua pegawai dari database...</span>
            </div>
          ) : (
            <>
              {/* Search & Select All */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Cari nama pegawai atau divisi..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium whitespace-nowrap"
                >
                  {selectedUserIds.length === userGroups.length
                    ? "Batal Semua"
                    : "Pilih Semua"}
                </button>
              </div>

              {/* User List */}
              <div className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                {displayedGroups.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6">
                    Tidak ada pegawai yang cocok dengan pencarian
                  </p>
                ) : (
                  displayedGroups.map((group) => (
                    <UserSelectionItem
                      key={group.user.id}
                      group={group}
                      isChecked={selectedUserIds.includes(group.user.id)}
                      onToggle={toggleUser}
                    />
                  ))
                )}
              </div>

              {/* Summary */}
              <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                <span>Total Pegawai Terpilih:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {selectedUserIds.length} dari {userGroups.length} Pegawai ({totalTasksSelected} Pekerjaan)
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            Tutup
          </button>
          <button
            type="button"
            disabled={loading || exporting || selectedUserIds.length === 0}
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
          >
            {exporting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Menyiapkan {selectedUserIds.length} Sheet Excel...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet size={16} />
                <span>Download Excel ({selectedUserIds.length} Sheet)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
