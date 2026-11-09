"use client";

"use client";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Tag,
  Users,
  LayoutGrid,
  Calendar as CalendarIcon,
  LogOut,
  Sun,
  Moon,
  Layers,
  Target,
  Briefcase,
  Bell,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { AVAILABLE_LABELS } from "../types";
import { useKanban } from "../store/kanbanStore";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";
import { ExportTimelineButton } from "./export-timeline/ExportTimelineButton";

export function Header() {
  const {
    filterLabel,
    setFilterLabel,
    activeDepartment,
    setActiveDepartment,
    viewMode,
    setViewMode,
    isDarkMode,
    toggleDarkMode,
    activeBoardId,
    setActiveBoardId,
    boards,
    departments,
  } = useKanban();
  const activeBoard = boards.find((b) => b.id === activeBoardId);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role?.name?.toLowerCase() === "admin";
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const isMasterData = pathname === "/master";

  const { notifications, unreadCount, fetchNotifications, markAsRead } =
    useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCalendarMenuOpen, setIsCalendarMenuOpen] = useState(false);
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    setIsCalendarMenuOpen(false);
    setIsProjectMenuOpen(false);
  }, [pathname, search]);

  return (
    <header
      id="main-header"
      className="sticky top-0 shrink-0 bg-bgSecondary border-b border-borderBase z-40 flex flex-col transition-colors duration-300 [isolation:isolate]"
    >
      {/* Main Nav */}
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-2 sm:gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 -ml-2 text-textSecondary hover:text-textPrimary hover:bg-bgGlass rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo */}
        <div className="flex items-center gap-4 flex-1 md:flex-none md:min-w-[200px]">
          <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent truncate">
            TimePro IT & Branding
          </h1>
        </div>

        {/* Main Tabs (Tasks / Master Data / KPI / Jobs) */}
        <div className="hidden md:flex relative z-30 flex-1 mx-2 lg:mx-4 gap-1.5 xl:gap-2 overflow-visible items-center justify-center">
          <Link
            to="/penilaian"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${pathname === "/penilaian" ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:text-textPrimary hover:bg-bgGlass/50"}`}
            title="Dashboard Penilaian"
          >
            Dashboard Penilaian
          </Link>
          <button
            type="button"
            onClick={() => setIsProjectMenuOpen((open) => !open)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${pathname === "/kpi" || pathname === "/avicenna-way" ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:text-textPrimary hover:bg-bgGlass/50"}`}
            title="Menu Dashboard Project"
          >
            Dashboard Project
            <ChevronDown size={14} className={`transition-transform ${isProjectMenuOpen ? "rotate-180" : ""}`} />
          </button>
          {/* <Link
            to="/jobs"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${pathname === "/jobs" || pathname.startsWith("/board/") || pathname === "/" ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:text-textPrimary hover:bg-bgGlass/50"}`}
            title="Pekerjaan Saya"
          >
            Pekerjaan Saya
          </Link> */}
          <Link
            to="/view-jobs"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${pathname === "/view-jobs" ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:text-textPrimary hover:bg-bgGlass/50"}`}
            title="Semua Pekerjaan"
          >
            Semua Pekerjaan
          </Link>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCalendarMenuOpen((open) => !open)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${pathname === "/calendar" ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:text-textPrimary hover:bg-bgGlass/50"}`}
              title="Menu Kalender"
            >
              Kalender
              <ChevronDown size={14} className={`transition-transform ${isCalendarMenuOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
          {isAdmin && (
            <Link
              to="/master"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${isMasterData ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:text-textPrimary hover:bg-bgGlass/50"}`}
              title="Master Data"
            >
              Master Data
            </Link>
          )}
        </div>

        {/* Profile (Right) */}
        <div className="flex items-center justify-end gap-2 sm:gap-4 ml-auto">
          <ExportTimelineButton variant="minimal" />

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 relative text-textSecondary hover:text-textPrimary hover:bg-bgGlass rounded-lg transition-colors"
              title="Notifikasi"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-bgSecondary"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-bgSecondary border border-borderBase rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[400px]">
                <div className="p-3 border-b border-borderBase flex justify-between items-center bg-bgGlass">
                  <h3 className="font-semibold text-textPrimary text-sm">
                    Notifikasi
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAsRead("all")}
                      className="text-xs text-brand-500 hover:text-brand-400 transition-colors"
                    >
                      Tandai semua dibaca
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto flex-1">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-textSecondary">
                      Belum ada notifikasi
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 border-b border-borderBase/50 hover:bg-bgGlass cursor-pointer transition-colors ${notif.read ? "opacity-70" : "bg-brand-500/5"}`}
                        onClick={() => {
                          if (!notif.read) markAsRead(notif.id);
                          if (notif.link) {
                            const [path, query] = notif.link.split("?");
                            navigate(path);
                            const boardIdMatch = path.match(
                              /\/board\/([a-zA-Z0-9-]+)/,
                            );
                            if (boardIdMatch) {
                              setActiveBoardId(boardIdMatch[1]);
                            }
                            setShowNotifications(false);
                          }
                        }}
                      >
                        <h4
                          className={`text-sm ${notif.read ? "font-medium text-textSecondary" : "font-semibold text-textPrimary"}`}
                        >
                          {notif.title}
                        </h4>
                        <p className="text-xs text-textSecondary mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-2 text-textSecondary hover:text-textPrimary hover:bg-bgGlass rounded-lg transition-colors"
            title={isDarkMode ? "Light Mode" : "Dark Mode"}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-borderBase">
            <div className="hidden lg:block text-right">
              <div className="text-sm font-medium text-textPrimary">
                {user?.name}
              </div>
              <div className="text-xs text-textSecondary capitalize">
                {departments.find((d) => d.id === user?.departmentId)?.name ||
                  "Unknown"}
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-textSecondary hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {isProjectMenuOpen && (
        <div className="hidden md:block border-t border-borderBase bg-bgSecondary px-4 py-2 shadow-sm">
          <div className="mx-auto flex max-w-4xl items-center justify-center gap-2">
            <Link to="/kpi" onClick={() => setIsProjectMenuOpen(false)} className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${pathname === "/kpi" ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:bg-bgGlass hover:text-textPrimary"}`}>Buat KPI</Link>
            <Link to="/avicenna-way" onClick={() => setIsProjectMenuOpen(false)} className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${pathname === "/avicenna-way" ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:bg-bgGlass hover:text-textPrimary"}`}>Buat Avicenna Way</Link>
          </div>
        </div>
      )}

      {isCalendarMenuOpen && (
        <div className="hidden md:block border-t border-borderBase bg-bgSecondary px-4 py-2 shadow-sm">
          <div className="mx-auto flex max-w-4xl items-center justify-center gap-2">
            <Link to="/calendar" onClick={() => { setActiveBoardId(null); setIsCalendarMenuOpen(false); }} className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${pathname === "/calendar" && !search ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:bg-bgGlass hover:text-textPrimary"}`}>Kalender Kerja</Link>
            <Link to="/calendar?type=publikasi" onClick={() => { setActiveBoardId(null); setIsCalendarMenuOpen(false); }} className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${pathname === "/calendar" && search === "?type=publikasi" ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:bg-bgGlass hover:text-textPrimary"}`}>Kalender Publikasi</Link>
            <Link to="/calendar?type=meeting" onClick={() => { setActiveBoardId(null); setIsCalendarMenuOpen(false); }} className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${pathname === "/calendar" && search === "?type=meeting" ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:bg-bgGlass hover:textTextPrimary"}`}>Kalender Meeting</Link>
          </div>
        </div>
      )}

      {/* Mobile Nav Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-borderBase bg-bgSecondary/95 backdrop-blur-md px-4 py-3 flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
          <Link
            to="/penilaian"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${pathname === "/penilaian" ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:text-textPrimary hover:bg-bgGlass/50"}`}
          >
            Dashboard Penilaian
          </Link>
          <div className="rounded-xl border border-borderBase/70 bg-bgGlass/30 p-1">
            <button type="button" onClick={() => setIsProjectMenuOpen((open) => !open)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold ${pathname === "/kpi" || pathname === "/avicenna-way" ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:textTextPrimary hover:bg-bgGlass/50"}`}>
              <span>Dashboard Project</span>
              <ChevronDown size={14} className={`transition-transform ${isProjectMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {isProjectMenuOpen && <div className="mt-1 flex flex-col gap-1 border-t border-borderBase/50 pt-1">
              <Link to="/kpi" onClick={() => { setIsProjectMenuOpen(false); setIsMobileMenuOpen(false); }} className={`rounded-lg px-3 py-2 text-xs font-medium ${pathname === "/kpi" ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:bg-bgGlass hover:text-textPrimary"}`}>Buat KPI</Link>
              <Link to="/avicenna-way" onClick={() => { setIsProjectMenuOpen(false); setIsMobileMenuOpen(false); }} className={`rounded-lg px-3 py-2 text-xs font-medium ${pathname === "/avicenna-way" ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:bg-bgGlass hover:text-textPrimary"}`}>Buat Avicenna Way</Link>
            </div>}
          </div>
          <Link
            to="/view-jobs"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${pathname === "/view-jobs" ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:text-textPrimary hover:bg-bgGlass/50"}`}
          >
            Semua Pekerjaan
          </Link>
          <div className="rounded-xl border border-borderBase/70 bg-bgGlass/30 p-1">
            <button
              type="button"
              onClick={() => setIsCalendarMenuOpen((open) => !open)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold ${pathname === "/calendar" ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:text-textPrimary hover:bg-bgGlass/50"}`}
            >
              <span>Kalender</span>
              <ChevronDown size={14} className={`transition-transform ${isCalendarMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {isCalendarMenuOpen && (
              <div className="mt-1 flex flex-col gap-1 border-t border-borderBase/50 pt-1">
                <Link to="/calendar" onClick={() => { setActiveBoardId(null); setIsCalendarMenuOpen(false); setIsMobileMenuOpen(false); }} className={`rounded-lg px-3 py-2 text-xs font-medium ${pathname === "/calendar" && !search ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:bg-bgGlass hover:text-textPrimary"}`}>Kalender Kerja</Link>
                <Link to="/calendar?type=publikasi" onClick={() => { setActiveBoardId(null); setIsCalendarMenuOpen(false); setIsMobileMenuOpen(false); }} className={`rounded-lg px-3 py-2 text-xs font-medium ${pathname === "/calendar" && search === "?type=publikasi" ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:bg-bgGlass hover:text-textPrimary"}`}>Kalender Publikasi</Link>
                <Link to="/calendar?type=meeting" onClick={() => { setActiveBoardId(null); setIsCalendarMenuOpen(false); setIsMobileMenuOpen(false); }} className={`rounded-lg px-3 py-2 text-xs font-medium ${pathname === "/calendar" && search === "?type=meeting" ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:bg-bgGlass hover:text-textPrimary"}`}>Kalender Meeting</Link>
              </div>
            )}
          </div>
          {isAdmin && (
            <Link
              to="/master"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${isMasterData ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:text-textPrimary hover:bg-bgGlass/50"}`}
            >
              Master Data
            </Link>
          )}

          <div className="pt-2 border-t border-borderBase/50">
            <ExportTimelineButton className="w-full justify-center py-2.5" />
          </div>
        </div>
      )}
    </header>
  );
}
