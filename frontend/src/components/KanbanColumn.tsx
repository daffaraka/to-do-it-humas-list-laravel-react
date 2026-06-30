"use client";

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import type { Column, Card } from '../types';
import { KanbanCard } from './KanbanCard';
import { CreateTaskModal } from './CreateTaskModal';

interface KanbanColumnProps {
  column: Column;
  cards: Card[];
}

export function KanbanColumn({ column, cards }: KanbanColumnProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const getColumnColors = (id: string) => {
    switch (id) {
      case 'new':
        return 'bg-indigo-50/80 border-indigo-200/60 dark:bg-indigo-500/5 dark:border-indigo-500/20';
      case 'progress':
        return 'bg-amber-50/80 border-amber-200/60 dark:bg-amber-500/5 dark:border-amber-500/20';
      case 'done':
        return 'bg-emerald-50/80 border-emerald-200/60 dark:bg-emerald-500/5 dark:border-emerald-500/20';
      default:
        return 'bg-bgSecondary/50 border-borderBase';
    }
  };

  const getHeaderColors = (id: string) => {
    switch (id) {
      case 'new':
        return 'bg-indigo-100/50 border-indigo-200/60 dark:bg-indigo-500/10 dark:border-indigo-500/20';
      case 'progress':
        return 'bg-amber-100/50 border-amber-200/60 dark:bg-amber-500/10 dark:border-amber-500/20';
      case 'done':
        return 'bg-emerald-100/50 border-emerald-200/60 dark:bg-emerald-500/10 dark:border-emerald-500/20';
      default:
        return 'bg-bgGlass border-borderBase';
    }
  };

  return (
    <>
      <div id={`column-${column.id}`} className={`flex flex-col flex-1 min-w-[300px] border rounded-2xl overflow-hidden h-full max-h-full transition-colors duration-300 ${getColumnColors(column.id)}`}>
        {/* Column Header */}
        <div className={`p-4 border-b flex items-center justify-between transition-colors duration-300 ${getHeaderColors(column.id)}`}>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-textPrimary">{column.title}</h2>
            <span className="bg-bgGlassHover text-textSecondary text-xs px-2 py-0.5 rounded-full font-medium">
              {cards.length}
            </span>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="text-textSecondary hover:text-textPrimary p-1 rounded-md hover:bg-bgGlass transition-colors"
            title="Tambah tugas"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Cards Container */}
        <div
          id={`column-${column.id}-cards`}
          ref={setNodeRef}
          className="flex-1 p-3 overflow-y-auto space-y-3 min-h-[400px] md:min-h-[200px]"
        >
          <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {cards.map((card) => (
              <KanbanCard key={card.id} card={card} />
            ))}
          </SortableContext>
        </div>
      </div>
      
      {isCreating && (
        <CreateTaskModal 
          columnId={column.id} 
          onClose={() => setIsCreating(false)} 
        />
      )}
    </>
  );
}
