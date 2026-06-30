"use client";

import React, { useEffect } from 'react';
import { useKanban } from '../store/kanbanStore';
import { COLUMNS } from '../types';

export const JobsView: React.FC = () => {
  const { myJobs, fetchMyJobs, isLoading, error } = useKanban();

  useEffect(() => {
    fetchMyJobs();
  }, [fetchMyJobs]);

  if (isLoading) return <div className="p-6 text-center text-textSecondary">Memuat pekerjaan saya...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="flex-1 overflow-auto p-6 bg-bgPrimary">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-textPrimary">Pekerjaan Saya</h1>
        <p className="text-textSecondary text-sm mt-1">Daftar semua tugas yang ditugaskan kepada Anda lintas proyek</p>
      </div>
      
      <div className="flex gap-6 h-full pb-10 overflow-x-auto snap-x">
        {COLUMNS.map((col) => (
          <div key={col.id} className="w-80 flex-shrink-0 snap-center h-full flex flex-col bg-bgSecondary/30 rounded-xl border border-border/30">
             <div className="p-4 border-b border-border/30">
               <h3 className="font-semibold text-textPrimary">{col.title} <span className="ml-2 text-xs bg-bgSecondary px-2 py-0.5 rounded-full text-textSecondary">{myJobs.filter(job => job.columnId === col.id).length}</span></h3>
             </div>
             <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
               {myJobs.filter(job => job.columnId === col.id).map(job => (
                  <div key={job.id} className="p-4 bg-bgSecondary rounded-lg border border-border/50 shadow-sm hover:border-brand-500/50 transition-colors">
                    {/* @ts-ignore */}
                    <div className="text-xs text-brand-500 mb-1.5 font-semibold uppercase tracking-wider">{job.board?.title}</div>
                    <h4 className="font-medium text-textPrimary">{job.title}</h4>
                    {job.dueDate && (
                      <div className="text-xs text-textSecondary mt-3 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        Tenggat: {new Date(job.dueDate).toLocaleDateString('id-ID')}
                      </div>
                    )}
                  </div>
               ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
