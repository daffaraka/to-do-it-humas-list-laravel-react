"use client";

import { useState, useMemo } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  getDay,
} from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Printer, Search } from "lucide-react";
import { useKanban } from "../store/kanbanStore";
import { CardModal } from "./CardModal";
import type { Card } from "../types";

export function CalendarView() {
  const { cards, activeDepartment, departments, boards } = useKanban();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterPic, setFilterPic] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const uniquePics = useMemo(() => {
    const pics = new Set<string>();
    cards.forEach(c => {
      const name = typeof c.pic === 'object' && c.pic ? c.pic.name : c.pic;
      if (name) pics.add(name as string);
    });
    return Array.from(pics).sort();
  }, [cards]);

  // Fallback to 'all' if the activeDepartment UUID from localStorage is stale
  const effectiveActiveDepartment =
    activeDepartment === "all" ||
    departments.some((d) => d.id === activeDepartment)
      ? activeDepartment
      : "all";

  // Helper to parse dates safely (supporting space separated dates from SQLite/Laravel)
  const parseDateSafe = (dateStr?: string | null) => {
    if (!dateStr) return new Date(NaN);
    const normalized =
      dateStr.includes(" ") && !dateStr.includes("T")
        ? dateStr.replace(" ", "T")
        : dateStr;
    return new Date(normalized);
  };

  // Helper to extract first 2 letters of PIC name
  const getPicInitials = (pic: any) => {
    let name = "";
    if (typeof pic === "object" && pic !== null) {
      name = pic.name || "";
    } else if (typeof pic === "string") {
      name = pic;
    }

    if (!name) return "??";

    name = name.trim();
    const words = name.split(/\s+/);
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Helper to get color classes based on KPI status
  const getCardColor = (card: Card) => {
    const board = card.board || boards.find(b => b.id === card.boardId);
    const isKpi = board?.kpiId || board?.kpi_id;
    if (isKpi) {
      return "bg-blue-500 border-blue-600 text-white dark:bg-blue-600 dark:border-blue-500 hover:bg-blue-600 dark:hover:bg-blue-500";
    }
    return "bg-gray-500 border-gray-600 text-white dark:bg-gray-600 dark:border-gray-500 hover:bg-gray-600 dark:hover:bg-gray-500";
  };

  // Filter cards by active department, filters, and date availability
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const hasDate = card.requestDate || card.dueDate || card.createdAt;
      if (!hasDate) return false;

      const deptIdToUse = filterDepartment !== "all" ? filterDepartment : effectiveActiveDepartment;
      if (deptIdToUse !== "all" && card.departmentId !== deptIdToUse) {
        return false;
      }

      const picName = typeof card.pic === 'object' && card.pic ? card.pic.name : card.pic;
      if (filterPic !== "all" && picName !== filterPic) {
        return false;
      }

      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesTitle = card.title?.toLowerCase().includes(query);
        const matchesDesc = card.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [cards, effectiveActiveDepartment, filterDepartment, filterPic, searchQuery]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "MMMM yyyy";
  let days = [];
  let day = startDate;
  let formattedDate = "";

  // Render Days of Week Header
  const daysOfWeek = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const renderDaysHeader = () => {
    return (
      <div className="grid grid-cols-7 border-b border-borderBase print:border-black print:border-b-2">
        {daysOfWeek.map((dayName, idx) => (
          <div
            key={idx}
            className="py-2 text-center text-xs font-semibold text-textSecondary uppercase tracking-wider print:text-black print:font-bold print:border-r print:border-black last:print:border-r-0"
          >
            {dayName}
          </div>
        ))}
      </div>
    );
  };

  // Build the grid cells
  const rows = [];
  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, "d");
      const cloneDay = day;

      // Find cards for this specific day
      const dayCards = filteredCards.filter((c) => {
        const dateStr = c.requestDate || c.dueDate || c.createdAt;
        if (!dateStr) return false;
        return isSameDay(parseDateSafe(dateStr), cloneDay);
      });

      days.push(
        <div
          key={day.toISOString()}
          className={`flex-1 min-h-[80px] border-r border-b border-borderBase print:border-black p-2 flex flex-col transition-colors ${
            !isSameMonth(day, monthStart)
              ? day < monthStart
                ? "bg-yellow-100 dark:bg-yellow-800 text-textSecondary opacity-80"
                : "bg-green-100 dark:bg-green-800 text-textSecondary opacity-80"
              : isSameDay(day, new Date())
                ? "bg-indigo-500/10 text-indigo-500 dark:text-indigo-300 print:bg-transparent print:text-black"
                : getDay(day) === 0
                  ? "bg-red-200 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-300 print:bg-transparent"
                  : "bg-transparent text-textPrimary hover:bg-bgGlass print:bg-transparent"
          }`}
        >
          <div className="flex justify-end mb-1">
            <span
              className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                isSameDay(day, new Date())
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                  : ""
              }`}
            >
              {formattedDate}
            </span>
          </div>

          {/* Cards for the day */}
          <div className="flex flex-col gap-1.5 mt-1">
            {dayCards.map((card) => {
              const picObj =
                typeof card.pic === "object" && card.pic !== null
                  ? (card.pic as any)
                  : null;

              const board = card.board || boards.find(b => b.id === card.boardId);
              const isKpi = board?.kpiId || board?.kpi_id;
              const badgeClasses = isKpi 
                ? "bg-white text-gray-800" 
                : "bg-black/80 dark:bg-black/60 text-white";

              return (
                <div
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className={`
                    text-xs p-1.5 rounded-md mb-1 cursor-pointer 
                    border transition-all duration-200 
                    hover:shadow-sm hover:scale-[1.02] flex flex-row items-start gap-1.5 min-h-[30px]
                    print:border-none print:bg-transparent print:text-black print:shadow-none print:px-0 print:py-1
                    ${getCardColor(card)}
                  `}
                  style={{ pageBreakInside: 'avoid' }}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm shrink-0 mt-0.5 print:border print:border-gray-400 print:text-black print:bg-transparent print:shadow-none ${badgeClasses}`}
                    title={
                      typeof card.pic === "object" && card.pic
                        ? (card.pic as any).name
                        : "Semua Orang / Belum di-assign"
                    }
                  >
                    {getPicInitials(card.pic)}
                  </div>
                  <div className="font-medium flex-1 break-words whitespace-normal leading-tight flex flex-col h-full print:text-black">
                    <span className="whitespace-normal break-words">{card.title}</span>
                    {card.pic && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-sm mt-1 font-medium w-fit shadow-sm whitespace-normal break-words print:bg-transparent print:border print:border-gray-300 print:text-gray-700 print:shadow-none print:px-1 ${badgeClasses}`}>
                        Oleh:{" "}
                        {typeof card.pic === "object" && card.pic !== null
                          ? (card.pic as any).name
                          : card.pic}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>,
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7 min-h-[80px] print:break-inside-avoid" key={day.toISOString()}>
        {days}
      </div>,
    );
    days = []; // Reassign new array for next row
  }

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 10mm;
          }
          html, body, #root {
            height: auto !important;
            overflow: visible !important;
            background: white !important;
          }
          /* Hide sidebar or other absolute elements in print */
          nav, aside, header {
            display: none !important;
          }
        }
      `}</style>
      <div className="flex-1 flex flex-col h-full bg-bgPrimary p-6 overflow-hidden transition-colors duration-300 print:h-auto print:overflow-visible print:p-0 print:bg-white">
        
        {/* Filter Bar */}
        <div className="mb-4 bg-gray-100 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 rounded-lg p-3 flex flex-col sm:flex-row items-center gap-3 print:hidden shrink-0">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" size={16} />
            <input
              type="text"
              placeholder="Cari nama tugas atau deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-bgSecondary border border-gray-300 dark:border-gray-700 rounded-md py-2 pl-9 pr-4 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="bg-white dark:bg-bgSecondary border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full sm:w-auto min-w-[150px]"
          >
            <option value="all">Semua Departemen</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          <select
            value={filterPic}
            onChange={(e) => setFilterPic(e.target.value)}
            className="bg-white dark:bg-bgSecondary border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full sm:w-auto min-w-[150px]"
          >
            <option value="all">Semua PIC</option>
            {uniquePics.map((pic) => (
              <option key={pic} value={pic}>
                {pic}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full flex flex-col flex-1 min-h-0 bg-bgSecondary border border-borderBase rounded-2xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/50 print:h-auto print:overflow-visible print:shadow-none print:border-2 print:border-black print:rounded-none">
          {/* Calendar Header */}
          <div className="p-4 border-b border-borderBase flex items-center justify-between bg-bgGlass print:bg-transparent print:border-b-2 print:border-black">
              <h2 className="text-xl font-bold text-textPrimary tracking-tight print:text-black">
                {format(currentDate, dateFormat, { locale: id })}
              </h2>
              <div className="flex items-center gap-2 print:hidden">
              <button
                onClick={() => window.print()}
                className="p-2 rounded-xl hover:bg-bgGlass text-textSecondary hover:text-indigo-500 transition-colors mr-2"
                title="Cetak Kalender"
              >
                <Printer size={20} />
              </button>
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl hover:bg-bgGlass text-textSecondary hover:text-textPrimary transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-sm font-medium text-textSecondary hover:text-textPrimary bg-bgGlass hover:bg-bgGlass/80 rounded-xl transition-colors border border-borderBase"
              >
                Hari Ini
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl hover:bg-bgGlass text-textSecondary hover:text-textPrimary transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar print:overflow-visible">
            {renderDaysHeader()}
            <div className="flex flex-col">{rows}</div>
          </div>
        </div>

        {selectedCard && (
          <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
        )}
      </div>
    </>
  );
}
