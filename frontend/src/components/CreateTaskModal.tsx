"use client";

import { useState } from 'react';
import type { FormEvent } from 'react';
import { createPortal } from 'react-dom';
import DatePicker from 'react-datepicker';
import { id } from 'date-fns/locale';
import { X, Type, FileText, User, Calendar, Briefcase } from 'lucide-react';
import type { ColumnId } from '../types';
import { useKanban } from '../store/kanbanStore';

interface CreateTaskModalProps {
  columnId: ColumnId;
  onClose: () => void;
}

export function CreateTaskModal({ columnId, onClose }: CreateTaskModalProps) {
  const { addCard } = useKanban();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requestDate, setRequestDate] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    addCard(title.trim(), columnId, {
      description,
      requestDate: requestDate ? requestDate.toISOString() : null,
      dueDate: dueDate ? dueDate.toISOString() : null
    });
    
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-bgPrimary w-full max-w-lg max-h-[95vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-black/[0.05] dark:border-white/[0.05] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 bg-black/[0.02] dark:bg-white/[0.02] shrink-0">
          <h2 className="text-xl font-bold text-textPrimary flex items-center gap-2">
            Tugas Baru
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-black/[0.05] dark:bg-white/[0.05] rounded-full text-textSecondary hover:text-textPrimary hover:bg-black/[0.1] dark:hover:bg-white/[0.1] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto custom-scrollbar">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
              <Type size={14} className="text-indigo-400" />
              Nama Tugas <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Perbaikan jaringan lantai 2"
              className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all placeholder-textSecondary"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
              <FileText size={14} className="text-indigo-400" />
              Deskripsi Singkat
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tambahkan detail..."
              className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary min-h-[80px] focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 resize-none transition-all placeholder-textSecondary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Request Date with native dark mode support via style */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
                <Calendar size={14} className="text-indigo-400" />
                Target Tanggal
              </label>
              <DatePicker
                selected={requestDate}
                onChange={(date: any) => setRequestDate(date)}
                dateFormat="dd/MM/yyyy"
                locale={id}
                placeholderText="dd/mm/yyyy"
                className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all placeholder-textSecondary"
              />
            </div>
            
            {/* Due Date (Tanggal Selesai) */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
                <Calendar size={14} className="text-emerald-400" />
                Tanggal Selesai
              </label>
              <DatePicker
                selected={dueDate}
                onChange={(date: any) => setDueDate(date)}
                dateFormat="dd/MM/yyyy"
                locale={id}
                placeholderText="dd/mm/yyyy"
                className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all placeholder-textSecondary"
              />
            </div>
          </div>



          <div className="pt-4 flex items-center justify-end gap-3 border-t border-borderBase shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-textSecondary bg-white border border-gray-200 hover:bg-gray-50 hover:text-textPrimary rounded-xl transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 border border-indigo-700 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all"
            >
              Buat Tugas
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
