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
  parseISO,
  getDay,
} from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useKanban } from "../store/kanbanStore";
import { CardModal } from "./CardModal";
import type { Card } from "../types";

export function CalendarView() {
  const { cards } = useKanban();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Filter cards by active department and those that have a requestDate
  const departmentCards = useMemo(() => {
    return cards.filter((card) => card.requestDate);
  }, [cards]);

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
        if (!c.requestDate) return false;
        return isSameDay(parseISO(c.requestDate), cloneDay);
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
          <div className="flex flex-col gap-1 mt-1">
            {dayCards.map((card) => {
              const isDone = card.columnId === "done";
              const isInProgress = card.columnId === "progress";

              const picObj =
                typeof card.pic === "object" && card.pic !== null
                  ? (card.pic as any)
                  : null;
              const initials = picObj
                ? picObj.name.charAt(0).toUpperCase()
                : typeof card.pic === "string"
                  ? card.pic.charAt(0).toUpperCase()
                  : "";
              const displayText = initials
                ? `(${initials}) ${card.title}`
                : card.title;

              return (
                <div
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                  className={`text-xs px-2 py-1 rounded whitespace-normal break-words cursor-pointer transition-transform hover:scale-[1.02] shadow-sm ${
                    isDone
                      ? "bg-emerald-500 text-white"
                      : isInProgress
                        ? "bg-amber-500 text-white"
                        : "bg-indigo-500 text-white"
                  }`}
                  title={card.title}
                >
                  {displayText}
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
