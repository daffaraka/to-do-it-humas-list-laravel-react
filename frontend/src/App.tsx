import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ClientLayout from '@/layouts/ClientLayout';
import JobsPage from '@/pages/JobsPage';
import KpiPage from '@/pages/KpiPage';
import ViewJobsPage from '@/pages/ViewJobsPage';
import CalendarPage from '@/pages/CalendarPage';
import MasterDataPage from '@/pages/MasterDataPage';
import BoardPage from '@/pages/BoardPage';
import NotFoundPage from '@/pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ClientLayout />}>
          <Route path="/" element={<Navigate to="/jobs" replace />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/kpi" element={<KpiPage />} />
          <Route path="/view-jobs" element={<ViewJobsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/master" element={<MasterDataPage />} />
          <Route path="/board/:id" element={<BoardPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
