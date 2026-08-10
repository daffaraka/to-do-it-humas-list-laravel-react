"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
  differenceInDays,
  startOfDay,
} from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Printer, Search, Info } from "lucide-react";
import { useKanban } from "../store/kanbanStore";
import { useKpiStore } from "../store/kpiStore";
import { CardModal } from "./modal/CardModal";
import type { Card } from "../types";
import { AVAILABLE_LABELS } from "../types";
import { useSearchParams } from "react-router-dom";

export function CalendarView() {
  const { cards, activeDepartment, departments, boards, fetchCardsByDateRange, isLoading } = useKanban();
  const { kpis, fetchKpis } = useKpiStore();
  const [searchParams] = useSearchParams();
  const calendarType = searchParams.get('type');

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [calendarType]);

  const showLoading = isLoading || isTransitioning;

  useEffect(() => {
    fetchKpis();
  }, [fetchKpis]);

  // Use ref to hold latest fetch fn — prevents useEffect re-triggering when store reference changes
  const fetchCardsByDateRangeRef = useRef(fetchCardsByDateRange);
  useEffect(() => {
    fetchCardsByDateRangeRef.current = fetchCardsByDateRange;
  });

  useEffect(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    fetchCardsByDateRangeRef.current(
      format(startDate, 'yyyy-MM-dd'),
      format(endDate, 'yyyy-MM-dd')
    );
  }, [currentDate]); // Stable: only re-runs when user changes month

  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterPic, setFilterPic] = useState<string>("all");
  const [filterCollab, setFilterCollab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [filterLabel, setFilterLabel] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterKpi, setFilterKpi] = useState<string>("all");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");

  const uniquePics = useMemo(() => {
    const pics = new Set<string>();
    cards.forEach((c) => {
      const name =
        typeof c.pic === "object" && c.pic !== null
          ? (c.pic as any).name
          : c.pic;
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
    const board = card.board || boards.find((b) => b.id === card.boardId);
    const isKpi = board?.kpiId || board?.kpi_id;
    if (isKpi) {
      return "bg-blue-500 border-blue-600 text-white dark:bg-blue-600 dark:border-blue-500 hover:bg-blue-600 dark:hover:bg-blue-500";
    }
    return "bg-gray-500 border-gray-600 text-white dark:bg-gray-600 dark:border-gray-500 hover:bg-gray-600 dark:hover:bg-gray-500";
  };

  const getDaysRemaining = (card: Card) => {
    // Check if the card is already marked as done
    const isDone =
      card.columnId === "done" ||
      (card as any).column_id === "done" ||
      (card as any).status === "done";

    if (isDone) {
      return {
        text: "Done",
        isDone: true,
        isOverdue: false,
        isWarning: false,
        inProgress: false,
      };
    }

    const dateString = card.dueDate || card.requestDate || card.createdAt;
    if (!dateString) return null;

    const target = startOfDay(parseDateSafe(dateString));
    const now = startOfDay(new Date());
    const diff = differenceInDays(target, now);

    if (diff < 0) {
      return {
        text: `Terlewat ${Math.abs(diff)} hr`,
        isOverdue: true,
        isDone: false,
        inProgress: false,
      };
    } else if (diff === 0) {
      return {
        text: `Hari ini`,
        isOverdue: false,
        isWarning: true,
        isDone: false,
        inProgress: false,
      };
    } else {
      return {
        text: `Dalam proses`,
        isOverdue: false,
        isWarning: false,
        isDone: false,
        inProgress: true,
      };
    }
  };

  // Filter cards + pre-parse date ONCE here so grid loop never calls parseDateSafe() again
  const filteredCards = useMemo(() => {
    return cards
      .filter((card) => {
        if (calendarType === 'publikasi') {
          if (!card.labels || !card.labels.some((l: any) => l.id === 'l9' || l.name === 'Publikasi')) return false;
        } else if (calendarType === 'meeting') {
          if (!card.labels || !card.labels.some((l: any) => l.id === 'l10' || l.name === 'Meeting')) return false;
        }

        const hasDate = card.requestDate || card.dueDate || card.createdAt;
        if (!hasDate) return false;

        const deptIdToUse =
          filterDepartment !== "all"
            ? filterDepartment
            : effectiveActiveDepartment;
        if (deptIdToUse !== "all" && card.departmentId !== deptIdToUse) {
          return false;
        }

        const picName =
          typeof card.pic === "object" && card.pic !== null
            ? (card.pic as any).name
            : card.pic;
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

        if (filterLabel !== "all") {
          if (!card.labels || !card.labels.some((l) => l.id === filterLabel)) {
            return false;
          }
        }

        if (filterPriority !== "all") {
          if (card.priority !== filterPriority) {
            return false;
          }
        }

        if (filterCollab !== "all") {
          const hasCollab = card.collaborators && card.collaborators.length > 0;
          if (filterCollab === "yes" && !hasCollab) return false;
          if (filterCollab === "no" && hasCollab) return false;
        }

        if (filterKpi !== "all") {
          const board = card.board || boards.find((b) => b.id === card.boardId);
          const kpiId = board?.kpiId || board?.kpi_id;
          if (kpiId !== filterKpi) {
            return false;
          }
        }

        const cardDateStr = card.requestDate || card.dueDate || card.createdAt;
        if (cardDateStr) {
          const cardDate = parseDateSafe(cardDateStr);
          if (filterStartDate) {
            const start = startOfDay(parseDateSafe(filterStartDate));
            if (cardDate < start) return false;
          }
          if (filterEndDate) {
            const end = startOfDay(parseDateSafe(filterEndDate));
            end.setHours(23, 59, 59, 999);
            if (cardDate > end) return false;
          }
        }

        return true;
      })
      .map((card) => {
        // Pre-compute parsed date once — avoids re-parsing 35x per render in the grid loop
        const dateStr = card.requestDate || card.dueDate || card.createdAt;
        return {
          ...card,
          _parsedDate: dateStr ? parseDateSafe(dateStr) : null,
        };
      });
  }, [
    cards,
    effectiveActiveDepartment,
    filterDepartment,
    filterPic,
    filterCollab,
    searchQuery,
    filterLabel,
    filterPriority,
    filterKpi,
    filterStartDate,
    filterEndDate,
    boards,
    calendarType,
  ]);

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

      // Use pre-parsed _parsedDate — no more parseDateSafe() call per cell per card
      const dayCards = filteredCards.filter((c) => {
        return c._parsedDate ? isSameDay(c._parsedDate, cloneDay) : false;
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

              const board =
                card.board || boards.find((b) => b.id === card.boardId);
              const isKpi = board?.kpiId || board?.kpi_id;
              const badgeClasses = isKpi
                ? "bg-white text-gray-800"
                : "bg-black/80 dark:bg-black/60 text-white";

              const olehTextClasses = isKpi
                ? "text-white"
                : "text-gray-900 dark:text-white print:text-gray-900";

              const outlineBadgeClasses = isKpi
                ? "border-white text-white"
                : "border-white text-gray-900 dark:border-white dark:text-white print:border-gray-900 print:text-gray-900";

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
                  style={{ pageBreakInside: "avoid" }}
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
                    <span className="whitespace-normal break-words">
                      {card.title}
                    </span>
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      {(card.pic ||
                        (card.collaborators &&
                          card.collaborators.length > 0)) &&
                        (() => {
                          const names = [
                            card.pic
                              ? typeof card.pic === "object" &&
                                card.pic !== null
                                ? (card.pic as any).name
                                : card.pic
                              : null,
                            ...(card.collaborators?.map((c: any) => c.name) ||
                              []),
                          ].filter(Boolean);

                          return (
                            <div className="flex flex-wrap gap-1 items-center mt-0.5">
                              <span
                                className={`text-[9px] text-white font-medium mr-0.5 ${olehTextClasses}`}
                              >
                                Oleh:
                              </span>
                              {names.map((name, idx) => (
                                <span
                                  key={idx}
                                  className={`text-[9px] text-white px-1.5 py-0.5 rounded border font-medium whitespace-nowrap bg-transparent ${outlineBadgeClasses}`}
                                >
                                  {name}
                                </span>
                              ))}
                            </div>
                          );
                        })()}
                      {(() => {
                        const remaining = getDaysRemaining(card);
                        if (!remaining) return null;

                        let remainingClasses = "bg-green-500 text-white"; // default green
                        if (remaining.isDone) {
                          remainingClasses = "bg-green-600 text-white";
                        } else if (remaining.isOverdue) {
                          remainingClasses = "bg-red-500 text-white";
                        } else if (remaining.isWarning) {
                          remainingClasses = "bg-yellow-500 text-white";
                        } else if (remaining.inProgress) {
                          remainingClasses = "bg-blue-500 text-white";
                        }

                        return (
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-medium w-fit shadow-sm whitespace-nowrap print:bg-transparent print:border print:border-gray-300 print:text-gray-700 print:shadow-none print:px-1 ${remainingClasses}`}
                          >
                            {remaining.text}
                          </span>
                        );
                      })()}
                    </div>
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
      <div
        className="grid grid-cols-7 min-h-[80px] print:break-inside-avoid"
        key={day.toISOString()}
      >
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
        <div className="mb-4 bg-gray-100 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 rounded-lg p-3 flex flex-col gap-3 print:hidden shrink-0">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary"
                size={16}
              />
              <input
                type="text"
                placeholder="Cari nama tugas atau deskripsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-bgSecondary border border-gray-300 dark:border-gray-700 rounded-md py-2 pl-9 pr-4 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>

            <select
              value={filterLabel}
              onChange={(e) => setFilterLabel(e.target.value)}
              className="bg-white dark:bg-bgSecondary border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full sm:w-auto min-w-[150px]"
            >
              <option value="all">Semua Label</option>
              {AVAILABLE_LABELS.map((label) => (
                <option key={label.id} value={label.id}>
                  {label.name}
                </option>
              ))}
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-white dark:bg-bgSecondary border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full sm:w-auto min-w-[150px]"
            >
              <option value="all">Semua Prioritas</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

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

            <select
              value={filterCollab}
              onChange={(e) => setFilterCollab(e.target.value)}
              className="bg-white dark:bg-bgSecondary border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full sm:w-auto min-w-[150px]"
            >
              <option value="all">Semua (Termasuk Kolaborasi)</option>
              <option value="yes">Hanya Kolaborasi</option>
              <option value="no">Tanpa Kolaborasi</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <select
              value={filterKpi}
              onChange={(e) => setFilterKpi(e.target.value)}
              className="bg-white dark:bg-bgSecondary border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full sm:w-auto min-w-[150px] sm:max-w-xs truncate"
            >
              <option value="all">Semua WIG/Project</option>
              {kpis.map((kpi) => (
                <option key={kpi.id} value={kpi.id}>
                  {kpi.title}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-sm font-medium text-textSecondary whitespace-nowrap">
                Tanggal:
              </span>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="bg-white dark:bg-bgSecondary border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1.5 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full sm:w-auto h-[38px]"
              />
              <span className="text-sm font-medium text-textSecondary">-</span>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="bg-white dark:bg-bgSecondary border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1.5 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full sm:w-auto h-[38px]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-1 border-t border-gray-300 dark:border-zinc-800 pt-3">
            <div className="flex items-center gap-1.5 text-sm">
              <Info size={16} className="text-textSecondary" />
              <span className="font-semibold text-textPrimary mr-2">
                Legenda:
              </span>
              <div className="flex items-center gap-1.5 mr-4">
                <span className="w-3 h-3 rounded-full bg-blue-500 border border-blue-600"></span>
                <span className="text-textSecondary">Tugas KPI / WIG</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gray-500 border border-gray-600"></span>
                <span className="text-textSecondary">
                  Tugas Rutin / Non-KPI
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col flex-1 min-h-0 bg-bgSecondary border border-borderBase rounded-2xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/50 print:h-auto print:overflow-visible print:shadow-none print:border-2 print:border-black print:rounded-none">
          {/* Calendar Header */}
          <div className="p-4 border-b border-borderBase flex items-center justify-between bg-bgGlass print:bg-transparent print:border-b-2 print:border-black">
            <h2 className="text-xl font-bold text-textPrimary tracking-tight print:text-black">
              {calendarType === 'publikasi' ? 'Kalender Publikasi - ' : calendarType === 'meeting' ? 'Kalender Meeting - ' : 'Kalender Kerja - '}
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
          <div className="relative flex-1 overflow-y-auto custom-scrollbar print:overflow-visible">
            {/* Loading Overlay */}
            {showLoading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
              </div>
            )}
            {renderDaysHeader()}
            <div className="flex flex-col">{rows}</div>
          </div>
        </div>

        {selectedCard && (
          <CardModal
            card={cards.find((c) => c.id === selectedCard.id) || selectedCard}
            onClose={() => setSelectedCard(null)}
          />
        )}
      </div>
    </>
  );
}
