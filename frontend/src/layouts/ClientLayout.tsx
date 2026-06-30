import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { useKanban } from '@/store/kanbanStore';
import { useAuthStore } from '@/store/authStore';
import { Login } from '@/pages_old/Login';
import { Outlet } from 'react-router-dom';

export default function ClientLayout() {
  const { isDarkMode, fetchDepartments } = useKanban();
  const { token } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (!mounted) return <div className="min-h-screen bg-bgPrimary flex items-center justify-center text-textSecondary">Memuat...</div>;

  if (!token) {
    return <Login />;
  }

  return (
    <div className={`min-h-screen bg-bgPrimary text-textPrimary flex flex-col font-sans transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <Header />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
