"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Edit2, Trash2, FileText, AlertTriangle } from "lucide-react";
import type { Card } from "../types";
import { useState, useRef } from "react";
import { CardModal } from "./CardModal";
import { useKanban } from "../store/kanbanStore";
import { useAuthStore } from "../store/authStore";
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

interface KanbanCardProps {
  card: Card;
  isOverlay?: boolean;
}

const PRIORITY_COLORS = {
  low: "bg-gray-500 text-white font-extrabold shadow-sm",
  medium: "bg-indigo-500 text-white font-extrabold shadow-sm",
  high: "bg-red-500 text-white font-extrabold shadow-sm",
};

export function KanbanCard({ card, isOverlay }: KanbanCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const pointerDownPos = useRef<{x: number, y: number} | null>(null);
  const { deleteCard } = useKanban();
  const user = useAuthStore((state) => state.user);
  
  let cardPicId = null;
  if (card) {
    if (card.pic && typeof card.pic === 'object') {
      cardPicId = (card.pic as any).id;
    } else if (typeof card.pic === 'string') {
      cardPicId = card.pic;
    } else {
      cardPicId = (card as any).picId || (card as any).pic_id;
    }
  }
  const isOwner = !cardPicId || cardPicId === user?.id;
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: "Card",
      card,
    },
    disabled: !isOwner,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const checklist = card.checklist || [];
  const labels = card.labels || [];
  const completedChecklist = checklist.filter((item) => item.completed).length;

  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-32 bg-bgGlass border border-borderBase border-dashed rounded-xl opacity-40"
      />
    );
  }

  const CardContent = (
    <div
      className={`group bg-bgSecondary border border-borderBase p-4 rounded-xl shadow-md hover:shadow-lg hover:border-textSecondary transition-all relative ${isOverlay ? "drag-overlay" : ""}`}
    >
      {/* Action Buttons (visible on hover) */}
      {!isOverlay && (
        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-bgSecondary/90 backdrop-blur rounded-md p-1 shadow-sm border border-borderBase z-10">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            className="p-1.5 text-textSecondary hover:text-indigo-500 hover:bg-bgGlassHover rounded transition-colors"
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm("Hapus tugas ini?")) {
                deleteCard(card.id);
              }
            }}
            className="p-1.5 text-textSecondary hover:text-red-500 hover:bg-bgGlassHover rounded transition-colors"
            title="Hapus"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3 pr-12">
          {labels.map((label) => (
            <span
              key={label.id}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${label.color}20`,
                color: label.color,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      <h3 className="text-sm font-medium text-textPrimary mb-3 leading-snug line-clamp-2 break-words">
        {card.title}
      </h3>

      <div className="flex flex-col gap-2 mt-auto pt-2 border-t border-borderBase">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            {checklist.length > 0 && (
              <div className="text-[11px] font-semibold text-textSecondary bg-bgSecondary border border-borderBase px-1.5 py-0.5 rounded">
                {completedChecklist}/{checklist.length} Selesai
              </div>
            )}
            {card.requestDate && (
              <div
                className="text-[11px] font-semibold text-textSecondary bg-bgSecondary border border-borderBase px-1.5 py-0.5 rounded"
                title="Target Tanggal"
              >
                <span className="text-textPrimary mr-1">Mulai:</span>
                {new Date(card.requestDate).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })}
              </div>
            )}
            {card.dueDate && (
                <div
                  className="text-[11px] font-semibold text-textSecondary bg-bgSecondary border border-borderBase px-1.5 py-0.5 rounded"
                  title="Tanggal Selesai"
                >
                  <span className="text-textPrimary mr-1">Target:</span>
                  {new Date(card.dueDate).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}
                  {(() => { const r = getDaysRemaining(card.dueDate); return (
                    <span className={`ml-1 ${r.isOverdue ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-500'}`}>
                      ({r.text})
                    </span>
                  ); })()}
                </div>
              )}
            {card.attachment ? (
              <div className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400 px-1.5 py-0.5 rounded">
                <FileText size={12} />
                <span>Ada Lampiran</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 bg-gray-50 border border-gray-200 dark:bg-gray-800/50 dark:border-gray-700/50 dark:text-gray-500 px-1.5 py-0.5 rounded">
                <FileText size={12} />
                <span>Tidak Ada</span>
              </div>
            )}
          </div>

          <span
            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm shrink-0 ${PRIORITY_COLORS[card.priority]}`}
          >
            {card.priority}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2">
          <div
            className="text-[10px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-500/10 border border-slate-200 dark:border-slate-500/20 px-1.5 py-0.5 rounded flex items-center gap-1"
            title="Waktu Masuk"
          >
            <span className="font-semibold">Masuk:</span>
            <span>
              {new Date(
                (card as any).newDate ||
                  card.new_date ||
                  card.createdAt ||
                  Date.now(),
              ).toLocaleString("id-ID", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          {((card as any).prosesDate || card.proses_date) && (
            <div
              className="text-[10px] text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 px-1.5 py-0.5 rounded flex items-center gap-1"
              title="Waktu Proses"
            >
              <span className="font-semibold">Proses:</span>
              <span>
                {new Date(
                  (card as any).prosesDate || card.proses_date,
                ).toLocaleString("id-ID", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
          {((card as any).endDate || card.end_date) && (
            <div
              className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-1"
              title="Waktu Selesai"
            >
              <span className="font-semibold">Selesai:</span>
              <span>
                {new Date(
                  (card as any).endDate || card.end_date,
                ).toLocaleString("id-ID", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>

        {/* PIC Row */}
        {card.pic && (
          <div className="flex items-center gap-2 mt-1">
            <div className="w-5 h-5 shrink-0 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-500 dark:text-indigo-400">
              {typeof card.pic === "object"
                ? (card.pic as any).name?.charAt(0).toUpperCase()
                : (card.pic as string).charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-textSecondary flex-1 min-w-0 truncate">
              {typeof card.pic === "object"
                ? (card.pic as any).name
                : (card.pic as string)}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (isOverlay) {
    return CardContent;
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={(e) => {
          // Prevent drag from triggering click if it moved
          if (e.defaultPrevented) return;
          setIsModalOpen(true);
        }}
        onPointerDown={(e) => {
          if (!isOwner) {
            pointerDownPos.current = { x: e.clientX, y: e.clientY };
          }
          if (listeners?.onPointerDown) {
            listeners.onPointerDown(e as any);
          }
        }}
        onPointerMove={(e) => {
          if (!isOwner && pointerDownPos.current) {
            const dx = e.clientX - pointerDownPos.current.x;
            const dy = e.clientY - pointerDownPos.current.y;
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
              setShowAlert(true);
              pointerDownPos.current = null;
              setTimeout(() => setShowAlert(false), 3000);
            }
          }
          // dnd-kit pointerSensor doesn't typically attach onPointerMove to the node directly, but just in case:
          if (listeners?.onPointerMove) {
            (listeners as any).onPointerMove(e);
          }
        }}
        onPointerUp={(e) => {
          if (!isOwner) {
            pointerDownPos.current = null;
          }
          if (listeners?.onPointerUp) {
            (listeners as any).onPointerUp(e);
          }
        }}
        onPointerCancel={(e) => {
          if (!isOwner) {
            pointerDownPos.current = null;
          }
          if (listeners?.onPointerCancel) {
            (listeners as any).onPointerCancel(e);
          }
        }}
        className={isOwner ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}
      >
        {CardContent}
      </div>

      {showAlert && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] animate-shake pointer-events-none">
          <div className="bg-red-50/95 backdrop-blur border border-red-200 text-red-600 px-6 py-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-3">
            <AlertTriangle size={24} className="text-red-500" />
            <span className="font-medium text-[15px]">Anda tidak berhak memindahkan tugas ini!</span>
          </div>
        </div>
      )}

      {isModalOpen && (
        <CardModal card={card} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}

export function CardDragOverlay({ card }: { card: Card }) {
  return <KanbanCard card={card} isOverlay />;
}
