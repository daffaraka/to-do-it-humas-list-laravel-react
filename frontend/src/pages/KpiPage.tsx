import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { KpiDashboard } from "@/pages_old/KpiDashboard";
import { KpiDepartmentOverview } from "@/components/KpiDepartmentOverview";
import { useKpiStore } from "@/store/kpiStore";
import { useKanban } from "@/store/kanbanStore";
import { cachedGet } from "@/lib/api";

export default function KpiPage() {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);
  const { kpis, fetchKpis } = useKpiStore();
  const { boards, departments, fetchBoards, fetchDepartments } = useKanban();

  useEffect(() => {
    setIsOverviewLoading(true);
    Promise.all([
      fetchKpis(),
      fetchBoards(),
      fetchDepartments(),
      cachedGet<any[]>("/users").then((response) => setUsers(Array.isArray(response.data) ? response.data : [])),
    ]).finally(() => setIsOverviewLoading(false));
  }, [fetchBoards, fetchDepartments, fetchKpis]);

  if (selectedDepartmentId) {
    const selectedDepartment = departments.find((department) => department.id === selectedDepartmentId);
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-borderBase bg-bgPrimary px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => setSelectedDepartmentId(null)}
            className="inline-flex items-center gap-2 rounded-xl border border-borderBase bg-bgSecondary px-3 py-2 text-sm font-semibold text-textSecondary transition hover:border-indigo-400 hover:text-indigo-500"
          >
            <ArrowLeft size={16} />
            Klasifikasi Departemen
          </button>
          <span className="hidden text-sm font-semibold text-textSecondary sm:block">
            {selectedDepartment?.name || "Dashboard KPI"}
          </span>
        </div>
        <KpiDashboard viewType="all" initialDepartmentId={selectedDepartmentId} />
      </div>
    );
  }

  return (
    <KpiDepartmentOverview
      departments={departments}
      kpis={kpis}
      boards={boards}
      users={users}
      isLoading={isOverviewLoading}
      onSelectDepartment={setSelectedDepartmentId}
    />
  );
}
