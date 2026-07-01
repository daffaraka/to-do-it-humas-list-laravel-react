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
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useKanban } from "../store/kanbanStore";
import { CardModal } from "./CardModal";
import type { Card } from "../types";

export function CalendarView() {
  const { cards, activeDepartment, departments } = useKanban();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Fallback to 'all' if the activeDepartment UUID from localStorage is stale
  const effectiveActiveDepartment = activeDepartment === 'all' || departments.some(d => d.id === activeDepartment) 
    ? activeDepartment 
    : 'all';

  // Helper to parse dates safely (supporting space separated dates from SQLite/Laravel)
  const parseDateSafe = (dateStr?: string | null) => {
    if (!dateStr) return new Date(NaN);
    const normalized = dateStr.includes(' ') && !dateStr.includes('T')
      ? dateStr.replace(' ', 'T')
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

  // Helper to get color classes based on department name
  const getDeptColor = (deptName?: string) => {
    const name = deptName?.toLowerCase() || '';
    if (name === 'it') {
      return 'bg-blue-500 border-blue-600 text-white dark:bg-blue-600 dark:border-blue-500 hover:bg-blue-600 dark:hover:bg-blue-500';
    }
    if (name === 'humas') {
      return 'bg-purple-500 border-purple-600 text-white dark:bg-purple-600 dark:border-purple-500 hover:bg-purple-600 dark:hover:bg-purple-500';
    }
    if (name === 'jaringan') {
      return 'bg-emerald-500 border-emerald-600 text-white dark:bg-emerald-600 dark:border-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-500';
    }
    return 'bg-gray-500 border-gray-600 text-white dark:bg-gray-600 dark:border-gray-500 hover:bg-gray-600 dark:hover:bg-gray-500';
  };

  // Filter cards by active department and date availability
  const departmentCards = useMemo(() => {
    return cards.filter((card) => {
      const hasDate = card.requestDate || card.dueDate || card.createdAt;
      if (!hasDate) return false;

      if (effectiveActiveDepartment !== 'all' && card.departmentId !== effectiveActiveDepartment) {
        return false;
      }
      return true;
    });
  }, [cards, effectiveActiveDepartment]);

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
      <div className="grid grid-cols-7 border-b border-borderBase">
        {daysOfWeek.map((dayName, idx) => (
          <div
            key={idx}
            className="py-2 text-center text-xs font-semibold text-textSecondary uppercase tracking-wider"
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
      const dayCards = departmentCards.filter((c) => {
        const dateStr = c.requestDate || c.dueDate || c.createdAt;
        if (!dateStr) return false;
        return isSameDay(parseDateSafe(dateStr), cloneDay);
      });

      days.push(
        <div
          key={day.toISOString()}
          className={`flex-1 min-h-[60px] border-r border-b border-borderBase p-2 flex flex-col transition-colors ${
            !isSameMonth(day, monthStart)
              ? "bg-bgGlass text-textSecondary opacity-50"
              : isSameDay(day, new Date())
                ? "bg-indigo-500/10 text-indigo-500 dark:text-indigo-300"
                : getDay(day) === 0
                  ? "bg-yellow-500/10 dark:bg-yellow-500/5 text-textPrimary hover:bg-yellow-500/20"
                  : "bg-transparent text-textPrimary hover:bg-bgGlass"
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

              return (
                <div
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className={`
                    text-xs p-1.5 rounded-md mb-1 cursor-pointer 
                    border transition-all duration-200 
                    hover:shadow-sm hover:scale-[1.02] flex flex-row items-start gap-1.5 h-auto min-h-[30px]
                    ${getDeptColor(card.department?.name)}
                  `}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0 mt-0.5 ${card.pic ? 'bg-black/20 dark:bg-black/40' : 'bg-black/10 dark:bg-black/20'}`}>
                    {getPicInitials(card.pic)}
                  </div>
                  <div className="font-medium flex-1 break-words whitespace-normal leading-tight">
                    {card.title}
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
      <div className="grid grid-cols-7 min-h-[80px]" key={day.toISOString()}>
        {days}
      </div>,
    );
    days = []; // Reassign new array for next row
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-bgPrimary p-6 overflow-hidden transition-colors duration-300">
      <div className="w-full flex flex-col h-full bg-bgSecondary border border-borderBase rounded-2xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/50">
        {/* Calendar Header */}
        <div className="p-4 border-b border-borderBase flex items-center justify-between bg-bgGlass">
          <h2 className="text-xl font-bold text-textPrimary tracking-tight">
            {format(currentDate, dateFormat, { locale: id })}
          </h2>
          <div className="flex items-center gap-2">
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
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {renderDaysHeader()}
          <div className="flex flex-col">{rows}</div>
        </div>
      </div>

      {selectedCard && (
        <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  );
}
