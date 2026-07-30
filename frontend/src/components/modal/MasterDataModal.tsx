"use client";

import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { createPortal } from 'react-dom';
import DatePicker from 'react-datepicker';
import { id as dateFnsIdLocale } from 'date-fns/locale';
import { format } from 'date-fns';
import { X, User, Briefcase, Lock, Mail, Tag, Target } from 'lucide-react';
import api from '../../lib/api';
import { useKanban } from '../../store/kanbanStore';
import { useAuthStore } from '../../store/authStore';

interface MasterDataModalProps {
  type: 'users' | 'departments' | 'roles' | 'kpis' | 'kategori-program-kerja' | 'task-weights';
  initialData?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function MasterDataModal({ type, initialData, onClose, onSuccess }: MasterDataModalProps) {
  const { departments } = useKanban();
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [roleId, setRoleId] = useState('');
  // KPI specific
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  // Task Weight specific
  const [weight, setWeight] = useState(0);

  const user = useAuthStore(state => state.user);

  useEffect(() => {
    if (type === 'users') {
      // Fetch roles for user creation
      api.get('/roles').then(res => {
        setRoles(res.data);
        if (!initialData && res.data.length > 0) setRoleId(res.data[0].id);
      }).catch(console.error);

      if (!initialData && departments.length > 0) setDepartmentId(departments[0].id);
    } else if (type === 'kpis') {
      if (!initialData && (user as any)?.department?.id) {
        setDepartmentId((user as any).department.id);
      }
    }
  }, [type, departments, initialData, user]);

  useEffect(() => {
    if (initialData) {
      if (type === 'users') {
        setName(initialData.name || '');
        setEmail(initialData.email || '');
        setDepartmentId(initialData.departmentId || (initialData.department?.id) || '');
        setRoleId(initialData.roleId || (initialData.role?.id) || '');
      } else if (type === 'kpis') {
        setTitle(initialData.title || '');
        setDescription(initialData.description || '');
        setDepartmentId(initialData.departmentId || (initialData.department?.id) || '');
        if (initialData.targetDate) setTargetDate(new Date(initialData.targetDate));
      } else if (type === 'task-weights') {
        setWeight(initialData.weight || 0);
      } else {
        setName(initialData.name || '');
      }
    }
  }, [initialData, type]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (type !== 'kpis' && type !== 'task-weights' && !name.trim()) return;
    if (type === 'kpis' && !title.trim()) return;
    if (type === 'task-weights' && weight < 1) return;

    setLoading(true);
    try {
      if (initialData) {
        // EDIT MODE
        if (type === 'users') {
          const payload: any = { name, email, departmentId, roleId };
          if (password) payload.password = password;
          await api.patch(`/users/${initialData.id}`, payload);
        } else if (type === 'kpis') {
          await api.put(`/kpis/${initialData.id}`, { title, description, targetDate: targetDate ? format(targetDate, "yyyy-MM-dd") : null, departmentId });
        } else if (type === 'task-weights') {
          await api.put(`/task-weights/${initialData.id}`, { weight });
        } else {
          await api.patch(`/${type}/${initialData.id}`, { name });
        }
      } else {
        // CREATE MODE
        if (type === 'users') {
          if (!email || !password || !departmentId || !roleId) return;
          await api.post('/users', { name, email, password, departmentId, roleId });
        } else if (type === 'kpis') {
          await api.post('/kpis', { title, description, targetDate: targetDate ? format(targetDate, "yyyy-MM-dd") : null, departmentId });
        } else {
          await api.post(`/${type}`, { name });
        }
      }
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Gagal menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    const action = initialData ? 'Edit' : 'Tambah';
    if (type === 'users') return `${action} Pengguna`;
    if (type === 'departments') return `${action} Departemen`;
    if (type === 'kpis') return `${action} WIG`;
    if (type === 'task-weights') return `${action} Bobot Pekerjaan`;
    return `${action} Jabatan (Role)`;
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-bgPrimary w-full max-w-md max-h-[95vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-black/[0.05] dark:border-white/[0.05] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 bg-black/[0.02] dark:bg-white/[0.02] shrink-0">
          <h2 className="text-xl font-bold text-textPrimary flex items-center gap-2">
            {getTitle()}
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-black/[0.05] dark:bg-white/[0.05] rounded-full text-textSecondary hover:text-textPrimary hover:bg-black/[0.1] dark:hover:bg-white/[0.1] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto custom-scrollbar">
          {/* Name Field (Common) */}
          {type !== 'kpis' && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
                {type === 'users' ? <User size={14} className="text-indigo-400" /> : <Tag size={14} className="text-indigo-400" />}
                Nama {type === 'users' ? 'Lengkap' : ''} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                autoFocus
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Masukkan nama ${type.slice(0, -1)}`}
                className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl p-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all placeholder-textSecondary"
              />
            </div>
          )}

          {/* Task Weight Specific Fields */}
          {type === 'task-weights' && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
                <Target size={14} className="text-indigo-400" />
                Level
              </label>
              <input
                type="text"
                disabled
                value={initialData?.level || ''}
                className="w-full bg-gray-100 border border-gray-200 dark:bg-bgPrimary dark:border-borderBase rounded-xl p-3 text-sm text-textPrimary capitalize opacity-70"
              />
            </div>
          )}
          {type === 'task-weights' && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
                <Target size={14} className="text-indigo-400" />
                Bobot (Nilai) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl p-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all"
              />
            </div>
          )}

          {/* WIG Specific Fields */}
          {type === 'kpis' && (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
                  <Tag size={14} className="text-indigo-400" />
                  Judul WIG <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Implementasi Website E-Commerce"
                  className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl p-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all placeholder-textSecondary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
                  <Briefcase size={14} className="text-indigo-400" />
                  Departemen
                </label>
                <div className="relative">
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl p-3 pr-10 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all appearance-none"
                  >
                    <option value="">Pilih Departemen</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id} className="bg-bgSecondary text-textPrimary">{d.name}</option>
                    ))}
                  </select>
                  <div className="absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none">
                    <svg className="w-4 h-4 text-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                <p className='text-red-400 text-xs'>* Jika tidak dipilih maka akan otomatis menyimpan sesuai departmen user yang sedang login</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
                  Deskripsi Singkat
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan tujuan dan ruang lingkup WIG ini..."
                  className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl p-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all placeholder-textSecondary min-h-[100px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
                  Tanggal Target <span className="text-red-400">*</span>
                </label>
                <DatePicker
                  selected={targetDate}
                  onChange={(date: any) => setTargetDate(date)}
                  dateFormat="dd/MM/yyyy"
                  locale={dateFnsIdLocale}
                  placeholderText="dd/mm/yyyy"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  onKeyDown={(e) => e.preventDefault()}
                  className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl px-4 py-3 text-sm text-textPrimary dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 placeholder-textSecondary transition-all"
                />
              </div>

            </>
          )}

          {/* User Specific Fields */}
          {type === 'users' && (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
                  <Mail size={14} className="text-indigo-400" />
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl p-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all placeholder-textSecondary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
                  <Lock size={14} className="text-indigo-400" />
                  Password {!initialData && <span className="text-red-400">*</span>}
                </label>
                <input
                  type="password"
                  required={!initialData}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={initialData ? "Biarkan kosong jika tidak ingin mengubah password" : "••••••••"}
                  className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl p-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all placeholder-textSecondary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
                    <Briefcase size={14} className="text-indigo-400" />
                    Departemen <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl p-3 pr-10 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all appearance-none"
                    >
                      {departments.map(d => (
                        <option key={d.id} value={d.id} className="bg-bgSecondary text-textPrimary">{d.name}</option>
                      ))}
                    </select>
                    <div className="absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none">
                      <svg className="w-4 h-4 text-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
                    <User size={14} className="text-indigo-400" />
                    Role <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={roleId}
                      onChange={(e) => setRoleId(e.target.value)}
                      className="w-full bg-white border border-gray-200 dark:bg-bgSecondary dark:border-borderBase rounded-xl p-3 pr-10 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all appearance-none"
                    >
                      {roles.map(r => (
                        <option key={r.id} value={r.id} className="bg-bgSecondary text-textPrimary">{r.name}</option>
                      ))}
                    </select>
                    <div className="absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none">
                      <svg className="w-4 h-4 text-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

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
              disabled={loading || (type === 'kpis' ? !title.trim() : !name.trim())}
              className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 border border-indigo-700 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
