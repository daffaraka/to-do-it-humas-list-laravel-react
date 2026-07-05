import { useEffect, useState, useRef } from 'react';
import { Header } from '@/components/Header';
import { useKanban } from '@/store/kanbanStore';
import { useAuthStore } from '@/store/authStore';
import { Login } from '@/pages_old/Login';
import { Outlet, useLocation, useNavigationType } from 'react-router-dom';

function useScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const scrollPositions = useRef<Record<string, number>>({});

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('overflow-y-auto') || target.classList.contains('overflow-auto')) {
        if (target.clientHeight > 300) {
          scrollPositions.current[location.pathname] = target.scrollTop;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [location.pathname]);

  useEffect(() => {
    const savedPosition = scrollPositions.current[location.pathname] || 0;
    const restore = () => {
      const containers = document.querySelectorAll('.overflow-y-auto, .overflow-auto');
      containers.forEach(container => {
        if (container.clientHeight > 300) {
          if (navigationType === 'POP') {
            container.scrollTo({ top: savedPosition, behavior: 'instant' });
          } else {
            container.scrollTo({ top: 0, behavior: 'instant' });
          }
        }
      });
    };
    const timeoutId = setTimeout(restore, 50);
    return () => clearTimeout(timeoutId);
  }, [location.pathname, navigationType]);
}

export default function ClientLayout() {
  useScrollRestoration();
  const { isDarkMode, fetchDepartments } = useKanban();
  const { token } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const titles: Record<string, string> = {
      '/kpi': 'Dashboard KPI - Portal Humas & Jaringan',
      '/jobs': 'Pekerjaan Saya - Portal Humas & Jaringan',
      '/view-jobs': 'Semua Pekerjaan - Portal Humas & Jaringan',
      '/calendar': 'Kalender - Portal Humas & Jaringan',
      '/master': 'Master Data - Portal Humas & Jaringan'
    };

    const baseTitle = 'Portal Humas & Jaringan';
    document.title = titles[location.pathname] || baseTitle;
  }, [location.pathname]);

  useEffect(() => {
    setMounted(true);
    if (token) {
      fetchDepartments();
    }
  }, [fetchDepartments, token]);

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
