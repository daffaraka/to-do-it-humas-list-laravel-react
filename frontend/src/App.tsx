import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import ClientLayout from "@/layouts/ClientLayout";

const JobsPage = lazy(() => import("@/pages/JobsPage"));
const KpiPage = lazy(() => import("@/pages/KpiPage"));
const ViewJobsPage = lazy(() => import("@/pages/ViewJobsPage"));
const CalendarPage = lazy(() => import("@/pages/CalendarPage"));
const MasterDataPage = lazy(() => import("@/pages/MasterDataPage"));
const MeetingsPage = lazy(() => import("@/pages/MeetingsPage"));
const BoardPage = lazy(() => import("@/pages/BoardPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-textSecondary text-sm">Memuat halaman...</div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ClientLayout />}>
          <Route path="/" element={<Navigate to="/kpi" replace />} />
          <Route
            path="/jobs"
            element={
              <Suspense fallback={<PageLoader />}>
                <JobsPage />
              </Suspense>
            }
          />
          <Route
            path="/kpi"
            element={
              <Suspense fallback={<PageLoader />}>
                <KpiPage />
              </Suspense>
            }
          />
          <Route
            path="/view-jobs"
            element={
              <Suspense fallback={<PageLoader />}>
                <ViewJobsPage />
              </Suspense>
            }
          />
          <Route
            path="/calendar"
            element={
              <Suspense fallback={<PageLoader />}>
                <CalendarPage />
              </Suspense>
            }
          />
          <Route
            path="/meetings"
            element={
              <Suspense fallback={<PageLoader />}>
                <MeetingsPage />
              </Suspense>
            }
          />
          <Route
            path="/master"
            element={
              <Suspense fallback={<PageLoader />}>
                <MasterDataPage />
              </Suspense>
            }
          />
          <Route
            path="/board/:id"
            element={
              <Suspense fallback={<PageLoader />}>
                <BoardPage />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={<PageLoader />}>
                <NotFoundPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
