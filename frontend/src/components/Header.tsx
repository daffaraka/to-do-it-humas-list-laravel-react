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
} from "lucide-react";
import { AVAILABLE_LABELS } from "../types";
import { useKanban } from "../store/kanbanStore";
import { useAuthStore } from "../store/authStore";
import { useNotificationStore } from "../store/notificationStore";

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

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <header
      id="main-header"
      className="bg-bgSecondary/80 backdrop-blur-md border-b border-borderBase sticky top-0 z-20 flex flex-col transition-colors duration-300"
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
        <div className="hidden md:flex flex-1 mx-2 lg:mx-4 gap-2 xl:gap-3 overflow-x-auto no-scrollbar items-center justify-center">
          <Link
            to="/kpi"
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${pathname === "/kpi" ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:text-textPrimary hover:bg-bgGlass/50"}`}
            title="Dashboard Project"
          >
            Dashboard Project
          </Link>
          {/* <Link
            to="/jobs"
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${pathname === "/jobs" || pathname.startsWith("/board/") || pathname === "/" ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:text-textPrimary hover:bg-bgGlass/50"}`}
            title="Pekerjaan Saya"
          >
            Pekerjaan Saya
          </Link> */}
          <Link
            to="/view-jobs"
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${pathname === "/view-jobs" ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:text-textPrimary hover:bg-bgGlass/50"}`}
            title="Semua Pekerjaan"
          >
            Semua Pekerjaan
          </Link>
          <Link
            to="/calendar"
            onClick={() => setActiveBoardId(null)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${pathname === "/calendar" && !search ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:text-textPrimary hover:bg-bgGlass/50"}`}
            title="Kalender Kerja"
          >
            Kalender
          </Link>
          <Link
            to="/calendar?type=publikasi"
            onClick={() => setActiveBoardId(null)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${pathname === "/calendar" && search === "?type=publikasi" ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:text-textPrimary hover:bg-bgGlass/50"}`}
            title="Kalender Publikasi"
          >
            Kalender Publikasi
          </Link>
          <Link
            to="/calendar?type=meeting"
            onClick={() => setActiveBoardId(null)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${pathname === "/calendar" && search === "?type=meeting" ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:text-textPrimary hover:bg-bgGlass/50"}`}
            title="Kalender Meeting"
          >
            Kalender Meeting
          </Link>
          {isAdmin && (
            <Link
              to="/master"
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${isMasterData ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:text-textPrimary hover:bg-bgGlass/50"}`}
              title="Master Data"
            >
              Master Data
            </Link>
          )}
        </div>

        {/* Profile (Right) */}
        <div className="flex items-center justify-end gap-2 sm:gap-4 ml-auto">
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

      {/* Mobile Nav Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-borderBase bg-bgSecondary/95 backdrop-blur-md px-4 py-3 flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
          <Link
            to="/kpi"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/kpi" ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:text-textPrimary hover:bg-bgGlass/50"}`}
          >
            Dashboard Project
          </Link>
          <Link
            to="/view-jobs"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/view-jobs" ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:text-textPrimary hover:bg-bgGlass/50"}`}
          >
            Semua Pekerjaan
          </Link>
          <Link
            to="/calendar"
            onClick={() => {
              setActiveBoardId(null);
              setIsMobileMenuOpen(false);
            }}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/calendar" && !search ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:text-textPrimary hover:bg-bgGlass/50"}`}
          >
            Kalender
          </Link>
          <Link
            to="/calendar?type=publikasi"
            onClick={() => {
              setActiveBoardId(null);
              setIsMobileMenuOpen(false);
            }}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/calendar" && search === "?type=publikasi" ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:text-textPrimary hover:bg-bgGlass/50"}`}
          >
            Kalender Publikasi
          </Link>
          <Link
            to="/calendar?type=meeting"
            onClick={() => {
              setActiveBoardId(null);
              setIsMobileMenuOpen(false);
            }}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/calendar" && search === "?type=meeting" ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:text-textPrimary hover:bg-bgGlass/50"}`}
          >
            Kalender Meeting
          </Link>
          {isAdmin && (
            <Link
              to="/master"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isMasterData ? "bg-bgGlass text-textPrimary" : "text-textSecondary hover:text-textPrimary hover:bg-bgGlass/50"}`}
            >
              Master Data
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
