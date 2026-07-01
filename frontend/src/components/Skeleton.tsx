import React from 'react';

export function DashboardSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-bgPrimary animate-pulse">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-gray-250 dark:bg-zinc-800 rounded-lg"></div>
            <div className="h-4 w-72 bg-gray-200 dark:bg-zinc-800/80 rounded-lg"></div>
          </div>
          <div className="h-10 w-32 bg-gray-250 dark:bg-zinc-800 rounded-lg"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-bgSecondary border border-borderBase rounded-xl p-6 space-y-4">
              <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-zinc-800/70"></div>
              <div className="space-y-2">
                <div className="h-5 w-3/4 bg-gray-250 dark:bg-zinc-800 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-zinc-800/60 rounded"></div>
              </div>
              <div className="pt-4 border-t border-borderBase space-y-2">
                <div className="h-3 w-1/3 bg-gray-200 dark:bg-zinc-800/50 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function KpiSkeleton() {
  return (
    <div className="flex-1 overflow-auto p-6 bg-bgPrimary animate-pulse">
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-gray-255 dark:bg-zinc-800 rounded-lg"></div>
          <div className="h-4 w-96 bg-gray-200 dark:bg-zinc-800/80 rounded-lg"></div>
        </div>
        <div className="h-11 w-40 bg-gray-255 dark:bg-zinc-800 rounded-xl"></div>
      </div>

      <div className="space-y-8">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div key={idx} className="mb-10 bg-bgSecondary/30 rounded-2xl p-6 border border-black/[0.03] dark:border-white/[0.03] space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-zinc-800/70"></div>
                <div className="h-6 w-64 bg-gray-250 dark:bg-zinc-800 rounded-md"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {Array.from({ length: 4 }).map((_, bIdx) => (
                <div key={bIdx} className="bg-bgSecondary rounded-xl p-4 border border-border/30 min-h-[140px] flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-zinc-800 rounded"></div>
                    <div className="h-3 w-1/2 bg-gray-150 dark:bg-zinc-800/60 rounded"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-center">
                    <div className="h-8 bg-gray-200 dark:bg-zinc-800/50 rounded"></div>
                    <div className="h-8 bg-gray-200 dark:bg-zinc-800/50 rounded"></div>
                    <div className="h-8 bg-gray-200 dark:bg-zinc-800/50 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function KanbanSkeleton() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-bgPrimary p-6 animate-pulse">
      {/* Board Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-borderBase">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-gray-250 dark:bg-zinc-800 rounded-lg"></div>
          <div className="h-4 w-80 bg-gray-200 dark:bg-zinc-800/80 rounded-lg"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-gray-200 dark:bg-zinc-800 rounded-lg"></div>
          <div className="h-10 w-32 bg-gray-250 dark:bg-zinc-800 rounded-lg"></div>
        </div>
      </div>

      {/* Columns Skeleton */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        {Array.from({ length: 3 }).map((_, colIdx) => (
          <div key={colIdx} className="bg-bgSecondary rounded-2xl p-4 border border-borderBase flex flex-col h-full min-w-[280px]">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-borderBase/50">
              <div className="h-5 w-24 bg-gray-250 dark:bg-zinc-800 rounded-lg"></div>
              <div className="h-5 w-8 bg-gray-200 dark:bg-zinc-800/70 rounded-full"></div>
            </div>
            
            <div className="flex-1 space-y-3 overflow-y-auto">
              {Array.from({ length: 3 }).map((_, cardIdx) => (
                <div key={cardIdx} className="bg-bgPrimary border border-borderBase p-4 rounded-xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="h-5 w-3/4 bg-gray-250 dark:bg-zinc-800 rounded"></div>
                  </div>
                  <div className="h-4 w-full bg-gray-200 dark:bg-zinc-800/60 rounded"></div>
                  <div className="flex justify-between items-center pt-2 border-t border-borderBase/20">
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-zinc-800/70"></div>
                    <div className="h-3 w-16 bg-gray-200 dark:bg-zinc-800/50 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="flex-1 flex flex-col h-full bg-bgPrimary p-6 overflow-hidden animate-pulse">
      <div className="w-full flex flex-col h-full bg-bgSecondary border border-borderBase rounded-2xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="p-4 border-b border-borderBase flex items-center justify-between">
          <div className="h-6 w-32 bg-gray-250 dark:bg-zinc-800 rounded"></div>
          <div className="flex gap-2">
            <div className="h-9 w-9 bg-gray-200 dark:bg-zinc-800 rounded-xl"></div>
            <div className="h-9 w-20 bg-gray-250 dark:bg-zinc-800 rounded-xl"></div>
            <div className="h-9 w-9 bg-gray-200 dark:bg-zinc-800 rounded-xl"></div>
          </div>
        </div>
        
        {/* Grid Days Header */}
        <div className="grid grid-cols-7 border-b border-borderBase py-2">
          {Array.from({ length: 7 }).map((_, idx) => (
            <div key={idx} className="h-4 w-12 bg-gray-200 dark:bg-zinc-800/80 rounded mx-auto"></div>
          ))}
        </div>

        {/* Grid Cells */}
        <div className="flex-1 grid grid-rows-5 grid-cols-7">
          {Array.from({ length: 35 }).map((_, idx) => (
            <div key={idx} className="border-r border-b border-borderBase p-2 flex flex-col justify-between min-h-[80px]">
              <div className="flex justify-end">
                <div className="h-6 w-6 bg-gray-150 dark:bg-zinc-800/50 rounded-full"></div>
              </div>
              <div className="space-y-1">
                <div className="h-4 w-full bg-gray-200 dark:bg-zinc-800/60 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
