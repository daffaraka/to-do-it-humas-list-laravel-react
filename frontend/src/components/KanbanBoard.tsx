"use client";

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type {
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { COLUMNS, AVAILABLE_LABELS } from '../types';
import type { Card, ColumnId } from '../types';
import { useKanban } from '../store/kanbanStore';
import { useAuthStore } from '../store/authStore';
import { KanbanColumn } from './KanbanColumn';
import { CardDragOverlay } from './KanbanCard';
import { Tag, ArrowLeft, Search, Calendar, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, startOfDay } from 'date-fns';

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
    getFilteredCards, moveCard, reorderCards, 
    filterLabel, setFilterLabel,
    searchQuery, setSearchQuery,
    activeBoardId, setActiveBoardId, boards
  } = useKanban();
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [isLabelOpen, setIsLabelOpen] = useState(false);
  const navigate = useNavigate();
  const activeBoard = boards.find(b => b.id === activeBoardId);
  
  const user = useAuthStore((state) => state.user);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
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
    const isOwner = card && (typeof card.pic === 'object' 
      ? (card.pic as any)?.id === user?.id 
      : (card as any)?.pic_id === user?.id);
    
    if (!isOwner) {
      return;
    }

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveCard = active.data.current?.type === 'Card';
    const isOverColumn = over.data.current?.type === 'Column';

    if (isActiveCard && isOverColumn) {
      moveCard(activeId, overId as ColumnId, false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    const card = active.data.current?.card as Card;

    const isOwner = card && (typeof card.pic === 'object' 
      ? (card.pic as any)?.id === user?.id 
      : (card as any)?.pic_id === user?.id);
      
    if (!isOwner) {
      return;
    }

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // Same column reorder
    const activeCard = active.data.current?.card as Card;
    const overCard = over.data.current?.card as Card;

    if (activeCard && overCard && activeCard.columnId === overCard.columnId) {
      reorderCards(activeId, overId);
    } else if (activeCard && overCard && activeCard.columnId !== overCard.columnId) {
       // Moving to a new column is handled during dragOver, but if dropped directly on a card in another column
       moveCard(activeId, overCard.columnId);
    } else if (activeCard && !overCard) {
       // Dropped onto empty column
       moveCard(activeId, overId as ColumnId);
    }
  };

  return (
    <div id="kanban-board-container" className="flex-1 flex flex-col h-full overflow-hidden p-6 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-bgPrimary via-bgSecondary to-indigo-500/10 dark:to-indigo-950/20 z-0 transition-colors duration-300"></div>
      
      {/* Sub Nav / Toolbar */}
      <div id="kanban-sub-nav" className="relative z-40 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setActiveBoardId(null);
              navigate("/");
            }}
            className="flex items-center gap-2 text-textSecondary hover:text-textPrimary bg-white dark:bg-bgSecondary hover:bg-gray-50 dark:hover:bg-bgGlassHover px-4 py-2 rounded-xl transition-colors text-sm font-medium border border-borderBase shadow-sm"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>
          {activeBoard && (
            <div className="border-l-2 border-borderBase pl-4">
              <h2 className="text-lg font-bold text-textPrimary flex items-center gap-2">
                {activeBoard.title}
                {activeBoard.targetDate && (() => {
                  const r = getDaysRemaining(activeBoard.targetDate);
                  return (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${r.isOverdue ? 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20' : 'text-amber-600 dark:text-amber-500 bg-amber-500/10 border-amber-500/20'}`}>
                      <Target size={12} />
                      ({r.text})
                    </span>
                  );
                })()}
              </h2>
            </div>
          )}
        </div>

        {/* Right: Search & Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari tugas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-bgSecondary border border-borderBase rounded-xl py-2 pl-10 pr-4 text-sm text-textPrimary placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-sm"
            />
          </div>

          {/* Label Filter */}
          <div className="relative shrink-0">
            <button 
              onClick={() => setIsLabelOpen(!isLabelOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl text-sm font-medium text-textSecondary hover:text-textPrimary hover:bg-gray-50 dark:hover:bg-bgGlassHover transition-all shadow-sm"
            >
              <Tag size={16} className={filterLabel ? "text-indigo-500 dark:text-indigo-400" : ""} />
              <span className="hidden sm:inline">
                {filterLabel ? AVAILABLE_LABELS.find((l) => l.id === filterLabel)?.name || "Filter" : "Filter Label"}
              </span>
            </button>

            {isLabelOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-bgSecondary border border-gray-200 dark:border-borderBase rounded-xl shadow-xl z-30">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => { setFilterLabel(null); setIsLabelOpen(false); }}
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
                      onClick={() => { setFilterLabel(label.id); setIsLabelOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        filterLabel === label.id
                          ? "bg-gray-100 dark:bg-bgGlass text-textPrimary font-medium"
                          : "text-textSecondary hover:bg-gray-50 dark:hover:bg-bgGlassHover hover:text-textPrimary"
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: label.color }} />
                      {label.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div id="kanban-columns-wrapper" className="relative z-10 flex-1 flex gap-6 items-start w-full overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
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
