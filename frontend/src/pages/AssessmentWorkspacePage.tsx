import { lazy, Suspense } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import { Award, BarChart3, HeartHandshake, Users } from "lucide-react";

const AssessmentDashboardPage = lazy(() => import("@/pages/AssessmentDashboardPage"));
const ExecutiveDashboardPage = lazy(() => import("@/pages/ExecutiveDashboardPage"));
const WorkloadPage = lazy(() => import("@/pages/WorkloadPage"));
const AvicennaWayReportPage = lazy(() => import("@/pages/AvicennaWayReportPage"));

function WorkspaceLoader() {
  return <div className="flex min-h-[50vh] items-center justify-center text-sm text-textSecondary">Memuat workspace...</div>;
}

export default function AssessmentWorkspacePage() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "assessment";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-bgPrimary">
      <div className="border-b border-borderBase bg-bgSecondary px-4 pt-4 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1920px] items-center gap-1 overflow-x-auto">
          <NavLink to="/penilaian" end className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${tab === "assessment" ? "border-indigo-500 text-indigo-500" : "border-transparent text-textSecondary hover:text-textPrimary"}`}><Award size={16} /> Penilaian</NavLink>
          <NavLink to="/penilaian?tab=executive" className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${tab === "executive" ? "border-indigo-500 text-indigo-500" : "border-transparent text-textSecondary hover:text-textPrimary"}`}><BarChart3 size={16} /> Eksekutif</NavLink>
          <NavLink to="/penilaian?tab=workload" className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${tab === "workload" ? "border-indigo-500 text-indigo-500" : "border-transparent text-textSecondary hover:text-textPrimary"}`}><Users size={16} /> Workload</NavLink>
          <NavLink to="/penilaian?tab=avicenna" className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${tab === "avicenna" ? "border-indigo-500 text-indigo-500" : "border-transparent text-textSecondary hover:text-textPrimary"}`}><HeartHandshake size={16} /> Avicenna Way</NavLink>
        </div>
      </div>
      <Suspense fallback={<WorkspaceLoader />}>
        {tab === "executive" ? <ExecutiveDashboardPage /> : tab === "workload" ? <WorkloadPage /> : tab === "avicenna" ? <AvicennaWayReportPage /> : <AssessmentDashboardPage />}
      </Suspense>
    </div>
  );
}
