"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import { id } from "date-fns/locale";
import { format } from "date-fns";
import { X, Type, FileText, User, Calendar, Briefcase, Users } from "lucide-react";
import type { ColumnId } from "../types";
import { useKanban } from "../store/kanbanStore";
import api from "../lib/api";
import { useEffect } from "react";

interface CreateTaskModalProps {
  columnId: ColumnId;
  onClose: () => void;
}

export function CreateTaskModal({ columnId, onClose }: CreateTaskModalProps) {
  const { addCard } = useKanban();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requestDate, setRequestDate] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [collaboratorIds, setCollaboratorIds] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get("/users").then((res) => {
      setUsers(res.data);
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validasi Front-end
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Nama tugas wajib diisi";
    if (!description.trim()) newErrors.description = "Deskripsi wajib diisi";
    if (!requestDate) newErrors.requestDate = "Tanggal mulai wajib diisi";
    if (!dueDate) newErrors.dueDate = "Target tanggal wajib diisi";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrors({});

    try {
      const activeBoardId = useKanban.getState().activeBoardId;
      const targetDepartmentId =
        useKanban.getState().activeDepartment === "all"
          ? useKanban.getState().departments[0]?.id
          : useKanban.getState().activeDepartment;

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("columnId", columnId);
      if (activeBoardId) formData.append("boardId", activeBoardId);
      if (targetDepartmentId)
        formData.append("departmentId", targetDepartmentId);
      if (description) formData.append("description", description);
      if (requestDate)
        formData.append("requestDate", format(requestDate, "yyyy-MM-dd"));
      if (dueDate) formData.append("dueDate", format(dueDate, "yyyy-MM-dd"));
      if (attachment) formData.append("attachment", attachment);
      collaboratorIds.forEach((id) => formData.append("collaborator_ids[]", id));

      const { data } = await api.post("/tasks", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      useKanban.setState((state) => ({ cards: [...state.cards, data] }));

      onClose();
    } catch (err: any) {
      console.error("Failed to add card", err);
      if (err.response?.data?.errors) {
        const apiErrors: Record<string, string> = {};
        Object.keys(err.response.data.errors).forEach(key => {
          apiErrors[key] = err.response.data.errors[key][0];
        });
        setErrors(apiErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
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

        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto custom-scrollbar"
        >
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
              <Type size={14} className="text-indigo-400" />
              Nama Tugas <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({...errors, title: ''});
              }}
              placeholder="Contoh: Perbaikan jaringan lantai 2"
              className={`w-full bg-white border dark:bg-bgSecondary rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 transition-all placeholder-textSecondary ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-borderBase focus:border-gray-400 focus:ring-gray-200'}`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
              <FileText size={14} className="text-indigo-400" />
              Deskripsi Singkat <span className="text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({...errors, description: ''});
              }}
              placeholder="Tambahkan detail..."
              className={`w-full bg-white border dark:bg-bgSecondary rounded-xl px-4 py-3 text-sm text-textPrimary min-h-[80px] focus:outline-none focus:ring-2 resize-none transition-all placeholder-textSecondary ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-borderBase focus:border-gray-400 focus:ring-gray-200'}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Request Date with native dark mode support via style */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
                <Calendar size={14} className="text-indigo-400" />
                Tanggal Mulai <span className="text-red-400">*</span>
              </label>
              <DatePicker
                selected={requestDate}
                onChange={(date: any) => {
                  setRequestDate(date);
                  if (errors.requestDate) setErrors({...errors, requestDate: ''});
                }}
                dateFormat="dd/MM/yyyy"
                locale={id}
                placeholderText="dd/mm/yyyy"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                className={`w-full bg-white border dark:bg-bgSecondary rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 transition-all placeholder-textSecondary ${errors.requestDate ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-borderBase focus:border-gray-400 focus:ring-gray-200'}`}
              />
              {errors.requestDate && <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1">{errors.requestDate}</p>}
            </div>

            {/* Due Date (Tanggal Selesai) */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
                <Calendar size={14} className="text-emerald-400" />
                Target Tanggal <span className="text-red-400">*</span>
              </label>
              <DatePicker
                selected={dueDate}
                onChange={(date: any) => {
                  setDueDate(date);
                  if (errors.dueDate) setErrors({...errors, dueDate: ''});
                }}
                dateFormat="dd/MM/yyyy"
                locale={id}
                placeholderText="dd/mm/yyyy"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                className={`w-full bg-white border dark:bg-bgSecondary rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 transition-all placeholder-textSecondary ${errors.dueDate ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 dark:border-borderBase focus:border-gray-400 focus:ring-gray-200'}`}
              />
              {errors.dueDate && <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1">{errors.dueDate}</p>}
            </div>
          </div>

          {/* Attachment */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
              <FileText size={14} className="text-blue-400" />
              Lampiran (Opsional)
            </label>
            <input
              type="file"
              onChange={(e) =>
                setAttachment(e.target.files ? e.target.files[0] : null)
              }
              className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              accept=".jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf"
            />
          </div>

          {/* Collaborators */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
              <Users size={14} className="text-indigo-400" />
              Anggota Tim (Opsional)
            </label>
            <div className="bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-2 max-h-40 overflow-y-auto custom-scrollbar">
              {users.map(user => (
                <label key={user.id} className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] rounded px-2">
                  <input
                    type="checkbox"
                    checked={collaboratorIds.includes(user.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCollaboratorIds([...collaboratorIds, user.id]);
                      } else {
                        setCollaboratorIds(collaboratorIds.filter(id => id !== user.id));
                      }
                    }}
                    className="rounded text-indigo-500 focus:ring-indigo-500 border-gray-300 bg-white"
                  />
                  <span className="text-sm text-textPrimary">{user.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-borderBase shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-textSecondary bg-white border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-bgGlass hover:text-textPrimary rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-2.5 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center min-w-[140px] cursor-pointer rounded-xl"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                "Buat Tugas"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
