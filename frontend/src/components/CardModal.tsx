"use client";

import { useState, useEffect, useRef } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import DatePicker from 'react-datepicker';
import { id as dateFnsIdLocale } from 'date-fns/locale';
import {
  X, Tag, Flag, CalendarDays, CheckSquare, Plus, Trash2
} from 'lucide-react';
import { COLUMNS, AVAILABLE_LABELS } from '../types';
import type { Card, ColumnId } from '../types';
import { useKanban } from '../store/kanbanStore';
import { useAuthStore } from '../store/authStore';
import { v4 as uuidv4 } from 'uuid';
import api from '../lib/api';
import type { Comment } from '../types';

interface CardModalProps {
  card: Card;
  onClose: () => void;
}

export function CardModal({ card, onClose }: CardModalProps) {
  const { updateCard, deleteCard, moveCard } = useKanban();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [newChecklistText, setNewChecklistText] = useState('');
  
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');

  const currentUser = useAuthStore(state => state.user);

  useEffect(() => {
    if (activeTab === 'comments') {
      api.get(`/tasks/${card.id}/comments`).then(res => setComments(res.data)).catch(console.error);
      api.get('/users').then(res => setUsers(res.data)).catch(console.error);
    }
  }, [activeTab, card.id]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/tasks/${card.id}/comments`, {
        text: newComment,
        mentions
      });
      setComments([...comments, res.data]);
      setNewComment('');
      setMentions([]);
    } catch (error) {
      console.error('Failed to post comment', error);
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewComment(val);
    
    const lastWord = val.split(' ').pop() || '';
    if (lastWord.startsWith('@')) {
      setMentionQuery(lastWord.slice(1).toLowerCase());
      setShowMentionDropdown(true);
    } else {
      setShowMentionDropdown(false);
    }
  };

  const handleMentionSelect = (user: any) => {
    const words = newComment.split(' ');
    words.pop();
    const newText = (words.length > 0 ? words.join(' ') + ' ' : '') + `@${user.name} `;
    setNewComment(newText);
    if (!mentions.includes(user.id)) {
      setMentions([...mentions, user.id]);
    }
    setShowMentionDropdown(false);
  };

  const checklist = card.checklist || [];
  const labels = card.labels || [];

  const handleSave = () => {
    updateCard(card.id, { title, description });
  };

  const handleAddChecklist = (e: KeyboardEvent | MouseEvent) => {
    if (
      (e.type === 'keydown' && (e as KeyboardEvent).key === 'Enter') ||
      e.type === 'click'
    ) {
      if (newChecklistText.trim()) {
        updateCard(card.id, {
          checklist: [
            ...checklist,
            { id: uuidv4(), text: newChecklistText.trim(), completed: false },
          ],
        });
        setNewChecklistText('');
      }
    }
  };

  const toggleChecklist = (itemId: string) => {
    updateCard(card.id, {
      checklist: checklist.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ),
    });
  };

  const deleteChecklist = (itemId: string) => {
    updateCard(card.id, {
      checklist: checklist.filter((item) => item.id !== itemId),
    });
  };

  const toggleLabel = (labelId: string) => {
    const hasLabel = labels.some((l) => l.id === labelId);
    if (hasLabel) {
      updateCard(card.id, {
        labels: labels.filter((l) => l.id !== labelId),
      });
    } else {
      const labelData = AVAILABLE_LABELS.find((l) => l.id === labelId);
      if (labelData) {
        updateCard(card.id, {
          labels: [...labels, labelData],
        });
      }
    }
  };

  const progress = checklist.length > 0
    ? Math.round((checklist.filter((c) => c.completed).length / checklist.length) * 100)
    : 0;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-bgSecondary w-full max-w-3xl max-h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-borderBase animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-borderBase">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            className="flex-1 bg-transparent text-lg sm:text-xl font-semibold text-textPrimary focus:outline-none focus:ring-1 focus:ring-gray-200 rounded-md px-2 py-1 mr-4"
          />
          <button
            onClick={onClose}
            className="p-2 rounded-full text-textSecondary hover:text-textPrimary hover:bg-bgGlassHover transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-borderBase px-4 sm:px-5">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-textSecondary hover:text-textPrimary'}`}
          >
            Detail Tugas
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'comments' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-textSecondary hover:text-textPrimary'}`}
          >
            Komentar
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 flex flex-col md:flex-row gap-6 sm:gap-8">
          
          {/* Left Column - Main Info */}
          <div className="flex-1 space-y-5 sm:space-y-6">
            {activeTab === 'details' ? (
              <>
                <div>
                  <h4 className="text-sm font-medium text-textSecondary mb-2">Deskripsi</h4>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleSave}
                placeholder="Tambahkan deskripsi lebih detail..."
                className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary min-h-[100px] sm:min-h-[120px] focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-textSecondary mb-2">Target Tanggal</h4>
                <DatePicker
                  selected={card.requestDate ? new Date(card.requestDate) : null}
                  onChange={(date: any) => updateCard(card.id, { requestDate: date ? date.toISOString() : null })}
                  dateFormat="dd/MM/yyyy"
                  locale={dateFnsIdLocale}
                  placeholderText="dd/mm/yyyy"
                  className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 placeholder-textSecondary transition-all"
                />
              </div>

              <div>
                <h4 className="text-sm font-medium text-textSecondary mb-2">Tanggal Selesai</h4>
                <DatePicker
                  selected={card.dueDate ? new Date(card.dueDate) : null}
                  onChange={(date: any) => updateCard(card.id, { dueDate: date ? date.toISOString() : null })}
                  dateFormat="dd/MM/yyyy"
                  locale={dateFnsIdLocale}
                  placeholderText="dd/mm/yyyy"
                  className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 placeholder-textSecondary transition-all"
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-textSecondary mb-2">Tautan Dokumen</h4>
              <input
                type="url"
                value={card.documentLink || ''}
                onChange={(e) => updateCard(card.id, { documentLink: e.target.value })}
                placeholder="https://..."
                className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400"
              />
              {card.documentLink && (
                <a 
                  href={card.documentLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-block mt-2 text-xs text-indigo-400 hover:text-indigo-300 underline"
                >
                  Buka Dokumen
                </a>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckSquare size={18} className="text-textSecondary" />
                <h4 className="text-sm font-medium text-textPrimary">Checklist</h4>
              </div>
              
              {checklist.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-textSecondary mb-1">
                    <span>{progress}% Selesai</span>
                  </div>
                  <div className="h-1.5 bg-bgGlassHover rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2 mb-3">
                {checklist.map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center gap-2 sm:gap-3 group">
                    <button
                      onClick={() => toggleChecklist(item.id)}
                      className={`w-4 h-4 shrink-0 rounded flex items-center justify-center border transition-colors ${
                        item.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-textSecondary hover:border-gray-400'
                      }`}
                    >
                      {item.completed && <CheckSquare size={12} className="opacity-0" style={{ display: 'none' }} />}
                      {/* Using HTML checkmark to avoid large icon padding */}
                      {item.completed && <span className="text-[10px]">✓</span>}
                    </button>
                    <span className={`flex-1 min-w-[200px] text-sm break-words ${item.completed ? 'text-textSecondary line-through' : 'text-textPrimary'}`}>
                      {item.text}
                    </span>
                    <button
                      onClick={() => deleteChecklist(item.id)}
                      className="text-textSecondary hover:text-red-400 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3">
                <input
                  type="text"
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  onKeyDown={handleAddChecklist}
                  placeholder="Tambah item baru..."
                  className="flex-1 bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400"
                />
                <button
                  onClick={handleAddChecklist}
                  disabled={!newChecklistText.trim()}
                  className="bg-bgGlass hover:bg-bgGlassHover disabled:opacity-50 text-textSecondary p-2 rounded-xl transition-colors flex items-center justify-center"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
            </>
            ) : (
              <div className="flex flex-col h-full space-y-4">
                <div className="flex-1 overflow-y-auto space-y-4 min-h-[300px]">
                  {comments.length === 0 ? (
                    <p className="text-textSecondary text-sm text-center py-8">Belum ada komentar.</p>
                  ) : (
                    comments.map(comment => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shrink-0">
                          {comment.user?.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="font-semibold text-textPrimary text-sm">{comment.user?.name}</span>
                            <span className="text-xs text-textSecondary">{new Date(comment.createdAt).toLocaleString('id-ID')}</span>
                          </div>
                          <p className="text-sm text-textPrimary mt-1 whitespace-pre-wrap">{comment.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="relative pt-4 border-t border-borderBase">
                  {showMentionDropdown && (
                    <div className="absolute bottom-full left-0 mb-1 w-full sm:w-64 bg-bgSecondary border border-borderBase rounded-lg shadow-xl overflow-hidden z-50">
                      {users.filter(u => u.name.toLowerCase().includes(mentionQuery)).map(u => (
                        <button
                          key={u.id}
                          onClick={() => handleMentionSelect(u)}
                          className="w-full text-left px-4 py-2 text-sm text-textPrimary hover:bg-bgGlass transition-colors flex items-center gap-2"
                        >
                          <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          {u.name}
                        </button>
                      ))}
                    </div>
                  )}
                  <textarea
                    value={newComment}
                    onChange={handleCommentChange}
                    placeholder="Tulis komentar... Gunakan @ untuk menyebut seseorang."
                    className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary min-h-[80px] focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleCommentSubmit}
                      disabled={!newComment.trim()}
                      className="px-4 py-1.5 bg-indigo-600 border border-indigo-700 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
                    >
                      Kirim
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="w-full md:w-56 space-y-5 sm:space-y-6 pt-4 md:pt-0 border-t md:border-t-0 border-borderBase md:pl-2">
            
            {/* Status Column */}
            <div>
              <h4 className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Status Kolom</h4>
              <select
                value={card.columnId}
                onChange={(e) => moveCard(card.id, e.target.value as ColumnId)}
                className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400"
              >
                {COLUMNS.map((col) => (
                  <option key={col.id} value={col.id} className="bg-bgSecondary">
                    {col.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Labels */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag size={14} className="text-textSecondary" />
                <h4 className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Label</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_LABELS.map((label) => {
                  const isActive = labels.some((l) => l.id === label.id);
                  return (
                    <button
                      key={label.id}
                      onClick={() => toggleLabel(label.id)}
                      className="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
                      style={{
                        backgroundColor: isActive ? label.color : 'rgba(255,255,255,0.05)',
                        color: isActive ? '#fff' : label.color,
                        border: `1px solid ${isActive ? 'transparent' : label.color + '40'}`,
                      }}
                    >
                      {label.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flag size={14} className="text-textSecondary" />
                <h4 className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Prioritas</h4>
              </div>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => updateCard(card.id, { priority: p })}
                    className={`flex-1 py-1.5 rounded-md text-xs font-medium uppercase tracking-wide transition-all ${
                      card.priority === p 
                        ? p === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/50 dark:text-red-300'
                        : p === 'medium' ? 'bg-indigo-500/20 text-indigo-500 border border-indigo-500/50 dark:text-indigo-300'
                        : 'bg-gray-500/20 text-gray-600 border border-gray-500/50 dark:text-gray-400'
                        : 'bg-bgGlass text-textSecondary border border-transparent hover:bg-bgGlassHover'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays size={14} className="text-textSecondary" />
                <h4 className="text-xs font-semibold text-textSecondary uppercase tracking-wider">Batas Waktu</h4>
              </div>
              <DatePicker
                selected={card.dueDate ? new Date(card.dueDate) : null}
                onChange={(date: any) => updateCard(card.id, { dueDate: date ? date.toISOString() : null })}
                dateFormat="dd/MM/yyyy"
                locale={dateFnsIdLocale}
                placeholderText="dd/mm/yyyy"
                className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 placeholder-textSecondary transition-all"
              />
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-borderBase bg-bgGlass flex gap-3 shrink-0">
          <button
            onClick={() => {
              handleSave();
              onClose();
            }}
            className="flex-[8] flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 border border-indigo-700 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            Simpan
          </button>
          <button
            onClick={() => {
              if (confirm('Hapus tugas ini?')) {
                deleteCard(card.id);
                // No need to onClose manually here if the component unmounts, but good practice
              }
            }}
            className="flex-[2] flex items-center justify-center py-2.5 px-4 bg-white border border-red-500 hover:bg-red-50 text-red-500 rounded-xl text-sm font-medium transition-colors"
            title="Hapus Tugas"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline ml-2">Hapus</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
