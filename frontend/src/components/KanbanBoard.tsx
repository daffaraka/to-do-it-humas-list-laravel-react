"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type {
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { COLUMNS, AVAILABLE_LABELS } from "../types";
import type { Card, ColumnId } from "../types";
import { useKanban } from "../store/kanbanStore";
import { useAuthStore } from "../store/authStore";
import { KanbanColumn } from "./KanbanColumn";
import { CardDragOverlay } from "./KanbanCard";
import {
  Tag,
  ArrowLeft,
  Search,
  Calendar,
  Target,
  Info,
  ChevronDown,
  ChevronUp,
  User,
  Flag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { differenceInDays, startOfDay, format } from "date-fns";
import { id as dateFnsIdLocale } from "date-fns/locale";

const getDaysRemaining = (dateString: string) => {
  const target = startOfDay(new Date(dateString));
  const now = startOfDay(new Date());
  const diff = differenceInDays(target, now);

  if (diff < 0) {
    return { text: `Terlewat ${Math.abs(diff)} hari`, isOverdue: true };
  } else if (diff === 0) {
    return { text: `Batas waktu hari ini`, isOverdue: false };
  } else {
    return { text: `Sisa waktu ${diff} hari`, isOverdue: false };
  }
};

export function KanbanBoard() {
  const {
    getFilteredCards,
    moveCard,
    reorderCards,
    cards,
    filterLabel,
    setFilterLabel,
    filterPic,
    setFilterPic,
    filterPriority,
    setFilterPriority,
    searchQuery,
    setSearchQuery,
    activeBoardId,
    setActiveBoardId,
    boards,
  } = useKanban();
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [isLabelOpen, setIsLabelOpen] = useState(false);
  const [isPicOpen, setIsPicOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isBoardInfoOpen, setIsBoardInfoOpen] = useState(false);
  const navigate = useNavigate();
  const activeBoard = boards.find((b) => b.id === activeBoardId);

  const user = useAuthStore((state) => state.user);

  const uniquePics = useMemo(() => {
    const picsMap = new Map();
    cards.forEach(card => {
      const picData = card.pic as any;
      if (picData) {
        if (typeof picData === 'object' && picData.id) {
          picsMap.set(picData.id, picData.name || picData.username || 'Unknown');
        } else if (typeof picData === 'string') {
           picsMap.set(picData, picData);
        } else if (picData.picId || picData.pic_id) {
           const id = picData.picId || picData.pic_id;
           picsMap.set(id, id);
        }
      }
    });
    return Array.from(picsMap.entries()).map(([id, name]) => ({ id, name }));
  }, [cards]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = active.data.current?.card as Card;
    if (card) {
      setActiveCard(card);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const card = active.data.current?.card as Card;
    let cardPicId = null;
    if (card) {
      if (card.pic && typeof card.pic === "object") {
        cardPicId = (card.pic as any).id;
      } else if (typeof card.pic === "string") {
        cardPicId = card.pic;
      } else {
        cardPicId = (card as any).picId || (card as any).pic_id;
      }
    }
    const isOwner = card && (!cardPicId || cardPicId === user?.id);

    if (!isOwner) {
      return;
    }

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveCard = active.data.current?.type === "Card";
    const isOverColumn = over.data.current?.type === "Column";
    const isOverCard = over.data.current?.type === "Card";

    if (!isActiveCard) return;

    if (isActiveCard && isOverColumn) {
      moveCard(activeId, overId as ColumnId, false);
      return;
    }

    if (isActiveCard && isOverCard) {
      const activeCard = active.data.current?.card as Card;
      const overCard = over.data.current?.card as Card;
      if (activeCard.columnId !== overCard.columnId) {
        moveCard(activeId, overCard.columnId as ColumnId, false);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    const card = active.data.current?.card as Card;

    let cardPicId = null;
    if (card) {
      if (card.pic && typeof card.pic === "object") {
        cardPicId = (card.pic as any).id;
      } else if (typeof card.pic === "string") {
        cardPicId = card.pic;
      } else {
        cardPicId = (card as any).picId || (card as any).pic_id;
      }
    }
    const isOwner = card && (!cardPicId || cardPicId === user?.id);

    if (!isOwner) {
      return;
    }

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // Same column reorder
    const freshActiveCard = cards.find((c) => c.id === activeId);
    const freshOverCard =
      over.data.current?.type === "Card"
        ? cards.find((c) => c.id === overId)
        : null;

    if (
      freshActiveCard &&
      freshOverCard &&
      freshActiveCard.columnId === freshOverCard.columnId
    ) {
      reorderCards(activeId, overId);
    } else if (
      freshActiveCard &&
      freshOverCard &&
      freshActiveCard.columnId !== freshOverCard.columnId
    ) {
      // Moving to a new column is handled during dragOver, but if dropped directly on a card in another column
      moveCard(activeId, freshOverCard.columnId);
    } else if (freshActiveCard && !freshOverCard) {
      // Dropped onto empty column
      moveCard(activeId, overId as ColumnId);
    }
  };

  return (
    <div
      id="kanban-board-container"
      className="flex-1 flex flex-col h-full overflow-hidden p-6 relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-bgPrimary via-bgSecondary to-indigo-500/10 dark:to-indigo-950/20 z-0 transition-colors duration-300"></div>

      {/* Sub Nav / Toolbar */}
      <div
        id="kanban-sub-nav"
        className="relative z-40 flex flex-col gap-4 mb-6"
      >
        {/* Row 1: Back Button */}
        <div>
          <button
            onClick={() => {
              setActiveBoardId(null);
              navigate("/");
            }}
            className="inline-flex items-center gap-2 text-textSecondary hover:text-textPrimary bg-white dark:bg-zinc-800/80 hover:bg-gray-50 dark:hover:bg-zinc-700 px-4 py-2 rounded-xl transition-colors text-sm font-medium border border-borderBase dark:border-zinc-700 shadow-sm"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>
        </div>

        {/* Row 2: Title and Target Date */}
        {activeBoard && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
            <h2 className="text-xl font-bold text-textPrimary text-left">
              {activeBoard.title}
            </h2>

            <div className="flex items-center gap-3 shrink-0">
              {activeBoard.targetDate &&
                (() => {
                  const r = getDaysRemaining(activeBoard.targetDate);
                  return (
                    <span
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${r.isOverdue ? "text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20" : "text-amber-600 dark:text-amber-500 bg-amber-500/10 border-amber-500/20"}`}
                    >
                      <Target size={14} />({r.text})
                    </span>
                  );
                })()}
            </div>
          </div>
        )}

        {/* Row 3: Search, Filter, and Detail */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full justify-between">
          <div className="flex items-center gap-3 w-full sm:flex-1">
            {/* Search */}
            <div className="relative w-full sm:max-w-md lg:max-w-lg">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary"
                size={18}
              />
              <input
                type="text"
                placeholder="Cari tugas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800/80 border border-borderBase dark:border-zinc-700 rounded-xl py-2 pl-10 pr-4 text-sm text-textPrimary placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-sm"
              />
            </div>

            {/* Label Filter */}
            <div className="relative shrink-0">
              <button
                onClick={() => setIsLabelOpen(!isLabelOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 dark:bg-zinc-800/80 dark:border-zinc-700 rounded-xl text-sm font-medium text-textSecondary hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all shadow-sm"
              >
                <Tag
                  size={16}
                  className={
                    filterLabel ? "text-indigo-500 dark:text-indigo-400" : ""
                  }
                />
                <span className="hidden sm:inline">
                  {filterLabel
                    ? AVAILABLE_LABELS.find((l) => l.id === filterLabel)?.name ||
                      "Filter"
                    : "Filter Label"}
                </span>
              </button>

            {isLabelOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-bgSecondary border border-gray-200 dark:border-borderBase rounded-xl shadow-xl z-30">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      setFilterLabel(null);
                      setIsLabelOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      filterLabel === null
                        ? "bg-gray-100 dark:bg-bgGlass text-textPrimary font-medium"
                        : "text-textSecondary hover:bg-gray-50 dark:hover:bg-bgGlassHover hover:text-textPrimary"
                    }`}
                  >
                    Semua Label
                  </button>
                  {AVAILABLE_LABELS.map((label) => (
                    <button
                      key={label.id}
                      onClick={() => {
                        setFilterLabel(label.id);
                        setIsLabelOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        filterLabel === label.id
                          ? "bg-gray-100 dark:bg-bgGlass text-textPrimary font-medium"
                          : "text-textSecondary hover:bg-gray-50 dark:hover:bg-bgGlassHover hover:text-textPrimary"
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: label.color }}
                      />
                      {label.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PIC Filter */}
          <div className="relative shrink-0">
            <button
              onClick={() => setIsPicOpen(!isPicOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 dark:bg-zinc-800/80 dark:border-zinc-700 rounded-xl text-sm font-medium text-textSecondary hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all shadow-sm"
            >
              <User
                size={16}
                className={
                  filterPic ? "text-indigo-500 dark:text-indigo-400" : ""
                }
              />
              <span className="hidden sm:inline">
                {filterPic
                  ? uniquePics.find((p) => p.id === filterPic)?.name || "Filter"
                  : "PIC"}
              </span>
            </button>

            {isPicOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-bgSecondary border border-gray-200 dark:border-borderBase rounded-xl shadow-xl z-30">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      setFilterPic(null);
                      setIsPicOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      filterPic === null
                        ? "bg-gray-100 dark:bg-bgGlass text-textPrimary font-medium"
                        : "text-textSecondary hover:bg-gray-50 dark:hover:bg-bgGlassHover hover:text-textPrimary"
                    }`}
                  >
                    Semua PIC
                  </button>
                  {uniquePics.map((pic) => (
                    <button
                      key={pic.id}
                      onClick={() => {
                        setFilterPic(pic.id);
                        setIsPicOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate ${
                        filterPic === pic.id
                          ? "bg-gray-100 dark:bg-bgGlass text-textPrimary font-medium"
                          : "text-textSecondary hover:bg-gray-50 dark:hover:bg-bgGlassHover hover:text-textPrimary"
                      }`}
                      title={pic.name}
                    >
                      {pic.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Priority Filter */}
          <div className="relative shrink-0">
            <button
              onClick={() => setIsPriorityOpen(!isPriorityOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 dark:bg-zinc-800/80 dark:border-zinc-700 rounded-xl text-sm font-medium text-textSecondary hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all shadow-sm"
            >
              <Flag
                size={16}
                className={
                  filterPriority ? "text-indigo-500 dark:text-indigo-400" : ""
                }
              />
              <span className="hidden sm:inline">
                {filterPriority
                  ? filterPriority.charAt(0).toUpperCase() + filterPriority.slice(1)
                  : "Prioritas"}
              </span>
            </button>

            {isPriorityOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-bgSecondary border border-gray-200 dark:border-borderBase rounded-xl shadow-xl z-30">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      setFilterPriority(null);
                      setIsPriorityOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      filterPriority === null
                        ? "bg-gray-100 dark:bg-bgGlass text-textPrimary font-medium"
                        : "text-textSecondary hover:bg-gray-50 dark:hover:bg-bgGlassHover hover:text-textPrimary"
                    }`}
                  >
                    Semua Prioritas
                  </button>
                  {['low', 'medium', 'high'].map((priority) => (
                    <button
                      key={priority}
                      onClick={() => {
                        setFilterPriority(priority);
                        setIsPriorityOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        filterPriority === priority
                          ? "bg-gray-100 dark:bg-bgGlass text-textPrimary font-medium"
                          : "text-textSecondary hover:bg-gray-50 dark:hover:bg-bgGlassHover hover:text-textPrimary"
                      }`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
          {/* Right Side: Detail Button */}
          {activeBoard && (
            <div className="shrink-0 w-full sm:w-auto">
              <button
                onClick={() => setIsBoardInfoOpen(!isBoardInfoOpen)}
                className={`w-full sm:w-auto px-4 py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-colors border shadow-sm ${isBoardInfoOpen ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:border-indigo-500 dark:hover:bg-indigo-600" : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30 dark:hover:bg-indigo-500/30"}`}
                title="Info Program Kerja"
              >
                <Info size={16} />
                Detail
                {isBoardInfoOpen ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Board Info Panel */}
      {activeBoard && isBoardInfoOpen && (
        <div className="relative z-30 mb-6 bg-white/80 dark:bg-bgSecondary/80 backdrop-blur-md border border-borderBase rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Column 1: Basic Info */}
            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-extrabold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Tujuan / Deskripsi
                </h4>
                <p className="text-sm text-textPrimary font-medium">
                  {activeBoard.description || "-"}
                </p>
              </div>
              <div>
                <h4 className="text-[10px] font-extrabold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Periode
                </h4>
                <p className="text-sm text-textPrimary font-medium flex items-center gap-1.5">
                  <Calendar size={14} className="text-textSecondary" />
                  {activeBoard.startDate
                    ? format(new Date(activeBoard.startDate), "dd MMM yyyy", {
                        locale: dateFnsIdLocale,
                      })
                    : "-"}
                  {" - "}
                  {activeBoard.targetDate
                    ? format(new Date(activeBoard.targetDate), "dd MMM yyyy", {
                        locale: dateFnsIdLocale,
                      })
                    : "-"}
                </p>
              </div>
            </div>

            {/* Column 2: Details */}
            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-extrabold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Kondisi Aktual
                </h4>
                <p className="text-sm text-textPrimary font-medium">
                  {activeBoard.kondisiAktual || "-"}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <h4 className="text-[10px] font-extrabold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Prioritas Task
                  </h4>
                  <div className="relative group/legend">
                    <div className="w-3.5 h-3.5 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 flex items-center justify-center text-[9px] font-bold text-gray-600 dark:text-gray-300 cursor-help transition-colors">
                      ?
                    </div>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-40 p-2 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/legend:opacity-100 group-hover/legend:visible transition-all duration-200 z-[60] pointer-events-none">
                      <div className="font-bold border-b border-gray-700 dark:border-gray-300 pb-1 mb-1.5">
                        Legend Bobot
                      </div>
                      <div className="flex justify-between mb-0.5">
                        <span className="text-red-400 dark:text-red-600">High:</span> <span className="font-semibold">5</span>
                      </div>
                      <div className="flex justify-between mb-0.5">
                        <span className="text-indigo-400 dark:text-indigo-600">Medium:</span> <span className="font-semibold">3</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 dark:text-gray-600">Low:</span> <span className="font-semibold">1</span>
                      </div>
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 dark:bg-gray-100 rotate-45"></div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 mt-2">
                  {(() => {
                    const getStats = (prio: string, w: number) => {
                      const pTasks = cards.filter((t) => t.priority === prio);
                      const doneTasks = pTasks.filter((t) => t.columnId === "done");
                      const todoTasks = pTasks.filter((t) => t.columnId !== "done");
                      return {
                        todoCount: todoTasks.length,
                        todoWeight: todoTasks.length * w,
                        doneCount: doneTasks.length,
                        doneWeight: doneTasks.length * w,
                      };
                    };
                    const h = getStats("high", 5);
                    const m = getStats("medium", 3);
                    const l = getStats("low", 1);
                    return (
                      <>
                        <div className="flex items-center justify-between text-xs font-bold bg-white dark:bg-bgSecondary/50 px-2 py-1.5 rounded border border-gray-200 dark:border-gray-700 mb-0.5 shadow-sm">
                          <span className="text-gray-700 dark:text-gray-300">Total To do</span>
                          <span className="text-indigo-600 dark:text-indigo-400">{cards.length}</span>
                        </div>
                        <table className="w-full text-xs text-left text-gray-600 dark:text-gray-400 mt-1 border-collapse">
                          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            <tr>
                              <th className="px-2 py-1.5 border border-gray-200 dark:border-gray-700 font-bold"></th>
                              <th className="px-2 py-1.5 border border-gray-200 dark:border-gray-700 font-bold text-center">New</th>
                              <th className="px-2 py-1.5 border border-gray-200 dark:border-gray-700 font-bold text-center">Done</th>
                              <th className="px-2 py-1.5 border border-gray-200 dark:border-gray-700 font-bold text-center">Score</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-bgSecondary/30">
                            <tr>
                              <td className="px-2 py-1.5 border border-gray-200 dark:border-gray-700 font-bold text-red-600 dark:text-red-400">High</td>
                              <td className="px-2 py-1.5 border border-gray-200 dark:border-gray-700 text-center">{h.todoCount}</td>
                              <td className="px-2 py-1.5 border border-gray-200 dark:border-gray-700 text-center">{h.doneCount}</td>
                              <td className="px-2 py-1.5 border border-gray-200 dark:border-gray-700 text-center font-bold text-red-600 dark:text-red-400">{h.doneWeight}</td>
                            </tr>
                            <tr>
                              <td className="px-2 py-1.5 border border-gray-200 dark:border-gray-700 font-bold text-indigo-600 dark:text-indigo-400">Medium</td>
                              <td className="px-2 py-1.5 border border-gray-200 dark:border-gray-700 text-center">{m.todoCount}</td>
                              <td className="px-2 py-1.5 border border-gray-200 dark:border-gray-700 text-center">{m.doneCount}</td>
                              <td className="px-2 py-1.5 border border-gray-200 dark:border-gray-700 text-center font-bold text-indigo-600 dark:text-indigo-400">{m.doneWeight}</td>
                            </tr>
                            <tr>
                              <td className="px-2 py-1.5 border border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-300">Low</td>
                              <td className="px-2 py-1.5 border border-gray-200 dark:border-gray-700 text-center">{l.todoCount}</td>
                              <td className="px-2 py-1.5 border border-gray-200 dark:border-gray-700 text-center">{l.doneCount}</td>
                              <td className="px-2 py-1.5 border border-gray-200 dark:border-gray-700 text-center font-bold text-gray-700 dark:text-gray-300">{l.doneWeight}</td>
                            </tr>
                          </tbody>
                        </table>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Column 3: Targets */}
            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-extrabold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Target Akhir Tahun
                </h4>
                <p className="text-sm text-textPrimary font-medium">
                  {activeBoard.targetAkhirTahun || "-"}
                </p>
              </div>
              <div>
                <h4 className="text-[10px] font-extrabold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Output Akhir
                </h4>
                <p className="text-sm text-textPrimary font-medium">
                  {activeBoard.outputAkhir || "-"}
                </p>
              </div>
            </div>

            {/* Column 4: Meta */}
            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-extrabold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Main Project (WIG)
                </h4>
                <p className="text-sm text-textPrimary font-medium">
                  {activeBoard.kpi?.title || (
                    <span className="text-textSecondary italic text-xs">
                      Non Project
                    </span>
                  )}
                </p>
              </div>
              <div>
                <h4 className="text-[10px] font-extrabold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Kategori Program
                </h4>
                <p className="text-sm text-textPrimary font-medium">
                  {activeBoard.kategoriProgram?.name ||
                    activeBoard.kategori_program?.name || (
                      <span className="text-textSecondary italic text-xs">
                        Tanpa Kategori
                      </span>
                    )}
                </p>
              </div>

              <div className="flex gap-4">
                {activeBoard.bobotBoard !== undefined &&
                  activeBoard.bobotBoard !== null && (
                    <div>
                      <h4 className="text-[10px] font-extrabold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Bobot
                      </h4>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {activeBoard.bobotBoard}
                      </span>
                    </div>
                  )}
                {activeBoard.score !== undefined &&
                  activeBoard.score !== null &&
                  (() => {
                    const tasks = activeBoard.tasks || [];
                    const lowCount = tasks.filter(
                      (t: any) => t.priority === "low",
                    ).length;
                    const medCount = tasks.filter(
                      (t: any) => t.priority === "medium",
                    ).length;
                    const highCount = tasks.filter(
                      (t: any) => t.priority === "high",
                    ).length;
                    const completedScore = tasks.reduce(
                      (sum: number, t: any) =>
                        sum +
                        (t.columnId === "done"
                          ? t.priority === "high"
                            ? 5
                            : t.priority === "medium"
                              ? 3
                              : t.priority === "low"
                                ? 1
                                : 0
                          : 0),
                      0,
                    );
                    const maxScore = tasks.reduce(
                      (sum: number, t: any) =>
                        sum +
                        (t.priority === "high"
                          ? 5
                          : t.priority === "medium"
                            ? 3
                            : t.priority === "low"
                              ? 1
                              : 0),
                      0,
                    );

                    return (
                      <div>
                        <h4 className="text-[10px] font-extrabold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
                          Ketercapaian
                        </h4>
                        <div className="relative group/score w-fit">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 cursor-help transition-colors">
                            {activeBoard.score}%
                          </span>
                          <div className="absolute right-0 top-full mt-2 w-56 p-3 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/score:opacity-100 group-hover/score:visible transition-all duration-200 z-[60] pointer-events-none">
                            <div className="font-bold border-b border-gray-700 dark:border-gray-300 pb-1 mb-2">
                              Detail Pekerjaan
                            </div>
                            <div className="flex justify-between mb-1">
                              <span>Low (Bobot 1):</span>{" "}
                              <span className="font-semibold">{lowCount}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                              <span>Medium (Bobot 3):</span>{" "}
                              <span className="font-semibold">{medCount}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                              <span>High (Bobot 5):</span>{" "}
                              <span className="font-semibold">{highCount}</span>
                            </div>

                            <div className="font-bold border-t border-gray-700 dark:border-gray-300 pt-2 mt-1">
                              Formula Ketercapaian:
                            </div>
                            <div className="text-[10px] text-gray-300 dark:text-gray-600 font-mono mt-1 text-center bg-black/20 dark:bg-black/5 p-1.5 rounded">
                              ({completedScore} / {maxScore}) *{" "}
                              {activeBoard.bobotBoard || 0}
                            </div>
                            <div className="absolute -top-1.5 right-4 w-3 h-3 bg-gray-900 dark:bg-gray-100 rotate-45"></div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        id="kanban-columns-wrapper"
        className="relative z-10 flex-1 flex gap-6 items-start w-full overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar"
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              cards={getFilteredCards(column.id)}
            />
          ))}

          {/* Add Column button could go here in future */}

          <DragOverlay>
            {activeCard ? <CardDragOverlay card={activeCard} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
